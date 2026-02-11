"""
CLMM Backtest Engine - Concentrated Liquidity IL + Fee simulation.

Uses exact sqrt-price math for IL, volume-based fee estimation,
and hourly granularity for time-in-range tracking.
"""

import numpy as np
import pandas as pd
from dataclasses import dataclass
from math import sqrt


@dataclass
class StrategyResult:
    strategy_type: str  # narrow, medium, wide
    lower_price: float
    upper_price: float
    apr_pct: float
    fee_pct: float
    il_pct: float
    net_pct: float
    time_in_range: float
    fee_usd: float
    il_usd: float
    net_usd: float


def calculate_clmm_il(p0: float, p1: float, pa: float, pb: float) -> float:
    """
    Exact concentrated liquidity IL.
    p0: entry price, p1: exit price, pa: lower bound, pb: upper bound.
    Returns IL as a fraction (negative = loss vs HODL).
    """
    if pa >= pb or p0 <= 0 or p1 <= 0:
        return 0.0

    sqrt_pa = sqrt(pa)
    sqrt_pb = sqrt(pb)

    # Effective prices clamped to range
    eff_p0 = max(pa, min(pb, p0))
    eff_p1 = max(pa, min(pb, p1))

    # LP value at p1
    if p1 <= pa:
        # All in token X
        x1 = 1.0 / sqrt_pa - 1.0 / sqrt_pb
        y1 = 0.0
    elif p1 >= pb:
        # All in token Y
        x1 = 0.0
        y1 = sqrt_pb - sqrt_pa
    else:
        x1 = 1.0 / sqrt(p1) - 1.0 / sqrt_pb
        y1 = sqrt(p1) - sqrt_pa
    v_lp = x1 * p1 + y1

    # HODL value: initial amounts at eff_p0, valued at p1
    if eff_p0 <= pa:
        x0 = 1.0 / sqrt_pa - 1.0 / sqrt_pb
        y0 = 0.0
    elif eff_p0 >= pb:
        x0 = 0.0
        y0 = sqrt_pb - sqrt_pa
    else:
        x0 = 1.0 / sqrt(eff_p0) - 1.0 / sqrt_pb
        y0 = sqrt(eff_p0) - sqrt_pa
    v_hodl = x0 * p1 + y0

    if v_hodl == 0:
        return 0.0

    return (v_lp - v_hodl) / v_hodl


def estimate_fee_income(
    prices: np.ndarray,
    pa: float,
    pb: float,
    fee_rate: float,
    amount_usd: float,
    pool_tvl: float,
    daily_volume: float | None = None,
) -> tuple[float, float]:
    """
    Estimate fee income over the price series.

    Returns (total_fee_usd, time_in_range_ratio).
    """
    in_range = (prices >= pa) & (prices <= pb)
    time_in_range = in_range.mean()

    if daily_volume is not None and daily_volume > 0:
        # Volume-based: pro-rata share of fees
        hours = len(prices)
        hourly_volume = daily_volume / 24.0
        # Assume LP share ~ amount_usd / pool_tvl (simplified)
        lp_share = amount_usd / max(pool_tvl, amount_usd)
        total_fee = sum(
            hourly_volume * fee_rate * lp_share
            for p in prices
            if pa <= p <= pb
        )
    else:
        # Volatility proxy: estimate volume from price movement
        returns = np.diff(np.log(prices))
        hourly_vol = np.std(returns)
        # Approximate daily volume ~ TVL * volatility * scaling_factor
        est_daily_volume = pool_tvl * hourly_vol * np.sqrt(24) * 2.0
        hourly_volume = est_daily_volume / 24.0
        lp_share = amount_usd / max(pool_tvl, amount_usd)
        total_fee = sum(
            hourly_volume * fee_rate * lp_share
            for p in prices
            if pa <= p <= pb
        )

    return total_fee, time_in_range


def run_backtest(
    prices: np.ndarray,
    current_price: float,
    fee_rate: float,
    amount_usd: float,
    pool_tvl: float,
    daily_volume: float | None,
    hold_days: int,
    range_pct: float,
) -> StrategyResult:
    """
    Run backtest for a single strategy (defined by range_pct).
    prices: hourly price array for the lookback period.
    """
    pa = current_price * (1 - range_pct)
    pb = current_price * (1 + range_pct)

    # Use last hold_days * 24 hours of data
    n_hours = hold_days * 24
    if len(prices) > n_hours:
        price_window = prices[-n_hours:]
    else:
        price_window = prices

    # IL from first to last price in window
    p0 = price_window[0]
    p1 = price_window[-1]
    il_frac = calculate_clmm_il(p0, p1, pa, pb)
    il_usd = abs(il_frac) * amount_usd

    # Fee income
    fee_usd, tir = estimate_fee_income(
        price_window, pa, pb, fee_rate, amount_usd, pool_tvl, daily_volume
    )

    net_usd = fee_usd - il_usd
    # Annualize
    period_days = len(price_window) / 24.0
    if period_days > 0:
        apr = (net_usd / amount_usd) * (365.0 / period_days) * 100
        fee_apr = (fee_usd / amount_usd) * (365.0 / period_days) * 100
        il_apr = (il_usd / amount_usd) * (365.0 / period_days) * 100
    else:
        apr = fee_apr = il_apr = 0.0

    strategy_name = (
        "narrow" if range_pct <= 0.07
        else "medium" if range_pct <= 0.20
        else "wide"
    )

    return StrategyResult(
        strategy_type=strategy_name,
        lower_price=round(pa, 4),
        upper_price=round(pb, 4),
        apr_pct=round(apr, 1),
        fee_pct=round(fee_apr, 1),
        il_pct=round(il_apr, 1),
        net_pct=round(apr, 1),
        time_in_range=round(tir, 3),
        fee_usd=round(fee_usd, 2),
        il_usd=round(il_usd, 2),
        net_usd=round(net_usd, 2),
    )


def simulate_strategies(
    prices: np.ndarray,
    current_price: float,
    fee_rate: float,
    amount_usd: float,
    pool_tvl: float,
    daily_volume: float | None,
    hold_days: int,
    volatility_30d: float | None = None,
) -> dict:
    """
    Run backtest for narrow/medium/wide strategies + recommend one.
    """
    strategies_config = {
        "narrow": 0.05,
        "medium": 0.15,
        "wide": 0.30,
    }

    results = {}
    for name, pct in strategies_config.items():
        r = run_backtest(
            prices, current_price, fee_rate, amount_usd,
            pool_tvl, daily_volume, hold_days, pct,
        )
        results[name] = r

    # Recommendation logic: best risk-adjusted net APR
    # Penalize narrow if time_in_range < 0.6
    scores = {}
    for name, r in results.items():
        score = r.net_pct
        if r.time_in_range < 0.5:
            score *= 0.5
        elif r.time_in_range < 0.7:
            score *= 0.8
        scores[name] = score

    recommended = max(scores, key=scores.get)

    # Risk score
    vol = volatility_30d or 0.5
    if vol < 0.3 and results[recommended].time_in_range > 0.85:
        risk_score = "LOW"
    elif vol > 0.6 or results[recommended].time_in_range < 0.6:
        risk_score = "HIGH"
    else:
        risk_score = "MEDIUM"

    return {
        "strategies": {
            name: {
                "range": [r.lower_price, r.upper_price],
                "apr": r.apr_pct,
                "fees": r.fee_pct,
                "il": r.il_pct,
                "net": r.net_pct,
                "fee_usd": r.fee_usd,
                "il_usd": r.il_usd,
                "net_usd": r.net_usd,
            }
            for name, r in results.items()
        },
        "recommended": recommended,
        "risk_score": risk_score,
        "time_in_range": {name: r.time_in_range for name, r in results.items()},
        "current_price": round(current_price, 6),
        "volatility_30d": round(vol, 4),
    }

"""
Monte Carlo simulation for CLMM LP risk analysis.
Uses Geometric Brownian Motion (GBM) price paths.
"""

import numpy as np
from .backtest import calculate_clmm_il, estimate_fee_income


def run_monte_carlo(
    current_price: float,
    volatility: float,
    drift: float,
    fee_rate: float,
    amount_usd: float,
    pool_tvl: float,
    daily_volume: float | None,
    hold_days: int,
    range_pct: float,
    n_simulations: int = 2000,
) -> dict:
    """
    Monte Carlo simulation of LP PnL.
    Returns distribution stats + histogram data.
    """
    pa = current_price * (1 - range_pct)
    pb = current_price * (1 + range_pct)
    n_hours = hold_days * 24
    dt = 1.0 / (365 * 24)  # hourly step

    rng = np.random.default_rng(42)

    pnl_results = []

    for _ in range(n_simulations):
        # Generate GBM price path
        z = rng.standard_normal(n_hours)
        log_returns = (drift - 0.5 * volatility**2) * dt + volatility * np.sqrt(dt) * z
        prices = current_price * np.exp(np.cumsum(log_returns))
        prices = np.insert(prices, 0, current_price)

        # IL
        p1 = prices[-1]
        il_frac = calculate_clmm_il(current_price, p1, pa, pb)
        il_usd = abs(il_frac) * amount_usd

        # Fee
        fee_usd, tir = estimate_fee_income(
            prices, pa, pb, fee_rate, amount_usd, pool_tvl, daily_volume
        )

        net = fee_usd - il_usd
        pnl_results.append(net)

    pnl = np.array(pnl_results)

    # Stats
    mean_pnl = float(np.mean(pnl))
    median_pnl = float(np.median(pnl))
    std_pnl = float(np.std(pnl))
    var_95 = float(np.percentile(pnl, 5))  # 5th percentile = 95% VaR
    var_99 = float(np.percentile(pnl, 1))
    profit_prob = float(np.mean(pnl > 0))

    # Histogram bins for frontend
    hist_counts, hist_edges = np.histogram(pnl, bins=50)
    histogram = [
        {
            "bin_start": round(float(hist_edges[i]), 2),
            "bin_end": round(float(hist_edges[i + 1]), 2),
            "count": int(hist_counts[i]),
        }
        for i in range(len(hist_counts))
    ]

    return {
        "mean_pnl": round(mean_pnl, 2),
        "median_pnl": round(median_pnl, 2),
        "std_pnl": round(std_pnl, 2),
        "var_95": round(var_95, 2),
        "var_99": round(var_99, 2),
        "profit_probability": round(profit_prob, 4),
        "n_simulations": n_simulations,
        "histogram": histogram,
        "range": [round(pa, 4), round(pb, 4)],
    }

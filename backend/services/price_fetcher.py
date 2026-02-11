"""
Price data fetcher - Birdeye API with CoinGecko fallback.
Caches results to local CSV.
"""

import os
import time
import httpx
import numpy as np
import pandas as pd
from pathlib import Path

CACHE_DIR = Path(__file__).parent.parent.parent / "data" / "cache"
CACHE_DIR.mkdir(parents=True, exist_ok=True)

# Common Sui token addresses
TOKEN_ADDRESSES = {
    "SUI": "0x2::sui::SUI",
    "USDC": "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC",
    "CETUS": "0x06864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b::cetus::CETUS",
}

BIRDEYE_BASE = "https://public-api.birdeye.so"


async def fetch_birdeye_ohlcv(
    token_address: str,
    interval: str = "1H",
    days: int = 30,
) -> pd.DataFrame | None:
    """Fetch OHLCV from Birdeye API."""
    api_key = os.getenv("BIRDEYE_API_KEY")
    if not api_key:
        return None

    time_to = int(time.time())
    time_from = time_to - days * 86400

    url = f"{BIRDEYE_BASE}/defi/ohlcv"
    params = {
        "address": token_address,
        "type": interval,
        "time_from": time_from,
        "time_to": time_to,
    }
    headers = {
        "X-API-KEY": api_key,
        "x-chain": "sui",
    }

    async with httpx.AsyncClient() as client:
        resp = await client.get(url, params=params, headers=headers, timeout=30)
        if resp.status_code != 200:
            return None

        data = resp.json()
        items = data.get("data", {}).get("items", [])
        if not items:
            return None

        df = pd.DataFrame(items)
        df["timestamp"] = pd.to_datetime(df["unixTime"], unit="s")
        return df[["timestamp", "o", "h", "l", "c", "v"]].rename(
            columns={"o": "open", "h": "high", "l": "low", "c": "close", "v": "volume"}
        )


async def fetch_coingecko_prices(
    coin_id: str = "sui",
    vs_currency: str = "usd",
    days: int = 30,
) -> pd.DataFrame | None:
    """Fallback: CoinGecko free API."""
    url = f"https://api.coingecko.com/api/v3/coins/{coin_id}/market_chart"
    params = {"vs_currency": vs_currency, "days": days}

    async with httpx.AsyncClient() as client:
        resp = await client.get(url, params=params, timeout=30)
        if resp.status_code != 200:
            return None
        data = resp.json()
        prices = data.get("prices", [])
        if not prices:
            return None
        df = pd.DataFrame(prices, columns=["timestamp", "close"])
        df["timestamp"] = pd.to_datetime(df["timestamp"], unit="ms")
        return df


def get_cached_prices(pool_id: str, days: int = 30) -> np.ndarray | None:
    """Load cached hourly close prices, trimmed to requested days."""
    cache_file = CACHE_DIR / f"{pool_id}_prices.csv"
    if cache_file.exists():
        df = pd.read_csv(cache_file)
        if len(df) > 24:  # at least 1 day
            n_hours = days * 24
            prices = df["close"].values
            if len(prices) > n_hours:
                return prices[-n_hours:]
            return prices
    return None


def save_cache(pool_id: str, df: pd.DataFrame):
    cache_file = CACHE_DIR / f"{pool_id}_prices.csv"
    df.to_csv(cache_file, index=False)


async def get_prices(pool_id: str, days: int = 30, current_price: float | None = None) -> np.ndarray:
    """
    Get hourly close prices. Try cache → Birdeye → CoinGecko → mock.
    """
    # Try cache (trimmed to requested days)
    cached = get_cached_prices(pool_id, days=days)
    if cached is not None:
        return cached

    # Map pool_id to token
    token_map = {
        "sui-usdc": ("SUI", "sui"),
        "cetus-sui": ("CETUS", "cetus-protocol"),
    }

    token_key, coingecko_id = token_map.get(pool_id, ("SUI", "sui"))

    # Try Birdeye
    addr = TOKEN_ADDRESSES.get(token_key, TOKEN_ADDRESSES["SUI"])
    df = await fetch_birdeye_ohlcv(addr, days=days)
    if df is not None and len(df) > 0:
        save_cache(pool_id, df)
        return df["close"].values

    # Try CoinGecko
    df = await fetch_coingecko_prices(coingecko_id, days=days)
    if df is not None and len(df) > 0:
        save_cache(pool_id, df)
        return df["close"].values

    # Mock data: GBM around a base price
    base_defaults = {"sui-usdc": 3.5, "cetus-sui": 0.045, "usdt-usdc": 1.0}
    base = current_price or base_defaults.get(pool_id, 3.5)
    n = days * 24
    rng = np.random.default_rng(123)
    returns = rng.normal(0, 0.01, n)
    prices = base * np.exp(np.cumsum(returns))
    return prices

"""
Fetch Cetus pool info from their public API.
"""

import httpx

CETUS_API = "https://api-sui.cetus.zone/v2/sui/pools"

# Hardcoded top pools for hackathon demo
DEFAULT_POOLS = [
    {
        "id": "sui-usdc",
        "name": "SUI / USDC",
        "token_a": "SUI",
        "token_b": "USDC",
        "fee_rate": 0.0025,  # 25bps
        "tvl": 15_000_000,
        "daily_volume": 8_000_000,
        "current_price": 3.45,
        "tick_spacing": 60,
    },
    {
        "id": "cetus-sui",
        "name": "CETUS / SUI",
        "token_a": "CETUS",
        "token_b": "SUI",
        "fee_rate": 0.0025,
        "tvl": 3_000_000,
        "daily_volume": 1_500_000,
        "current_price": 0.045,
        "tick_spacing": 60,
    },
    {
        "id": "usdt-usdc",
        "name": "USDT / USDC",
        "token_a": "USDT",
        "token_b": "USDC",
        "fee_rate": 0.0001,  # 1bp stable
        "tvl": 20_000_000,
        "daily_volume": 12_000_000,
        "current_price": 1.0,
        "tick_spacing": 1,
    },
]


async def fetch_pools() -> list[dict]:
    """Fetch pool list. Falls back to hardcoded defaults."""
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(CETUS_API, timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                pools = data.get("data", [])
                if pools:
                    # Transform to our format (top 10 by TVL)
                    result = []
                    for p in sorted(pools, key=lambda x: float(x.get("tvl", 0)), reverse=True)[:10]:
                        result.append({
                            "id": p.get("pool_address", ""),
                            "name": f"{p.get('coin_a', {}).get('symbol', '?')} / {p.get('coin_b', {}).get('symbol', '?')}",
                            "token_a": p.get("coin_a", {}).get("symbol", ""),
                            "token_b": p.get("coin_b", {}).get("symbol", ""),
                            "fee_rate": float(p.get("fee_rate", 0)) / 1_000_000,
                            "tvl": float(p.get("tvl", 0)),
                            "daily_volume": float(p.get("vol_in_usd_24h", 0)),
                            "current_price": float(p.get("current_price", 0)),
                            "tick_spacing": int(p.get("tick_spacing", 60)),
                        })
                    return result
    except Exception:
        pass

    return DEFAULT_POOLS


def get_pool_by_id(pool_id: str, pools: list[dict]) -> dict | None:
    for p in pools:
        if p["id"] == pool_id:
            return p
    return None

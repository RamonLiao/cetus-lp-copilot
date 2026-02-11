"""FastAPI backend for Cetus LP Risk Copilot."""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np

from services.pool_fetcher import fetch_pools, get_pool_by_id
from services.price_fetcher import get_prices
from engine.backtest import simulate_strategies
from engine.monte_carlo import run_monte_carlo

app = FastAPI(title="Cetus LP Risk Copilot", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SimulateRequest(BaseModel):
    pool_id: str
    amount_usd: float = 1000
    hold_days: int = 30


class MonteCarloRequest(BaseModel):
    pool_id: str
    amount_usd: float = 1000
    hold_days: int = 30
    range_pct: float = 0.15
    n_simulations: int = 2000


@app.get("/api/pools")
async def list_pools():
    pools = await fetch_pools()
    return {"pools": pools}


@app.post("/api/simulate")
async def simulate(req: SimulateRequest):
    pools = await fetch_pools()
    pool = get_pool_by_id(req.pool_id, pools)
    if not pool:
        raise HTTPException(404, f"Pool {req.pool_id} not found")

    prices = await get_prices(req.pool_id, days=max(req.hold_days, 30))

    # Calculate 30d volatility
    returns = np.diff(np.log(prices))
    hourly_vol = float(np.std(returns))
    annualized_vol = hourly_vol * np.sqrt(24 * 365)

    result = simulate_strategies(
        prices=prices,
        current_price=pool["current_price"],
        fee_rate=pool["fee_rate"],
        amount_usd=req.amount_usd,
        pool_tvl=pool["tvl"],
        daily_volume=pool.get("daily_volume"),
        hold_days=req.hold_days,
        volatility_30d=annualized_vol,
    )
    return result


@app.post("/api/monte-carlo")
async def monte_carlo(req: MonteCarloRequest):
    pools = await fetch_pools()
    pool = get_pool_by_id(req.pool_id, pools)
    if not pool:
        raise HTTPException(404, f"Pool {req.pool_id} not found")

    prices = await get_prices(req.pool_id, days=max(req.hold_days, 30))

    returns = np.diff(np.log(prices))
    hourly_vol = float(np.std(returns))
    annualized_vol = hourly_vol * np.sqrt(24 * 365)
    drift = float(np.mean(returns)) * 24 * 365

    result = run_monte_carlo(
        current_price=pool["current_price"],
        volatility=annualized_vol,
        drift=drift,
        fee_rate=pool["fee_rate"],
        amount_usd=req.amount_usd,
        pool_tvl=pool["tvl"],
        daily_volume=pool.get("daily_volume"),
        hold_days=req.hold_days,
        range_pct=req.range_pct,
        n_simulations=req.n_simulations,
    )
    return result


@app.get("/api/pool/{pool_id}/history")
async def pool_history(pool_id: str, days: int = 30):
    prices = await get_prices(pool_id, days=days)
    return {
        "pool_id": pool_id,
        "prices": [
            {"index": i, "price": round(float(p), 6)}
            for i, p in enumerate(prices)
        ],
    }

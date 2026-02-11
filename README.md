# Cetus LP Risk Copilot

> Simulate, compare, and execute concentrated liquidity strategies on Cetus DEX with real-time risk analysis.

Built for **Vibe Sui Sprint Hackathon 2026** | Cetus Track

## Architecture

```
Frontend (Next.js + shadcn/ui + Recharts)
    ↕ REST API
Backend (FastAPI + NumPy/Pandas)
    ↕
On-Chain (Sui Move Strategy NFT + Cetus CLMM SDK)
```

## Features

- **Precise CLMM Backtest** — Exact sqrt-price IL formula with volume-based fee estimation
- **Monte Carlo Simulation** — 2000+ GBM price paths → PnL distribution, 95% VaR, profit probability
- **Strategy Comparison** — Narrow/Medium/Wide ranges with risk-adjusted recommendation
- **One-Click Execute** — Connect Sui wallet → add liquidity via PTB + mint Strategy NFT
- **Strategy NFT** — On-chain record of your LP strategy for tracking

## Quick Start

### Backend

```bash
cd backend
cp .env.example .env  # add your BIRDEYE_API_KEY
uv run uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Move Contract

```bash
cd contracts/cetus_copilot
sui move build
sui move test
sui client publish --gas-budget 100000000
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/pools` | List available pools |
| POST | `/api/simulate` | Backtest 3 strategies |
| POST | `/api/monte-carlo` | Monte Carlo risk analysis |
| GET | `/api/pool/{id}/history` | Historical price data |

## Tech Stack

- **Frontend:** Next.js 16 + TypeScript + shadcn/ui + Tailwind + Recharts + Framer Motion
- **Backend:** Python FastAPI + Pandas + NumPy
- **Data:** Birdeye API (OHLCV) + CoinGecko fallback
- **Wallet:** @mysten/dapp-kit + @mysten/sui
- **Contract:** Sui Move (Strategy NFT)

## License

MIT

# Cetus LP Risk Copilot — Progress

## 2026-02-12 Session 1: 環境 + 核心實作

### 完成項目

#### Phase 0: 環境準備 ✅
- Monorepo 結構: `frontend/`, `backend/`, `contracts/`, `data/`
- Next.js 16 + shadcn/ui + @mysten/dapp-kit + recharts + framer-motion
- Python FastAPI + pandas + numpy + httpx (via uv)
- Sui Move project `cetus_copilot`

#### Phase 1: 數據層 + 回測引擎 ✅
- `backend/engine/backtest.py` — 精確 CLMM IL (sqrt-price boundary math) + volume-based fee + time-in-range
- `backend/engine/monte_carlo.py` — GBM Monte Carlo (2000 sims) + VaR + profit probability + histogram
- `backend/services/price_fetcher.py` — Birdeye API → CoinGecko → mock data fallback chain
- `backend/services/pool_fetcher.py` — Cetus API pools + hardcoded fallback (SUI/USDC, CETUS/SUI, USDT/USDC)
- 策略推薦: narrow ±5%, medium ±15%, wide ±30% + volatility-based risk score

#### Phase 2: FastAPI 後端 ✅
- `GET /api/pools` — 池子列表
- `POST /api/simulate` — 三策略回測 + 推薦
- `POST /api/monte-carlo` — Monte Carlo 風險分析
- `GET /api/pool/{id}/history` — 歷史價格
- CORS enabled, Pydantic models

#### Phase 3: Frontend UI ✅
- `/` — Landing page: hero + gradient title + 3 feature cards + framer-motion
- `/simulate` — 主功能頁: PoolSelector, amount input, hold days slider, strategy cards, comparison bar chart, Monte Carlo histogram, execute button
- Dark theme, ConnectButton, recommended badge 綠色高亮
- shadcn components: button, card, select, slider, tabs, badge, separator

#### Phase 4: On-Chain (部分) ✅
- `contracts/cetus_copilot/sources/strategy_nft.move` — StrategyNFT struct + mint + mint_and_transfer
- 3/3 Move tests pass
- Wallet connection via @mysten/dapp-kit (testnet config)

### 驗證狀態
- ✅ Frontend `npm run build` — clean
- ✅ Backend engine imports + mock data 跑通
- ✅ Move `sui move build` + `sui move test` — 3/3 pass

### 踩過的坑
- `@mysten/sui` 新版移除了 `getFullnodeUrl`，需手動寫 URL + `network` field
- Move test 不能在 module 外 destructure struct，改用 `std::unit_test::destroy`
- `shadcn init` 需要在 frontend 目錄下跑，且加 `--yes`
- `sui::test_utils::destroy` deprecated → 改用 `std::unit_test::destroy`

### TODO（下一個 chat）
- [ ] Cetus CLMM SDK 整合 — 實際 add liquidity PTB 構建
- [ ] Testnet deploy Strategy NFT (`sui client publish`)
- [ ] Landing page 潤色 + logo
- [ ] Deploy: Vercel (frontend) + Railway (backend)
- [ ] Demo video 2-3 min
- [ ] Git: init repo + 拆多次 commits (目標 10+)
- [ ] DeepSurge 提交 + Twitter threads ×3
- [ ] Monkey testing: 負數金額、超大數字、空池、斷網

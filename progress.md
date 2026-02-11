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

---

## 2026-02-12 Session 2: Cetus SDK 整合規劃

### 完成項目
- ✅ Git init + 手動 commits
- ✅ 研究 Cetus CLMM SDK API（v1 `@cetusprotocol/cetus-sui-clmm-sdk` v5.4.0 + v2 `@cetusprotocol/sui-clmm-sdk`）

### Cetus SDK 整合方案（已確認，下個 chat 實作）
- 安裝 `@cetusprotocol/cetus-sui-clmm-sdk`
- **新建** `frontend/src/lib/cetus.ts` — SDK init + `buildAddLiquidityTx(poolId, priceLower, priceUpper, amountUsd, fixCoinA)`
- **新建** `frontend/src/hooks/useAddLiquidity.ts` — React hook wrap `useSignAndExecuteTransaction` + cetus PTB
- **改** `frontend/src/app/simulate/page.tsx` — execute button onClick → 呼叫 hook
- 用 SDK v2 `createAddLiquidityFixCoinWithPricePayload` 吃 min/max price（不用手算 tick）
- `initCetusSDK({network: 'testnet'})` 初始化，切 mainnet 只改一行

### TODO（下一個 chat）
- [x] **Cetus CLMM SDK 整合** — ✅ Session 3 完成
- [ ] Testnet deploy Strategy NFT (`sui client publish`)
- [ ] Landing page 潤色 + logo
- [ ] Deploy: Vercel (frontend) + Railway (backend)
- [ ] Demo video 2-3 min
- [ ] DeepSurge 提交 + Twitter threads ×3
- [ ] Monkey testing: 負數金額、超大數字、空池、斷網

---

## 2026-02-12 Session 3: Cetus SDK 整合實作

### 完成項目
- ✅ 安裝 `@cetusprotocol/cetus-sui-clmm-sdk@5.4.0`
- ✅ **降級** `@mysten/dapp-kit@0.14.35` + `@mysten/sui@1.14.4`（因 SDK v5.4.0 用 `SuiClient`，而 `@mysten/sui@2.x` 已改名 `CoreClient`）
- ✅ **新建** `frontend/src/lib/cetus.ts` — SDK init + `buildAddLiquidityTx()` (price→tick 轉換 + `createAddLiquidityFixTokenPayload`)
- ✅ **新建** `frontend/src/hooks/useAddLiquidity.ts` — React hook: build TX → sign via dapp-kit → TX digest + status
- ✅ **改** `frontend/src/app/simulate/page.tsx` — execute button 接 hook，顯示 TX status + suiscan link
- ✅ **改** `frontend/src/components/providers.tsx` — 移除 `network` field（0.14.x 不需要）
- ✅ `pnpm run build` — clean

### 踩過的坑
- Cetus SDK v5.4.0 依賴 `SuiClient` from `@mysten/sui/client`，但 `@mysten/sui@2.x` 改名為 `CoreClient` → 降級到 `@mysten/sui@1.14.4`
- `dapp-kit@1.0.3` peer dep `@mysten/sui@^2.3.2` → 降級到 `dapp-kit@0.14.35`（API 兼容）
- SDK v5.4.0 用 v1 API（`createAddLiquidityFixTokenPayload` + tick-based），不是 v2 price-based API
- `AddLiquidityFixTokenParams` 需要 `pos_id`（`is_open: true` 時給空字串）、`coinTypeA`/`coinTypeB`（camelCase）
- `TickMath.priceToInitializableTickIndex(price, decimalsA, decimalsB, tickSpacing)` 做 price→tick 轉換

### 修改檔案清單
- `frontend/package.json` — 新增 cetus SDK，降級 dapp-kit + sui
- `frontend/src/lib/cetus.ts` — 新建
- `frontend/src/hooks/useAddLiquidity.ts` — 新建
- `frontend/src/app/simulate/page.tsx` — 加 hook + execute button 邏輯
- `frontend/src/components/providers.tsx` — 移除 network field

### TODO（下一個 chat）
- [ ] 實際 testnet 測試 execute flow（連錢包 + 簽名）
- [ ] Testnet deploy Strategy NFT
- [ ] Landing page 潤色 + logo
- [ ] Deploy: Vercel + Railway
- [ ] Demo video + 提交

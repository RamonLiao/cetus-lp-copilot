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
- [x] Monkey testing: 負數金額、超大數字、空池 — ✅ Session 4 完成
- [ ] DeepSurge 提交 + Twitter threads ×3

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
- [x] Testnet deploy Strategy NFT — ✅ Session 4 完成
- [x] Landing page 潤色 — ✅ Session 4 完成
- [x] Deploy configs (Vercel + Railway) — ✅ Session 4 完成
- [x] Monkey testing (input validation) — ✅ Session 4 完成
- [ ] 手動 deploy to Vercel + Railway
- [ ] Demo video + 提交

---

## 2026-02-12 Session 4: Deploy + Polish + Monkey Testing

### 完成項目

#### Testnet Deploy Strategy NFT ✅
- Package ID: `0x1939056b726a3b6f9423d7f0b711516486392887fd2b7a56076a97b1c28a4883`
- TX: `2zbT9cAockL2wBWnNHXkeoJvpZdMFU7L2vuZBPXySGxv`
- UpgradeCap: `0x08d50e3c94374711fca8e744c37ce7b3b1dec04aec3d11a16ae9c5110b00878d`
- **新建** `frontend/src/lib/constants.ts` — package ID + module/fn 常量
- **改** `frontend/src/hooks/useAddLiquidity.ts` — 加 NFT mint 到 execute flow（2-step: add liquidity → mint NFT）
- **改** `frontend/src/app/simulate/page.tsx` — 傳 strategyType/riskScore，顯示 NFT TX link

#### Landing Page 潤色 ✅
- **改** `frontend/src/app/page.tsx` — 完全重寫
  - 漸層背景 orbs（emerald/blue/purple）
  - Nav bar with gradient logo + Launch App button
  - Hero with status badge + gradient title + CTA
  - Stats row (2000+ sims, 3 strategies, <1s speed)
  - Feature cards with SVG icons + hover effects
  - "How It Works" 4-step section
  - Bottom CTA card

#### Deploy Configs ✅
- **新建** `backend/Procfile` — Railway/Heroku start command
- **新建** `backend/railway.toml` — Railway deploy config
- **新建** `backend/nixpacks.toml` — uv-based Python build
- **新建** `frontend/vercel.json` — Vercel framework config

#### Monkey Testing (Input Validation) ✅
- **改** `backend/main.py` — SimulateRequest/MonteCarloRequest 加 `validate_inputs()`
  - amount_usd: 0~10M, hold_days: 1~365, range_pct: 0~1, n_simulations: 100~10000
- **改** `frontend/src/app/simulate/page.tsx` — amount input clamp + disabled button when invalid

### 驗證狀態
- ✅ Frontend `pnpm run build` — clean
- ✅ Backend imports OK
- ✅ Move contract deployed to testnet

### 修改檔案清單
- `frontend/src/lib/constants.ts` — 新建
- `frontend/src/hooks/useAddLiquidity.ts` — NFT mint integration
- `frontend/src/app/simulate/page.tsx` — NFT display + input validation
- `frontend/src/app/page.tsx` — Landing page redesign
- `frontend/vercel.json` — 新建
- `backend/Procfile` — 新建
- `backend/railway.toml` — 新建
- `backend/nixpacks.toml` — 新建
- `backend/main.py` — Input validation

### TODO（下一個 chat）
- [x] Deploy: Vercel (frontend) + Railway (backend) — ✅ Session 5 完成
- [x] 設定 NEXT_PUBLIC_API_URL 環境變數 — ✅ Session 5 完成
- [ ] 實際 testnet 測試 execute flow
- [ ] Demo video 2-3 min
- [ ] DeepSurge 提交 + Twitter threads ×3

---

## 2026-02-12 Session 5: Deploy to Vercel + Railway

### 完成項目

#### Backend → Railway ✅
- GitHub repo 連接 auto deploy
- Root Directory: `backend`
- 修 `nixpacks.toml`: `nixPkgs = ["python313", "uv"]`（Railway 沒有 pip）
- URL: https://cetus-lp-copilot.up.railway.app

#### Frontend → Vercel ✅
- GitHub repo 連接 auto deploy
- Root Directory: `frontend`
- 環境變數: `NEXT_PUBLIC_API_URL=https://cetus-lp-copilot.up.railway.app`
- URL: https://cetus-lp-copilot.vercel.app
- 修了 3 個 build error:
  1. 移除 `radix-ui` meta-package → 改用個別 `@radix-ui/react-*`
  2. 加 `@vanilla-extract/css` + `@vanilla-extract/recipes`
  3. 加 `@vanilla-extract/dynamic`
  （以上都是 `@mysten/dapp-kit@0.14.35` 的 peer deps）

### 踩過的坑
- Railway nixpacks 環境沒有 `pip`，要用 `nixPkgs = ["uv"]` 直接裝
- `radix-ui` meta-package 帶 `@vanilla-extract` build-time 依賴，Vercel Turbopack 解析不到
- `@mysten/dapp-kit@0.14.35` 運行時需要 3 個 `@vanilla-extract/*` 套件，不會自動安裝

### 修改檔案清單
- `backend/nixpacks.toml` — 改用 nix uv
- `frontend/package.json` — 移除 radix-ui，加 vanilla-extract deps
- `frontend/pnpm-lock.yaml` — lockfile 更新
- `frontend/src/components/ui/{badge,button,select,separator,slider,tabs}.tsx` — import 改為 @radix-ui/react-*

### TODO（下一個 chat）
- [x] 驗證 /simulate 頁面 API 連通 — ✅ Session 6 完成
- [ ] 實際 testnet 測試 execute flow
- [ ] Demo video 2-3 min
- [ ] DeepSurge 提交 + Twitter threads ×3

---

## 2026-02-12 Session 6: Fix Live Price + API 驗證

### 完成項目

#### API 連通驗證 ✅
- 確認 Railway backend 三個 endpoint 都回 200
- 發現 `/api/simulate` 和 `/api/monte-carlo` 回傳全部為 0

#### 修復 stale current_price bug ✅
- **根因**: hardcoded `current_price=3.45` (SUI) 但 CoinGecko 回傳真實價格 ~0.89，所有 backtest range 都 out of range → fees/IL 全為 0
- **改** `backend/main.py` — simulate + monte-carlo 用 `prices[-1]`（最新 fetched price）取代 hardcoded `pool["current_price"]`
- **改** `backend/engine/backtest.py` — round `current_price` to 6 decimals
- 本地驗證: narrow fees=$2.83, IL=$11.9, time_in_range=0.304 ✅

### 踩過的坑
- Railway 上 CoinGecko API 能通，所以 `get_prices` 拿到真實歷史（0.87~1.9），但 pool hardcoded price 還是 3.45 → range 完全不匹配
- 本地沒 cache 且沒 API key，mock data 用 `current_price` 當 base 所以本地沒問題，prod 才爆

### 修改檔案清單
- `backend/main.py` — live_price from fetched prices
- `backend/engine/backtest.py` — round current_price

### TODO（下一個 chat）
- [ ] 等 Railway deploy 完後驗證 prod API 回傳有值
- [ ] 實際 testnet 測試 execute flow
- [ ] Demo video 2-3 min
- [ ] DeepSurge 提交 + Twitter threads ×3

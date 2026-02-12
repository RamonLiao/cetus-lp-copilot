# Cetus LP Risk Copilot — Demo Script (~2.5 min)

> **Recording setup:** Browser at https://cetus-lp-copilot.vercel.app, Sui wallet connected (testnet), screen 1920×1080, dark mode.

---

## [0:00–0:15] Landing Page — Hook

**Screen:** Landing page loads, gradient orbs animate in.

**Voiceover:**

> Providing liquidity on concentrated AMMs can be hugely profitable — or quietly devastating. The tighter your range, the higher the fees, but one sudden move and you're sitting on pure impermanent loss.
>
> Cetus LP Risk Copilot lets you see the numbers *before* you commit liquidity.

**Action:** Slow scroll to show feature cards + "How It Works" steps. Pause briefly on the three feature cards.

---

## [0:15–0:30] Navigate to Simulate

**Action:** Click "Start Simulation" → `/simulate` page loads.

**Voiceover:**

> The app runs entirely on-chain data. You pick a pool, set your amount and holding period, and the engine does the rest.

**Action:** Point out the Simulation Parameters panel — Pool dropdown, Amount, Hold Period slider.

---

## [0:30–1:00] Run a Simulation

**Action:**
1. Open Pool dropdown → select **SUI / USDC (0.25%)**
2. Set Amount to **$1,000**
3. Drag slider to **30 days**
4. Click **Simulate**

**Voiceover:**

> Let's simulate a thousand dollars in SUI/USDC for 30 days.
>
> The backend runs three strategies in parallel — narrow at plus-minus five percent, medium at fifteen, and wide at thirty — using the exact CLMM sqrt-price formula, not a simplified approximation.

**Action:** Results appear — risk badge, three strategy cards animate in.

**Voiceover:**

> Each card shows the estimated fee yield, impermanent loss, net APR, and time-in-range percentage. The recommended strategy is highlighted in green — the engine factors in recent volatility to pick the best risk-reward trade-off.

**Action:** Hover/click each strategy card briefly to show the sky-blue selection ring.

---

## [1:00–1:30] Charts — Comparison + Monte Carlo

**Action:** Scroll down to the two charts side by side.

**Voiceover:**

> The bar chart on the left compares fees versus impermanent loss across all three strategies at a glance.
>
> On the right is the Monte Carlo distribution — two thousand Geometric Brownian Motion simulations of your PnL. You can see the 95% Value-at-Risk line and the overall profit probability. This tells you not just the expected return, but the shape of your risk.

**Action:** Hover on the histogram to show tooltip values. Pause on VaR annotation.

---

## [1:30–2:10] Execute — Mint Strategy NFT

**Action:** Scroll to Execute Strategy section. Show "Selected: medium range [X — Y]" and "Expected Net APR".

**Voiceover:**

> Once you've picked a strategy, you can execute it directly. On mainnet, this adds liquidity via the Cetus CLMM SDK in a single transaction. On testnet, we mint a Strategy NFT that records your chosen range, risk score, and pool on-chain — a verifiable proof of your LP decision.

**Action:**
1. Click **Mint Strategy NFT**
2. Wallet popup appears → sign
3. Button changes to **"Minted!"**
4. Show "Strategy minted on-chain!" + NFT TX link

**Voiceover:**

> There it is — minted. You can click through to Suiscan to verify the on-chain object, or check your wallet portfolio to see the NFT.

**Action:** Click the NFT TX link → Suiscan opens showing the transaction. Quick glance, then switch back.

---

## [2:10–2:30] Architecture Recap + Close

**Screen:** Stay on the simulate page, or briefly show landing page again.

**Voiceover:**

> Under the hood: the frontend is Next.js with shadcn/ui, deployed on Vercel. The backtest and Monte Carlo engine is Python FastAPI on Railway, using real price history from Birdeye and CoinGecko. On-chain, a Move contract handles Strategy NFT minting, and the Cetus CLMM SDK handles liquidity provisioning.
>
> Cetus LP Risk Copilot — see the numbers before you commit liquidity.

**Action:** End on the gradient hero title. Fade out.

---

## Key Talking Points Cheat Sheet

| Topic | Detail |
|---|---|
| IL math | Exact CLMM sqrt-price boundary, not xy=k approximation |
| Monte Carlo | 2,000 GBM sims, 95% VaR, profit probability |
| Strategies | Narrow ±5%, Medium ±15%, Wide ±30% |
| Recommendation | Volatility-weighted risk score (LOW/MEDIUM/HIGH) |
| On-chain | Strategy NFT on Sui — immutable record of LP decision |
| Cetus SDK | `createAddLiquidityFixTokenPayload` — price→tick, single TX |
| Stack | Next.js + shadcn + dapp-kit / FastAPI + pandas / Sui Move |
| Deploy | Vercel (frontend) + Railway (backend) |

---

## Recording Tips

- Keep mouse movements deliberate, not jittery
- Pause 1–2 seconds after each result appears so viewers can read
- If the API takes a moment, just say "the engine is crunching the numbers"
- Don't rush the NFT mint — it's the money shot
- Total target: **2 min 15 sec to 2 min 30 sec** (leaves buffer under 3 min)

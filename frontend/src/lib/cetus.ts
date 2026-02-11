import {
  initCetusSDK,
  TickMath,
  d,
  toDecimalsAmount,
} from "@cetusprotocol/cetus-sui-clmm-sdk";
import type { Transaction } from "@mysten/sui/transactions";

const NETWORK =
  (process.env.NEXT_PUBLIC_SUI_NETWORK as "testnet" | "mainnet") || "testnet";

// Mainnet pool addresses — testnet uses same IDs for demo
const POOL_ADDRESS_MAP: Record<string, string> = {
  "sui-usdc":
    "0xcf994611fd4c48e277ce3ffd4d4364c914af2c3cbb05f7bf6facd371de688571",
  "cetus-sui":
    "0x2e041f3fd93646dcc877f783c1f2b7fa62d30271bdef1f21ef002cebf857bded",
  "usdt-usdc":
    "0x6bd72983b0b5a77774af8c77567bb593b418ae3cd750571f41a0e0b0e50d75aa",
};

const DECIMALS: Record<string, number> = {
  SUI: 9,
  USDC: 6,
  USDT: 6,
  CETUS: 9,
};

const TICK_SPACING: Record<string, number> = {
  "sui-usdc": 60,
  "cetus-sui": 60,
  "usdt-usdc": 1,
};

// Coin type addresses (mainnet)
const COIN_TYPES: Record<string, string> = {
  SUI: "0x2::sui::SUI",
  USDC: "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN",
  USDT: "0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN",
  CETUS: "0x06864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b::cetus::CETUS",
};

let sdkInstance: ReturnType<typeof initCetusSDK> | null = null;

export function getCetusSDK(wallet?: string) {
  if (sdkInstance && !wallet) return sdkInstance;
  sdkInstance = initCetusSDK({ network: NETWORK, wallet });
  return sdkInstance;
}

export function getPoolAddress(poolId: string): string {
  return POOL_ADDRESS_MAP[poolId] || poolId;
}

export interface BuildAddLiquidityParams {
  poolId: string;
  minPrice: string;
  maxPrice: string;
  amountUsd: number;
  currentPrice: number;
  tokenA: string;
  tokenB: string;
  fixCoinA?: boolean;
  slippage?: number;
}

/**
 * Build a Transaction for adding liquidity to a Cetus CLMM pool.
 * Returns a Transaction that can be signed via dapp-kit.
 */
export async function buildAddLiquidityTx(
  params: BuildAddLiquidityParams
): Promise<Transaction> {
  const {
    poolId,
    minPrice,
    maxPrice,
    amountUsd,
    currentPrice,
    tokenA,
    tokenB,
    fixCoinA = true,
    slippage = 0.005,
  } = params;

  const sdk = getCetusSDK();
  const onChainPoolId = getPoolAddress(poolId);
  const decimalsA = DECIMALS[tokenA] || 9;
  const decimalsB = DECIMALS[tokenB] || 6;
  const tickSpacing = TICK_SPACING[poolId] || 60;

  // Convert price range to initializable tick indices
  const tickLower = TickMath.priceToInitializableTickIndex(
    d(minPrice),
    decimalsA,
    decimalsB,
    tickSpacing
  );
  const tickUpper = TickMath.priceToInitializableTickIndex(
    d(maxPrice),
    decimalsA,
    decimalsB,
    tickSpacing
  );

  // Calculate token amounts from USD (must be integer strings for BigInt conversion)
  // fixCoinA: deposit half as token A
  const rawA = Number(toDecimalsAmount(amountUsd / 2 / currentPrice, decimalsA));
  const rawB = Number(toDecimalsAmount(amountUsd / 2, decimalsB));
  const amountA = fixCoinA ? Math.floor(rawA).toString() : "0";
  const amountB = fixCoinA ? "0" : Math.floor(rawB).toString();

  const coinTypeA = COIN_TYPES[tokenA] || "";
  const coinTypeB = COIN_TYPES[tokenB] || "";

  const tx = await sdk.Position.createAddLiquidityFixTokenPayload({
    pool_id: onChainPoolId,
    pos_id: "",
    coinTypeA,
    coinTypeB,
    tick_lower: tickLower.toString(),
    tick_upper: tickUpper.toString(),
    is_open: true,
    amount_a: amountA,
    amount_b: amountB,
    fix_amount_a: fixCoinA,
    slippage,
    collect_fee: false,
    rewarder_coin_types: [],
  });

  return tx as unknown as Transaction;
}

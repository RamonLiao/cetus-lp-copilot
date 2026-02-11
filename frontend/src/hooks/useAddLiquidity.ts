"use client";

import { useState, useCallback } from "react";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import {
  buildAddLiquidityTx,
  getCetusSDK,
  getPoolAddress,
  type BuildAddLiquidityParams,
} from "@/lib/cetus";
import { Transaction } from "@mysten/sui/transactions";
import {
  STRATEGY_NFT_PACKAGE_ID,
  STRATEGY_NFT_MODULE,
  STRATEGY_NFT_MINT_FN,
} from "@/lib/constants";

export type TxStatus = "idle" | "building" | "signing" | "success" | "error";

export interface ExecuteParams extends BuildAddLiquidityParams {
  strategyType: number; // 0=narrow, 1=medium, 2=wide
  riskScore: number; // 0=LOW, 1=MEDIUM, 2=HIGH
  lowerTick: number;
  upperTick: number;
}

export function useAddLiquidity() {
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const [status, setStatus] = useState<TxStatus>("idle");
  const [txDigest, setTxDigest] = useState<string | null>(null);
  const [nftTxDigest, setNftTxDigest] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (params: ExecuteParams) => {
      if (!account) {
        setError("Wallet not connected");
        return;
      }

      setStatus("building");
      setError(null);
      setTxDigest(null);
      setNftTxDigest(null);

      try {
        const isMainnet = process.env.NEXT_PUBLIC_SUI_NETWORK === "mainnet";
        const onChainPoolId = getPoolAddress(params.poolId);

        // 1) Add liquidity via Cetus SDK (mainnet only — testnet has no standard pools)
        if (isMainnet) {
          getCetusSDK(account.address);
          const tx = await buildAddLiquidityTx(params);

          setStatus("signing");
          const result = await signAndExecute({ transaction: tx });
          setTxDigest(result.digest);
          setStatus("building");
        }

        // 2) Mint Strategy NFT (use on-chain pool address, not our internal ID)
        const nftTx = new Transaction();
        nftTx.moveCall({
          target: `${STRATEGY_NFT_PACKAGE_ID}::${STRATEGY_NFT_MODULE}::${STRATEGY_NFT_MINT_FN}`,
          arguments: [
            nftTx.pure.address(onChainPoolId),
            nftTx.pure.u32(params.lowerTick),
            nftTx.pure.u32(params.upperTick),
            nftTx.pure.u64(Math.round(params.currentPrice * 1e6)),
            nftTx.pure.u64(Math.round(params.amountUsd)),
            nftTx.pure.u8(params.strategyType),
            nftTx.pure.u8(params.riskScore),
            nftTx.pure.u64(Date.now()),
          ],
        });

        setStatus("signing");
        const nftResult = await signAndExecute({ transaction: nftTx });
        setNftTxDigest(nftResult.digest);

        setStatus("success");
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Transaction failed";
        setError(message);
        setStatus("error");
        console.error("Add liquidity error:", err);
      }
    },
    [account, signAndExecute]
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setTxDigest(null);
    setNftTxDigest(null);
    setError(null);
  }, []);

  return { execute, status, txDigest, nftTxDigest, error, reset };
}

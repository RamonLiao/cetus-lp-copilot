"use client";

import { useState, useCallback } from "react";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import {
  buildAddLiquidityTx,
  getCetusSDK,
  type BuildAddLiquidityParams,
} from "@/lib/cetus";

export type TxStatus = "idle" | "building" | "signing" | "success" | "error";

export function useAddLiquidity() {
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const [status, setStatus] = useState<TxStatus>("idle");
  const [txDigest, setTxDigest] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (params: BuildAddLiquidityParams) => {
      if (!account) {
        setError("Wallet not connected");
        return;
      }

      setStatus("building");
      setError(null);
      setTxDigest(null);

      try {
        // Update SDK with current wallet
        getCetusSDK(account.address);

        const tx = await buildAddLiquidityTx(params);

        setStatus("signing");
        const result = await signAndExecute({ transaction: tx });

        setTxDigest(result.digest);
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
    setError(null);
  }, []);

  return { execute, status, txDigest, error, reset };
}

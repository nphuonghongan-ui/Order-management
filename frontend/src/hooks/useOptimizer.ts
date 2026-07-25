/**
 * useOptimizer — spawns the CLP worker once, exposes a single
 * `run(input, plId)` function that posts to the worker and
 * resolves when the run finishes.
 *
 * Worker is constructed via `new Worker(new URL(…), { type:
 * 'module' })` so Vite bundles it as a separate chunk.
 */

import { useCallback, useEffect, useRef } from "react";
import { useOptimizerStore } from "@/stores/useOptimizerStore";
import type {
  CLPInput,
  CLPResult,
} from "@/lib/clp/types";
import type {
  WorkerInbound,
  WorkerOutbound,
} from "@/lib/clp/worker";

let workerInstance: Worker | null = null;

function getWorker(): Worker {
  if (workerInstance) return workerInstance;
  workerInstance = new Worker(
    new URL("../lib/clp/worker.ts", import.meta.url),
    { type: "module" }
  );
  return workerInstance;
}

export interface RunHandle {
  runId: string;
  promise: Promise<CLPResult>;
  cancel: () => void;
}

export function useOptimizer() {
  const start = useOptimizerStore((s) => s.start);
  const setProgress = useOptimizerStore((s) => s.setProgress);
  const setResult = useOptimizerStore((s) => s.setResult);
  const setError = useOptimizerStore((s) => s.setError);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = getWorker();
  }, []);

  const run = useCallback(
    (input: CLPInput, plId: string): RunHandle => {
      const runId = start(input, plId);
      const worker = workerRef.current ?? getWorker();
      workerRef.current = worker;

      const promise = new Promise<CLPResult>((resolve, reject) => {
        const handler = (e: MessageEvent<WorkerOutbound>) => {
          const msg = e.data;
          if (msg.runId !== runId) return;
          if (msg.type === "progress") {
            setProgress(msg.info);
          } else if (msg.type === "result") {
            setResult(msg.result);
            worker.removeEventListener("message", handler);
            resolve(msg.result);
          } else if (msg.type === "error") {
            setError(msg.message);
            worker.removeEventListener("message", handler);
            reject(new Error(msg.message));
          }
        };
        worker.addEventListener("message", handler);
        const msg: WorkerInbound = { type: "optimize", runId, input };
        worker.postMessage(msg);
      });

      const cancel = () => {
        const msg: WorkerInbound = { type: "cancel", runId };
        worker.postMessage(msg);
      };

      return { runId, promise, cancel };
    },
    [start, setProgress, setResult, setError]
  );

  return { run };
}

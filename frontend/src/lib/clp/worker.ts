/// <reference lib="webworker" />
/**
 * Web Worker entry for the CLP optimizer.
 *
 * Messages:
 *   inbound  : { type: 'optimize', input: CLPInput, runId: string }
 *   outbound : { type: 'progress', runId, info: OptimizeProgressInfo }
 *              { type: 'result',   runId, result: CLPResult }
 *              { type: 'error',    runId, message: string }
 *
 * Cancellation is best-effort: a `cancel` message flips a flag
 * checked between major phases. Granular cancellation inside
 * SA is not yet supported.
 */

import { optimize, type OptimizeProgressInfo } from "./binPacking";
import type { CLPInput, CLPResult } from "./types";

export type WorkerInbound =
  | { type: "optimize"; runId: string; input: CLPInput }
  | { type: "cancel"; runId: string };

export type WorkerOutbound =
  | { type: "progress"; runId: string; info: OptimizeProgressInfo }
  | { type: "result"; runId: string; result: CLPResult }
  | { type: "error"; runId: string; message: string };

let cancelled = false;
let currentRunId: string | null = null;

self.addEventListener("message", (e: MessageEvent<WorkerInbound>) => {
  const msg = e.data;
  if (msg.type === "cancel") {
    if (currentRunId === msg.runId) cancelled = true;
    return;
  }
  if (msg.type !== "optimize") return;
  cancelled = false;
  currentRunId = msg.runId;
  try {
    const result = optimize(msg.input, {
      onProgress: (info) =>
        post({ type: "progress", runId: msg.runId, info }),
      isCancelled: () => cancelled,
    });
    post({ type: "result", runId: msg.runId, result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    post({ type: "error", runId: msg.runId, message });
  } finally {
    currentRunId = null;
  }
});

function post(msg: WorkerOutbound) {
  (self as unknown as DedicatedWorkerGlobalScope).postMessage(msg);
}

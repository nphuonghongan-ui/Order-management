/**
 * Optimizer store — tracks the latest CLP run and its progress.
 *
 * Components subscribe to this store to drive the loading screen
 * and the result view. The `useOptimizer` hook bridges to the
 * worker and dispatches updates here.
 */

import { create } from "zustand";
import type { CLPInput, CLPResult } from "@/lib/clp/types";
import type { ContainerTypeId } from "@/components/container-viewer/units";
import type { BoxPlacement } from "@/components/container-viewer/types";

export type OptimizerStatus = "idle" | "running" | "done" | "error";

export interface OptimizerProgress {
  phase: "single" | "split" | "sa";
  current: number;
  total: number;
  bestPerContainer: { containerTypeId: ContainerTypeId; fillPct: number }[];
}

interface State {
  status: OptimizerStatus;
  progress: OptimizerProgress | null;
  result: CLPResult | null;
  error: string | null;
  runId: string | null;
  /** Most recent input (kept so "Re-run" can re-use it). */
  lastInput: CLPInput | null;
  /** plId associated with the current run, for navigation. */
  plId: string | null;
}

interface Actions {
  start: (input: CLPInput, plId: string) => string;
  setProgress: (info: OptimizerProgress) => void;
  setResult: (result: CLPResult) => void;
  setError: (message: string) => void;
  reset: () => void;
  /** Get the placements of a specific container in the last result. */
  getContainerPlacements: (containerTypeId: ContainerTypeId) => BoxPlacement[];
}

const initial: State = {
  status: "idle",
  progress: null,
  result: null,
  error: null,
  runId: null,
  lastInput: null,
  plId: null,
};

function newRunId(): string {
  return `run-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export const useOptimizerStore = create<State & Actions>((set, get) => ({
  ...initial,

  start: (input, plId) => {
    const runId = newRunId();
    set({
      status: "running",
      progress: null,
      result: null,
      error: null,
      runId,
      lastInput: input,
      plId,
    });
    return runId;
  },

  setProgress: (info) => set({ progress: info }),

  setResult: (result) =>
    set({
      status: "done",
      result,
      progress: null,
    }),

  setError: (message) =>
    set({
      status: "error",
      error: message,
      progress: null,
    }),

  reset: () => set({ ...initial }),

  getContainerPlacements: (containerTypeId) => {
    const { result } = get();
    if (!result) return [];
    const c = result.containers.find(
      (x) => x.containerTypeId === containerTypeId
    );
    return c?.placements ?? [];
  },
}));

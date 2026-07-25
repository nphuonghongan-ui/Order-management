/**
 * OptimizationRunPage — the "▶ Play" entry point from the
 * PackingList page. Loads the packing list, kicks off the
 * optimizer, and renders either the progress screen or the
 * 3D multi-container result.
 *
 * Route: /dashboard/packing-list/:plId/loading/run
 */

import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { AlertCircle, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPackingList } from "@/lib/apis/packingListApi";
import { getPartNumDimensions } from "@/components/packing-list/exportEnrichment";
import { packingListToCLPInput } from "@/lib/clp/adaptInput";
import { useOptimizer, type RunHandle } from "@/hooks/useOptimizer";
import { useOptimizerStore } from "@/stores/useOptimizerStore";
import { useContainerListStore } from "@/stores/useContainerListStore";
import { loadContainersCached } from "@/lib/apis/containerApi";
import { OptimizationProgress } from "@/components/container-viewer/OptimizationProgress";
import { MultiContainerResultView } from "@/components/container-viewer/MultiContainerResultView";
import type { PackingListRecord } from "@/components/packing-list/types";
import type { CLPMode, LoadingStrategy } from "@/lib/clp/types";

type RunStage = "loading" | "configuring" | "running" | "done" | "error";

export default function OptimizationRunPage() {
  const { plId } = useParams<{ plId: string }>();
  const [search] = useSearchParams();
  const navigate = useNavigate();

  const [record, setRecord] = useState<PackingListRecord | null>(null);
  const [partNumToDim, setPartNumToDim] = useState<
    Map<string, { length: number; width: number; height: number }> | null
  >(null);
  const [stage, setStage] = useState<RunStage>("loading");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mode, setMode] = useState<CLPMode>("auto");
  const [loadingStrategy, setLoadingStrategy] =
    useState<LoadingStrategy>("tight");
  const [saIters, setSaIters] = useState(0);
  const [runHandle, setRunHandle] = useState<RunHandle | null>(null);

  const status = useOptimizerStore((s) => s.status);
  const result = useOptimizerStore((s) => s.result);
  const error = useOptimizerStore((s) => s.error);
  const reset = useOptimizerStore((s) => s.reset);

  const containersLoaded = useContainerListStore((s) => s.loaded);
  const containerTypes = useContainerListStore((s) => s.types);
  const setContainerTypes = useContainerListStore((s) => s.setTypes);

  const { run } = useOptimizer();

  // Allow `?auto=1` to start running immediately.
  const autoStart = search.get("auto") === "1";

  // Load the packing list + dimensions once.
  useEffect(() => {
    if (!plId) {
      setLoadError("Missing packing list id");
      setStage("error");
      return;
    }
    let alive = true;
    (async () => {
      try {
        const [data, dims] = await Promise.all([
          getPackingList(plId),
          getPartNumDimensions(),
        ]);
        if (!alive) return;
        setRecord(data);
        setPartNumToDim(dims);
        setStage("configuring");
      } catch (err) {
        if (!alive) return;
        const msg =
          err instanceof Error ? err.message : "Failed to load packing list";
        setLoadError(msg);
        setStage("error");
      }
    })();
    return () => {
      alive = false;
    };
  }, [plId]);

  useEffect(() => {
    if (autoStart && stage === "configuring" && record && partNumToDim && containersLoaded) {
      void startRun();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, stage, record, partNumToDim, containersLoaded]);

  // Pre-warm the container-type list (sessionStorage-cached).
  useEffect(() => {
    if (containersLoaded) return;
    let alive = true;
    (async () => {
      try {
        const types = await loadContainersCached();
        if (!alive) return;
        setContainerTypes(types);
      } catch (err) {
        if (!alive) return;
        const msg =
          err instanceof Error ? err.message : "Failed to load container types";
        setLoadError(msg);
        setStage("error");
      }
    })();
    return () => {
      alive = false;
    };
  }, [containersLoaded, setContainerTypes]);

  // Mirror status -> stage.
  useEffect(() => {
    if (status === "running" && stage !== "running") setStage("running");
    if (status === "done" && stage !== "done") setStage("done");
    if (status === "error" && stage !== "error") setStage("error");
  }, [status, stage]);

  const startRun = useCallback(async () => {
    if (!plId || !record || !partNumToDim) return;
    reset();
    setStage("running");
    const input = packingListToCLPInput({
      record,
      partNumToDim,
      availableContainers: containerTypes.map((c) => c.typeId),
      containerTypes,
      mode,
      saIters,
      saT0: 1.0,
      saAlpha: 0.997,
      groupIdentical: true,
      minSupportRatio: 0.6,
      loadingStrategy,
    });
    const handle = run(input, plId);
    setRunHandle(handle);
    try {
      await handle.promise;
    } catch {
      // error is already in store
    }
  }, [plId, record, partNumToDim, mode, saIters, loadingStrategy, reset, run, containerTypes]);

  const cancelRun = useCallback(() => {
    runHandle?.cancel();
    setStage("configuring");
    reset();
  }, [runHandle, reset]);

  if (stage === "loading") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b0f1a] text-white">
        <div className="text-sm font-medium tracking-wide">
          Loading packing list
          <span aria-hidden="true">…</span>
        </div>
      </div>
    );
  }

  if (stage === "error") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-[#0b0f1a] text-white px-6">
        <div className="rounded-full bg-destructive/10 p-3">
          <AlertCircle size={22} className="text-destructive" />
        </div>
        <p className="text-sm text-destructive max-w-md text-center">
          {loadError ?? error ?? "Optimization failed"}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/packing-list")}
          >
            Back
          </Button>
        </div>
      </div>
    );
  }

  if (stage === "configuring") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-[#0b0f1a] text-white px-6">
        <div className="flex flex-col items-center gap-1 text-center">
          <Truck size={28} className="text-white/80" />
          <p className="text-lg font-semibold tracking-wide">
            {record?.plNumber ?? plId}
          </p>
          <p className="text-xs text-white/60">
            {record?.itemsCount ?? 0} item
            {(record?.itemsCount ?? 0) === 1 ? "" : "s"} · choose mode and run
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(["auto", "single", "split"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={
                "rounded-md border px-3 py-2 text-xs font-semibold uppercase tracking-widest transition-colors " +
                (mode === m
                  ? "bg-white text-[#0b0f1a] border-transparent"
                  : "bg-white/5 text-white/80 border-white/10 hover:bg-white/10")
              }
            >
              {m}
            </button>
          ))}
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] uppercase tracking-widest font-semibold text-white/50">
            Loading strategy
          </span>
          <div className="grid grid-cols-2 gap-2 w-[260px]">
            {(
              [
                { v: "tight", label: "Tight pack", hint: "max fill" },
                { v: "corner-first", label: "Corner-first", hint: "easy cargo" },
              ] as const
            ).map((s) => (
              <button
                key={s.v}
                type="button"
                onClick={() => setLoadingStrategy(s.v)}
                className={
                  "rounded-md border px-3 py-2 text-xs font-semibold transition-colors flex flex-col items-center gap-0.5 " +
                  (loadingStrategy === s.v
                    ? "bg-white text-[#0b0f1a] border-transparent"
                    : "bg-white/5 text-white/80 border-white/10 hover:bg-white/10")
                }
              >
                <span className="uppercase tracking-widest">{s.label}</span>
                <span
                  className={
                    "text-[10px] font-normal " +
                    (loadingStrategy === s.v
                      ? "text-[#0b0f1a]/60"
                      : "text-white/50")
                  }
                >
                  {s.hint}
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center gap-2 text-xs text-white/60">
          <label className="flex items-center gap-2">
            <span className="uppercase tracking-widest font-semibold">
              SA iters
            </span>
            <input
              type="number"
              min={0}
              max={50000}
              step={1000}
              value={saIters}
              onChange={(e) =>
                setSaIters(Math.max(0, parseInt(e.target.value, 10) || 0))
              }
              className="w-24 rounded-md bg-white/5 border border-white/10 px-2 py-1 text-right font-mono text-white"
            />
          </label>
          <span>0 = greedy only. Higher = slower + better.</span>
        </div>
        <Button
          size="lg"
          onClick={() => void startRun()}
          className="gap-2"
          disabled={!record || !partNumToDim || !containersLoaded}
        >
          ▶ Run optimization
        </Button>
        <button
          type="button"
          onClick={() => navigate("/dashboard/packing-list")}
          className="text-xs text-white/50 hover:text-white transition-colors"
        >
          Back
        </button>
      </div>
    );
  }

  if (stage === "running") {
    return <OptimizationProgress onCancel={cancelRun} />;
  }

  // done
  if (result) {
    return (
      <MultiContainerResultView
        plId={plId ?? ""}
        plNumber={record?.plNumber}
        onRerun={() => setStage("configuring")}
      />
    );
  }

  return null;
}

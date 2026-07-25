/**
 * OptimizationProgress — the loading screen shown while the CLP
 * worker is running. Mirrors the design language of
 * `components/LoadingScreen.tsx` but adds:
 *   - a progress bar
 *   - per-container candidate fill % preview
 *   - cancel button
 */

import { Loader2, X } from "lucide-react";
import { useOptimizerStore } from "@/stores/useOptimizerStore";
import { getContainerTypes } from "@/components/container-viewer/units";
import { cn } from "@/lib/utils/utils";

interface Props {
  onCancel: () => void;
}

export function OptimizationProgress({ onCancel }: Props) {
  const progress = useOptimizerStore((s) => s.progress);
  const error = useOptimizerStore((s) => s.error);

  const pct = progress
    ? Math.min(
        100,
        progress.total > 0
          ? (progress.current / progress.total) * 100
          : 0
      )
    : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 px-6"
      style={{ background: "#08122C" }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="absolute size-7 text-[#3B6FD9]/30"
            style={{
              top: `${5 + ((i * 31) % 80)}%`,
              left: `${10 + ((i * 47) % 80)}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center gap-5 w-full max-w-md">
        <Loader2 size={36} className="animate-spin text-white" />
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-base font-medium tracking-wide text-white">
            Optimizing container layout
            <span aria-hidden="true">…</span>
          </p>
          {error ? (
            <p className="text-xs text-rose-300">{error}</p>
          ) : (
            <p className="text-xs text-white/60">
              Trying 6 container types · extreme points + best-fit
            </p>
          )}
        </div>

        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-300",
              error ? "bg-rose-400" : "bg-[#3B6FD9]"
            )}
            style={{ width: `${pct}%` }}
          />
        </div>

        {progress && progress.bestPerContainer.length > 0 && (
          <div className="w-full grid gap-1.5">
            {progress.bestPerContainer.map((c) => {
              const t = getContainerTypes().find(
                (x) => x.typeId === c.containerTypeId
              );
              return (
                <div
                  key={c.containerTypeId}
                  className="flex items-center justify-between gap-3 rounded-md bg-white/5 px-3 py-1.5 text-[11px] font-mono"
                >
                  <span className="text-white/80">
                    {t?.label ?? c.containerTypeId}
                  </span>
                  <span className="text-white font-semibold tabular-nums">
                    {c.fillPct.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 rounded-md bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-white/70 hover:bg-white/10 hover:text-white transition-colors"
        >
          <X size={12} /> Cancel
        </button>
      </div>
    </div>
  );
}

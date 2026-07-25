/**
 * ResultsSidebar — right-side panel for the multi-container
 * result view. Shows one row per container with type, fill%,
 * weight, item count, and an "Edit" button.
 */

import { useNavigate } from "react-router";
import { ArrowRight, Box, Maximize2, Weight } from "lucide-react";
import { getContainerType } from "@/components/container-viewer/units";
import type { CLPResult } from "@/lib/clp/types";
import { cn } from "@/lib/utils/utils";
import { exportDat } from "./datExport";

interface Props {
  result: CLPResult;
  plId: string;
  selectedIdx: number | null;
  onSelect: (idx: number | null) => void;
}

export function ResultsSidebar({ result, plId, selectedIdx, onSelect }: Props) {
  const navigate = useNavigate();

  return (
    <aside className="w-72 shrink-0 border-l border-border bg-card/85 backdrop-blur flex flex-col">
      <div className="px-4 py-3 border-b border-border">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
          Containers
        </div>
        <div className="mt-1 text-lg font-semibold font-mono">
          {result.containers.length}
          <span
            className={cn(
              "ml-2 text-xs font-normal",
              result.totalItemsPlaced < result.totalItems
                ? "text-destructive font-semibold"
                : "text-muted-foreground",
            )}
          >
            · {result.totalItemsPlaced}/{result.totalItems} units
          </span>
        </div>
        <div className="mt-0.5 text-xs text-muted-foreground">
          Avg fill {result.totalFillPct.toFixed(1)}% ·{" "}
          {(result.totalWeightKg / 1000).toFixed(2)} t · cost{" "}
          {result.totalCost.toFixed(2)}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {result.containers.map((c, idx) => {
          const t = getContainerType(c.containerTypeId);
          const fillTone =
            c.fillPct > 95
              ? "text-destructive"
              : c.fillPct > 80
                ? "text-warning"
                : "text-success";
          const isSelected = selectedIdx === idx;
          const unplacedCount = c.unplaced.reduce(
            (s, u) => s + (u.qty ?? 1),
            0,
          );
          return (
            <div
              key={`${c.containerTypeId}-${idx}`}
              role="button"
              tabIndex={0}
              onClick={() => onSelect(isSelected ? null : idx)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(isSelected ? null : idx);
                }
              }}
              className={cn(
                "px-4 py-3 border-b border-border cursor-pointer transition-colors",
                isSelected
                  ? "bg-primary-light/10"
                  : "hover:bg-muted/50"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold truncate">
                  {t.label}
                </span>
                <span
                  className={cn(
                    "font-mono text-sm font-bold tabular-nums",
                    fillTone
                  )}
                >
                  {c.fillPct.toFixed(1)}%
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-3 text-[11px] text-muted-foreground font-mono">
                <span className="inline-flex items-center gap-1">
                  <Box size={11} /> {c.placements.length}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Weight size={11} /> {(c.weightUsedKg / 1000).toFixed(2)} t
                </span>
                <span className="inline-flex items-center gap-1">
                  <Maximize2 size={11} /> {t.costFactor.toFixed(1)}x
                </span>
              </div>
              {unplacedCount > 0 && (
                <div className="mt-1 text-[10px] text-warning font-mono leading-snug">
                  {unplacedCount} unplaced ·{" "}
                  {c.unplaced
                    .map((u) => `${u.partNum} ×${u.qty ?? 1}`)
                    .join(", ")}
                </div>
              )}
              <div className="mt-2 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(
                      `/dashboard/packing-list/${plId}/container-viewer?runId=${result.runId}&container=${c.containerTypeId}&idx=${idx}`
                    );
                  }}
                  className="inline-flex items-center gap-1 rounded-md bg-card border border-border px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-foreground hover:bg-muted transition-colors"
                >
                  Edit <ArrowRight size={11} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const text = exportDat({
                      containerTypeId: c.containerTypeId,
                      boxes: c.placements,
                    });
                    const blob = new Blob([text], {
                      type: "text/plain;charset=utf-8",
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${plId}-${c.containerTypeId}-${idx + 1}.dat`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  className="inline-flex items-center gap-1 rounded-md bg-card border border-border px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-foreground hover:bg-muted transition-colors"
                >
                  DAT
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-4 py-3 border-t border-border space-y-1.5 text-[10px] text-muted-foreground font-mono">
        <div>Mode: {result.mode}</div>
        <div>Run: {result.runId}</div>
      </div>
    </aside>
  );
}

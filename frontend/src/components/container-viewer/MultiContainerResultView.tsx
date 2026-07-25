/**
 * MultiContainerResultView — the post-optimization 3D scene
 * showing all chosen containers side-by-side, plus the per-
 * container sidebar.
 */

import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, RefreshCw, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EMPTY } from "@/lib/format";
import { useOptimizerStore } from "@/stores/useOptimizerStore";
import { MultiScene } from "./MultiScene";
import { ResultsSidebar } from "./ResultsSidebar";

interface Props {
  plId: string;
  plNumber?: string;
  onRerun: () => void;
}

export function MultiContainerResultView({
  plId,
  plNumber,
  onRerun,
}: Props) {
  const result = useOptimizerStore((s) => s.result);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);
  const navigate = useNavigate();

  if (!result) return null;

  return (
    <div className="fixed inset-0 flex flex-col bg-[#0b0f1a]">
      <header className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-border bg-card/85 backdrop-blur z-10">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => navigate("/dashboard/packing-list")}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            title="Back"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <div className="rounded bg-primary-light/10 p-1">
              <Truck size={11} className="text-primary-light" />
            </div>
            <span className="font-mono text-sm font-semibold">
              {plNumber ?? plId ?? EMPTY}
            </span>
            <span className="text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-success/15 text-success font-semibold">
              {result.containers.length} container
              {result.containers.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono text-muted-foreground">
          <span>
            {result.totalItemsPlaced}/{result.totalItems} placed
          </span>
          <span>avg fill {result.totalFillPct.toFixed(1)}%</span>
          <span>{(result.totalWeightKg / 1000).toFixed(2)} t</span>
          <span>cost {result.totalCost.toFixed(2)}</span>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={onRerun}
          className="gap-1.5"
        >
          <RefreshCw size={12} /> Re-run
        </Button>
      </header>

      <div className="flex-1 flex min-h-0">
        <div className="flex-1 relative">
          <MultiScene
            result={result}
            selectedContainerIdx={selectedIdx}
            onSelectContainer={setSelectedIdx}
            selectedBoxId={selectedBoxId}
            onSelectBox={setSelectedBoxId}
          />
        </div>
        <ResultsSidebar
          result={result}
          plId={plId}
          selectedIdx={selectedIdx}
          onSelect={setSelectedIdx}
        />
      </div>
    </div>
  );
}

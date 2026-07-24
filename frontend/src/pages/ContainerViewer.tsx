import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Loader2, AlertCircle, Truck } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { getPackingList } from "@/lib/apis/packingListApi";
import { getPartNumDimensions } from "@/components/packing-list/exportEnrichment";
import type { PackingListRecord } from "@/components/packing-list/types";
import { EMPTY } from "@/lib/format";
import { Scene } from "@/components/container-viewer/Scene";
import { TopBar } from "@/components/container-viewer/TopBar";
import { Toolbar } from "@/components/container-viewer/Toolbar";
import { useContainerStore } from "@/stores/useContainerStore";
import type { BoxPlacement } from "@/components/container-viewer/types";
import { getContainerType, type ContainerTypeId } from "@/components/container-viewer/units";

/**
 * Quick packing strategy used to seed the 3D scene before the customer takes
 * over. The real model is the Data Engineer's optimizer — this just stacks
 * boxes left-to-right, front-to-back, bottom-to-top so the operator has
 * something to look at and edit.
 */
function seedBoxes(
  record: PackingListRecord,
  partNumToDim: Map<string, { length: number; width: number; height: number }>,
  containerTypeId: ContainerTypeId,
): BoxPlacement[] {
  const container = getContainerType(containerTypeId);
  const { l, w, h } = container.inner;

  const out: BoxPlacement[] = [];
  let cursorX = -l / 2;
  let cursorZ = -w / 2;
  let cursorY = 0;
  let rowMaxH = 0;
  let sliceMaxL = 0;

  for (let i = 0; i < record.items.length; i++) {
    const item = record.items[i];
    if (!item) continue;
    const dim = partNumToDim.get(item.partNum) ?? { length: 0, width: 0, height: 0 };
    const sizeL = dim.length || 1;
    const sizeW = dim.width || 1;
    const sizeH = dim.height || 1;
    if (sizeL > l || sizeW > w || sizeH > h) continue;

    if (cursorX + sizeL > l / 2) {
      cursorX = -l / 2;
      cursorZ += sliceMaxL + 20;
      sliceMaxL = 0;
    }
    if (cursorZ + sizeW > w / 2) {
      cursorZ = -w / 2;
      cursorY += rowMaxH + 20;
      rowMaxH = 0;
    }
    if (cursorY + sizeH > h) break;

    out.push({
      id: `seed-${i}`,
      partNum: item.partNum,
      poNum: item.poNum,
      size: { l: sizeL, w: sizeW, h: sizeH },
      position: {
        x: cursorX + sizeL / 2,
        y: cursorY,
        z: cursorZ + sizeW / 2,
      },
      rotationY: 0,
      weightKg: 0,
      qty: 1,
    });
    cursorX += sizeL + 20;
    sliceMaxL = Math.max(sliceMaxL, sizeW);
    rowMaxH = Math.max(rowMaxH, sizeH);
  }
  return out;
}

export default function ContainerViewer() {
  const { plId } = useParams<{ plId: string }>();
  const navigate = useNavigate();
  const [toolbarOpen, setToolbarOpen] = useState(true);

  const [record, setRecord] = useState<PackingListRecord | null>(null);
  const [partNumToDim, setPartNumToDim] = useState<
    Map<string, { length: number; width: number; height: number }>
  >(() => new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const setBoxes = useContainerStore((s) => s.setBoxes);
  const reset = useContainerStore((s) => s.reset);
  const undo = useContainerStore((s) => s.undo);
  const redo = useContainerStore((s) => s.redo);

  const load = useCallback(async () => {
    if (!plId) {
      setError("Missing packing list id");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [data, dimMap] = await Promise.all([
        getPackingList(plId),
        getPartNumDimensions(),
      ]);
      setRecord(data);
      setPartNumToDim(dimMap);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to load packing list";
      setError(msg);
      setRecord(null);
      setPartNumToDim(new Map());
    } finally {
      setLoading(false);
    }
  }, [plId]);

  useEffect(() => {
    void load();
  }, [load]);

  // Seed the 3D scene once data is ready.
  useEffect(() => {
    if (!record) return;
    const state = useContainerStore.getState();
    const seeded = seedBoxes(record, partNumToDim, state.containerTypeId);
    setBoxes(seeded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record, partNumToDim]);

  useEffect(() => {
    return () => reset();
  }, [reset]);

  // Keyboard shortcuts: Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z, q/g/r/s, Esc.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        useContainerStore.getState().selectBox(null);
        return;
      }
      const meta = e.ctrlKey || e.metaKey;
      if (meta && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      const { setTool, selectedId, axisConstraint, setAxisConstraint } =
        useContainerStore.getState();
      if (!meta) {
        const key = e.key.toLowerCase();
        const toolMap: Record<string, "select" | "move" | "rotate" | "scale"> = {
          q: "select",
          g: "move",
          r: "rotate",
          s: "scale",
        };
        const tool = toolMap[key];
        if (tool) {
          setTool(tool);
          return;
        }
        // X / Y / Z — toggle axis lock on the gizmo (when a box is
        // selected). Pressing the same key again unlocks.
        if (selectedId && (key === "x" || key === "y" || key === "z")) {
          setAxisConstraint(
            axisConstraint === key
              ? "all"
              : (key as "x" | "y" | "z"),
          );
          e.preventDefault();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo]);

  const handleBack = useCallback(() => {
    navigate("/dashboard/packing-list");
  }, [navigate]);

  return (
    <PageShell className="h-screen overflow-hidden">
      <div className="fixed inset-0 bg-[#0b0f1a]">
        {/* 3D viewport fills the window */}
        <Scene />

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Loader2 size={28} className="animate-spin text-white/70" />
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
            <div className="rounded-full bg-destructive/10 p-3">
              <AlertCircle size={22} className="text-destructive" />
            </div>
            <p className="text-sm text-destructive max-w-sm">{error}</p>
            <Button variant="outline" size="sm" onClick={() => void load()}>
              Retry
            </Button>
          </div>
        )}

        {/* Floating top bar — container picker + fill stats */}
        {!loading && !error && (
          <div className="absolute top-3 left-3 right-3 sm:right-[272px] pointer-events-auto z-10">
            <div className="rounded-xl bg-card/85 backdrop-blur border border-border shadow-lg overflow-hidden">
              <TopBar />
            </div>
          </div>
        )}

        {/* Floating right toolbar — collapsible */}
        {!loading && !error && toolbarOpen && (
          <div className="absolute top-3 right-3 bottom-3 w-64 pointer-events-auto z-10">
            <div className="h-full rounded-xl bg-card/85 backdrop-blur border border-border shadow-lg overflow-hidden">
              <Toolbar plNumber={record?.plNumber} partNumToDim={partNumToDim} />
            </div>
          </div>
        )}

        {/* Toolbar pin/unpin toggle */}
        {!loading && !error && (
          <button
            type="button"
            onClick={() => setToolbarOpen((v) => !v)}
            className="absolute top-3 right-3 z-20 rounded-md bg-card/85 backdrop-blur border border-border px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            style={{ marginTop: toolbarOpen ? "calc(100vh - 60px)" : 0 }}
            title={toolbarOpen ? "Hide toolbar" : "Show toolbar"}
          >
            {toolbarOpen ? "×" : "≡"}
          </button>
        )}

        {/* Floating mini-header — Back button + plNumber */}
        <div className="absolute bottom-3 left-3 z-10 pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            onClick={handleBack}
            className="rounded-md bg-card/85 backdrop-blur border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-1.5"
            title="Back to Packing List"
          >
            <ArrowLeft size={12} /> Back
          </button>
          <div className="rounded-md bg-card/85 backdrop-blur border border-border px-3 py-1.5 text-xs font-mono flex items-center gap-2">
            <div className="rounded bg-primary-light/10 p-1">
              <Truck size={11} className="text-primary-light" />
            </div>
            <span className="font-semibold">
              {record?.plNumber ?? plId ?? EMPTY}
            </span>
            {record && (
              <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-success/15 text-success">
                {record.itemsCount} item{record.itemsCount === 1 ? "" : "s"}
              </span>
            )}
          </div>
        </div>

        {/* Controls hint */}
        <div className="absolute bottom-3 right-100 z-10 pointer-events-none text-[10px] text-white/40 font-mono">
          LMB rotate · RMB pan · Wheel zoom · Esc deselect · G/M/R/S tools
        </div>
      </div>
    </PageShell>
  );
}

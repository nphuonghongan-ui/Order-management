import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils/utils";
import { useClpStore } from "@/stores/useClpStore";
import type {
  BoxPlacement,
  ClpStats,
  ToolMode,
  ViewPreset,
  AxisConstraint,
} from "@/lib/clp/types";
import { formatNumber } from "@/lib/format";

const TOOLS: { id: ToolMode; label: string }[] = [
  { id: "select", label: "SELECT" },
  { id: "move", label: "MOVE" },
  { id: "rotate", label: "ROTATE" },
  { id: "scale", label: "SCALE" },
];

const VIEWS: { id: ViewPreset; label: string }[] = [
  { id: "iso", label: "Iso" },
  { id: "top", label: "Top" },
  { id: "front", label: "Front" },
  { id: "right", label: "Right" },
];

const AXISES = ["x", "y", "z"] as const;

interface SectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Section({ title, children, defaultOpen = true }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border/60 px-3 py-2 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
      >
        {title}
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
      </button>
      {open && <div className="mt-2">{children}</div>}
    </div>
  );
}

function ToolButton({ id, label }: { id: ToolMode; label: string }) {
  const tool = useClpStore((s) => s.tool);
  const setTool = useClpStore((s) => s.setTool);
  return (
    <button
      type="button"
      onClick={() => setTool(id)}
      className={cn(
        "rounded-md px-2 py-2 text-[10px] font-semibold transition-colors",
        tool === id
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-foreground hover:bg-muted/70"
      )}
    >
      {label}
    </button>
  );
}

interface PartGroup {
  partNum: string;
  color: string;
  qty: number;
  weightKg: number;
  volumeMm3: number;
}

interface ToolbarProps {
  onGenerateDat: () => void;
  onCopyDat: () => void;
  canExport: boolean;
  containerLabel: string;
  containerInnerCm: { l: number; w: number; h: number };
  stats: ClpStats | null;
  placements: BoxPlacement[];
}

export default function Toolbar({
  onGenerateDat,
  onCopyDat,
  canExport,
  containerLabel,
  containerInnerCm,
  stats,
  placements,
}: ToolbarProps) {
  const axisConstraint = useClpStore((s) => s.axisConstraint);
  const setAxisConstraint = useClpStore((s) => s.setAxisConstraint);
  const space = useClpStore((s) => s.space);
  const setSpace = useClpStore((s) => s.setSpace);
  const view = useClpStore((s) => s.view);
  const setView = useClpStore((s) => s.setView);
  const showWalls = useClpStore((s) => s.showWalls);
  const showGrid = useClpStore((s) => s.showGrid);
  const showAxes = useClpStore((s) => s.showAxes);
  const showLabels = useClpStore((s) => s.showLabels);
  const toggleWalls = useClpStore((s) => s.toggleWalls);
  const toggleGrid = useClpStore((s) => s.toggleGrid);
  const toggleAxes = useClpStore((s) => s.toggleAxes);
  const toggleLabels = useClpStore((s) => s.toggleLabels);

  const partGroups = useMemo<PartGroup[]>(() => {
    const map = new Map<string, PartGroup>();
    for (const p of placements) {
      const existing = map.get(p.partNum);
      const vol = p.size.l * p.size.w * p.size.h;
      if (existing) {
        existing.qty += 1;
        existing.weightKg += p.weightKg;
        existing.volumeMm3 += vol;
      } else {
        map.set(p.partNum, {
          partNum: p.partNum,
          color: p.color ?? "#3b6fd9",
          qty: 1,
          weightKg: p.weightKg,
          volumeMm3: vol,
        });
      }
    }
    return Array.from(map.values()).sort(
      (a, b) => b.volumeMm3 - a.volumeMm3
    );
  }, [placements]);

  const containerVolumeMm3 =
    containerInnerCm.l *
    containerInnerCm.w *
    containerInnerCm.h *
    1000;
  const usedVolumeMm3 = stats?.usedVolumeMm3 ?? 0;
  const freeVolumeMm3 = Math.max(containerVolumeMm3 - usedVolumeMm3, 0);

  return (
    <aside className="pointer-events-auto flex h-full w-72 flex-col border-l border-border bg-white text-foreground">
      <Tabs defaultValue="editor" className="flex flex-1 flex-col overflow-hidden">
        <div className="border-b border-border/60 px-3 pt-2">
          <TabsList className="w-full justify-start gap-2">
            <TabsTrigger value="editor" className="px-2 text-[11px]">
              Editor
            </TabsTrigger>
            <TabsTrigger value="summary" className="px-2 text-[11px]">
              Summary
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="editor"
          className="mt-0 flex-1 overflow-y-auto"
        >
          <Section title="Transform">
            <div className="grid grid-cols-4 gap-1">
              {TOOLS.map((t) => (
                <ToolButton key={t.id} id={t.id} label={t.label} />
              ))}
            </div>
          </Section>

          <Section title="Constraints">
            <div className="space-y-2">
              <div>
                <div className="mb-1 text-[10px] text-muted-foreground">AXES</div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setAxisConstraint("all")}
                    className={cn(
                      "rounded-md px-2 py-1 text-[10px] font-semibold",
                      axisConstraint === "all"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    ALL
                  </button>
                  {AXISES.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setAxisConstraint(a as AxisConstraint)}
                      className={cn(
                        "rounded-md px-2 py-1 text-[10px] font-semibold",
                        axisConstraint === a
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      {a.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-1 text-[10px] text-muted-foreground">SPACE</div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setSpace("world")}
                    className={cn(
                      "rounded-md px-2 py-1 text-[10px] font-semibold",
                      space === "world"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    WORLD
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpace("local")}
                    className={cn(
                      "rounded-md px-2 py-1 text-[10px] font-semibold",
                      space === "local"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    LOCAL
                  </button>
                </div>
              </div>
            </div>
          </Section>

          <Section title="View">
            <div className="grid grid-cols-4 gap-1">
              <button
                type="button"
                onClick={() => setView("iso")}
                className={cn(
                  "rounded-md px-2 py-1.5 text-[10px] font-semibold",
                  view === "iso"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                Iso
              </button>
              {VIEWS.filter((v) => v.id !== "iso").map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setView(v.id)}
                  className={cn(
                    "rounded-md px-2 py-1.5 text-[10px] font-semibold",
                    view === v.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </Section>

          <Section title="Visibility">
            <div className="space-y-1.5">
              {[
                { label: "Walls", value: showWalls, toggle: toggleWalls },
                { label: "Grid", value: showGrid, toggle: toggleGrid },
                { label: "Axes", value: showAxes, toggle: toggleAxes },
                { label: "Labels", value: showLabels, toggle: toggleLabels },
              ].map((row) => (
                <label
                  key={row.label}
                  className="flex cursor-pointer items-center justify-between rounded px-1 py-1 text-[11px] hover:bg-muted/50"
                >
                  <span>{row.label}</span>
                  <input
                    type="checkbox"
                    checked={row.value}
                    onChange={row.toggle}
                    className="h-3.5 w-3.5 accent-primary"
                  />
                </label>
              ))}
            </div>
          </Section>
        </TabsContent>

        <TabsContent
          value="summary"
          className="mt-0 flex-1 overflow-y-auto"
        >
          <div className="px-3 pb-3 pt-2 text-[11px]">
            <div className="text-xs font-semibold text-foreground">
              {containerLabel}
            </div>
            <div className="mt-0.5 text-[10px] text-muted-foreground">
              {containerInnerCm.l.toFixed(1)} cm ×{" "}
              {containerInnerCm.w.toFixed(1)} cm ×{" "}
              {containerInnerCm.h.toFixed(1)} cm
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 border-b border-border/60 px-3 py-3">
            <SummaryStat
              label="Items"
              value={formatNumber(stats?.itemCount ?? 0)}
            />
            <SummaryStat
              label="Fill"
              value={`${(stats?.fillPct ?? 0).toFixed(1)}%`}
            />
            <SummaryStat
              label="Weight"
              value={
                stats
                  ? `${formatNumber(Math.round(stats.weightKg))} kg`
                  : "–"
              }
            />
            <SummaryStat
              label="Volume"
              value={
                stats
                  ? `${(stats.usedVolumeMm3 / 1e9).toFixed(2)} m³`
                  : "–"
              }
            />
            <SummaryStat
              label="Free volume"
              value={`${(freeVolumeMm3 / 1e9).toFixed(2)} m³`}
              className="col-span-2"
            />
          </div>

          <div className="px-3 pt-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            By part number
          </div>
          <div className="px-3 pb-3">
            <div className="grid grid-cols-[1.5rem_1fr_auto_auto] items-center gap-x-2 gap-y-1 pt-1 text-[10px] text-muted-foreground">
              <span />
              <span>Part</span>
              <span className="text-right">Weight</span>
              <span className="text-right">Volume</span>
            </div>
            {partGroups.length === 0 ? (
              <div className="pt-2 text-[11px] text-muted-foreground">
                No placements yet. Run the optimizer to see the breakdown.
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {partGroups.map((g) => (
                  <div
                    key={g.partNum}
                    className="grid grid-cols-[1.5rem_1fr_auto_auto] items-center gap-x-2 py-1.5 text-[11px]"
                  >
                    <span
                      className="inline-block h-3.5 w-3.5 rounded-sm border border-border/60"
                      style={{ background: g.color }}
                      aria-hidden
                    />
                    <span className="truncate font-mono" title={g.partNum}>
                      {g.partNum}
                    </span>
                    <span className="text-right tabular-nums">
                      {formatNumber(Math.round(g.weightKg))} kg
                    </span>
                    <span className="text-right tabular-nums">
                      {(g.volumeMm3 / 1e9).toFixed(2)} m³
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <div className="space-y-2 border-t border-border/60 p-3">
        <Button
          className="w-full gap-2"
          onClick={onGenerateDat}
          disabled={!canExport}
        >
          Generate DAT file
        </Button>
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={onCopyDat}
          disabled={!canExport}
        >
          Copy DAT
        </Button>
      </div>
    </aside>
  );
}

function SummaryStat({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-md border border-border/60 bg-muted/40 px-2 py-1.5",
        className
      )}
    >
      <div className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="text-sm font-semibold tabular-nums text-foreground">
        {value}
      </div>
    </div>
  );
}

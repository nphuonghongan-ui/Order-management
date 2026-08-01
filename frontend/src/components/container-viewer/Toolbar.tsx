import { useMemo, useState } from "react";
import {
  BarChart3,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils/utils";
import { getCdnUrl } from "@/lib/utils/cdn";
import { useClpStore } from "@/stores/useClpStore";
import type {
  BoxPlacement,
  ClpStats,
  ToolMode,
  ViewPreset,
  AxisConstraint,
} from "@/lib/clp/types";
import type { PickedItem } from "@/components/packing-list/types";
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

const CONTAINER_ICON_URL = getCdnUrl("container.png");

interface SectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  icon?: React.ReactNode;
}

function Section({ title, children, defaultOpen = true, icon }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border/60 px-3 pt-3 pb-5 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-[11px] font-bold uppercase tracking-wider text-foreground py-3 cursor-pointer"
      >
        <span className="flex items-center gap-2">
          {icon}
          {title}
        </span>
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
      {open && <div className="mt-3">{children}</div>}
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

interface PackingListPartGroup {
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
  containerMaxWeightKg: number;
  stats: ClpStats | null;
  placements: BoxPlacement[];
  packingListItems: PickedItem[];
}

export default function Toolbar({
  onGenerateDat,
  onCopyDat,
  canExport,
  containerLabel,
  containerInnerCm,
  containerMaxWeightKg,
  stats,
  placements,
  packingListItems,
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
  const highlightedPartNum = useClpStore((s) => s.highlightedPartNum);
  const toggleHighlightedPartNum = useClpStore(
    (s) => s.toggleHighlightedPartNum
  );

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

  const partColorMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const g of partGroups) m.set(g.partNum, g.color);
    return m;
  }, [partGroups]);

  const packingListPartGroups = useMemo<PackingListPartGroup[]>(() => {
    const map = new Map<string, PackingListPartGroup>();
    for (const item of packingListItems) {
      const existing = map.get(item.partNum);
      const lineVolumeMm3 = item.cbm * 1e9;
      const lineWeightKg = item.weightKg * item.qty;
      if (existing) {
        existing.qty += item.qty;
        existing.weightKg += lineWeightKg;
        existing.volumeMm3 += lineVolumeMm3;
      } else {
        map.set(item.partNum, {
          partNum: item.partNum,
          color: partColorMap.get(item.partNum) ?? "#94a3b8",
          qty: item.qty,
          weightKg: lineWeightKg,
          volumeMm3: lineVolumeMm3,
        });
      }
    }
    return Array.from(map.values()).sort(
      (a, b) => b.volumeMm3 - a.volumeMm3
    );
  }, [packingListItems, partColorMap]);

  const containerVolumeMm3 =
    containerInnerCm.l *
    containerInnerCm.w *
    containerInnerCm.h *
    1000;
  const usedVolumeMm3 = stats?.usedVolumeMm3 ?? 0;
  const freeVolumeMm3 = Math.max(containerVolumeMm3 - usedVolumeMm3, 0);
  const containerCbmM3 = containerVolumeMm3 / 1e9;

  const recordTotalQty = useMemo(
    () => packingListItems.reduce((s, it) => s + it.qty, 0),
    [packingListItems]
  );

  return (
    <aside className="pointer-events-auto flex h-full w-[26rem] flex-col border-l border-border bg-white text-foreground">
      <Tabs defaultValue="editor" className="flex flex-1 flex-col overflow-hidden">
        <div className="border-b border-border/60 px-3 pt-2">
          <TabsList className="w-full justify-start gap-2">
            <TabsTrigger value="editor" className="px-2 text-[11px] cursor-pointer">
              Editor
            </TabsTrigger>
            <TabsTrigger value="summary" className="px-2 text-[11px] cursor-pointer">
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
          <Section
            title="Container"
            defaultOpen
            icon={<Package size={14} className="text-muted-foreground" />}
          >
            <div className="rounded-xl border border-border/60 bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-amber-200 bg-amber-100 text-amber-700">
                  <img
                    src={CONTAINER_ICON_URL}
                    alt="Container"
                    className="h-[30px] w-[30px] object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-foreground">
                    {containerLabel}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {containerInnerCm.l.toFixed(1)} cm ×{" "}
                    {containerInnerCm.w.toFixed(1)} cm ×{" "}
                    {containerInnerCm.h.toFixed(1)} cm
                  </div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <StatCard
                  label="CBM"
                  value={`${containerCbmM3.toFixed(2)} m³`}
                />
                <StatCard
                  label="Max payload"
                  value={`${formatNumber(containerMaxWeightKg)} kg`}
                />
              </div>
            </div>
          </Section>

          <Section
            title="Packing List"
            defaultOpen
            icon={
              <ClipboardList size={14} className="text-muted-foreground" />
            }
          >
            <div className="rounded-xl border border-border/60 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <div className="grid grid-cols-[1.5rem_1fr_auto] items-center gap-x-3 border-b border-border/60 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <span />
                <span>Part</span>
                <div className="flex items-center gap-4 text-right">
                  <span className="w-7">Qty</span>
                  <span className="w-16">Weight</span>
                  <span className="w-20">CBM</span>
                </div>
              </div>
              {packingListPartGroups.length === 0 ? (
                <div className="px-3 py-4 text-center text-[11px] text-muted-foreground">
                  No packing list items yet.
                </div>
              ) : (
                <div className="divide-y divide-border/60">
                  {packingListPartGroups.map((g) => {
                    const isActive = highlightedPartNum === g.partNum;
                    return (
                      <button
                        key={g.partNum}
                        type="button"
                        onClick={() => toggleHighlightedPartNum(g.partNum)}
                        className={cn(
                          "grid w-full grid-cols-[1.5rem_1fr_auto] items-center gap-x-3 px-3 py-2 text-left text-[11px] transition-colors cursor-pointer",
                          isActive
                            ? "bg-muted/60 ring-1 ring-primary/40"
                            : "hover:bg-muted/50"
                        )}
                      >
                        <span
                          className="inline-block h-3.5 w-3.5 shrink-0 rounded-sm border border-border/60"
                          style={{ background: g.color }}
                          aria-hidden
                        />
                        <span
                          className="truncate font-mono"
                          title={g.partNum}
                        >
                          {g.partNum}
                        </span>
                        <div className="flex items-center gap-4 text-right tabular-nums">
                          <span className="w-7">
                            {formatNumber(g.qty)}
                          </span>
                          <span className="w-16">
                            {formatNumber(Math.round(g.weightKg))} kg
                          </span>
                          <span className="w-20">
                            {fmtCbmSmall(g.volumeMm3 / 1e9)} m³
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </Section>

          <Section
            title="Statistics"
            defaultOpen
            icon={
              <BarChart3 size={14} className="text-muted-foreground" />
            }
          >
            <div className="grid grid-cols-2 gap-2">
              <StatCard
                label="Loaded items"
                value={formatNumber(stats?.itemCount ?? 0)}
                fillPct={
                  recordTotalQty > 0
                    ? (stats?.itemCount ?? 0) / recordTotalQty
                    : 0
                }
                accent="emerald"
              />
              <StatCard
                label="Total weight"
                value={
                  stats
                    ? `${formatNumber(Math.round(stats.weightKg))} kg`
                    : "–"
                }
                subValue={`${formatNumber(containerMaxWeightKg)} kg`}
                fillPct={
                  containerMaxWeightKg > 0
                    ? (stats?.weightKg ?? 0) / containerMaxWeightKg
                    : 0
                }
                accent="orange"
              />
              {/* <StatCard
                label="Total volume"
                value={
                  stats
                    ? `${(stats.usedVolumeMm3 / 1e9).toFixed(2)} m³`
                    : "–"
                }
                subValue={`${containerCbmM3.toFixed(2)} m³`}
                fillPct={
                  containerVolumeMm3 > 0
                    ? usedVolumeMm3 / containerVolumeMm3
                    : 0
                }
                accent="purple"
              /> */}
            </div>
            <div className="mt-2">
              <StatCard
                label="Volume fill"
                value={`${(stats?.fillPct ?? 0).toFixed(1)}%`}
                subValue={
                  stats
                    ? `${(stats.usedVolumeMm3 / 1e9).toFixed(2)} / ${(containerVolumeMm3 / 1e9).toFixed(2)} m³`
                    : undefined
                }
                caption="of container volume"
                visual={<ContainerFillVisual fillPct={stats?.fillPct ?? 0} />}
              />
            </div>
            <div className="mt-2">
              <StatCard
                label="Free volume"
                value={`${(freeVolumeMm3 / 1e9).toFixed(2)} m³`}
                fillPct={
                  containerVolumeMm3 > 0
                    ? freeVolumeMm3 / containerVolumeMm3
                    : 0
                }
                accent="emerald"
                badge={
                  <span
                    className="inline-block h-5 w-5 rounded-md bg-emerald-500"
                    aria-hidden
                  />
                }
              />
            </div>
          </Section>
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

type AccentColor = "emerald" | "blue" | "orange" | "purple";

function fmtCbmSmall(v: number): string {
  if (v < 0.01) return v.toFixed(4);
  if (v < 0.1) return v.toFixed(3);
  return v.toFixed(2);
}

function ProgressBar({
  fillPct,
  accent,
  showMarker = true,
}: {
  fillPct: number;
  accent: AccentColor;
  showMarker?: boolean;
}) {
  const clamped = Math.max(0, Math.min(1, fillPct));
  const fillBg = {
    emerald: "bg-emerald-500",
    blue: "bg-blue-500",
    orange: "bg-orange-500",
    purple: "bg-purple-500",
  }[accent];
  const markerBg = {
    emerald: "bg-emerald-600",
    blue: "bg-blue-600",
    orange: "bg-orange-600",
    purple: "bg-purple-600",
  }[accent];
  return (
    <div className="relative h-1.5 w-full overflow-visible rounded-full bg-slate-200/80">
      <div
        className={cn("h-full rounded-full", fillBg)}
        style={{ width: `${clamped * 100}%` }}
      />
      {showMarker && clamped > 0 && (
        <span
          className={cn(
            "absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white",
            markerBg
          )}
          style={{ left: `${clamped * 100}%` }}
        />
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  subValue,
  fillPct,
  accent,
  className,
  badge,
  caption,
  visual,
}: {
  label: string;
  value: string;
  subValue?: string;
  fillPct?: number;
  accent?: AccentColor;
  className?: string;
  badge?: React.ReactNode;
  caption?: React.ReactNode;
  visual?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/60 bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        {badge}
      </div>
      <div className="mt-1 flex items-baseline justify-between gap-2">
        <div className="text-xl font-bold tabular-nums text-foreground">
          {value}
        </div>
        {subValue && (
          <div className="text-[11px] tabular-nums text-muted-foreground">
            {subValue}
          </div>
        )}
      </div>
      {visual ? (
        <div className="mt-2.5">{visual}</div>
      ) : (
        fillPct !== undefined && accent && (
          <div className="mt-2.5">
            <ProgressBar fillPct={fillPct} accent={accent} />
          </div>
        )
      )}
      {caption && (
        <div className="mt-1 text-[9px] text-muted-foreground">
          {caption}
        </div>
      )}
    </div>
  );
}

function ContainerFillVisual({ fillPct }: { fillPct: number }) {
  const clamped = Math.max(0, Math.min(100, fillPct));
  return (
    <div className="relative h-14 w-full overflow-hidden rounded border border-border/80">
      <div
        className="absolute inset-x-0 bottom-0 bg-blue-500/40 transition-[height] duration-300"
        style={{ height: `${clamped}%` }}
      />
      <div className="absolute right-2 top-1 bottom-1 w-px bg-border/70" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[11px] font-bold tabular-nums text-foreground">
          {clamped.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

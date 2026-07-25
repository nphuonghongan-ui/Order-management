import { useEffect, useState } from "react";
import {
  MousePointer2,
  Move,
  RotateCw,
  Scaling,
  Undo2,
  Redo2,
  Eye,
  EyeOff,
  Grid3x3,
  Crosshair,
  Tag,
  RotateCcw,
  Download,
  Copy,
  FileCode2,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useContainerStore } from "../../stores/useContainerStore";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils/utils";
import { exportDat, copyDatToClipboard } from "./datExport";
import { toast } from "sonner";
import type {
  AxisConstraint,
  BoxPlacement,
  TransformSpace,
} from "./types";

const SNAP_OPTIONS = [0.1, 1, 5, 10] as const;
const ROT_SNAP_OPTIONS = [1, 15, 30, 45, 90] as const;
const ROT_PRESETS = [0, 90, 180, 270] as const;
const AXIS_COLORS: Record<"x" | "y" | "z", string> = {
  x: "#ef4444",
  y: "#10b981",
  z: "#3b82f6",
};

interface ToolbarProps {
  plNumber: string | undefined;
  partNumToDim: Map<string, { length: number; width: number; height: number }>;
}

export function Toolbar({ plNumber }: ToolbarProps) {
  const tool = useContainerStore((s) => s.tool);
  const setTool = useContainerStore((s) => s.setTool);
  const snapCm = useContainerStore((s) => s.snapCm);
  const setSnapCm = useContainerStore((s) => s.setSnapCm);
  const rotSnap = useContainerStore((s) => s.rotationSnapDeg);
  const setRotSnap = useContainerStore((s) => s.setRotationSnapDeg);
  const showWalls = useContainerStore((s) => s.showWalls);
  const setShowWalls = useContainerStore((s) => s.setShowWalls);
  const showGrid = useContainerStore((s) => s.showGrid);
  const setShowGrid = useContainerStore((s) => s.setShowGrid);
  const showAxes = useContainerStore((s) => s.showAxes);
  const setShowAxes = useContainerStore((s) => s.setShowAxes);
  const showLabels = useContainerStore((s) => s.showLabels);
  const setShowLabels = useContainerStore((s) => s.setShowLabels);
  const setView = useContainerStore((s) => s.setView);
  const view = useContainerStore((s) => s.view);
  const undo = useContainerStore((s) => s.undo);
  const redo = useContainerStore((s) => s.redo);
  const past = useContainerStore((s) => s.past);
  const future = useContainerStore((s) => s.future);
  const containerTypeId = useContainerStore((s) => s.containerTypeId);
  const boxes = useContainerStore((s) => s.boxes);
  const selectedId = useContainerStore((s) => s.selectedId);
  const axisConstraint = useContainerStore((s) => s.axisConstraint);
  const setAxisConstraint = useContainerStore((s) => s.setAxisConstraint);
  const space = useContainerStore((s) => s.space);
  const setSpace = useContainerStore((s) => s.setSpace);
  const setBoxPositionXYZ = useContainerStore((s) => s.setBoxPositionXYZ);
  const setBoxRotation90 = useContainerStore((s) => s.setBoxRotation90);
  const resetBoxTransform = useContainerStore((s) => s.resetBoxTransform);
  const recenterBox = useContainerStore((s) => s.recenterBox);

  function buildDat(): string {
    return exportDat({ containerTypeId, boxes });
  }

  function handleDownload() {
    try {
      const text = buildDat();
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${plNumber ?? "packing-list"}.dat`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("DAT downloaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Download failed");
    }
  }

  async function handleCopy() {
    try {
      await copyDatToClipboard(buildDat());
      toast.success("DAT copied to clipboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Copy failed");
    }
  }

  const selected = boxes.find((b: BoxPlacement) => b.id === selectedId);

  return (
    <aside className="w-64 shrink-0 border-l border-border bg-card/80 backdrop-blur flex flex-col">
      {/* 1. TRANSFORM — tool modes */}
      <Section title="Transform">
        <div className="grid grid-cols-4 gap-1.5">
          <ToolButton
            active={tool === "select"}
            onClick={() => setTool("select")}
            icon={<MousePointer2 size={14} />}
            label="Select"
            hotkey="Q"
          />
          <ToolButton
            active={tool === "move"}
            onClick={() => setTool("move")}
            icon={<Move size={14} />}
            label="Move"
            hotkey="G"
          />
          <ToolButton
            active={tool === "rotate"}
            onClick={() => setTool("rotate")}
            icon={<RotateCw size={14} />}
            label="Rotate"
            hotkey="R"
          />
          <ToolButton
            active={tool === "scale"}
            onClick={() => setTool("scale")}
            icon={<Scaling size={14} />}
            label="Scale"
            hotkey="S"
          />
        </div>
      </Section>

      {/* 2. AXES + SPACE — constraints and coordinate space */}
      <Section title="Constraints">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
              Axes
            </span>
            <div className="flex gap-1">
              {(["x", "y", "z"] as const).map((a) => {
                const isLocked = axisConstraint === a;
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() =>
                      setAxisConstraint(isLocked ? "all" : (a as AxisConstraint))
                    }
                    className={cn(
                      "size-6 rounded-md border text-[10px] font-bold tabular-nums transition-colors cursor-pointer",
                      isLocked
                        ? "text-white border-transparent"
                        : "bg-card border-border text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                    style={
                      isLocked
                        ? { backgroundColor: AXIS_COLORS[a] }
                        : undefined
                    }
                    title={
                      isLocked
                        ? `Unlock ${a.toUpperCase()} (press ${a.toUpperCase()})`
                        : `Lock to ${a.toUpperCase()} only (press ${a.toUpperCase()})`
                    }
                  >
                    {a.toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
              Space
            </span>
            <PillToggle<TransformSpace>
              value={space}
              options={[
                { v: "world", label: "World" },
                { v: "local", label: "Local" },
              ]}
              onChange={setSpace}
            />
          </div>
        </div>
      </Section>

      {/* 3. PRECISE TRANSFORM — only when a box is selected */}
      {selected && (
        <Section title="Precise">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                Position (mm)
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {(["x", "y", "z"] as const).map((axis) => (
                  <NumberInput
                    key={axis}
                    axis={axis}
                    value={selected.position[axis]}
                    onCommit={(v) => {
                      setBoxPositionXYZ(
                        selected.id,
                        axis === "x" ? v : selected.position.x,
                        axis === "y" ? v : selected.position.y,
                        axis === "z" ? v : selected.position.z,
                      );
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                Rotation (Y)
              </div>
              <div className="grid grid-cols-4 gap-1">
                {ROT_PRESETS.map((deg) => (
                  <button
                    key={deg}
                    type="button"
                    onClick={() =>
                      setBoxRotation90(
                        selected.id,
                        deg as 0 | 90 | 180 | 270,
                      )
                    }
                    className={cn(
                      "h-7 rounded-md border text-[11px] font-medium transition-colors cursor-pointer tabular-nums",
                      selected.rotationY === deg
                        ? "bg-primary-light text-primary-foreground border-primary-light"
                        : "bg-card border-border text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {deg}°
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <Button
                size="sm"
                variant="outline"
                onClick={() => resetBoxTransform(selected.id)}
                className="gap-1.5"
                title="Reset to origin (0, 0, 0) with no rotation"
              >
                <RotateCcw size={12} /> Reset
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => recenterBox(selected.id)}
                className="gap-1.5"
                title="Center the box in the container at floor level"
              >
                <Crosshair size={12} /> Re-center
              </Button>
            </div>
            <div className="text-[10px] text-muted-foreground font-mono pt-1 border-t border-border">
              <div>{selected.partNum}</div>
              <div>
                {selected.size.l}×{selected.size.w}×{selected.size.h} mm · qty{" "}
                {selected.qty}
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* 4. SNAP */}
      <Section title="Snap">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
              Translate
            </span>
            <Select
              value={String(snapCm)}
              onValueChange={(v) => setSnapCm(Number(v))}
            >
              <SelectTrigger size="sm" className="h-6 w-20 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SNAP_OPTIONS.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} cm
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
              Rotate
            </span>
            <Select
              value={String(rotSnap)}
              onValueChange={(v) => setRotSnap(Number(v))}
            >
              <SelectTrigger size="sm" className="h-6 w-20 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROT_SNAP_OPTIONS.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}°
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Section>

      {/* 5. VIEW */}
      <Section title="View">
        <div className="grid grid-cols-4 gap-1.5 mb-2">
          <ViewButton
            active={view === "iso"}
            onClick={() => setView("iso")}
            label="Iso"
          />
          <ViewButton
            active={view === "top"}
            onClick={() => setView("top")}
            label="Top"
            icon={<ChevronUp size={12} />}
          />
          <ViewButton
            active={view === "front"}
            onClick={() => setView("front")}
            label="Front"
            icon={<ChevronDown size={12} />}
          />
          <ViewButton
            active={view === "right"}
            onClick={() => setView("right")}
            label="Right"
            icon={<ChevronRight size={12} />}
          />
        </div>
      </Section>

      {/* 6. VISIBILITY — collapsed by default */}
      <AccordionSection title="Visibility" defaultOpen={false}>
        <ToggleRow
          label="Container walls"
          icon={showWalls ? <Eye size={12} /> : <EyeOff size={12} />}
          on={showWalls}
          onClick={() => setShowWalls(!showWalls)}
        />
        <ToggleRow
          label="Grid"
          icon={<Grid3x3 size={12} />}
          on={showGrid}
          onClick={() => setShowGrid(!showGrid)}
        />
        <ToggleRow
          label="Axes"
          icon={<Crosshair size={12} />}
          on={showAxes}
          onClick={() => setShowAxes(!showAxes)}
        />
        <ToggleRow
          label="Box labels"
          icon={<Tag size={12} />}
          on={showLabels}
          onClick={() => setShowLabels(!showLabels)}
        />
      </AccordionSection>

      {/* 7. EXPORT — pinned to bottom */}
      <div className="mt-auto p-3 border-t border-border space-y-1.5">
        <Button
          size="default"
          className="w-full gap-1.5"
          onClick={handleDownload}
        >
          <Download size={14} /> Generate DAT file
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="w-full gap-1.5"
          onClick={() => void handleCopy()}
        >
          <Copy size={13} /> Copy DAT
        </Button>
        <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground pt-1">
          <FileCode2 size={10} /> .dat
        </div>
      </div>
    </aside>
  );
}

// ----------------------------------------------------------------------
// Section — a labelled, bordered block
// ----------------------------------------------------------------------
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-3 py-3 border-b border-border">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">
        {title}
      </div>
      {children}
    </div>
  );
}

// ----------------------------------------------------------------------
// AccordionSection — same as Section but collapsible
// ----------------------------------------------------------------------
function AccordionSection({
  title,
  defaultOpen,
  children,
}: {
  title: string;
  defaultOpen: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="px-3 py-2 border-b border-border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 py-1 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold hover:text-foreground transition-colors cursor-pointer"
      >
        <span>{title}</span>
        <ChevronRight
          size={12}
          className={cn(
            "transition-transform",
            open && "rotate-90",
          )}
        />
      </button>
      {open && <div className="space-y-1.5 pt-1.5">{children}</div>}
    </div>
  );
}

// ----------------------------------------------------------------------
// ToolButton — 4 mode buttons in the Transform section
// ----------------------------------------------------------------------
function ToolButton({
  active,
  onClick,
  icon,
  label,
  hotkey,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  hotkey: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-0.5 h-12 rounded-md border text-[10px] uppercase tracking-wider font-semibold transition-colors cursor-pointer",
        active
          ? "bg-primary-light text-primary-foreground border-primary-light"
          : "bg-card border-border text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
      title={`${label} (${hotkey})`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

// ----------------------------------------------------------------------
// ViewButton — view preset chip
// ----------------------------------------------------------------------
function ViewButton({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-7 rounded-md border text-[11px] font-medium transition-colors cursor-pointer flex items-center justify-center gap-1",
        active
          ? "bg-primary-light text-primary-foreground border-primary-light"
          : "bg-card border-border text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

// ----------------------------------------------------------------------
// PillToggle — World/Local style toggle
// ----------------------------------------------------------------------
function PillToggle<V extends string>({
  value,
  options,
  onChange,
}: {
  value: V;
  options: { v: V; label: string }[];
  onChange: (v: V) => void;
}) {
  return (
    <div className="inline-flex rounded-md border border-border bg-card p-0.5">
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          onClick={() => onChange(o.v)}
          className={cn(
            "px-2 h-5 rounded text-[10px] font-semibold uppercase tracking-wider transition-colors cursor-pointer",
            value === o.v
              ? "bg-primary-light text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ----------------------------------------------------------------------
// ToggleRow — visibility toggle row
// ----------------------------------------------------------------------
function ToggleRow({
  label,
  icon,
  on,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-md text-xs transition-colors cursor-pointer",
        on
          ? "bg-primary-light/10 text-foreground"
          : "bg-transparent text-muted-foreground hover:bg-muted",
      )}
    >
      <span className="flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      <span
        className={cn(
          "size-2 rounded-full",
          on ? "bg-primary-light" : "bg-muted-foreground/40",
        )}
      />
    </button>
  );
}

// ----------------------------------------------------------------------
// NumberInput — X/Y/Z numeric input with local state, commits on
// Enter / blur. Reverts to the last value on Escape / invalid input.
// ----------------------------------------------------------------------
function NumberInput({
  axis,
  value,
  onCommit,
}: {
  axis: "x" | "y" | "z";
  value: number;
  onCommit: (v: number) => void;
}) {
  const [draft, setDraft] = useState(() => String(Math.round(value)));

  // Sync local draft when the external value changes (undo, gizmo drag, etc.)
  useEffect(() => {
    setDraft(String(Math.round(value)));
  }, [value]);

  const commit = () => {
    const n = Number(draft);
    if (Number.isFinite(n)) {
      onCommit(n);
    } else {
      setDraft(String(Math.round(value)));
    }
  };

  const colorClass =
    axis === "x"
      ? "text-red-500"
      : axis === "y"
        ? "text-emerald-500"
        : "text-blue-500";

  return (
    <div className="relative">
      <span
        className={cn(
          "absolute left-1.5 top-1/2 -translate-y-1/2 text-[9px] font-bold pointer-events-none",
          colorClass,
        )}
      >
        {axis.toUpperCase()}
      </span>
      <input
        type="number"
        step={1}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.currentTarget.blur();
          } else if (e.key === "Escape") {
            setDraft(String(Math.round(value)));
            e.currentTarget.blur();
          } else if (e.key === "ArrowLeft") {
            e.stopPropagation();
          } else if (e.key === "ArrowRight") {
            e.stopPropagation();
          } else if (e.key === "ArrowUp") {
            e.stopPropagation();
          } else if (e.key === "ArrowDown") {
            e.stopPropagation();
          }
        }}
        className="w-full h-7 pl-5 pr-1 text-xs font-mono text-right rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring tabular-nums"
      />
    </div>
  );
}

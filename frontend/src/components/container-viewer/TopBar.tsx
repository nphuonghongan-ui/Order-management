import { useMemo } from "react";
import { useContainerStore, computeStats } from "../../stores/useContainerStore";
import { useContainerListStore } from "@/stores/useContainerListStore";
import { formatCm, type ContainerTypeId } from "./units";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Truck, Package, Weight, Maximize2 } from "lucide-react";

export function TopBar() {
  const containerTypeId = useContainerStore((s) => s.containerTypeId);
  const setContainerType = useContainerStore((s) => s.setContainerType);
  const boxes = useContainerStore((s) => s.boxes);
  const showWalls = useContainerStore((s) => s.showWalls);
  const showGrid = useContainerStore((s) => s.showGrid);
  const showAxes = useContainerStore((s) => s.showAxes);
  const showLabels = useContainerStore((s) => s.showLabels);
  const types = useContainerListStore((s) => s.types);

  const stats = useMemo(
    () =>
      computeStats({
        containerTypeId,
        boxes,
        selectedId: null,
        tool: "select",
        snapCm: 1,
        rotationSnapDeg: 90,
        showWalls,
        showGrid,
        showAxes,
        showLabels,
        axisConstraint: "all",
        space: "world",
      }),
    [containerTypeId, boxes, showWalls, showGrid, showAxes, showLabels],
  );

  const fillTone =
    stats.fillPct > 95
      ? "text-destructive"
      : stats.fillPct > 80
        ? "text-warning"
        : "text-success";

  return (
    <div className="rounded-xl overflow-hidden flex items-center justify-between gap-4 border-b border-border bg-card/80 backdrop-blur px-5 py-2.5">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Truck size={16} className="text-primary-light" />
        </div>
        <Select
          value={containerTypeId}
          onValueChange={(v) => setContainerType(v as ContainerTypeId)}
        >
          <SelectTrigger className="h-8 min-w-[220px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {types.map((c) => (
              <SelectItem key={c.typeId} value={c.typeId}>
                {c.label} ·{" "}
                <span className="text-muted-foreground">
                  {formatCm(c.inner.l)} × {formatCm(c.inner.w)} × {formatCm(c.inner.h)}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-5 text-xs">
        <Stat icon={<Maximize2 size={13} />} label="Fill" tone={fillTone}>
          {stats.fillPct.toFixed(1)}%
        </Stat>
        <Stat icon={<Weight size={13} />} label="Weight">
          {(stats.totalWeightKg / 1000).toFixed(2)} t
        </Stat>
        <Stat icon={<Package size={13} />} label="Items">
          {stats.boxCount}
        </Stat>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  tone,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  tone?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-muted-foreground uppercase tracking-wider text-[10px] font-semibold">
        {label}
      </span>
      <span className={`font-mono font-semibold tabular-nums ${tone ?? ""}`}>
        {children}
      </span>
    </div>
  );
}

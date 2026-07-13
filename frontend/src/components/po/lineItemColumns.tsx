import { Plane, Ship, TrainFront, Truck, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Mode } from "./types";

export const MODE_ICONS: Record<Mode, LucideIcon> = {
  SEA: Ship,
  AIR: Plane,
  ROAD: Truck,
  RAIL: TrainFront,
};

export function formatDisplay(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export const formatNumber = (n: number) => n.toLocaleString();

export const formatCurrency = (n: number) =>
  n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export function partNumCell(partNum: string) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-xs font-semibold">{partNum}</span>
    </div>
  );
}

export function monoCell(value: ReactNode) {
  return <span className="font-mono text-xs">{value}</span>;
}

export function currencyCell(
  value: number,
  opts: { bold?: boolean; primary?: boolean } = {}
) {
  const { bold = false, primary = false } = opts;
  return (
    <span
      className={cn(
        "font-mono text-xs",
        bold && "font-semibold",
        primary && "text-primary-light"
      )}
    >
      {formatCurrency(value)}
    </span>
  );
}

export function modePill(mode: Mode) {
  const ModeIcon = MODE_ICONS[mode];
  return (
    <span className="inline-flex h-6 items-center gap-1 rounded-full border border-[#7fe7ff] bg-[#e9fbff] px-2.5 text-xs font-semibold text-[#0b6f8b]">
      <ModeIcon size={12} />
      {mode}
    </span>
  );
}

export function exWorkDateCell(date: string | null) {
  return (
    <div className="flex flex-col">
      <span className="font-mono text-xs">{formatDisplay(date)}</span>
      <span className="text-[10px] text-muted-foreground">
        Set by Manufacture
      </span>
    </div>
  );
}

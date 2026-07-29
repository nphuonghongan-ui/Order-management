import { cn } from "@/lib/utils/utils";
import { formatNumber } from "@/lib/format";

type QtyCellProps = {
  value: number | null | undefined;
  unit?: string;
  className?: string;
};

export function QtyCell({ value, unit, className }: QtyCellProps) {
  if (value == null || Number.isNaN(value)) {
    return (
      <span
        className={cn(
          "font-mono text-xs text-muted-foreground",
          className
        )}
      >
        –
      </span>
    );
  }
  return (
    <span className={cn("font-mono text-xs", className)}>
      {formatNumber(value)}
      {unit && <span className="text-muted-foreground ml-0.5">{unit}</span>}
    </span>
  );
}

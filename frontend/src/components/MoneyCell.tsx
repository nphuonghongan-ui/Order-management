import { cn } from "@/lib/utils/utils";
import { formatCurrency } from "@/lib/format";

type MoneyCellProps = {
  value: number | null | undefined;
  bold?: boolean;
  primary?: boolean;
  muted?: boolean;
  className?: string;
};

export function MoneyCell({
  value,
  bold = false,
  primary = false,
  muted = false,
  className,
}: MoneyCellProps) {
  if (value == null || Number.isNaN(value) || value === 0) {
    return (
      <span
        className={cn(
          "font-mono text-xs text-muted-foreground",
          className
        )}
      >
        {value === 0 ? "$0.00" : "–"}
      </span>
    );
  }
  return (
    <span
      className={cn(
        "font-mono text-xs",
        bold && "font-semibold",
        primary && "text-primary-light",
        muted && "text-muted-foreground",
        className
      )}
    >
      ${formatCurrency(value)}
    </span>
  );
}

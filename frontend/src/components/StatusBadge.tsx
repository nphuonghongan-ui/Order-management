import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
  {
    variants: {
      variant: {
        success: "bg-success-container text-success-foreground-dark",
        warning: "bg-warning-container text-warning-foreground-dark",
        error: "bg-destructive-container text-destructive",
        info: "bg-info-container text-info-foreground-dark",
        neutral: "bg-muted text-muted-foreground",
      },
    },
    defaultVariants: { variant: "neutral" },
  }
);

type StatusVariant = VariantProps<typeof statusVariants>["variant"];

const STATUS_MAP: Record<string, StatusVariant> = {
  confirmed: "success",
  shipped: "success",
  submitted: "warning",
  pending: "warning",
  error: "error",
  issue: "error",
  active: "info",
};

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const variant = STATUS_MAP[status] || "neutral";
  const label = status
    ? status.charAt(0).toUpperCase() + status.slice(1)
    : "Unknown";

  return (
    <span className={cn(statusVariants({ variant }))}>{label}</span>
  );
}

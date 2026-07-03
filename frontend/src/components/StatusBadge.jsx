import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
  {
    variants: {
      variant: {
        success: "bg-green-100 text-green-800",
        warning: "bg-amber-100 text-amber-800",
        error: "bg-red-100 text-red-800",
        info: "bg-blue-100 text-blue-800",
        neutral: "bg-slate-100 text-slate-700",
      },
    },
    defaultVariants: { variant: "neutral" },
  }
);

const STATUS_MAP = {
  confirmed: "success",
  shipped: "success",
  submitted: "warning",
  pending: "warning",
  error: "error",
  issue: "error",
  active: "info",
};

export default function StatusBadge({ status }) {
  const variant = STATUS_MAP[status] || "neutral";
  const label = status
    ? status.charAt(0).toUpperCase() + status.slice(1)
    : "Unknown";

  return (
    <span className={cn(statusVariants({ variant }))}>{label}</span>
  );
}

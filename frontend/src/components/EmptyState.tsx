import type { LucideIcon } from "lucide-react";
import { Inbox, AlertCircle, SearchX } from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  variant?: "default" | "error" | "no-results";
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

const ICON_BG: Record<NonNullable<EmptyStateProps["variant"]>, string> = {
  default: "bg-muted text-muted-foreground",
  error: "bg-destructive/10 text-destructive",
  "no-results": "bg-muted text-muted-foreground",
};

const FALLBACK_ICON: Record<NonNullable<EmptyStateProps["variant"]>, LucideIcon> =
  {
    default: Inbox,
    error: AlertCircle,
    "no-results": SearchX,
  };

export function EmptyState({
  variant = "default",
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const Icon = icon ?? FALLBACK_ICON[variant];
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center gap-3 py-10 px-6",
        className
      )}
    >
      <div
        className={cn(
          "size-10 rounded-full flex items-center justify-center",
          ICON_BG[variant]
        )}
      >
        <Icon size={18} />
      </div>
      <div className="flex flex-col gap-1 max-w-sm">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}

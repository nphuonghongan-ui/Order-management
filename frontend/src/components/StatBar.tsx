import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type StatTrend = {
  value: number;
  label: string;
};

type StatAction = {
  label: string;
  onClick?: () => void;
  href?: string;
};

type StatBarItem = {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  primary?: boolean;
  trend?: StatTrend;
  viewDetails?: StatAction;
};

type StatBarProps = {
  items: StatBarItem[];
  className?: string;
};

function trendTone(value: number) {
  if (value > 0) return "text-emerald-600";
  if (value < 0) return "text-red-600";
  return "text-muted-foreground";
}

export function StatBar({ items, className }: StatBarProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
        className
      )}
    >
      {items.map((item, i) => {
        const Icon = item.icon;
        const trendDir =
          item.trend && item.trend.value !== 0
            ? item.trend.value > 0
              ? "up"
              : "down"
            : "flat";
        return (
          <div
            key={i}
            className="rounded-xl border border-border bg-card shadow-sm p-5 flex flex-col min-w-0"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="text-[15px] font-semibold uppercase tracking-widest text-muted-foreground truncate">
                {item.label}
              </span>
              <span className="h-10 w-10 rounded-lg bg-muted text-muted-foreground flex items-center justify-center shrink-0">
                <Icon size={18} />
              </span>
            </div>
            <span
              className={cn(
                "text-3xl font-bold font-mono truncate",
                item.primary ? "text-primary-light" : "text-foreground"
              )}
            >
              {item.value}
            </span>
            {(item.trend || item.viewDetails) && (
              <div className="flex items-center justify-between gap-3 text-xs pt-1 border-t border-border/60">
                {item.trend ? (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 font-medium",
                      trendTone(item.trend.value)
                    )}
                  >
                    {trendDir === "up" && <ArrowUpRight size={14} />}
                    {trendDir === "down" && <ArrowDownRight size={14} />}
                    <span>
                      {item.trend.value > 0 ? "+" : ""}
                      {item.trend.value}%
                    </span>
                    <span className="text-muted-foreground font-normal">
                      {item.trend.label}
                    </span>
                  </span>
                ) : (
                  <span />
                )}
                {item.viewDetails &&
                  (item.viewDetails.href ? (
                    <a
                      href={item.viewDetails.href}
                      className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                    >
                      {item.viewDetails.label}
                      <ArrowUpRight size={14} />
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={item.viewDetails.onClick}
                      className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                    >
                      {item.viewDetails.label}
                      <ArrowUpRight size={14} />
                    </button>
                  ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

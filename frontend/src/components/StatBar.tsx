import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type StatBarItem = {
  label: string;
  value: ReactNode;
  primary?: boolean;
};

type StatBarProps = {
  items: StatBarItem[];
  className?: string;
};

export function StatBar({ items, className }: StatBarProps) {
  return (
    <div
      className={cn(
        "flex items-stretch divide-x divide-border border-y border-border bg-card",
        className
      )}
    >
      {items.map((item, i) => (
        <div
          key={i}
          className="flex flex-col gap-0.5 px-5 py-2.5 min-w-0 flex-1"
        >
          <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            {item.label}
          </span>
          <span
            className={cn(
              "text-xl font-bold font-mono truncate",
              item.primary ? "text-primary-light" : "text-foreground"
            )}
          >
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
  titleClassName?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
  titleClassName,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 min-w-0",
        className
      )}
    >
      <div className="flex flex-col gap-1 min-w-0">
        {eyebrow && (
          <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            {eyebrow}
          </span>
        )}
        <h2
          className={cn(
            "text-headline-md text-foreground truncate",
            titleClassName
          )}
        >
          {title}
        </h2>
        {description && (
          <p className="text-sm text-muted-foreground max-w-[65ch]">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

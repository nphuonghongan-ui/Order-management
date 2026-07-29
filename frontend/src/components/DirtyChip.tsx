import { cn } from "@/lib/utils/utils";

type DirtyChipProps = {
  variant?: "inline" | "dot";
  label?: string;
  className?: string;
};

export function DirtyChip({
  variant = "inline",
  label = "Unsaved",
  className,
}: DirtyChipProps) {
  if (variant === "dot") {
    return (
      <span
        title={label}
        aria-label={label}
        className={cn(
          "inline-block size-1.5 rounded-full bg-amber-500 shrink-0",
          className
        )}
      />
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400",
        className
      )}
    >
      <span className="inline-block size-1.5 rounded-full bg-amber-500" />
      {label}
    </span>
  );
}

import type { ReactNode } from "react";

export function IconField({
  icon: Icon,
  label,
  value,
  mono,
  caption,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: ReactNode;
  mono?: boolean;
  caption?: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary-light">
        <Icon size={14} />
      </div>
      <div className="flex-1 flex items-center justify-between gap-3">
        <span className="text-sm text-foreground">{label}</span>
        <div className="flex flex-col items-end gap-0.5">
          <span className={mono ? "font-mono text-sm" : "text-sm"}>{value}</span>
          {caption && (
            <span className="text-[10px] text-muted-foreground">{caption}</span>
          )}
        </div>
      </div>
    </div>
  );
}

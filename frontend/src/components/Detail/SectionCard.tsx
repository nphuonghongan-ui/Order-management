import type { ReactNode } from "react";
import { Layers } from "lucide-react";

export function SectionCard({
  title,
  icon: Icon = Layers,
  children,
}: {
  title: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border overflow-hidden bg-card">
      <div className="flex items-center gap-2 px-4 py-2 bg-accent border-b border-border">
        <Icon size={12} className="text-accent-foreground" />
        <span className="text-[11px] font-semibold uppercase tracking-widest text-accent-foreground">
          {title}
        </span>
      </div>
      <div className="p-4 bg-accent/30">{children}</div>
    </div>
  );
}

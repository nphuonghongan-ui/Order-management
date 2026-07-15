import type { ReactNode } from "react";

export function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 bg-[#e6f7fa] border-b border-border">
        <Icon size={12} className="text-[#0E7490]" />
        <span className="text-[11px] font-semibold uppercase tracking-widest text-[#0E7490]">
          {title}
        </span>
      </div>
      <div className="p-4 bg-[#e6f7fa]/40">{children}</div>
    </div>
  );
}

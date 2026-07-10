import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function PageShell({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("h-full flex flex-col bg-[#f5f7fb]", className)}
      {...rest}
    >
      {children}
    </div>
  );
}

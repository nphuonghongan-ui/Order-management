import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

type LogoVariant = "light" | "dark";

interface LogoProps {
  variant?: LogoVariant;
  className?: string;
}

const COLORS: Record<LogoVariant, { axon: string; log: string }> = {
  dark: { axon: "#0D1F3C", log: "#0052CC" },
  light: { axon: "#FFFFFF", log: "#60A5FA" },
};

export default function Logo({ variant = "dark", className }: LogoProps) {
  const c = COLORS[variant];
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className="w-8 h-8 flex items-center justify-center"
        style={{ background: "#0052CC", borderRadius: "4px" }}
      >
        <Package size={18} color="#fff" />
      </div>
      <span
        className="text-m font-semibold tracking-tight"
        style={{ color: c.axon }}
      >
        Axon<span style={{ color: c.log }}>Log</span>
      </span>
    </div>
  );
}

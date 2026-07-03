import { useLocation } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { MENU_BY_ROLE } from "@/lib/roles";
import { cn } from "@/lib/utils";

const ROLE_BADGE_STYLES = {
  PO: "bg-blue-100 text-blue-800",
  Sale: "bg-green-100 text-green-800",
  Manufacture: "bg-amber-100 text-amber-800",
};

export default function Header() {
  const { role } = useAuth();
  const location = useLocation();

  const menuItems = MENU_BY_ROLE[role] || [];
  const current = menuItems.find((m) => location.pathname.startsWith(m.path));
  const title = current?.label || "Dashboard";

  return (
    <header className="h-12 shrink-0 flex items-center justify-between px-6 bg-card border-b border-border">
      <h1 className="text-base font-semibold text-foreground">{title}</h1>
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
            ROLE_BADGE_STYLES[role] || "bg-muted text-muted-foreground"
          )}
        >
          {role}
        </span>
        <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground text-xs font-medium">
          {role?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}

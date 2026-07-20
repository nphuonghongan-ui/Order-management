import { useLocation } from "react-router";
import { useAuthStore } from "@/stores/authStore";
import { MENU_BY_ROLE } from "@/lib/roles";
import { NotificationBell } from "@/components/notification/NotificationBell";

export default function Header() {
  const role = useAuthStore((s) => s.role);
  const location = useLocation();

  const menuItems = role ? MENU_BY_ROLE[role] : [];
  const current = menuItems.find((m) => location.pathname.startsWith(m.path));
  const title = current?.label || "Dashboard";

  return (
    <header className="h-12 shrink-0 flex items-center justify-between px-6 bg-card border-b border-border">
      <h1 className="text-base font-semibold text-foreground">{title}</h1>
      <div className="flex items-center gap-3">
        {role && (
          <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full bg-accent text-primary">
            {role}
          </span>
        )}
        {role && <NotificationBell />}
        <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground text-xs font-medium cursor-pointer">
          {role?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}

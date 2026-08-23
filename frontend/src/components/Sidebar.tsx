import { useLocation, Link } from "react-router";
import {
  Package,
  ClipboardList,
  LogOut,
  Factory,
  PackagePlus,
  ListChecks,
  Boxes,
  Warehouse,
  type LucideIcon,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { MENU_BY_ROLE } from "@/lib/roles";
import { cn } from "@/lib/utils/utils";
import Logo from "@/components/Logo";
import { useNavigation } from "@/lib/hooks/useNavigation";

const ICONS: Record<string, LucideIcon> = {
  Package,
  PackagePlus,
  ListChecks,
  ClipboardList,
  Factory,
  Boxes,
  Warehouse,
};

export default function Sidebar() {
  const role = useAuthStore((s) => s.role);
  const logout = useAuthStore((s) => s.logout);
  const goToHome = useNavigation("/");
  const location = useLocation();

  const menuItems = role ? MENU_BY_ROLE[role] : [];

  const handleLogout = () => {
    logout();
    goToHome();
  };

  return (
    <aside className="w-60 shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="h-16 flex items-center px-6">
        <Logo variant="dark" />
      </div>

      <nav className="flex-1 py-4">
        {menuItems.map((item) => {
          const Icon = ICONS[item.icon] || Package;
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-6 py-3 text-sm border-l-2 transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground border-primary font-medium"
                  : "text-sidebar-foreground border-transparent hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border py-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-6 py-3 text-sm text-sidebar-foreground border-l-2 border-transparent hover:bg-muted hover:text-foreground transition-colors w-full cursor-pointer"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}

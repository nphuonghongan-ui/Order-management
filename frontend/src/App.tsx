import { useEffect } from "react";
import { Toaster } from "sonner";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router";
import { useAuthStore } from "./stores/authStore";
import { DEFAULT_PATH_BY_ROLE, ROLES, type Role } from "./lib/roles";
import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import PackingList from "./pages/PackingList";
import ProductionSchedule from "./pages/ProductionSchedule";
import NotFound from "./pages/NotFound";

function AuthBootstrap() {
  const restoreSession = useAuthStore((s) => s.restoreSession);
  useEffect(() => {
    restoreSession();
  }, [restoreSession]);
  return null;
}

function PublicRoute() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const role = useAuthStore((s) => s.role);
  if (!hydrated) return null;
  if (role) return <Navigate to={DEFAULT_PATH_BY_ROLE[role]} replace />;
  return <Outlet />;
}

function ProtectedRoute() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const role = useAuthStore((s) => s.role);
  if (!hydrated) return null;
  if (!role) return <Navigate to="/" replace />;
  return <Outlet />;
}

function DashboardIndex() {
  const role = useAuthStore((s) => s.role);
  return <Navigate to={role ? DEFAULT_PATH_BY_ROLE[role] : "/"} replace />;
}

function RoleGuard({ allowed, children }: { allowed: Role[]; children: React.ReactNode }) {
  const role = useAuthStore((s) => s.role);
  if (!role || !allowed.includes(role)) {
    return <Navigate to={role ? DEFAULT_PATH_BY_ROLE[role] : "/"} replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <AuthBootstrap />
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Route>
        <Route path="/dashboard" element={<ProtectedRoute />}>
          <Route element={<Dashboard />}>
            <Route index element={<DashboardIndex />} />
            <Route
              path="inventory"
              element={
                <RoleGuard allowed={[ROLES.PO]}>
                  <Inventory />
                </RoleGuard>
              }
            />
            <Route
              path="production"
              element={
                <RoleGuard allowed={[ROLES.MANUFACTURE]}>
                  <ProductionSchedule />
                </RoleGuard>
              }
            />
            <Route
              path="packing-list"
              element={
                <RoleGuard allowed={[ROLES.SALE]}>
                  <PackingList />
                </RoleGuard>
              }
            />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}

export default App;

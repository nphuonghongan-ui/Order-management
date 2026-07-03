import { Toaster } from "sonner";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DEFAULT_PATH_BY_ROLE, ROLES, type Role } from "./lib/roles";
import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import PackingList from "./pages/PackingList";
import NotFound from "./pages/NotFound";

function PublicRoute() {
  const { role } = useAuth();
  if (role) return <Navigate to={DEFAULT_PATH_BY_ROLE[role]} replace />;
  return <Outlet />;
}

function ProtectedRoute() {
  const { role } = useAuth();
  if (!role) return <Navigate to="/" replace />;
  return <Outlet />;
}

function DashboardIndex() {
  const { role } = useAuth();
  return <Navigate to={role ? DEFAULT_PATH_BY_ROLE[role] : "/"} replace />;
}

function RoleGuard({ allowed, children }: { allowed: Role[]; children: React.ReactNode }) {
  const { role } = useAuth();
  if (!role || !allowed.includes(role)) {
    return <Navigate to={role ? DEFAULT_PATH_BY_ROLE[role] : "/"} replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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
                  <RoleGuard allowed={[ROLES.PO, ROLES.MANUFACTURE]}>
                    <Inventory />
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
      </BrowserRouter>
      <Toaster position="top-right" />
    </AuthProvider>
  );
}

export default App;

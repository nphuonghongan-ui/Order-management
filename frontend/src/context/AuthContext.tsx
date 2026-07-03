import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { loginMock, type Role } from "@/lib/roles";

interface AuthContextValue {
  role: Role | null;
  login: (username: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "om_role";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role | null>(() => {
    return (localStorage.getItem(STORAGE_KEY) as Role) || null;
  });

  const login = useCallback((username: string): boolean => {
    const resolvedRole = loginMock(username);
    if (!resolvedRole) return false;
    setRole(resolvedRole);
    localStorage.setItem(STORAGE_KEY, resolvedRole);
    return true;
  }, []);

  const logout = useCallback(() => {
    setRole(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

import { createContext, useContext, useState, useCallback } from "react";
import { loginMock } from "@/lib/roles";

const AuthContext = createContext(null);

const STORAGE_KEY = "om_role";

export function AuthProvider({ children }) {
  const [role, setRole] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || null;
  });

  const login = useCallback((username) => {
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

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

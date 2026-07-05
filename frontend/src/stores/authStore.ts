import { create } from "zustand";
import api from "@/lib/axios";
import type { Role } from "@/lib/roles";

interface AccountProfile {
  customerCustId: string;
  userName: string;
  role: Role;
}

interface AuthState {
  hydrated: boolean;
  role: Role | null;
  account: AccountProfile | null;
  /**
   * Short-lived access token held in memory only (never persisted).
   * Sent as `Authorization: Bearer <accessToken>` by the axios layer.
   * CAUTION: do NOT add zustand `persist` to this store — that would leak
   * the access token to localStorage and reverse the in-memory protection.
   */
  accessToken: string | null;
  restoreSession: () => Promise<void>;
  login: (userName: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  hydrated: false,
  role: null,
  account: null,
  accessToken: null,

  restoreSession: async () => {
    try {
      const { data } = await api.get<{ account: AccountProfile }>("/auth/me");
      set({ role: data.account.role, account: data.account, hydrated: true });
    } catch {
      set({ role: null, account: null, hydrated: true });
    }
  },

  login: async (userName, password) => {
    try {
      const { data } = await api.post<{
        account: AccountProfile;
        accessToken: string;
      }>("/auth/login", { userName, password });

      set({
        role: data.account.role,
        account: data.account,
        accessToken: data.accessToken,
        hydrated: true,
      });
      return true;
    } catch {
      return false;
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // best-effort
    }
    set({ role: null, account: null, accessToken: null });
  },
}));

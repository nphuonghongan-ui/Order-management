import { create } from "zustand";
import api from "@/lib/apis/axios";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import { useNotificationStore } from "@/stores/notificationStore";
import type { Role } from "@/lib/roles";

let restoreInFlight: Promise<void> | null = null;

interface AccountProfile {
  customerCustId: string;
  userName: string;
  role: Role;
  authProvider?: "local" | "google" | "both";
  email?: string | null;
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
  loginWithGoogleOneTap: (credential: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  hydrated: false,
  role: null,
  account: null,
  accessToken: null,

  restoreSession: async () => {
    if (restoreInFlight) return restoreInFlight;
    restoreInFlight = (async () => {
      try {
        if (!useAuthStore.getState().accessToken) {
          try {
            const { data } = await api.post<{ accessToken: string }>(
              "/auth/refresh",
            );
            useAuthStore.setState({ accessToken: data.accessToken });
          } catch {
            set({ role: null, account: null, hydrated: true });
            return;
          }
        }
        const { data } = await api.get<{ account: AccountProfile }>("/auth/me");
        set({ role: data.account.role, account: data.account, hydrated: true });
        const token = useAuthStore.getState().accessToken;
        if (token) connectSocket(token);
      } catch {
        set({ role: null, account: null, hydrated: true });
      }
    })().finally(() => {
      restoreInFlight = null;
    });
    return restoreInFlight;
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
      connectSocket(data.accessToken);
      return true;
    } catch {
      return false;
    }
  },

  loginWithGoogleOneTap: async (credential) => {
    const { data } = await api.post<{
      account: AccountProfile;
      accessToken: string;
    }>("/auth/google/onetap", { credential });

    set({
      role: data.account.role,
      account: data.account,
      accessToken: data.accessToken,
      hydrated: true,
    });
    connectSocket(data.accessToken);
    return true;
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // best-effort
    }
    disconnectSocket();
    useNotificationStore.getState().reset();
    set({ role: null, account: null, accessToken: null });
  },
}));

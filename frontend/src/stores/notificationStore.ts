import { create } from "zustand";
import type { NotificationItem } from "@/components/notification/types";

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  loaded: boolean;
  setAll: (items: NotificationItem[], unreadCount: number) => void;
  addOne: (n: NotificationItem) => void;
  markRead: (id: string) => void;
  markAllReadLocal: () => void;
  reset: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  loaded: false,

  setAll: (items, unreadCount) => set({ notifications: items, unreadCount, loaded: true }),

  addOne: (n) =>
    set((s) => {
      if (s.notifications.some((x) => x._id === n._id)) return s;
      return {
        notifications: [n, ...s.notifications],
        unreadCount: s.unreadCount + (n.read ? 0 : 1),
      };
    }),

  markRead: (id) =>
    set((s) => {
      const target = s.notifications.find((n) => n._id === id);
      if (!target || target.read) return s;
      return {
        notifications: s.notifications.map((n) =>
          n._id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, s.unreadCount - 1),
      };
    }),

  markAllReadLocal: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  reset: () => set({ notifications: [], unreadCount: 0, loaded: false }),
}));

import { io, type Socket } from "socket.io-client";
import { toast } from "sonner";
import type { NotificationItem } from "@/components/notification/types";
import { useNotificationStore } from "@/stores/notificationStore";

const SOCKET_URL =
  import.meta.env.API_URL?.replace(/\/api$/, "") ?? "http://localhost:8000";

let socket: Socket | null = null;

export function connectSocket(token: string) {
  if (socket) {
    if (socket.connected) return socket;
    socket.disconnect();
    socket = null;
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    withCredentials: true,
    transports: ["websocket", "polling"],
    reconnection: true,
  });

  socket.on("connect_error", (err) => {
    console.warn("[socket] connect_error:", err.message);
  });

  socket.on("notification:new", (n: NotificationItem) => {
    useNotificationStore.getState().addOne(n);
    toast.message(n.title, {
      description: n.message
        ? `${n.message}\nFrom ${n.fromUserName} (${n.fromCustomerCustId})`
        : `From ${n.fromUserName} (${n.fromCustomerCustId})`,
    });
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}

export function getSocket() {
  return socket;
}

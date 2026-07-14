import api from "./axios";
import type {
  ManufactureRecipient,
  NotificationItem,
  NotificationListResult,
  NotificationContext,
} from "@/components/notification/types";

export interface ListNotificationsParams {
  cursor?: string | null;
  limit?: number;
  unreadOnly?: boolean;
}

export async function listMyNotifications(
  params?: ListNotificationsParams
): Promise<NotificationListResult> {
  const query: Record<string, string> = {};
  if (params?.cursor) query.cursor = params.cursor;
  if (typeof params?.limit === "number") query.limit = String(params.limit);
  if (params?.unreadOnly) query.unreadOnly = "true";
  const { data } = await api.get<NotificationListResult>("/notifications", {
    params: query,
  });
  return {
    items: data.items ?? [],
    nextCursor: data.nextCursor ?? null,
    hasMore: Boolean(data.hasMore),
    unreadCount: Number(data.unreadCount ?? 0),
  };
}

export interface SendUrgeUpdateInput {
  recipientCustomerCustId: string;
  message?: string;
  context?: NotificationContext;
}

export async function sendUrgeUpdate(
  input: SendUrgeUpdateInput
): Promise<NotificationItem> {
  const { data } = await api.post<{ item: NotificationItem }>(
    "/notifications",
    input
  );
  return data.item;
}

export async function markRead(id: string): Promise<NotificationItem> {
  const { data } = await api.patch<{ item: NotificationItem }>(
    `/notifications/${id}/read`
  );
  return data.item;
}

export async function markAllRead(): Promise<number> {
  const { data } = await api.patch<{ modified: number }>(
    "/notifications/read-all"
  );
  return Number(data.modified ?? 0);
}

export async function listManufactureRecipients(): Promise<ManufactureRecipient[]> {
  const { data } = await api.get<{ items: ManufactureRecipient[] }>(
    "/notifications/recipients"
  );
  return data.items ?? [];
}

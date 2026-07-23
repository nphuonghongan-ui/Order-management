import api from "./axios";
import type {
  CustomerInfo,
  DeliveryInfo,
  PackingListRecord,
  PickedItem,
} from "@/components/packing-list/types";

export interface SubmitPackingListPayload {
  customer: CustomerInfo;
  delivery: DeliveryInfo;
  items: PickedItem[];
}

export type PackingListOperation =
  | { op: "set_qty"; lineId: string; qty: number }
  | { op: "set_customer"; name: string; address: string; contact?: string; email?: string }
  | { op: "set_delivery"; name: string; address: string; shipDate?: string; notes?: string };

export async function listPackingLists(): Promise<PackingListRecord[]> {
  const { data } = await api.get<{ lists: PackingListRecord[] }>("/packing-list");
  return data.lists ?? [];
}

export async function getPackingList(id: string): Promise<PackingListRecord> {
  const { data } = await api.get<{ list: PackingListRecord }>(`/packing-list/${id}`);
  return data.list;
}

export async function submitPackingList(
  payload: SubmitPackingListPayload
): Promise<PackingListRecord> {
  const { data } = await api.post<{ list: PackingListRecord }>("/packing-list", payload);
  return data.list;
}

export async function updatePackingList(
  id: string,
  payload: { operations: PackingListOperation[] }
): Promise<PackingListRecord> {
  const { data } = await api.patch<{ list: PackingListRecord }>(
    `/packing-list/${id}`,
    payload
  );
  return data.list;
}

export async function deletePackingList(id: string): Promise<void> {
  await api.delete(`/packing-list/${id}`);
}

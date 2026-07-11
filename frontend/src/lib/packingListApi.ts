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

export async function deletePackingList(id: string): Promise<void> {
  await api.delete(`/packing-list/${id}`);
}

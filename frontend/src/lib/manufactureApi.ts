import api from "./axios";
import type { ManufactureItem } from "@/components/po/types";

export interface ListManufactureParams {
  cursor?: string | null;
  limit?: number;
  q?: string;
}

export interface ListManufactureResult {
  items: ManufactureItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface PatchExWorkDatePayload {
  exWorkDate: string | null;
}

export async function listManufactureItems(
  params?: ListManufactureParams
): Promise<ListManufactureResult> {
  const query: Record<string, string> = {};
  if (params?.cursor) query.cursor = params.cursor;
  if (typeof params?.limit === "number") query.limit = String(params.limit);
  if (params?.q) query.q = params.q;
  const { data } = await api.get<{
    items: ManufactureItem[];
    nextCursor: string | null;
    hasMore: boolean;
  }>("/manufacture/items", { params: query });
  return {
    items: data.items ?? [],
    nextCursor: data.nextCursor ?? null,
    hasMore: Boolean(data.hasMore),
  };
}

export async function patchManufactureItem(
  id: string,
  payload: PatchExWorkDatePayload
): Promise<ManufactureItem> {
  const { data } = await api.patch<{ item: ManufactureItem }>(
    `/manufacture/items/${id}`,
    payload
  );
  return data.item;
}

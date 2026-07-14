import api from "./axios";
import type { ManufactureItem, Mode } from "@/components/po/types";

export interface ListLineItemsParams {
  cursor?: string | null;
  limit?: number;
  q?: string;
  mode?: Mode | null;
  customerCustId?: string;
  ready?: boolean;
}

export interface ListLineItemsResult {
  items: ManufactureItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

export async function listLineItems(
  params?: ListLineItemsParams
): Promise<ListLineItemsResult> {
  const query: Record<string, string> = {};
  if (params?.cursor) query.cursor = params.cursor;
  if (typeof params?.limit === "number") query.limit = String(params.limit);
  if (params?.q) query.q = params.q;
  if (params?.mode) query.mode = params.mode;
  if (params?.customerCustId) query.customerCustId = params.customerCustId;
  if (params?.ready) query.ready = "true";
  const { data } = await api.get<{
    items: ManufactureItem[];
    nextCursor: string | null;
    hasMore: boolean;
  }>("/line-items", { params: query });
  return {
    items: data.items ?? [],
    nextCursor: data.nextCursor ?? null,
    hasMore: Boolean(data.hasMore),
  };
}

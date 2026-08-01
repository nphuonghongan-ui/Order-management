import api from "./axios";

export interface PartNumOption {
  _id: string;
  no: number;
  partNum: string;
  dimension: {
    length: number;
    width: number;
    height: number;
  };
  weightKg: number;
}

export interface CreatePartNumPayload {
  no?: number;
  partNum: string;
  dimension: { length: number; width: number; height: number };
  weightKg?: number;
}

export interface ImportPartNumItem {
  no?: number;
  partNum: string;
  dimension: { length: number; width: number; height: number };
  weightKg?: number;
}

export interface ImportPartNumError {
  row: number;
  partNum: string | null;
  message: string;
}

export interface ImportPartNumResponse {
  createdCount: number;
  skippedCount: number;
  created: PartNumOption[];
  errors: ImportPartNumError[];
}

export async function listPartNums(): Promise<PartNumOption[]> {
  const { data } = await api.get<{ items: PartNumOption[] }>("/part-nums");
  return data.items ?? [];
}

export interface ListPartNumsPageParams {
  cursor?: string | null;
  limit?: number;
  q?: string;
}

export interface ListPartNumsPageResult {
  items: PartNumOption[];
  nextCursor: string | null;
  hasMore: boolean;
}

export async function listPartNumsPage(
  params?: ListPartNumsPageParams
): Promise<ListPartNumsPageResult> {
  const query: Record<string, string> = {};
  if (params?.cursor) query.cursor = params.cursor;
  if (typeof params?.limit === "number") query.limit = String(params.limit);
  if (params?.q) query.q = params.q;
  const { data } = await api.get<{
    items: PartNumOption[];
    nextCursor: string | null;
    hasMore: boolean;
  }>("/part-nums", { params: query });
  return {
    items: data.items ?? [],
    nextCursor: data.nextCursor ?? null,
    hasMore: Boolean(data.hasMore),
  };
}

export async function getNextPartNumNo(): Promise<number> {
  const { data } = await api.get<{ no: number }>("/part-nums/next-no");
  return data.no;
}

export async function createPartNum(
  payload: CreatePartNumPayload
): Promise<PartNumOption> {
  const { data } = await api.post<{ item: PartNumOption }>("/part-nums", payload);
  return data.item;
}

export async function importPartNums(
  items: ImportPartNumItem[]
): Promise<ImportPartNumResponse> {
  const { data } = await api.post<ImportPartNumResponse>("/part-nums/import", {
    items,
  });
  return data;
}

export async function deletePartNum(id: string): Promise<PartNumOption> {
  const { data } = await api.delete<{ item: PartNumOption }>(`/part-nums/${id}`);
  return data.item;
}

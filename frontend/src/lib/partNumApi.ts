import api from "./axios";

export interface PartNumOption {
  no: number;
  partNum: string;
  dimension: { length: number; width: number; height: number };
}

export async function listPartNums(): Promise<PartNumOption[]> {
  const { data } = await api.get<{ items: PartNumOption[] }>("/part-nums");
  return data.items ?? [];
}

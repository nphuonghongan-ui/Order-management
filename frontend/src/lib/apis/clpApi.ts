import api from "./axios";
import type { ContainerTypeId, ClpOptimizeResponse } from "@/lib/clp/types";

export interface ClpOptimizeRequest {
  plId: string;
  containerTypeId: ContainerTypeId;
}

export async function optimizePackingList(
  payload: ClpOptimizeRequest
): Promise<ClpOptimizeResponse> {
  const { data } = await api.post<ClpOptimizeResponse>(
    "/clp/optimize",
    payload
  );
  return data;
}

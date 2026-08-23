import api from "./axios";
import type {
  ContainerTypeId,
  YardContainer,
  YardContainerStatus,
} from "@/components/yard-viewer/yardTypes";

export interface ListYardContainersParams {
  status?: YardContainerStatus;
  typeId?: ContainerTypeId;
  unplaced?: boolean;
}

export async function listYardContainers(
  params?: ListYardContainersParams
): Promise<YardContainer[]> {
  const query: Record<string, string> = {};
  if (params?.status) query.status = params.status;
  if (params?.typeId) query.typeId = params.typeId;
  if (params?.unplaced) query.unplaced = "true";
  const { data } = await api.get<{ items: YardContainer[] }>("/yard-containers", {
    params: query,
  });
  return data.items ?? [];
}

export interface CreateYardContainerInput {
  containerNo: string;
  typeId: ContainerTypeId;
  status?: YardContainerStatus;
  ownerName?: string;
  grossWeightKg?: number;
  sealNo?: string;
  eta?: string | null;
  notes?: string;
}

export async function createYardContainer(
  input: CreateYardContainerInput
): Promise<YardContainer> {
  const { data } = await api.post<{ item: YardContainer }>("/yard-containers", input);
  return data.item;
}

export interface UpdateYardContainerInput {
  status?: YardContainerStatus;
  ownerName?: string;
  grossWeightKg?: number;
  sealNo?: string;
  eta?: string | null;
  notes?: string;
}

export async function updateYardContainer(
  id: string,
  input: UpdateYardContainerInput
): Promise<YardContainer> {
  const { data } = await api.patch<{ item: YardContainer }>(
    `/yard-containers/${id}`,
    input
  );
  return data.item;
}

export async function moveYardContainer(
  id: string,
  targetSlotId: string
): Promise<YardContainer> {
  const { data } = await api.post<{ item: YardContainer }>(
    `/yard-containers/${id}/move`,
    { targetSlotId }
  );
  return data.item;
}

export async function releaseYardContainer(id: string): Promise<YardContainer> {
  const { data } = await api.post<{ item: YardContainer }>(
    `/yard-containers/${id}/release`
  );
  return data.item;
}

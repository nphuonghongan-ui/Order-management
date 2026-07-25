import api from "./axios";
import type { ContainerType, ContainerTypeId } from "@/components/container-viewer/units";

export interface ContainerApiItem {
  _id: string;
  typeId: ContainerTypeId;
  isoDesignation: string | null;
  label: string;
  inner: { length: number; width: number; height: number };
  maxWeightKg: number;
  shellColor: string;
  costFactor: number;
}

export interface ContainerListResponse {
  items: ContainerApiItem[];
}

const CACHE_KEY = "containers_v2";

export async function listContainers(): Promise<ContainerApiItem[]> {
  const { data } = await api.get<ContainerListResponse>("/containers");
  return data.items ?? [];
}

export function toContainerType(item: ContainerApiItem): ContainerType {
  return {
    typeId: item.typeId,
    label: item.label,
    inner: {
      l: item.inner.length,
      w: item.inner.width,
      h: item.inner.height,
    },
    maxWeightKg: item.maxWeightKg,
    shellColor: item.shellColor,
    costFactor: item.costFactor,
  };
}

export async function loadContainersCached(): Promise<ContainerType[]> {
  const cached = sessionStorage.getItem(CACHE_KEY);
  if (cached) {
    try {
      const items = JSON.parse(cached) as ContainerApiItem[];
      return items.map(toContainerType);
    } catch {
      sessionStorage.removeItem(CACHE_KEY);
    }
  }
  const items = await listContainers();
  sessionStorage.setItem(CACHE_KEY, JSON.stringify(items));
  return items.map(toContainerType);
}

import api from "./axios";
import type {
  ContainerTypeId,
  Slot,
  Yard,
  YardBlock,
  YardContainer,
  YardLayout,
  YardUpdateEvent,
} from "@/components/yard-viewer/yardTypes";

export async function listYards(): Promise<Yard[]> {
  const { data } = await api.get<{ items: Yard[] }>("/yards");
  return data.items ?? [];
}

export async function getYardLayout(yardId: string): Promise<YardLayout> {
  const { data } = await api.get<YardLayout>(`/slots/yards/${yardId}/layout`);
  return data;
}

export async function reserveSlot(slotId: string, reserved: boolean): Promise<Slot> {
  const { data } = await api.patch<{ item: Slot }>(`/slots/${slotId}/reserve`, {
    reserved,
  });
  return data.item;
}

export type { ContainerTypeId, Yard, YardBlock, YardContainer, YardLayout, YardUpdateEvent };

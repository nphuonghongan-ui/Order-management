import { isAxiosError } from "axios";
import api from "./axios";
import type { LineItem, Mode, POHeader } from "@/components/po/types";

export interface SubmitLine {
  poNum: string;
  shipToNum: string;
  needByDate: string;
  requestDate: string;
  mode: Mode;
  orderDtl: { orderLine: string; partNum: string; sellingQuantity: string };
  unitPrice: string;
  quantityPerCont: string;
}

export interface SubmitPayload {
  lines: SubmitLine[];
}

export interface CreatedLine {
  _id: string;
  customerCustId: string;
  poNum: string;
  shipToNum: string;
  needByDate: string;
  requestDate: string;
  mode: Mode;
  orderDtl: { orderLine: number; partNum: string; sellingQuantity: number };
  unitPrice: number;
  total: number;
  quantityPerCont: number;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitResponse {
  created: CreatedLine[];
}

export interface SubmitErrorBody {
  message: string;
  errors?: Record<string, string>[];
  duplicatePairs?: { poNum: string; orderLine: number }[];
  existingPairs?: { poNum: string; orderLine: number }[];
}

export function toSubmitPayload(items: LineItem[], header: POHeader): SubmitPayload {
  return {
    lines: items.map((it) => ({
      poNum: it.poNum,
      shipToNum: header.shipToNum,
      needByDate: header.needByDate,
      requestDate: header.requestDate,
      mode: header.mode,
      orderDtl: {
        orderLine: it.orderLine,
        partNum: it.partNum,
        sellingQuantity: it.sellingQuantity,
      },
      unitPrice: it.unitPrice,
      quantityPerCont: it.quantityPerCont,
    })),
  };
}

export async function submitPO(
  payload: SubmitPayload
): Promise<SubmitResponse> {
  const { data } = await api.post<SubmitResponse>("/pos", payload);
  return data;
}

export async function fetchNextPONum(): Promise<{ poNum: string }> {
  const { data } = await api.get<{ poNum: string }>("/pos/next-po-num");
  return data;
}

export function extractSubmitError(err: unknown): {
  message: string;
  conflictingPairs: { poNum: string; orderLine: number }[];
} {
  let message = "Submission failed. Please try again.";
  let conflictingPairs: { poNum: string; orderLine: number }[] = [];
  if (isAxiosError<SubmitErrorBody>(err)) {
    const body = err.response?.data;
    if (body?.message) message = body.message;
    if (Array.isArray(body?.existingPairs)) {
      conflictingPairs = body.existingPairs;
    } else if (Array.isArray(body?.duplicatePairs)) {
      conflictingPairs = body.duplicatePairs;
    }
    if (Array.isArray(body?.errors)) {
      const flat = body.errors.flatMap((e) =>
        Object.entries(e).map(([k, v]) => `${k}: ${v}`)
      );
      if (flat.length) {
        message = `${message} — ${flat.slice(0, 3).join("; ")}`;
      }
    }
  }
  return { message, conflictingPairs };
}

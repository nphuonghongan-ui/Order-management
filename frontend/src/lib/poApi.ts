import { isAxiosError } from "axios";
import api from "./axios";
import type { LineItem, Mode } from "@/components/po/types";

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
  existingPoNums?: string[];
}

export function toSubmitPayload(items: LineItem[]): SubmitPayload {
  return {
    lines: items.map((it) => ({
      poNum: it.poNum,
      shipToNum: it.shipToNum,
      needByDate: it.needByDate,
      requestDate: it.requestDate,
      mode: it.mode,
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

export function extractSubmitError(err: unknown): {
  message: string;
  conflictingPoNums: string[];
} {
  let message = "Submission failed. Please try again.";
  let conflictingPoNums: string[] = [];
  if (isAxiosError<SubmitErrorBody>(err)) {
    const body = err.response?.data;
    if (body?.message) message = body.message;
    if (Array.isArray(body?.existingPoNums)) {
      conflictingPoNums = body.existingPoNums;
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
  return { message, conflictingPoNums };
}

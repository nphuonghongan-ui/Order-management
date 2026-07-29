import { useCallback, useState } from "react";
import { createShipment } from "@/lib/apis/easycargoApi";

export interface EasyCargoState {
  openShipmentUrl: string | null;
  shipmentId: string | null;
  loading: boolean;
  error: string | null;
  skippedPartNums: string[];
  alreadySent: boolean;
}

const initial: EasyCargoState = {
  openShipmentUrl: null,
  shipmentId: null,
  loading: false,
  error: null,
  skippedPartNums: [],
  alreadySent: false,
};

export function useEasyCargo() {
  const [state, setState] = useState<EasyCargoState>(initial);

  const run = useCallback(async (plId: string) => {
    setState({ ...initial, loading: true });
    try {
      const result = await createShipment(plId);
      setState({
        openShipmentUrl: result.openShipmentUrl,
        shipmentId: result.shipmentId,
        skippedPartNums: result.skippedPartNums ?? [],
        loading: false,
        error: null,
        alreadySent: result.alreadySent ?? false,
      });
      return result;
    } catch (err) {
      const msg = extractErrorMessage(err);
      setState({
        openShipmentUrl: null,
        shipmentId: null,
        skippedPartNums: [],
        loading: false,
        error: msg,
        alreadySent: false,
      });
      throw err;
    }
  }, []);

  const reset = useCallback(() => setState(initial), []);

  return { ...state, run, reset };
}

function extractErrorMessage(err: unknown): string {
  if (typeof err === "object" && err !== null) {
    const anyErr = err as {
      response?: { data?: { message?: string } };
      message?: string;
    };
    if (anyErr.response?.data?.message) return anyErr.response.data.message;
    if (anyErr.message) return anyErr.message;
  }
  return "Failed to create easy-cargo shipment";
}

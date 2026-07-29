import api from "./axios";

export interface CreateShipmentRequest {
  plId: string;
}

export interface CreateShipmentResponse {
  openShipmentUrl: string;
  shipmentId: string;
  skippedPartNums?: string[];
  /** `true` when the response is a re-used existing shipment (no
   *  easy-cargo API call was made); `false` when a new shipment
   *  was just created. */
  alreadySent?: boolean;
}

export async function createShipment(
  plId: string,
): Promise<CreateShipmentResponse> {
  const { data } = await api.post<CreateShipmentResponse>(
    "/easycargo/shipment",
    { plId },
  );
  return data;
}

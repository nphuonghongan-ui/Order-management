/**
 * LoadingToContainer — sends a packing list to easy-cargo and
 * returns the open_shipment_url the user opens in a new tab to
 * view and calculate the load plan. The actual load planning is
 * done in easy-cargo's web app, not here.
 *
 * Route: /dashboard/packing-list/:plId/loading/run
 *
 * Flow:
 *   1. Load packing list
 *   2. Show current sync state + button (label depends on state)
 *   3. On click → POST /api/easycargo/shipment
 *   4. Backend re-uses the existing link if the PL is unchanged
 *      since the last successful send; otherwise creates a new
 *      shipment and persists the new state.
 *   5. On success → show the public link + a "(re-used)" or
 *      "(just created)" hint.
 *   6. On error → show error + Retry / Back.
 */

import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  AlertCircle,
  ExternalLink,
  Loader2,
  RefreshCw,
  Send,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPackingList } from "@/lib/apis/packingListApi";
import { useEasyCargo } from "@/hooks/useEasyCargo";
import type { PackingListRecord } from "@/components/packing-list/types";

type Stage = "loading" | "ready" | "sending" | "done" | "error";

export default function LoadingToContainer() {
  const { plId } = useParams<{ plId: string }>();
  const navigate = useNavigate();

  const [record, setRecord] = useState<PackingListRecord | null>(null);
  const [stage, setStage] = useState<Stage>("loading");
  const [loadError, setLoadError] = useState<string | null>(null);

  const {
    openShipmentUrl,
    shipmentId,
    loading,
    error,
    skippedPartNums,
    alreadySent,
    run,
    reset,
  } = useEasyCargo();

  useEffect(() => {
    if (!plId) return;
    let alive = true;
    (async () => {
      try {
        const data = await getPackingList(plId);
        if (!alive) return;
        setRecord(data);
        setStage("ready");
      } catch (err) {
        if (!alive) return;
        const msg =
          err instanceof Error ? err.message : "Failed to load packing list";
        setLoadError(msg);
        setStage("error");
      }
    })();
    return () => {
      alive = false;
    };
  }, [plId]);

  const handleSend = useCallback(async () => {
    if (!plId) return;
    setStage("sending");
    try {
      await run(plId);
      setStage("done");
    } catch {
      setStage("error");
    }
  }, [plId, run]);

  const handleRetry = useCallback(() => {
    setLoadError(null);
    reset();
    setStage("ready");
  }, [reset]);

  if (!plId) {
    return (
      <FullScreen>
        <div className="rounded-full bg-destructive/10 p-3">
          <AlertCircle size={22} className="text-destructive" />
        </div>
        <p className="text-sm text-destructive max-w-md text-center">
          Missing packing list id
        </p>
        <Button
          onClick={() => navigate("/dashboard/packing-list")}
        >
          Back
        </Button>
      </FullScreen>
    );
  }

  if (stage === "loading") {
    return (
      <FullScreen>
        <Loader2 size={36} className="animate-spin text-white" />
        <p className="text-sm text-white/70">Loading packing list…</p>
      </FullScreen>
    );
  }

  if (stage === "error") {
    return (
      <FullScreen>
        <div className="rounded-full bg-destructive/10 p-3">
          <AlertCircle size={22} className="text-destructive" />
        </div>
        <p className="text-sm text-destructive max-w-md text-center">
          {loadError ?? error ?? "Something went wrong"}
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRetry}>
            Retry
          </Button>
          <Button
            onClick={() => navigate("/dashboard/packing-list")}
          >
            Back
          </Button>
        </div>
      </FullScreen>
    );
  }

  if (stage === "sending" || loading) {
    return (
      <FullScreen>
        <Loader2 size={36} className="animate-spin text-white" />
        <p className="text-sm text-white/70">Sending to EasyCargo…</p>
      </FullScreen>
    );
  }

  if (stage === "done" && openShipmentUrl) {
    return (
      <FullScreen>
        <div className="flex flex-col items-center gap-1 text-center">
          <Truck size={28} className="text-white/80" />
          <p className="text-lg font-semibold tracking-wide">
            {record?.plNumber ?? plId}
          </p>
          <p className="text-xs text-white/60">
            {record?.itemsCount ?? 0} item
            {(record?.itemsCount ?? 0) === 1 ? "" : "s"} sent to EasyCargo
          </p>
        </div>
        <a
          href={openShipmentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex"
        >
          <Button size="lg" className="gap-2">
            <ExternalLink size={16} /> Open in EasyCargo
          </Button>
        </a>
        <p className="text-[11px] text-white/40 max-w-md text-center">
          {alreadySent ? "(re-used existing shipment)" : "(just created)"}
          {" — "}shipment ID: {shipmentId}
        </p>
        {skippedPartNums.length > 0 && (
          <p className="text-[11px] text-white/50 max-w-md text-center">
            {skippedPartNums.length} partNum(s) were skipped (no dimensions
            in the PartNum collection): {skippedPartNums.join(", ")}
          </p>
        )}
        <Button
          onClick={() => navigate("/dashboard/packing-list")}
        >
          Back
        </Button>
      </FullScreen>
    );
  }

  // ready stage
  const isShipmentCreated = record?.isShipmentCreated ?? false;
  const isUpdated = record?.isUpdated ?? false;
  const sentAt = record?.easycargoSentAt ?? null;

  let stateLabel = `${record?.itemsCount ?? 0} item${
    (record?.itemsCount ?? 0) === 1 ? "" : "s"
  } · Ready to send to EasyCargo`;
  if (isShipmentCreated && isUpdated) {
    stateLabel = `Last sent at ${
      sentAt ? new Date(sentAt).toLocaleString() : "—"
    } · modified since — a new shipment will be created`;
  } else if (isShipmentCreated) {
    stateLabel = `Last sent at ${
      sentAt ? new Date(sentAt).toLocaleString() : "—"
    } · no changes since`;
  }

  const buttonLabel = isShipmentCreated
    ? isUpdated
      ? "Send new shipment"
      : "Re-send to EasyCargo"
    : "Send to EasyCargo";
  const ButtonIcon = isShipmentCreated && !isUpdated ? RefreshCw : Send;

  return (
    <FullScreen>
      <div className="flex flex-col items-center gap-1 text-center">
        <Truck size={28} className="text-white/80" />
        <p className="text-lg font-semibold tracking-wide">
          {record?.plNumber ?? plId}
        </p>
        <p className="text-xs text-white/60">{stateLabel}</p>
      </div>
      <Button
        size="lg"
        onClick={() => void handleSend()}
        className="gap-2"
      >
        <ButtonIcon size={16} /> {buttonLabel}
      </Button>
      <Button
        onClick={() => navigate("/dashboard/packing-list")}
      >
        Back
      </Button>
    </FullScreen>
  );
}

function FullScreen({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 px-6"
      style={{ background: "#08122C" }}
    >
      <div className="relative z-10 flex flex-col items-center gap-5 w-full max-w-md text-white">
        {children}
      </div>
    </div>
  );
}

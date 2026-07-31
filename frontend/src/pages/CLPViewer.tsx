import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import {
  AlertCircle,
  ArrowLeft,
  ExternalLink,
  Loader2,
  Play,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPackingList } from "@/lib/apis/packingListApi";
import { optimizePackingList } from "@/lib/apis/clpApi";
import { useEasyCargo } from "@/lib/hooks/useEasyCargo";
import type { PackingListRecord } from "@/components/packing-list/types";
import type {
  ClpOptimizeResponse,
  ContainerTypeId,
} from "@/lib/clp/types";
import { CONTAINER_REGISTRY } from "@/lib/clp/registry";
import Scene from "@/components/container-viewer/Scene";
import TopBar from "@/components/container-viewer/TopBar";
import Toolbar from "@/components/container-viewer/Toolbar";
import {
  copyDatToClipboard,
  downloadDatFile,
} from "@/components/container-viewer/datExport";
import { toast } from "sonner";

interface CLPViewerProps {
  plId: string;
  autoStart: boolean;
}

type Stage =
  | "loading"
  | "ready"
  | "calculating"
  | "ready-viewer"
  | "error";

export default function CLPViewer({ plId, autoStart }: CLPViewerProps) {
  const navigate = useNavigate();

  const [record, setRecord] = useState<PackingListRecord | null>(null);
  const [stage, setStage] = useState<Stage>("loading");
  const [loadError, setLoadError] = useState<string | null>(null);

  const [containerTypeId, setContainerTypeId] =
    useState<ContainerTypeId>("20GP");
  const [result, setResult] = useState<ClpOptimizeResponse | null>(null);

  const {
    openShipmentUrl,
    loading: easyLoading,
    error: easyError,
    alreadySent,
    run: runEasyCargo,
    reset: resetEasyCargo,
  } = useEasyCargo();

  const containerTypeIdRef = useRef(containerTypeId);
  useEffect(() => {
    containerTypeIdRef.current = containerTypeId;
  }, [containerTypeId]);

  const runOptimize = useCallback(
    async (typeId: ContainerTypeId, list?: PackingListRecord | null) => {
      if (!plId) return;
      if (list) setRecord(list);
      setStage("calculating");
      try {
        const res = await optimizePackingList({
          plId,
          containerTypeId: typeId,
        });
        setResult(res);
        if (res.skippedPartNums && res.skippedPartNums.length > 0) {
          toast.warning(
            `${res.skippedPartNums.length} partNum(s) skipped (no dimensions/weight): ${res.skippedPartNums.join(", ")}`
          );
        }
        setStage("ready-viewer");
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to run CLP optimizer";
        setLoadError(msg);
        setStage("error");
      }
    },
    [plId]
  );

  useEffect(() => {
    if (!plId) return;
    let alive = true;
    (async () => {
      try {
        const data = await getPackingList(plId);
        if (!alive) return;
        setRecord(data);
        if (autoStart) {
          await runOptimize(containerTypeIdRef.current, data);
        } else {
          setStage("ready");
        }
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
  }, [plId, autoStart, runOptimize]);

  const handleContainerChange = useCallback(
    (id: ContainerTypeId) => {
      setContainerTypeId(id);
      setResult(null);
      void runOptimize(id);
    },
    [runOptimize]
  );

  const handleCalculate = useCallback(() => {
    void runOptimize(containerTypeId);
  }, [runOptimize, containerTypeId]);

  const handleGenerateDat = useCallback(() => {
    if (!result) return;
    downloadDatFile(result.placements, `${record?.plNumber ?? plId}.dat`);
    toast.success("DAT file downloaded");
  }, [result, record, plId]);

  const handleCopyDat = useCallback(async () => {
    if (!result) return;
    const ok = await copyDatToClipboard(result.placements);
    if (ok) toast.success("DAT copied to clipboard");
    else toast.error("Clipboard unavailable");
  }, [result]);

  const handleSendEasyCargo = useCallback(async () => {
    if (!plId) return;
    try {
      await runEasyCargo(plId);
    } catch {
      // surfaced via the hook
    }
  }, [plId, runEasyCargo]);

  useEffect(() => {
    if (openShipmentUrl) {
      window.open(openShipmentUrl, "_blank", "noopener,noreferrer");
    }
  }, [openShipmentUrl]);

  const handleRetry = useCallback(() => {
    setLoadError(null);
    resetEasyCargo();
    setStage("calculating");
  }, [resetEasyCargo]);

  if (!plId) {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 px-6"
        style={{ background: "#08122C" }}
      >
        <div className="rounded-full bg-destructive/10 p-3">
          <AlertCircle size={22} className="text-destructive" />
        </div>
        <p className="max-w-md text-center text-sm text-destructive">
          Missing packing list id
        </p>
        <Button onClick={() => navigate("/dashboard/packing-list")}>
          Back
        </Button>
      </div>
    );
  }

  if (stage === "loading" || (stage === "calculating" && !result)) {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 px-6"
        style={{ background: "#08122C" }}
      >
        <Loader2 size={36} className="animate-spin text-white" />
        <p className="text-sm text-white/70">
          {stage === "loading" ? "Loading packing list…" : "Running CLP optimizer…"}
        </p>
      </div>
    );
  }

  if (stage === "error") {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 px-6"
        style={{ background: "#08122C" }}
      >
        <div className="rounded-full bg-destructive/10 p-3">
          <AlertCircle size={22} className="text-destructive" />
        </div>
        <p className="max-w-md text-center text-sm text-destructive">
          {loadError ?? easyError ?? "Something went wrong"}
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRetry}>
            Retry
          </Button>
          <Button onClick={() => navigate("/dashboard/packing-list")}>
            Back
          </Button>
        </div>
      </div>
    );
  }

  if (stage === "ready" && !result) {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 px-6"
        style={{ background: "#08122C" }}
      >
        <div className="flex flex-col items-center gap-1 text-center">
          <Truck size={28} className="text-white/80" />
          <p className="text-lg font-semibold tracking-wide text-white">
            {record?.plNumber ?? plId}
          </p>
          <p className="text-xs text-white/60">
            {record?.itemsCount ?? 0} item
            {(record?.itemsCount ?? 0) === 1 ? "" : "s"} · Ready to run CLP
          </p>
        </div>
        <Button size="lg" className="gap-2" onClick={handleCalculate}>
          <Play size={16} /> Calculate load plan
        </Button>
        <Button onClick={() => navigate("/dashboard/packing-list")}>
          Back
        </Button>
      </div>
    );
  }

  const entry = CONTAINER_REGISTRY[containerTypeId];
  const canExport = !!result && result.placements.length > 0;
  const isShipmentCreated = record?.isShipmentCreated ?? false;
  const isUpdated = record?.isUpdated ?? false;
  const easyButtonLabel = easyLoading
    ? "Sending…"
    : isShipmentCreated
      ? isUpdated
        ? "Send new shipment"
        : "Re-send to EasyCargo"
      : "Send to EasyCargo";

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col"
      style={{ background: "#08122C" }}
    >
      <div className="relative flex-1 overflow-hidden">
        <Scene
          innerMm={entry.innerMm}
          shellColor={entry.shellColor}
          placements={result?.placements ?? []}
        />
        <TopBar
          containerTypeId={containerTypeId}
          onContainerChange={handleContainerChange}
          containerLabel={entry.label}
          containerInnerCm={{
            l: entry.innerMm.l / 10,
            w: entry.innerMm.w / 10,
            h: entry.innerMm.h / 10,
          }}
          disabled={easyLoading}
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 flex justify-end">
          <Toolbar
            onGenerateDat={handleGenerateDat}
            onCopyDat={handleCopyDat}
            canExport={canExport}
            containerLabel={entry.label}
            containerInnerCm={{
              l: entry.innerMm.l / 10,
              w: entry.innerMm.w / 10,
              h: entry.innerMm.h / 10,
            }}
            stats={result?.stats ?? null}
            placements={result?.placements ?? []}
          />
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-3 p-3">
          <div className="pointer-events-auto flex items-center gap-2">
            <Button
              variant="secondary"
              className="gap-1.5"
              onClick={() => navigate("/dashboard/packing-list")}
            >
              <ArrowLeft size={14} /> Back
            </Button>
            <div className="flex items-center gap-1.5 rounded-md border border-border bg-white px-2.5 py-1.5 text-foreground">
              <Truck size={12} className="text-muted-foreground" />
              <span className="text-[11px] font-medium">
                {record?.plNumber ?? plId}
              </span>
              <span className="rounded bg-emerald-500 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                {result?.stats.itemCount ?? 0} items
              </span>
              {alreadySent && (
                <span className="rounded bg-amber-500 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                  re-used
                </span>
              )}
            </div>
            <Button
              variant="outline"
              className="gap-1.5"
              onClick={() => void handleSendEasyCargo()}
              disabled={easyLoading}
            >
              {easyLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <ExternalLink size={14} />
              )}
              {easyButtonLabel}
            </Button>
          </div>
          <div className="pointer-events-none pr-[18rem] text-[10px] text-white/40">
            LMB rotate · RMB pan · Wheel zoom · Esc deselect · G/V/R/S tools
          </div>
        </div>
      </div>
    </div>
  );
}

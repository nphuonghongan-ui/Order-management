import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Copy,
  Download,
  Loader2,
  Truck,
} from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { SectionCard } from "@/components/Detail/SectionCard";
import { Button } from "@/components/ui/button";
import { getPackingList } from "@/lib/packingListApi";
import { formatPackingListForModel } from "@/components/packing-list/formatPackingListForModel";
import { getPartNumDimensions } from "@/components/packing-list/exportEnrichment";
import type { PackingListRecord } from "@/components/packing-list/types";
import { EMPTY } from "@/lib/format";

async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  // Fallback for older browsers / non-secure contexts.
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try {
    document.execCommand("copy");
  } finally {
    document.body.removeChild(ta);
  }
}

export default function LoadingToContainer() {
  const { plId } = useParams<{ plId: string }>();
  const navigate = useNavigate();

  const [record, setRecord] = useState<PackingListRecord | null>(null);
  const [partNumToDim, setPartNumToDim] = useState<Map<
    string,
    { length: number; width: number; height: number }
  > | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    if (!plId) {
      setError("Missing packing list id");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [data, dimMap] = await Promise.all([
        getPackingList(plId),
        getPartNumDimensions(),
      ]);
      setRecord(data);
      setPartNumToDim(dimMap);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to load packing list";
      setError(msg);
      setRecord(null);
      setPartNumToDim(null);
    } finally {
      setLoading(false);
    }
  }, [plId]);

  useEffect(() => {
    void load();
  }, [load]);

  const text = useMemo(
    () =>
      record && partNumToDim
        ? formatPackingListForModel(record, partNumToDim)
        : "",
    [record, partNumToDim]
  );

  const handleCopy = useCallback(async () => {
    if (!text) return;
    try {
      await copyToClipboard(text);
      setCopied(true);
      toast.success("Copied to clipboard");
      window.setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to copy to clipboard"
      );
    }
  }, [text]);

  const handleDownload = useCallback(() => {
    if (!text) return;
    try {
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const filename = `${record?.plNumber ?? plId ?? "packing-list"}.dat`;
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Downloaded");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to download"
      );
    }
  }, [text, record?.plNumber, plId]);

  return (
    <PageShell className="items-center justify-center py-16 px-4">
      <div className="w-full max-w-2xl flex flex-col gap-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <button
            type="button"
            onClick={() => navigate("/dashboard/packing-list")}
            className="inline-flex items-center gap-1.5 text-xs hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            Back to Packing Lists
          </button>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-6 py-5 bg-dk-bg">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-white/10 p-2 ring-1 ring-white/20">
                <Truck size={20} className="text-white" />
              </div>
              <div>
                <div className="font-mono text-lg font-semibold text-dk-text">
                  {record?.plNumber ?? plId ?? EMPTY}
                </div>
              </div>
            </div>
            {record && (
              <span className="text-[11px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full bg-success/15 text-success">
                {record.itemsCount} item{record.itemsCount === 1 ? "" : "s"}
              </span>
            )}
          </div>

          <div className="p-6 flex flex-col gap-6">
            {loading ? (
              <SectionCard title="Model Input" icon={Copy}>
                <div className="flex items-center justify-center py-10">
                  <Loader2
                    size={24}
                    className="animate-spin text-muted-foreground"
                  />
                </div>
              </SectionCard>
            ) : error ? (
              <SectionCard title="Model Input" icon={Copy}>
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                  <div className="rounded-full bg-destructive/10 p-3">
                    <AlertCircle size={22} className="text-destructive" />
                  </div>
                  <p className="text-sm text-destructive max-w-sm">{error}</p>
                  <Button variant="outline" size="sm" onClick={() => void load()}>
                    Retry
                  </Button>
                </div>
              </SectionCard>
            ) : record ? (
              <SectionCard title="Model Input" icon={Copy}>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">
                      Copy or download the block below for your model.
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void handleCopy()}
                        disabled={!text}
                        className="gap-1.5"
                      >
                        {copied ? (
                          <>
                            <Check size={13} />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy size={13} />
                            Copy
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload()}
                        disabled={!text}
                        className="gap-1.5"
                      >
                        <Download size={13} />
                        Download
                      </Button>
                    </div>
                  </div>
                  <pre className="rounded-lg border border-border bg-muted/40 p-4 overflow-auto text-xs leading-5 font-mono whitespace-pre-wrap break-words">
                    {text}
                  </pre>
                </div>
              </SectionCard>
            ) : null}
          </div>
        </div>
      </div>
    </PageShell>
  );
}

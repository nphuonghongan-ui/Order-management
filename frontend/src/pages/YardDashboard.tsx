import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/PageShell";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useYardStore } from "@/stores/useYardStore";
import { listYards, getYardLayout } from "@/lib/apis/yardApi";
import { createYardContainer } from "@/lib/apis/yardContainerApi";
import YardGrid from "@/components/yard-viewer/YardGrid";
import YardLegend from "@/components/yard-viewer/YardLegend";
import YardFiltersPopover from "@/components/yard-viewer/YardFiltersPopover";
import YardSlotDetail from "@/components/yard-viewer/YardSlotDetail";
import { toast } from "sonner";
import { connectSocket, getSocket } from "@/lib/socket";
import { useAuthStore } from "@/stores/authStore";
import type { ContainerTypeId } from "@/components/yard-viewer/yardTypes";

export default function YardDashboard() {
  const yards = useYardStore((s) => s.yards);
  const setYards = useYardStore((s) => s.setYards);
  const selectedYardId = useYardStore((s) => s.selectedYardId);
  const setSelectedYard = useYardStore((s) => s.setSelectedYard);
  const layout = useYardStore((s) => s.layout);
  const setLayout = useYardStore((s) => s.setLayout);
  const setLayoutLoading = useYardStore((s) => s.setLayoutLoading);
  const setLayoutError = useYardStore((s) => s.setLayoutError);
  const layoutLoading = useYardStore((s) => s.layoutLoading);
  const layoutError = useYardStore((s) => s.layoutError);
  const applyServerEvent = useYardStore((s) => s.applyServerEvent);
  const blockFilter = useYardStore((s) => s.blockFilter);
  const setBlockFilter = useYardStore((s) => s.setBlockFilter);

  const accessToken = useAuthStore((s) => s.accessToken);

  const [addOpen, setAddOpen] = useState(false);

  const refreshLayout = useCallback(async () => {
    if (!selectedYardId) return;
    setLayoutLoading(true);
    try {
      const next = await getYardLayout(selectedYardId);
      setLayout(next);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load yard";
      setLayoutError(msg);
    }
  }, [selectedYardId, setLayout, setLayoutError, setLayoutLoading]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const items = await listYards();
        if (!alive) return;
        setYards(items);
        if (items.length > 0 && !selectedYardId) {
          setSelectedYard(items[0]._id);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load yards";
        toast.error(msg);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void refreshLayout();
  }, [refreshLayout]);

  useEffect(() => {
    if (!accessToken) return;
    const s = getSocket() ?? connectSocket(accessToken);
    if (!s) return;
    const onYardUpdate = () => {
      applyServerEvent({ kind: "container.updated" });
      void refreshLayout();
    };
    s.on("yard:update", onYardUpdate);
    return () => {
      s.off("yard:update", onYardUpdate);
    };
  }, [accessToken, applyServerEvent, refreshLayout]);

  const blockOptions = useMemo(() => {
    const blocks = layout?.yard.blocks ?? [];
    return blocks;
  }, [layout]);

  return (
    <PageShell className="h-full">
      <div className="flex h-full flex-col">
        <div className="flex items-end justify-between gap-4 border-b border-border bg-card px-6 pt-5 pb-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Yard Map</h1>
            <p className="text-xs text-muted-foreground">
              Real-time overview of yard layout and container locations
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={selectedYardId ?? undefined}
              onValueChange={(v) => setSelectedYard(v)}
            >
              <SelectTrigger size="sm" className="min-w-[150px]">
                <SelectValue placeholder="Select yard…" />
              </SelectTrigger>
              <SelectContent>
                {yards.map((y) => (
                  <SelectItem key={y._id} value={y._id}>
                    {y.code} · {y.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={blockFilter}
              onValueChange={(v) => setBlockFilter(v)}
            >
              <SelectTrigger size="sm" className="min-w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Blocks</SelectItem>
                {blockOptions.map((b) => (
                  <SelectItem key={b.code} value={b.code}>
                    {b.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <YardFiltersPopover />
            <Button
              size="icon-sm"
              variant="outline"
              aria-label="Add container"
              onClick={() => setAddOpen(true)}
            >
              <Plus />
            </Button>
          </div>
        </div>

        <YardLegend />

        <div className="flex-1 min-h-0 relative bg-muted/30">
          {layoutLoading && !layout && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/60 z-10">
              <Loader2 size={24} className="animate-spin text-primary" />
              <div className="text-xs text-muted-foreground">
                Loading yard layout…
              </div>
            </div>
          )}
          {layoutError && !layout && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <div className="text-sm text-destructive">{layoutError}</div>
              <Button size="sm" variant="outline" onClick={() => void refreshLayout()}>
                Retry
              </Button>
            </div>
          )}
          {layout && <YardGrid />}
          <YardSlotDetail />
        </div>
      </div>
      <AddContainerDialog open={addOpen} onOpenChange={setAddOpen} />
    </PageShell>
  );
}

function AddContainerDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
}) {
  const [containerNo, setContainerNo] = useState("");
  const [typeId, setTypeId] = useState<ContainerTypeId>("20GP");
  const [ownerName, setOwnerName] = useState("");
  const [sealNo, setSealNo] = useState("");
  const [grossWeightKg, setGrossWeightKg] = useState("0");
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setContainerNo("");
    setTypeId("20GP");
    setOwnerName("");
    setSealNo("");
    setGrossWeightKg("0");
  };

  const handleSubmit = async () => {
    if (!containerNo.trim()) {
      toast.error("Container number required");
      return;
    }
    setBusy(true);
    try {
      await createYardContainer({
        containerNo: containerNo.trim().toUpperCase(),
        typeId,
        ownerName,
        sealNo,
        grossWeightKg: Number(grossWeightKg) || 0,
        status: "IN_YARD",
      });
      toast.success("Container registered");
      reset();
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add container</DialogTitle>
          <DialogDescription>
            Register a new physical container in this customer's yard (unplaced).
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Container number</label>
            <Input
              value={containerNo}
              onChange={(e) => setContainerNo(e.target.value.toUpperCase())}
              placeholder="e.g. MSCU1234567"
              className="placeholder:opacity-70"
            />
          </div>
          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Type</label>
            <Select
              value={typeId}
              onValueChange={(v) => setTypeId(v as ContainerTypeId)}
            >
              <SelectTrigger size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(["20GP", "40GP", "40HC", "45HC"] as ContainerTypeId[]).map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Owner (optional)</label>
            <Input
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="placeholder:opacity-70"
              placeholder="Customer / shipping line"
            />
          </div>
          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Seal</label>
            <Input
              value={sealNo}
              onChange={(e) => setSealNo(e.target.value)}
              className="placeholder:opacity-70"
            />
          </div>
          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Gross weight (kg)</label>
            <Input
              type="number"
              value={grossWeightKg}
              onChange={(e) => setGrossWeightKg(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={busy}>
            {busy ? "Saving…" : "Register"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

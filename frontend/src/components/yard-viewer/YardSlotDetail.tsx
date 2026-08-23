import { useMemo, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Building2,
  CalendarClock,
  Hash,
  Layers,
  MapPin,
  PackageOpen,
  Save,
  Tag,
  Weight,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useYardStore } from "@/stores/useYardStore";
import { toast } from "sonner";
import {
  moveYardContainer,
  releaseYardContainer,
  updateYardContainer,
  listYardContainers,
} from "@/lib/apis/yardContainerApi";
import { getYardLayout, reserveSlot } from "@/lib/apis/yardApi";
import type {
  ContainerTypeId,
  Slot,
  YardContainer,
  YardContainerStatus,
} from "./yardTypes";
import { YARD_HEX, shellFor, statusFor } from "./yardColors";

const STATUS_OPTIONS: YardContainerStatus[] = [
  "IN_YARD",
  "GROUNDED",
  "LOADED",
  "OUT_GATED",
  "RESERVED",
];

const TYPE_OPTIONS: ContainerTypeId[] = ["20GP", "40GP", "40HC", "45HC"];

export default function YardSlotDetail() {
  const open = useYardStore((s) => s.selectedSlotId != null);
  const layout = useYardStore((s) => s.layout);
  const selectedSlotId = useYardStore((s) => s.selectedSlotId);
  const setSelectedSlotId = useYardStore((s) => s.setSelectedSlotId);
  const setLayout = useYardStore((s) => s.setLayout);

  const slot = useMemo<Slot | null>(() => {
    if (!layout || !selectedSlotId) return null;
    return layout.slots.find((s) => s._id === selectedSlotId) ?? null;
  }, [layout, selectedSlotId]);

  const container = slot?.container ?? null;
  const [unplaced, setUnplaced] = useState<YardContainer[]>([]);
  const [busy, setBusy] = useState(false);

  const loadUnplaced = async () => {
    try {
      const items = await listYardContainers({ unplaced: true });
      setUnplaced(items);
    } catch {
      /* surfaced elsewhere */
    }
  };

  const handleRelease = async () => {
    if (!container) return;
    setBusy(true);
    try {
      await releaseYardContainer(container._id);
      toast.success("Container released");
      await refreshLayout();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to release");
    } finally {
      setBusy(false);
    }
  };

  const handleMove = async (targetSlotId: string) => {
    if (!container) return;
    setBusy(true);
    try {
      await moveYardContainer(container._id, targetSlotId);
      toast.success("Container moved");
      await refreshLayout();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to move");
    } finally {
      setBusy(false);
    }
  };

  const handleMoveUnplaced = async (containerId: string) => {
    if (!slot) return;
    setBusy(true);
    try {
      await moveYardContainer(containerId, slot._id);
      toast.success("Container placed");
      await Promise.all([refreshLayout(), loadUnplaced()]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to place");
    } finally {
      setBusy(false);
    }
  };

  const handleReserveToggle = async () => {
    if (!slot || !layout) return;
    try {
      await reserveSlot(slot._id, !slot.isReserved);
      await refreshLayout();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to toggle");
    }
  };

  const refreshLayout = async () => {
    if (!layout) return;
    const next = await getYardLayout(layout.yard._id);
    setLayout(next);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        if (!o) setSelectedSlotId(null);
      }}
    >
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 flex flex-col"
      >
        <SheetHeader className="px-4 py-3 border-b border-border">
          <SheetTitle className="flex items-center gap-2 text-base">
            <MapPin size={14} className="text-primary" />
            {slot
              ? `${slot.blockCode} · Row ${slot.row} · Col ${slot.col} · Tier ${slot.tier}`
              : "Slot"}
          </SheetTitle>
          <SheetDescription>
            {slot
              ? `Max tier ${slot.maxTier} · ${slot.isReserved ? "Reserved" : "Open"}`
              : ""}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {!slot ? (
            <div className="text-sm text-muted-foreground">No slot selected.</div>
          ) : container ? (
            <OccupiedPanel
              container={container}
              busy={busy}
              onRelease={handleRelease}
            />
          ) : (
            <EmptyPanel
              slot={slot}
              busy={busy}
              unplaced={unplaced}
              onLoadUnplaced={loadUnplaced}
              onPlace={handleMoveUnplaced}
              onReserveToggle={handleReserveToggle}
              onMoveHere={() => slot.yardContainerId && handleMove(slot._id)}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function OccupiedPanel({
  container,
  busy,
  onRelease,
}: {
  container: YardContainer;
  busy: boolean;
  onRelease: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState<YardContainerStatus>(container.status);
  const [ownerName, setOwnerName] = useState(container.ownerName);
  const [grossWeightKg, setGrossWeightKg] = useState(String(container.grossWeightKg));
  const [sealNo, setSealNo] = useState(container.sealNo);
  const [notes, setNotes] = useState(container.notes);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateYardContainer(container._id, {
        status,
        ownerName,
        grossWeightKg: Number(grossWeightKg) || 0,
        sealNo,
        notes,
      });
      toast.success("Container updated");
      setEditing(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span
          className="inline-block size-3 rounded-sm border"
          style={{ background: shellFor(container.typeId) }}
        />
        <div className="flex-1">
          <div className="text-sm font-semibold font-mono tracking-tight">
            {container.containerNo}
          </div>
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
            {container.typeId} · tier position
          </div>
        </div>
        <Badge
          variant="secondary"
          className="gap-1"
          style={{
            background: statusFor(container.status),
            color: YARD_HEX.label,
          }}
        >
          {container.status}
        </Badge>
      </div>

      <Separator />

      <div className="grid grid-cols-2 gap-2 text-xs">
        <KV icon={<Building2 size={11} />} label="Owner" value={container.ownerName || "—"} />
        <KV icon={<Hash size={11} />} label="Seal" value={container.sealNo || "—"} />
        <KV icon={<Weight size={11} />} label="Gross" value={`${container.grossWeightKg} kg`} />
        <KV
          icon={<CalendarClock size={11} />}
          label="ETA"
          value={container.eta ? new Date(container.eta).toLocaleDateString() : "—"}
        />
        <KV
          icon={<Layers size={11} />}
          label="Placed"
          value={container.placedAt ? new Date(container.placedAt).toLocaleDateString() : "—"}
        />
        <KV icon={<Tag size={11} />} label="Type" value={container.typeId} />
      </div>

      <Separator />

      {editing ? (
        <div className="space-y-2">
          <div className="grid gap-1.5">
            <label className="text-[10px] font-medium text-muted-foreground">Status</label>
            <Select value={status} onValueChange={(v) => setStatus(v as YardContainerStatus)}>
              <SelectTrigger size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <label className="text-[10px] font-medium text-muted-foreground">Owner</label>
            <Input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <label className="text-[10px] font-medium text-muted-foreground">Gross weight (kg)</label>
            <Input
              type="number"
              value={grossWeightKg}
              onChange={(e) => setGrossWeightKg(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <label className="text-[10px] font-medium text-muted-foreground">Seal</label>
            <Input value={sealNo} onChange={(e) => setSealNo(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <label className="text-[10px] font-medium text-muted-foreground">Notes</label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Button size="sm" className="flex-1 gap-1" onClick={handleSave} disabled={saving}>
              <Save size={12} /> {saving ? "Saving…" : "Save"}
            </Button>
            <Button size="sm" variant="outline" className="flex-1" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
            Edit details
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="gap-1.5"
            onClick={onRelease}
            disabled={busy}
          >
            <ArrowUpFromLine size={12} /> Release from yard
          </Button>
        </div>
      )}
    </div>
  );
}

function EmptyPanel({
  slot,
  busy,
  unplaced,
  onLoadUnplaced,
  onPlace,
  onReserveToggle,
}: {
  slot: Slot;
  busy: boolean;
  unplaced: YardContainer[];
  onLoadUnplaced: () => void;
  onPlace: (containerId: string) => void;
  onReserveToggle: () => void;
  onMoveHere: () => void;
}) {
  void busy;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm">
        <PackageOpen size={14} className="text-muted-foreground" />
        <span>Empty slot</span>
      </div>
      <div className="text-[11px] text-muted-foreground">
        Drop an unplaced container here or toggle reservation.
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" className="flex-1" onClick={onReserveToggle}>
          {slot.isReserved ? "Unreserve" : "Reserve slot"}
        </Button>
        <Button size="sm" variant="outline" onClick={onLoadUnplaced}>
          <ArrowDownToLine size={12} /> Load list
        </Button>
      </div>
      {unplaced.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Unplaced containers ({unplaced.length})
          </div>
          <div className="max-h-56 overflow-y-auto space-y-1 rounded border border-border">
            {unplaced.map((c) => (
              <button
                key={c._id}
                type="button"
                onClick={() => onPlace(c._id)}
                className="flex w-full items-center gap-2 px-2 py-1.5 text-left text-xs hover:bg-muted/60"
              >
                <span
                  className="inline-block size-2 rounded-sm"
                  style={{ background: shellFor(c.typeId) }}
                />
                <span className="flex-1 font-mono">{c.containerNo}</span>
                <Badge variant="secondary" className="text-[9px]">
                  {c.typeId}
                </Badge>
                <span className="text-[10px] text-muted-foreground">
                  {c.ownerName || "—"}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function KV({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-border bg-muted/30 px-2 py-1.5">
      <div className="flex items-center gap-1 text-[9px] uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="text-xs font-medium">{value}</div>
    </div>
  );
}

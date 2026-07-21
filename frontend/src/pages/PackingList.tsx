import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  AlertCircle,
  Box,
  CalendarDays,
  Check,
  DollarSign,
  Inbox,
  Loader2,
  Play,
  Plus,
  Save,
  SquarePen,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import ActionToolbar from "@/components/ActionToolbar";
import DataTable, { type Column } from "@/components/DataTable";
import { PageShell } from "@/components/PageShell";
import { SkeletonTable } from "@/components/SkeletonRow";
import { StatBar } from "@/components/StatBar";
import { SectionHeader } from "@/components/SectionHeader";
import { EmptyState } from "@/components/EmptyState";
import { DirtyChip } from "@/components/DirtyChip";
import { ConfirmDiscardDialog } from "@/components/ConfirmDiscardDialog";
import LoadingScreen from "@/components/LoadingScreen";
import { MetaField } from "@/components/Detail/MetaField";
import { SectionCard } from "@/components/Detail/SectionCard";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { fmt } from "@/components/po/utils";
import {
  MODE_ICONS,
  currencyCell,
  formatDisplay,
  formatNumber,
} from "@/components/po/lineItemColumns";
import { extractErrorMessage } from "@/lib/api";
import { EMPTY } from "@/lib/format";
import { useSaveShortcut } from "@/lib/useSaveShortcut";
import {
  deletePackingList,
  listPackingLists,
  updatePackingList,
  type PackingListOperation,
} from "@/lib/packingListApi";
import type { PackingListRecord } from "@/components/packing-list/types";
import { ExportButtons } from "@/components/packing-list/ExportButtons";

function EditableTextField({
  label,
  value,
  onCommit,
  type = "text",
  inputClassName,
  validator,
  isDirty = false,
}: {
  label: string;
  value: string;
  onCommit: (next: string) => void;
  type?: "text" | "email" | "date";
  inputClassName?: string;
  validator?: (v: string) => string | null;
  isDirty?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const [error, setError] = useState<string | null>(null);

  const start = () => {
    setDraft(value ?? "");
    setError(null);
    setEditing(true);
  };
  const cancel = () => {
    setEditing(false);
    setError(null);
  };

  const commit = () => {
    setError(null);
    if (validator) {
      const e = validator(draft);
      if (e) {
        setError(e);
        return;
      }
    }
    if (draft === (value ?? "")) {
      setEditing(false);
      return;
    }
    onCommit(draft);
    setEditing(false);
  };

  if (!editing) {
    return (
      <div className="group relative">
        <MetaField
          label={label}
          value={
            <span className="inline-flex items-center gap-1.5">
              <span>{value || EMPTY}</span>
              {isDirty && <DirtyChip variant="dot" />}
            </span>
          }
        />
        <button
          type="button"
          onClick={start}
          className="absolute top-0 right-0 p-1 rounded text-muted-foreground opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-muted hover:text-foreground transition-opacity"
          title={`Edit ${label}`}
          aria-label={`Edit ${label}`}
        >
          <SquarePen size={12} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
      <div className="flex items-center gap-1">
        <Input
          type={type}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") cancel();
          }}
          autoFocus
          className={inputClassName ?? "h-7 text-sm"}
        />
        <button
          type="button"
          onClick={commit}
          title="Commit"
          aria-label="Commit"
          className="p-1 rounded text-primary hover:bg-primary/10"
        >
          <Check size={14} />
        </button>
        <button
          type="button"
          onClick={cancel}
          title="Cancel"
          aria-label="Cancel"
          className="p-1 rounded text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X size={14} />
        </button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function QtyCellInline({
  qty,
  currentSellingQty,
  onCommit,
  isDirty = false,
}: {
  qty: number;
  currentSellingQty: number;
  onCommit: (next: number) => void;
  isDirty?: boolean;
}) {
  const max = Math.max(1, currentSellingQty + qty);
  const [draft, setDraft] = useState(String(qty));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(String(qty));
  }, [qty]);

  const commit = () => {
    setError(null);
    const n = parseInt(draft, 10);
    if (!Number.isFinite(n) || n < 1) {
      setError("Min 1");
      return;
    }
    if (n > max) {
      setError(`Max ${max}`);
      return;
    }
    if (n === qty) return;
    onCommit(n);
  };

  return (
    <div className="flex items-center gap-1.5">
      <Input
        type="number"
        value={draft}
        min={1}
        max={max}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          }
          if (e.key === "Escape") {
            setDraft(String(qty));
            setError(null);
          }
        }}
        disabled={max < 1}
        className="h-7 w-16 text-right font-mono text-xs px-1"
      />
      {isDirty && <DirtyChip variant="dot" />}
      {error && (
        <span className="text-[10px] text-destructive whitespace-nowrap">
          {error}
        </span>
      )}
    </div>
  );
}

export default function PackingList() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<PackingListRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<PackingListRecord | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<PackingListRecord | null>(null);
  const [pendingOps, setPendingOps] = useState<PackingListOperation[]>([]);
  const [saving, setSaving] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [loadingToContainerId, setLoadingToContainerId] = useState<string | null>(
    null
  );
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
    };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const lists = await listPackingLists();
      setRecords(lists);
    } catch (err) {
      setLoadError(extractErrorMessage(err, "Failed to load packing lists"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (selected) {
      setDraft(selected);
      setPendingOps([]);
    } else {
      setDraft(null);
      setPendingOps([]);
    }
  }, [selected]);

  const filtered = q
    ? records.filter(
        (r) =>
          r.plNumber.toLowerCase().includes(q.toLowerCase()) ||
          r.customer.name.toLowerCase().includes(q.toLowerCase()) ||
          r.delivery.name.toLowerCase().includes(q.toLowerCase())
      )
    : records;

  const totalValue = records.reduce((s, r) => s + r.total, 0);
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const thisWeek = records.filter(
    (r) => new Date(r.createdAt).getTime() >= sevenDaysAgo
  ).length;
  const avgValue = records.length > 0 ? totalValue / records.length : 0;

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deletePackingList(id);
      toast.success("Packing list deleted");
      setSelected((prev) => (prev?._id === id ? null : prev));
      await load();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Delete failed"));
    } finally {
      setDeletingId(null);
    }
  };

  const applyUpdated = (updated: PackingListRecord) => {
    setSelected(updated);
    setRecords((prev) =>
      prev.map((r) => (r._id === updated._id ? updated : r))
    );
  };

  const isDirty = pendingOps.length > 0;

  const dirtyPaths = useMemo(() => {
    const set = new Set<string>();
    if (!selected) return set;
    for (const op of pendingOps) {
      if (op.op === "set_customer") {
        if (op.name !== selected.customer.name) set.add("customer.name");
        if (op.address !== selected.customer.address) set.add("customer.address");
        if ((op.contact ?? "") !== (selected.customer.contact ?? ""))
          set.add("customer.contact");
        if ((op.email ?? "") !== (selected.customer.email ?? ""))
          set.add("customer.email");
      } else if (op.op === "set_delivery") {
        if (op.name !== selected.delivery.name) set.add("delivery.name");
        if (op.address !== selected.delivery.address) set.add("delivery.address");
        if ((op.shipDate ?? "") !== (selected.delivery.shipDate ?? ""))
          set.add("delivery.shipDate");
        if ((op.notes ?? "") !== (selected.delivery.notes ?? ""))
          set.add("delivery.notes");
      } else if (op.op === "set_qty") {
        const item = selected.items.find((it) => it.lineId === op.lineId);
        if (item && item.qty !== op.qty) set.add(`items.${op.lineId}`);
      }
    }
    return set;
  }, [pendingOps, selected]);

  const enqueueOp = (op: PackingListOperation) => {
    setPendingOps((prev) => {
      let filtered: PackingListOperation[];
      if (op.op === "set_qty") {
        filtered = prev.filter(
          (p) => !(p.op === "set_qty" && p.lineId === op.lineId)
        );
      } else if (op.op === "set_customer") {
        filtered = prev.filter((p) => p.op !== "set_customer");
      } else {
        filtered = prev.filter((p) => p.op !== "set_delivery");
      }
      return [...filtered, op];
    });
  };

  const commitCustomer = (next: PackingListRecord["customer"]) => {
    setDraft((prev) => (prev ? { ...prev, customer: next } : prev));
    enqueueOp({
      op: "set_customer",
      name: next.name,
      address: next.address,
      contact: next.contact,
      email: next.email,
    });
  };

  const commitDelivery = (next: PackingListRecord["delivery"]) => {
    setDraft((prev) => (prev ? { ...prev, delivery: next } : prev));
    enqueueOp({
      op: "set_delivery",
      name: next.name,
      address: next.address,
      shipDate: next.shipDate,
      notes: next.notes,
    });
  };

  const commitItemQty = (lineId: string, qty: number) => {
    setDraft((prev) =>
      prev
        ? {
            ...prev,
            items: prev.items.map((it) =>
              it.lineId === lineId ? { ...it, qty } : it
            ),
          }
        : prev
    );
    enqueueOp({ op: "set_qty", lineId, qty });
  };

  const discardPending = () => {
    if (selected) {
      setDraft(selected);
    }
    setPendingOps([]);
  };

  const handleSave = async () => {
    if (!selected || !isDirty || saving) return;
    setSaving(true);
    try {
      const updated = await updatePackingList(selected._id, {
        operations: pendingOps,
      });
      applyUpdated(updated);
      setPendingOps([]);
      toast.success("Updated");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Save failed"));
    } finally {
      setSaving(false);
    }
  };

  useSaveShortcut(isDirty, handleSave);

  const handleSheetOpenChange = (open: boolean) => {
    if (open) return;
    if (saving) return;
    if (isDirty) {
      setConfirmDiscard(true);
      return;
    }
    setSelected(null);
  };

  const confirmDiscardAndClose = () => {
    setConfirmDiscard(false);
    setPendingOps([]);
    setSelected(null);
  };

  const groupedByPo = useMemo(() => {
    if (!draft) return [];
    const map = new Map<string, typeof draft.items>();
    for (const it of draft.items) {
      const arr = map.get(it.poNum) ?? [];
      arr.push(it);
      map.set(it.poNum, arr);
    }
    return [...map.entries()].map(([poNum, items]) => ({
      poNum,
      items,
      subTotal: items.reduce((s, it) => s + it.qty * it.unitPrice, 0),
    }));
  }, [draft]);

  const liveTotal = useMemo(
    () =>
      draft
        ? draft.items.reduce((s, it) => s + it.qty * it.unitPrice, 0)
        : 0,
    [draft]
  );

  const columns: Column<PackingListRecord>[] = [
    {
      key: "plNumber",
      label: "PL Number",
      sortable: false,
      render: (row) => (
        <div className="flex flex-col">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelected(row);
            }}
            className="text-sm font-semibold font-mono text-primary cursor-pointer hover:underline text-left w-fit"
            title="View packing list detail"
          >
            {row.plNumber}
          </button>
          <span className="text-xs text-muted-foreground">
            {formatDisplay(row.createdAt)}
          </span>
        </div>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      sortable: false,
      render: (row) => (
        <div className="min-w-0">
          <div className="text-sm font-medium truncate">
            {row.customer.name || EMPTY}
          </div>
          {row.customer.contact && (
            <div className="text-xs text-muted-foreground truncate">
              {row.customer.contact}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "delivery",
      label: "Deliver To",
      sortable: false,
      render: (row) => (
        <div className="min-w-0">
          <div className="text-sm truncate">
            {row.delivery.name || EMPTY}
          </div>
          {row.delivery.address && (
            <div className="text-xs text-muted-foreground truncate">
              {row.delivery.address}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "itemsCount",
      label: "Items",
      align: "right",
      sortable: true,
      render: (row) => (
        <div className="flex flex-col items-end">
          <span className="text-sm font-mono">
            {formatNumber(row.itemsCount)}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatNumber(row.items.reduce((s, it) => s + it.qty, 0))} units
          </span>
        </div>
      ),
    },
    {
      key: "total",
      label: "Total",
      align: "right",
      sortable: true,
      render: (row) => currencyCell(row.total, { bold: true, primary: true }),
    },
    {
      key: "export",
      label: "Export",
      sortable: false,
      align: "right",
      render: (row) => <ExportButtons record={row} />,
    },
    {
      key: "_action",
      label: "",
      sortable: false,
      align: "right",
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLoadingToContainerId(row._id);
              if (loadingTimerRef.current) {
                clearTimeout(loadingTimerRef.current);
              }
              loadingTimerRef.current = setTimeout(() => {
                setLoadingToContainerId(null);
                loadingTimerRef.current = null;
                navigate(`${row._id}/loading`);
              }, 5000);
            }}
            disabled={loadingToContainerId === row._id}
            className="p-1.5 rounded text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
            title="Load to Container"
            aria-label="Load to Container"
          >
            {loadingToContainerId === row._id ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Play size={14} />
            )}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row._id);
            }}
            disabled={deletingId === row._id}
            className="p-1.5 rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-50"
            title="Delete"
            aria-label="Delete"
          >
            {deletingId === row._id ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
          </button>
        </div>
      ),
    },
  ];

  if (loading && records.length === 0) {
    return (
      <PageShell>
        <SectionHeader
          title="Packing Lists"
          actions={
            <Button disabled>
              <Loader2 className="animate-spin" />
              Loading
            </Button>
          }
        />
        <div className="mt-4">
          <DataTable
            columns={columns}
            data={[]}
            emptyMessage={<SkeletonTable rows={8} columns={7} />}
          />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell className="gap-4">
      <StatBar
        items={[
          { label: "Total Lists", value: formatNumber(records.length), icon: Box },
          {
            label: "Total Value",
            value: `$${totalValue > 0 ? fmt(totalValue) : "0.00"}`,
            icon: DollarSign,
            primary: true,
          },
          {
            label: "This Week",
            value: formatNumber(thisWeek),
            icon: CalendarDays,
          },
          {
            label: "Avg Value",
            value: `$${records.length > 0 ? fmt(avgValue) : "0.00"}`,
            icon: TrendingUp,
          },
        ]}
      />

      <SectionHeader
        title="Packing Lists"
        description={`${records.length} record${records.length !== 1 ? "s" : ""}`}
      />

      {loadError && (
        <div
          role="alert"
          className="flex items-start gap-3 px-4 py-3 rounded-lg border border-destructive/40 bg-destructive/10"
        >
          <AlertCircle
            size={16}
            className="text-destructive flex-shrink-0 mt-0.5"
          />
          <div className="flex-1 flex flex-col gap-1">
            <p className="text-sm text-destructive">{loadError}</p>
            <button
              onClick={load}
              className="text-xs text-destructive underline self-start"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      <ActionToolbar
        search={q}
        setSearch={setQ}
        searchPlaceholder="Search by PL number, customer, or recipient..."
        ctaLabel="New Packing List"
        onCTA={() => navigate("new")}
      />

      <DataTable
        columns={columns}
        data={filtered}
        emptyMessage={
          records.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="No packing lists yet"
              description="Create your first packing list to get started."
              action={
                <Button onClick={() => navigate("new")}>
                  <Plus />
                  New Packing List
                </Button>
              }
            />
          ) : (
            <EmptyState
              variant="no-results"
              title={`No matches for "${q}"`}
              description="Try a different PL number, customer, or recipient."
            />
          )
        }
      />

      <Sheet open={!!selected} onOpenChange={handleSheetOpenChange}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="w-full sm:max-w-xl p-0 flex flex-col gap-0"
        >
          {selected && draft && (
            <>
              <div className="flex-1 min-h-0 overflow-y-auto">
                <div className="flex flex-col">
                  <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4">
                    <SheetHeader className="p-0">
                      <span className="text-[15px] font-bold uppercase tracking-widest text-foreground">
                        Packing List
                      </span>
                      <SheetTitle className="font-mono text-[15px] mt-1">
                        {selected.plNumber}
                      </SheetTitle>
                    </SheetHeader>
                    <button
                      type="button"
                      onClick={() => handleSheetOpenChange(false)}
                      className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                      aria-label="Close"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="flex flex-col gap-3 px-5 pb-5 text-sm">
                    <div className="rounded-lg border border-border bg-card p-4">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                        <MetaField
                          label="Created At"
                          value={formatDisplay(selected.createdAt)}
                        />
                      </div>
                    </div>

                    <SectionCard title="Customer">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                        <EditableTextField
                          label="Name"
                          value={draft.customer.name}
                          isDirty={dirtyPaths.has("customer.name")}
                          onCommit={(v) =>
                            commitCustomer({ ...draft.customer, name: v })
                          }
                        />
                        <EditableTextField
                          label="Contact"
                          value={draft.customer.contact}
                          isDirty={dirtyPaths.has("customer.contact")}
                          onCommit={(v) =>
                            commitCustomer({ ...draft.customer, contact: v })
                          }
                        />
                        <EditableTextField
                          label="Email"
                          value={draft.customer.email}
                          type="email"
                          isDirty={dirtyPaths.has("customer.email")}
                          onCommit={(v) =>
                            commitCustomer({ ...draft.customer, email: v })
                          }
                        />
                        <div className="col-span-2">
                          <EditableTextField
                            label="Address"
                            value={draft.customer.address}
                            isDirty={dirtyPaths.has("customer.address")}
                            onCommit={(v) =>
                              commitCustomer({
                                ...draft.customer,
                                address: v,
                              })
                            }
                          />
                        </div>
                      </div>
                    </SectionCard>

                    <SectionCard title="Delivery">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                        <EditableTextField
                          label="Recipient"
                          value={draft.delivery.name}
                          isDirty={dirtyPaths.has("delivery.name")}
                          onCommit={(v) =>
                            commitDelivery({ ...draft.delivery, name: v })
                          }
                        />
                        <EditableTextField
                          label="Expected Date"
                          value={draft.delivery.shipDate}
                          type="date"
                          isDirty={dirtyPaths.has("delivery.shipDate")}
                          onCommit={(v) =>
                            commitDelivery({ ...draft.delivery, shipDate: v })
                          }
                        />
                        <div className="col-span-2">
                          <EditableTextField
                            label="Address"
                            value={draft.delivery.address}
                            isDirty={dirtyPaths.has("delivery.address")}
                            onCommit={(v) =>
                              commitDelivery({
                                ...draft.delivery,
                                address: v,
                              })
                            }
                          />
                        </div>
                        <div className="col-span-2">
                          <EditableTextField
                            label="Notes"
                            value={draft.delivery.notes}
                            isDirty={dirtyPaths.has("delivery.notes")}
                            onCommit={(v) =>
                              commitDelivery({ ...draft.delivery, notes: v })
                            }
                          />
                        </div>
                      </div>
                    </SectionCard>

                    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                          Packing List Detail
                        </span>
                      </div>
                      {draft.items.length === 0 ? (
                        <div className="rounded-md border border-border bg-background px-4 py-6 text-center text-xs text-muted-foreground">
                          No items
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {groupedByPo.map((group) => (
                            <div
                              key={group.poNum}
                              className="rounded-md border border-border bg-background overflow-hidden"
                            >
                              <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/40">
                                <span className="font-mono text-sm font-semibold">
                                  {group.poNum}
                                </span>
                                <span className="font-mono text-sm font-semibold text-primary">
                                  $ {fmt(group.subTotal)}
                                </span>
                              </div>
                              <div className="divide-y divide-border">
                                {group.items.map((it) => {
                                  const ModeIcon = MODE_ICONS[it.mode];
                                  return (
                                    <div
                                      key={it.lineId}
                                      className="flex items-center gap-3 px-4 py-3"
                                    >
                                      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary-light">
                                        <Box size={14} />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="text-sm font-mono font-semibold truncate">
                                          {it.partNum}
                                        </div>
                                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                                          <ModeIcon size={10} />
                                          <span className="truncate">
                                            {it.mode} - {it.shipToNum}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-1.5 shrink-0">
                                        <QtyCellInline
                                          qty={it.qty}
                                          currentSellingQty={
                                            it.currentSellingQty ?? 0
                                          }
                                          isDirty={dirtyPaths.has(
                                            `items.${it.lineId}`
                                          )}
                                          onCommit={(n) =>
                                            commitItemQty(it.lineId, n)
                                          }
                                        />
                                        <span className="font-mono text-sm font-semibold whitespace-nowrap">
                                          x $ {fmt(it.unitPrice)}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="rounded-lg bg-primary-light text-primary-foreground p-4 flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-widest">
                        Total
                      </span>
                      <span className="font-mono text-sm font-semibold">
                        $ {fmt(liveTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {isDirty && (
                <div className="shrink-0 border-t border-border bg-card/80 backdrop-blur px-5 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <DirtyChip label={`${pendingOps.length} pending`} />
                      <span className="text-xs text-muted-foreground truncate">
                        Review and save to commit the updates
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={discardPending}
                        disabled={saving}
                      >
                        Discard
                      </Button>
                      <Button
                        onClick={handleSave}
                        disabled={saving}
                        size="sm"
                      >
                        {saving ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Save size={14} />
                        )}
                        Save changes
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>

      <ConfirmDiscardDialog
        open={confirmDiscard}
        onOpenChange={setConfirmDiscard}
        count={pendingOps.length}
        onConfirm={confirmDiscardAndClose}
        saving={saving}
      />

      {loadingToContainerId && (
        <LoadingScreen
          variant="fullscreen"
          label="Preparing"
        />
      )}
    </PageShell>
  );
}

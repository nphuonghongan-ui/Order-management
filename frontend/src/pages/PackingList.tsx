import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  AlertCircle,
  Box,
  Code2,
  Inbox,
  Loader2,
  Trash2,
  X,
} from "lucide-react";
import ActionToolbar from "@/components/ActionToolbar";
import DataTable, { type Column } from "@/components/DataTable";
import { PageShell } from "@/components/PageShell";
import { MetaField } from "@/components/Detail/MetaField";
import { SectionCard } from "@/components/Detail/SectionCard";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { fmt } from "@/components/po/utils";
import {
  MODE_ICONS,
  currencyCell,
  formatDisplay,
  formatNumber,
} from "@/components/po/lineItemColumns";
import {
  deletePackingList,
  listPackingLists,
} from "@/lib/packingListApi";
import type { PackingListRecord } from "@/components/packing-list/types";
import { ExportButtons } from "@/components/packing-list/ExportButtons";

const isAxiosError = (
  e: unknown
): e is { response?: { data?: { message?: string } }; message: string } => {
  return typeof e === "object" && e !== null && "message" in e;
};

export default function PackingList() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<PackingListRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<PackingListRecord | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const lists = await listPackingLists();
      setRecords(lists);
    } catch (err) {
      setLoadError(
        isAxiosError(err)
          ? err.response?.data?.message || err.message
          : "Failed to load packing lists"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = q
    ? records.filter(
        (r) =>
          r.plNumber.toLowerCase().includes(q.toLowerCase()) ||
          r.customer.name.toLowerCase().includes(q.toLowerCase()) ||
          r.delivery.name.toLowerCase().includes(q.toLowerCase())
      )
    : records;

  const totalValue = records.reduce((s, r) => s + r.total, 0);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deletePackingList(id);
      toast.success("Packing list deleted");
      setSelected((prev) => (prev?._id === id ? null : prev));
      await load();
    } catch (err) {
      toast.error(
        isAxiosError(err)
          ? err.response?.data?.message || err.message
          : "Delete failed"
      );
    } finally {
      setDeletingId(null);
    }
  };

  const groupedByPo = useMemo(() => {
    if (!selected) return [];
    const map = new Map<string, typeof selected.items>();
    for (const it of selected.items) {
      const arr = map.get(it.poNum) ?? [];
      arr.push(it);
      map.set(it.poNum, arr);
    }
    return [...map.entries()].map(([poNum, items]) => ({
      poNum,
      items,
      subTotal: items.reduce((s, it) => s + it.qty * it.unitPrice, 0),
    }));
  }, [selected]);

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
            {row.customer.name || "—"}
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
          <div className="text-sm truncate">{row.delivery.name || "—"}</div>
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
            {formatNumber(
              row.items.reduce((s, it) => s + it.qty, 0)
            )}{" "}
            units
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
      ),
    },
  ];

  if (loading && records.length === 0) {
    return (
      <PageShell className="items-center justify-center py-24">
        <Loader2 size={28} className="animate-spin text-muted-foreground" />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="rounded-lg border border-border bg-card px-5 py-3.5">
          <div className="text-xs text-muted-foreground">Total Lists</div>
          <div className="text-2xl font-bold text-foreground font-mono mt-0.5">
            {records.length}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card px-5 py-3.5">
          <div className="text-xs text-muted-foreground">Total Value</div>
          <div className="text-2xl font-bold text-primary font-mono mt-0.5">
            $ {totalValue > 0 ? fmt(totalValue) : "0.00"}
          </div>
        </div>
      </div>

      <ActionToolbar
        search={q}
        setSearch={setQ}
        ctaLabel="New Packing List"
        onCTA={() => navigate("new")}
      />

      {loadError && (
        <div
          role="alert"
          className="flex items-start gap-3 px-4 py-3 rounded-lg border border-destructive/40 bg-destructive/10 mb-4"
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

      <DataTable
        columns={columns}
        data={filtered}
        emptyMessage={
          records.length === 0 ? (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              {/* <Inbox size={32} className="opacity-40" /> */}
              <span className="text-sm">No packing lists yet</span>
              <span className="text-xs">
                Click &ldquo;New Packing List&rdquo; to create your first one.
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Inbox size={32} className="opacity-40" />
              <span className="text-sm">No matches for &ldquo;{q}&rdquo;</span>
            </div>
          )
        }
      />

      <Sheet
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
      >
        <SheetContent
          side="right"
          showCloseButton={false}
          className="w-full sm:max-w-md overflow-y-auto p-0"
        >
          {selected && (
            <div className="flex flex-col">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4">
                <SheetHeader className="p-0">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Packing List
                  </span>
                  <SheetTitle className="font-mono text-xl mt-1">
                    {selected.plNumber}
                  </SheetTitle>
                </SheetHeader>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex flex-col gap-3 px-5 pb-5 text-sm">
                {/* Meta card */}
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <MetaField
                      label="Submitted"
                      value={formatDisplay(selected.createdAt)}
                    />
                  </div>
                </div>

                {/* CUSTOMER */}
                <SectionCard title="Customer" icon={Code2}>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <MetaField label="Name" value={selected.customer.name} />
                    <MetaField
                      label="Contact"
                      value={selected.customer.contact}
                    />
                    <MetaField
                      label="Email"
                      value={selected.customer.email}
                      mono
                    />
                    <div className="col-span-2">
                      <MetaField
                        label="Address"
                        value={selected.customer.address}
                      />
                    </div>
                  </div>
                </SectionCard>

                {/* DELIVERY */}
                <SectionCard title="Delivery" icon={Code2}>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <MetaField
                      label="Recipient"
                      value={selected.delivery.name}
                    />
                    <MetaField
                      label="Expected Date"
                      value={formatDisplay(selected.delivery.shipDate)}
                    />
                    <div className="col-span-2">
                      <MetaField
                        label="Address"
                        value={selected.delivery.address}
                      />
                    </div>
                    {selected.delivery.notes && (
                      <div className="col-span-2">
                        <MetaField
                          label="Notes"
                          value={selected.delivery.notes}
                        />
                      </div>
                    )}
                  </div>
                </SectionCard>

                {/* PACKING LIST DETAIL */}
                <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Packing List Detail
                    </span>
                  </div>
                  {selected.items.length === 0 ? (
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
                                        {it.mode} · {it.shipToNum}
                                      </span>
                                    </div>
                                  </div>
                                  <span className="font-mono text-sm font-semibold shrink-0">
                                    {formatNumber(it.qty)} × $ {fmt(it.unitPrice)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Total card */}
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-widest text-primary-light">
                    Total
                  </span>
                  <span className="font-mono text-sm font-semibold text-primary-light">
                    $ {fmt(selected.total)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </PageShell>
  );
}

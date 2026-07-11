import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  AlertCircle,
  ChevronRight,
  Inbox,
  Loader2,
  Trash2,
} from "lucide-react";
import ActionToolbar from "@/components/ActionToolbar";
import DataTable, { type Column } from "@/components/DataTable";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
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

  const columns: Column<PackingListRecord>[] = [
    {
      key: "plNumber",
      label: "PL Number",
      sortable: false,
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-sm font-semibold font-mono text-primary">
            {row.plNumber}
          </span>
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
      sortable: false,
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
      sortable: false,
      render: (row) => currencyCell(row.total, { bold: true, primary: true }),
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
              setSelected(row);
            }}
            className="p-1.5 rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="View details"
            aria-label="View details"
          >
            <ChevronRight size={16} />
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
          className="w-full sm:max-w-md overflow-y-auto"
        >
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <span className="font-mono">{selected.plNumber}</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground font-normal text-sm">
                    {formatDisplay(selected.createdAt)}
                  </span>
                </SheetTitle>
                <SheetDescription>Packing list details</SheetDescription>
              </SheetHeader>

              <div className="mt-4 flex flex-col gap-5 text-sm">
                <Section title="Customer">
                  <DetailRow label="Name" value={selected.customer.name} />
                  <DetailRow label="Contact" value={selected.customer.contact} />
                  <DetailRow label="Email" value={selected.customer.email} mono />
                  <DetailRow label="Address" value={selected.customer.address} />
                </Section>

                <Section title="Delivery">
                  <DetailRow label="Recipient" value={selected.delivery.name} />
                  <DetailRow
                    label="Address"
                    value={selected.delivery.address}
                  />
                  <DetailRow
                    label="Expected Date"
                    value={formatDisplay(selected.delivery.shipDate)}
                  />
                  <DetailRow label="Notes" value={selected.delivery.notes} />
                </Section>

                <Section title="Items">
                  <div className="rounded-md border border-border overflow-hidden">
                    <div
                      className="grid px-3 py-1.5 bg-muted/40 border-b border-border text-xs font-semibold uppercase tracking-wide text-slate"
                      style={{ gridTemplateColumns: "1fr 70px 90px" }}
                    >
                      <span>Part</span>
                      <span className="text-right">Qty</span>
                      <span className="text-right">Amount</span>
                    </div>
                    {selected.items.length === 0 ? (
                      <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                        No items
                      </div>
                    ) : (
                      selected.items.map((it) => {
                        const ModeIcon = MODE_ICONS[it.mode];
                        return (
                          <div
                            key={it.lineId}
                            className="grid px-3 py-1.5 border-b last:border-b-0 border-border items-center"
                            style={{ gridTemplateColumns: "1fr 70px 90px" }}
                          >
                            <div className="min-w-0">
                              <div className="text-xs font-mono truncate">
                                {it.partNum}
                              </div>
                              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                <ModeIcon size={9} />
                                <span className="truncate">{it.shipToNum}</span>
                              </div>
                            </div>
                            <div className="text-right text-xs font-mono">
                              {formatNumber(it.qty)}
                            </div>
                            <div className="text-right text-xs font-mono">
                              {fmt(it.qty * it.unitPrice)}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <DetailRow
                    label="Total"
                    value={`$ ${fmt(selected.total)}`}
                    mono
                    highlight
                  />
                </Section>

                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(selected._id)}
                    disabled={deletingId === selected._id}
                    className="text-destructive hover:text-destructive"
                  >
                    {deletingId === selected._id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                    Delete
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </PageShell>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {title}
      </p>
      <div className="flex flex-col gap-1.5">{children}</div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono,
  highlight,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  highlight?: boolean;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <span
        className={[
          "text-right",
          mono ? "font-mono text-xs" : "",
          highlight ? "text-primary font-semibold" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {value}
      </span>
    </div>
  );
}

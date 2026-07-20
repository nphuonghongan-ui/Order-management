import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  CheckCircle2,
  Hash,
  Link2,
  Loader2,
  Plane,
  Plus,
  Send,
  Ship,
  TrainFront,
  Truck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageShell } from "@/components/PageShell";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LineCard } from "@/components/po/LineCard";
import { Field } from "@/components/po/Field";
import {
  calcTotal,
  emptyLine,
  fmt,
  validateHeader,
  validateItem,
} from "@/components/po/utils";
import type { FieldError, LineItem, Mode, POHeader } from "@/components/po/types";
import { useAuthStore } from "@/stores/authStore";
import {
  extractSubmitError,
  fetchNextPONum,
  submitPO,
  toSubmitPayload,
} from "@/lib/poApi";
import { listPartNums, type PartNumOption } from "@/lib/partNumApi";
import { Separator } from "@/components/ui/separator";
import { EMPTY } from "@/lib/format";

const MODE_OPTIONS = [
  { value: "SEA" as const, label: "Sea Freight", icon: Ship },
  { value: "AIR" as const, label: "Air Freight", icon: Plane },
  { value: "ROAD" as const, label: "Road Transport", icon: Truck },
  { value: "RAIL" as const, label: "Rail Freight", icon: TrainFront },
];

const today = () => new Date().toISOString().split("T")[0];

const EMPTY_HEADER: POHeader = {
  shipToNum: "",
  needByDate: "",
  requestDate: today(),
  mode: "SEA",
};

export default function NewOrder() {
  const account = useAuthStore((s) => s.account);
  const customerCustID = account?.customerCustId ?? "PO";

  const [poNum, setPoNum] = useState("");
  const [originalPoNum, setOriginalPoNum] = useState("");
  const [poNumTouched, setPoNumTouched] = useState(false);
  const [poNumLoading, setPoNumLoading] = useState(true);
  const [poNumError, setPoNumError] = useState(false);
  const [items, setItems] = useState<LineItem[]>([]);
  const [poHeader, setPoHeader] = useState<POHeader>(EMPTY_HEADER);
  const [errors, setErrors] = useState<Record<string, FieldError>>({});
  const [headerErrors, setHeaderErrors] = useState<FieldError>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [conflictingPairs, setConflictingPairs] = useState<{ poNum: string; orderLine: number }[]>([]);
  const [partNums, setPartNums] = useState<PartNumOption[]>([]);

  async function loadNextPONum() {
    setPoNumLoading(true);
    setPoNumError(false);
    try {
      const { poNum: next } = await fetchNextPONum();
      setPoNum(next);
      setOriginalPoNum(next);
      setItems([emptyLine(customerCustID, next, "")]);
    } catch {
      toast.error("Failed to generate PO number. Please try again.");
      setPoNumError(true);
    } finally {
      setPoNumLoading(false);
    }
  }

  function updatePoNum(next: string) {
    setPoNum(next);
    setPoNumTouched(true);
    setItems((prev) => prev.map((it) => ({ ...it, poNum: next })));
  }

  function revertPoNum() {
    if (!originalPoNum) return;
    setPoNum(originalPoNum);
    setPoNumTouched(false);
    setItems((prev) => prev.map((it) => ({ ...it, poNum: originalPoNum })));
  }

  async function loadPartNums() {
    const cached = sessionStorage.getItem("partNums");
    if (cached) {
      try {
        setPartNums(JSON.parse(cached) as PartNumOption[]);
        return;
      } catch {
        sessionStorage.removeItem("partNums");
      }
    }
    try {
      const res = await listPartNums();
      setPartNums(res);
      sessionStorage.setItem("partNums", JSON.stringify(res));
    } catch {
      toast.error("Failed to load part numbers. Please try again.");
    }
  }

  useEffect(() => {
    loadNextPONum();
    void loadPartNums();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function resetForm() {
    setPoHeader(EMPTY_HEADER);
    setErrors({});
    setHeaderErrors({});
    setSubmitError(null);
    setConflictingPairs([]);
    setPoNumTouched(false);
    loadNextPONum();
  }

  function updateItem(id: string, patch: Partial<LineItem>) {
    setItems((prev) =>
      prev.map((it) => (it._id === id ? { ...it, ...patch } : it))
    );
    setErrors((prev) => {
      if (!prev[id]) return prev;
      const itemErrors = { ...prev[id] };
      (Object.keys(patch) as (keyof LineItem)[]).forEach(
        (k) => delete itemErrors[k]
      );
      const next = { ...prev };
      if (Object.keys(itemErrors).length === 0) delete next[id];
      else next[id] = itemErrors;
      return next;
    });
  }

  function addLine() {
    if (!poNum) return;
    setItems((prev) => [
      ...prev,
      emptyLine(customerCustID, poNum, ""),
    ]);
  }

  function removeLine(id: string) {
    setItems((prev) => prev.filter((it) => it._id !== id));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function validate(): boolean {
    const next: Record<string, FieldError> = {};
    let valid = true;

    if (!poNum.trim()) {
      setPoNumTouched(true);
      valid = false;
    }

    const seenLines = new Map<string, string[]>();
    items.forEach((it) => {
      const err = validateItem(it);
      if (Object.keys(err).length > 0) {
        next[it._id] = err;
        valid = false;
      }
      const ol = (it.orderLine ?? "").trim();
      if (ol) {
        const list = seenLines.get(ol) ?? [];
        list.push(it._id);
        seenLines.set(ol, list);
      }
    });
    seenLines.forEach((ids, ol) => {
      if (ids.length > 1) {
        const msg = `Duplicate line ${ol} in this PO`;
        ids.forEach((id) => {
          next[id] = { ...(next[id] ?? {}), orderLine: msg };
        });
        valid = false;
      }
    });
    setErrors(next);
    const hErr = validateHeader(poHeader);
    setHeaderErrors(hErr);
    if (Object.keys(hErr).length > 0) valid = false;
    return valid;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    setConflictingPairs([]);
    if (!validate()) {
      toast.error("Please fix the highlighted fields before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      await submitPO(toSubmitPayload(items, poHeader));
      setSubmitted(true);
      toast.success(
        `${items.length} line${items.length !== 1 ? "s" : ""} submitted`
      );
    } catch (err) {
      const { message, conflictingPairs: conflicts } = extractSubmitError(err);
      setSubmitError(message);
      setConflictingPairs(conflicts);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  const grandTotal = items.reduce(
    (s, it) => s + calcTotal(it.sellingQuantity, it.unitPrice),
    0
  );
  const totalQty = items.reduce(
    (s, it) => s + (parseFloat(it.sellingQuantity) || 0),
    0
  );
  const hasErrors = Object.keys(errors).length > 0 || Object.keys(headerErrors).length > 0;
  const poGroups = items.reduce<Record<string, LineItem[]>>((acc, it) => {
    (acc[it.poNum] ??= []).push(it);
    return acc;
  }, {});

  if (poNumLoading) {
    return (
      <PageShell className="items-center justify-center gap-3">
        <Loader2 size={28} className="animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Generating PO number...</p>
      </PageShell>
    );
  }

  if (poNumError) {
    return (
      <PageShell className="items-center justify-center gap-3">
        <AlertCircle size={28} className="text-destructive" />
        <p className="text-sm text-destructive">Failed to generate PO number</p>
        <Button onClick={loadNextPONum}>Retry</Button>
      </PageShell>
    );
  }

  if (submitted) {
    return (
      <PageShell className="items-center justify-center gap-4">
        <div className="size-16 rounded-full flex items-center justify-center bg-success/10">
          <CheckCircle2 size={32} className="text-success" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          Purchase Order{Object.keys(poGroups).length !== 1 ? "s" : ""} Submitted
        </h2>
        <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          {Object.entries(poGroups).map(([num, lines]) => (
            <div key={num} className="flex items-center gap-2">
              <span className="font-mono">{num}</span>
              <span>-</span>
              <span>
                {lines.length} line{lines.length !== 1 ? "s" : ""}
              </span>
            </div>
          ))}
        </div>
        <Button
          onClick={() => {
            setSubmitted(false);
            resetForm();
          }}
          className="mt-2"
        >
          Create another PO
        </Button>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <form
        onSubmit={handleSubmit}
        className="flex-1 flex flex-col gap-5"
      >
        {/* PO identity strip */}
        <div className="flex flex-wrap items-center gap-4 px-5 py-4 rounded-lg border border-border bg-card">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <div className="size-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-accent">
              <Hash size={19} className="text-primary-light" />
            </div>
            <div className="min-w-[260px]">
              <div className="text-[11px] font-semibold uppercase tracking-widest mb-1 text-slate font-mono">
                PONum
              </div>
              <div className="flex items-center gap-2">
                <Input
                  value={poNum}
                  onChange={(e) => updatePoNum(e.target.value.trim().toUpperCase())}
                  placeholder="Enter PONum"
                  aria-invalid={poNumTouched && !poNum.trim()}
                  className="h-9 w-[220px] font-mono text-sm font-bold text-foreground border-border"
                />
                {poNum !== originalPoNum && (
                  <button
                    type="button"
                    onClick={revertPoNum}
                    title="Revert to generated PONum"
                    className="p-1.5 rounded border border-border text-slate hover:text-foreground hover:bg-muted"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
              {poNumTouched && !poNum.trim() && (
                <p className="text-[11px] text-destructive mt-1 font-mono">PONum is required</p>
              )}
            </div>
            <Separator orientation="vertical" className="h-10 bg-border" />
            <div className="min-w-[140px]">
              <div className="text-[11px] font-semibold uppercase tracking-widest mb-1 text-slate font-mono">
                Customer ID
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-foreground font-mono">
                  {customerCustID}
                </span>
              </div>
            </div>
          </div>
          <div className="ml-auto text-right hidden sm:block">
            <div className="text-xs text-slate">Lines</div>
            <div className="text-lg font-bold text-foreground font-mono">
              {items.length}
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-xs text-slate">Grand Total</div>
            <div className="text-lg font-bold text-primary-light font-mono">
              {grandTotal > 0 ? fmt(grandTotal) : EMPTY}
            </div>
          </div>
        </div>

        {/* Shared Across All Lines */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="flex items-start gap-3 px-5 py-4 border-b border-border bg-accent">
            <div className="mt-0.5 size-6 rounded-full flex items-center justify-center bg-primary text-primary-foreground">
              <Link2 size={13} />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-primary font-mono">
                Shared Across All Lines
              </div>
              <p className="text-xs text-primary-light">
                Set once, automatically applied to every order line below.
              </p>
            </div>
          </div>
          <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="Ship To Num" required error={headerErrors.shipToNum}>
              <Input
                value={poHeader.shipToNum}
                onChange={(e) =>
                  setPoHeader((h) => ({ ...h, shipToNum: e.target.value.toUpperCase() }))
                }
                placeholder="GRA-INDIA"
                aria-invalid={!!headerErrors.shipToNum}
                className="h-9 font-mono"
              />
            </Field>

            <Field label="Mode" required>
              <Select
                value={poHeader.mode}
                onValueChange={(v) => setPoHeader((h) => ({ ...h, mode: v as Mode }))}
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODE_OPTIONS.map(({ value, label, icon: Icon }) => (
                    <SelectItem key={value} value={value}>
                      <Icon size={13} className="text-muted-foreground" />
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Need By Date" required error={headerErrors.needByDate}>
              <Input
                type="date"
                value={poHeader.needByDate}
                min={poHeader.requestDate || undefined}
                onChange={(e) =>
                  setPoHeader((h) => ({ ...h, needByDate: e.target.value }))
                }
                aria-invalid={!!headerErrors.needByDate}
                className="h-9"
              />
            </Field>

            <Field label="Request Date" required error={headerErrors.requestDate}>
              <Input
                type="date"
                value={poHeader.requestDate}
                onChange={(e) =>
                  setPoHeader((h) => {
                    const req = e.target.value;
                    const needBy = req && (!h.needByDate || h.needByDate < req) ? req : h.needByDate;
                    return { ...h, requestDate: req, needByDate: needBy };
                  })
                }
                aria-invalid={!!headerErrors.requestDate}
                className="h-9"
              />
            </Field>
          </div>
        </div>

        {/* Validation banner */}
        {hasErrors && (
          <div className="flex items-start gap-3 px-4 py-3 rounded-lg border border-destructive/40 bg-destructive/5">
            <AlertCircle
              size={16}
              className="text-destructive flex-shrink-0 mt-0.5"
            />
            <p className="text-sm text-destructive">
              Please fix the highlighted fields before submitting.
            </p>
          </div>
        )}

        {/* Submit error banner */}
        {submitError && (
          <div
            role="alert"
            className="flex items-start gap-3 px-4 py-3 rounded-lg border border-destructive/40 bg-destructive/10"
          >
            <AlertCircle
              size={16}
              className="text-destructive flex-shrink-0 mt-0.5"
            />
            <div className="flex flex-col gap-1">
              <p className="text-sm text-destructive">{submitError}</p>
              {conflictingPairs.length > 0 && (
                <p className="text-xs text-destructive/80 font-mono">
                  Already in use:{" "}
                  {conflictingPairs
                    .map((p) => `${p.poNum} / line ${p.orderLine}`)
                    .join(", ")}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Line cards */}
        {items.map((item, idx) => (
          <LineCard
            key={item._id}
            item={item}
            index={idx}
            errors={errors[item._id] ?? {}}
            mode={poHeader.mode}
            partNums={partNums}
            onChange={(patch) => updateItem(item._id, patch)}
            onRemove={() => removeLine(item._id)}
            canRemove={items.length > 1}
          />
        ))}

        {/* Add line button */}
        <Button
          type="button"
          variant="outline"
          onClick={addLine}
          className="w-full h-auto py-3 border-2 border-dashed border-primary/30 text-primary-light font-semibold hover:bg-accent hover:border-primary/50"
        >
          <Plus size={16} /> Add another line
        </Button>

        {/* Summary */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <span className="text-xs font-bold uppercase tracking-widest text-slate font-mono">
              Summary
            </span>
          </div>
          <div className="px-5 py-4 flex flex-col gap-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Total lines</span>
              <span className="font-mono">{items.length}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Total selling qty</span>
              <span className="font-mono">
                {totalQty > 0 ? totalQty.toLocaleString() : EMPTY}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold pt-2 border-t border-border text-foreground">
              <span>Grand Total</span>
              <span className="text-primary-light font-mono">
                {grandTotal > 0 ? fmt(grandTotal) : EMPTY}
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-4 pb-8">
          <Button type="submit" disabled={submitting} className="h-10 px-7">
            {submitting ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Send size={15} />
            )}
            {submitting ? "Submitting..." : "Submit Purchase Order"}
          </Button>
        </div>
      </form>
    </PageShell>
  );
}

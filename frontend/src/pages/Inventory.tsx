import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2, Hash, Loader2, Plus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LineCard } from "@/components/po/LineCard";
import {
  calcTotal,
  emptyLine,
  fmt,
  genPONum,
  uniquePONum,
  validateItem,
} from "@/components/po/utils";
import type { FieldError, LineItem } from "@/components/po/types";
import { useAuthStore } from "@/stores/authStore";
import { extractSubmitError, submitPO, toSubmitPayload } from "@/lib/poApi";

export default function Inventory() {
  const account = useAuthStore((s) => s.account);
  const customerCustID = account?.customerCustId ?? "PO";

  const [items, setItems] = useState<LineItem[]>(() => [
    emptyLine(customerCustID, genPONum(), ""),
  ]);
  const [errors, setErrors] = useState<Record<string, FieldError>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [conflictingPoNums, setConflictingPoNums] = useState<string[]>([]);

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
    const used = items.map((i) => i.poNum);
    setItems((prev) => [
      ...prev,
      emptyLine(customerCustID, uniquePONum(used), ""),
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
    items.forEach((it) => {
      const err = validateItem(it);
      if (Object.keys(err).length > 0) {
        next[it._id] = err;
        valid = false;
      }
    });
    setErrors(next);
    return valid;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    setConflictingPoNums([]);
    if (!validate()) {
      toast.error("Please fix the highlighted fields before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      await submitPO(toSubmitPayload(items));
      setSubmitted(true);
      toast.success(
        `${items.length} line${items.length !== 1 ? "s" : ""} submitted`
      );
    } catch (err) {
      const { message, conflictingPoNums: conflicts } = extractSubmitError(err);
      setSubmitError(message);
      setConflictingPoNums(conflicts);
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
  const hasErrors = Object.keys(errors).length > 0;
  const poGroups = items.reduce<Record<string, LineItem[]>>((acc, it) => {
    (acc[it.poNum] ??= []).push(it);
    return acc;
  }, {});

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-muted/50">
        <div className="size-16 rounded-full flex items-center justify-center bg-green-100">
          <CheckCircle2 size={32} className="text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          Purchase Order{Object.keys(poGroups).length !== 1 ? "s" : ""} Submitted
        </h2>
        <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          {Object.entries(poGroups).map(([num, lines]) => (
            <div key={num} className="flex items-center gap-2">
              <span className="font-mono">{num}</span>
              <span>—</span>
              <span>
                {lines.length} line{lines.length !== 1 ? "s" : ""}
              </span>
            </div>
          ))}
        </div>
        <Button
          onClick={() => {
            setSubmitted(false);
            setItems([emptyLine(customerCustID, genPONum(), "")]);
            setErrors({});
            setSubmitError(null);
            setConflictingPoNums([]);
          }}
          className="mt-2"
        >
          Create another PO
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col ">
      <form
        onSubmit={handleSubmit}
        className="flex-1 flex flex-col max-w-4xl w-full mx-auto px-6 py-6 gap-5"
      >
        {/* PO identity strip */}
        <div className="flex items-center gap-4 px-5 py-3.5 rounded-lg border border-border bg-card">
          <div className="size-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-primary/10">
            <Hash size={18} className="text-primary" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest mb-0.5 text-muted-foreground font-mono">
              Customer ID
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-foreground font-mono">
                {customerCustID}
              </span>
            </div>
          </div>
          <div className="ml-auto text-right hidden sm:block">
            <div className="text-xs text-muted-foreground">Lines</div>
            <div className="text-lg font-bold text-foreground font-mono">
              {items.length}
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-xs text-muted-foreground">Grand Total</div>
            <div className="text-lg font-bold text-primary font-mono">
              {grandTotal > 0 ? fmt(grandTotal) : "—"}
            </div>
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
              {conflictingPoNums.length > 0 && (
                <p className="text-xs text-destructive/80 font-mono">
                  Already in use: {conflictingPoNums.join(", ")}
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
          className="w-full h-auto py-3 border-2 border-dashed border-primary/30 text-primary bg-transparent hover:bg-accent hover:border-primary/40"
        >
          <Plus size={16} /> Add another line
        </Button>

        {/* Summary */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground font-mono">
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
                {totalQty > 0 ? totalQty.toLocaleString() : "—"}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold pt-2 border-t border-border text-foreground">
              <span>Grand Total</span>
              <span className="text-primary font-mono">
                {grandTotal > 0 ? fmt(grandTotal) : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end pb-8">
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Send size={15} />
            )}
            {submitting ? "Submitting…" : "Submit Purchase Order"}
          </Button>
        </div>
      </form>
    </div>
  );
}

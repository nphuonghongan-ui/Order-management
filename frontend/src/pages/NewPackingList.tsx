import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Inbox,
  Loader2,
  MapPin,
  Plus,
  Send,
  X,
} from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Field } from "@/components/po/Field";
import { ItemPicker } from "@/components/packing-list/ItemPicker";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fmt } from "@/components/po/utils";
import { MODE_ICONS, formatNumber } from "@/components/po/lineItemColumns";
import { submitPackingList } from "@/lib/packingListApi";
import type { CustomerInfo, DeliveryInfo, PickedItem } from "@/components/packing-list/types";

const EMPTY_CUSTOMER: CustomerInfo = {
  name: "",
  address: "",
  contact: "",
  email: "",
};

const EMPTY_DELIVERY: DeliveryInfo = {
  name: "",
  address: "",
  shipDate: "",
  notes: "",
};

// ─── Input tokens (matches the legacy TextInput style) ────────────────────────
const INPUT_C = {
  blue: "#2563EB",
  blueMid: "#BFDBFE",
  white: "#FFFFFF",
  border: "#E2E8F0",
  ink: "#0F172A",
};
const INPUT_SANS = { fontFamily: "'Inter', sans-serif" };
const INPUT_MONO = { fontFamily: "'JetBrains Mono', monospace" };

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
  useMono = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  useMono?: boolean;
}) {
  const [focus, setFocus] = useState(false);
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      className="w-full text-sm outline-none rounded-lg px-3.5 py-2.5 placeholder:opacity-70"
      style={{
        border: `1px solid ${focus ? INPUT_C.blue : INPUT_C.border}`,
        boxShadow: focus ? `0 0 0 3px ${INPUT_C.blueMid}40` : "none",
        background: INPUT_C.white,
        color: INPUT_C.ink,
        transition: "all 0.12s",
        ...(useMono ? INPUT_MONO : INPUT_SANS),
      }}
    />
  );
}

interface SubmittedInfo {
  plNumber: string;
  items: number;
  total: number;
}

export default function NewPackingList() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<CustomerInfo>(EMPTY_CUSTOMER);
  const [delivery, setDelivery] = useState<DeliveryInfo>(EMPTY_DELIVERY);
  const [picked, setPicked] = useState<PickedItem[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<SubmittedInfo | null>(null);

  const grandTotal = picked.reduce((s, it) => s + it.qty * it.unitPrice, 0);
  const totalQty = picked.reduce((s, it) => s + it.qty, 0);

  const customerValid =
    customer.name.trim().length > 0 && customer.address.trim().length > 0;
  const deliveryValid =
    delivery.name.trim().length > 0 && delivery.address.trim().length > 0;
  const canSubmit =
    !submitting && picked.length > 0 && customerValid && deliveryValid;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const result = await submitPackingList({
        customer,
        delivery,
        items: picked,
      });
      setSubmitted({
        plNumber: result.plNumber,
        items: result.itemsCount,
        total: result.total,
      });
      toast.success("Packing list submitted");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Submission failed. Please try again.";
      setSubmitError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <PageShell className="items-center justify-center gap-4">
        <div className="size-16 rounded-full flex items-center justify-center bg-green-100">
          <CheckCircle2 size={32} className="text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          Packing List Submitted
        </h2>
        <p className="text-sm text-muted-foreground">
          <span className="font-mono">{submitted.plNumber}</span> ·{" "}
          {submitted.items} item{submitted.items !== 1 ? "s" : ""} · ${" "}
          {fmt(submitted.total)}
        </p>
        <Button
          onClick={() => navigate("/dashboard/packing-list")}
          className="mt-2"
        >
          <ArrowLeft size={14} /> Back to Packing Lists
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
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() => navigate("/dashboard/packing-list")}
              aria-label="Back to packing lists"
            >
              <ArrowLeft size={14} />
            </Button>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Link
                  to="/dashboard/packing-list"
                  className="hover:text-foreground"
                >
                  Packing List
                </Link>
                <span>/</span>
                <span className="text-foreground">New</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="submit"
              disabled={!canSubmit}
              className="px-6 py-2 text-xs cursor-pointer"
              title={
                picked.length === 0
                  ? "Pick at least one item"
                  : !customerValid
                    ? "Customer name and address are required"
                    : !deliveryValid
                      ? "Recipient name and address are required"
                      : undefined
              }
            >
              {submitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}
              {submitting ? "Submitting…" : "Submit"}
            </Button>
          </div>
        </div>

        {submitError && (
          <div
            role="alert"
            className="flex items-start gap-3 px-4 py-3 rounded-lg border border-destructive/40 bg-destructive/10"
          >
            <AlertCircle
              size={16}
              className="text-destructive flex-shrink-0 mt-0.5"
            />
            <p className="text-sm text-destructive">{submitError}</p>
          </div>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center gap-3 border-b border-border">
            <div className="size-8 rounded-md flex items-center justify-center bg-primary-light/10 flex-shrink-0">
              <Building2 size={15} className="text-primary-light" />
            </div>
            <div>
              <CardTitle>Customer Information</CardTitle>
              <CardDescription>The party placing this order</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Company / Customer Name" required>
                <TextInput
                  value={customer.name}
                  onChange={(v) =>
                    setCustomer((c) => ({ ...c, name: v }))
                  }
                  placeholder="e.g. DevOTeam SIREN"
                />
              </Field>
              <Field label="Contact Person">
                <TextInput
                  value={customer.contact}
                  onChange={(v) =>
                    setCustomer((c) => ({ ...c, contact: v }))
                  }
                  placeholder="Full name"
                />
              </Field>
              <Field label="Address" required>
                <TextInput
                  value={customer.address}
                  onChange={(v) =>
                    setCustomer((c) => ({ ...c, address: v }))
                  }
                  placeholder="Street, City, Country"
                />
              </Field>
              <Field label="Email">
                <TextInput
                  type="email"
                  value={customer.email}
                  onChange={(v) =>
                    setCustomer((c) => ({ ...c, email: v }))
                  }
                  placeholder="contact@company.com"
                />
              </Field>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-3 border-b border-border">
            <div className="size-8 rounded-md flex items-center justify-center bg-primary/10 flex-shrink-0">
              <MapPin size={15} className="text-primary-light" />
            </div>
            <div>
              <CardTitle>Delivery Information</CardTitle>
              <CardDescription>Where the goods will be shipped</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Recipient Name" required>
                <TextInput
                  value={delivery.name}
                  onChange={(v) =>
                    setDelivery((d) => ({ ...d, name: v }))
                  }
                  placeholder="e.g. Franklin Warehouse"
                />
              </Field>
              <Field label="Expected Delivery Date">
                <TextInput
                  type="date"
                  value={delivery.shipDate}
                  onChange={(v) =>
                    setDelivery((d) => ({ ...d, shipDate: v }))
                  }
                />
              </Field>
              <div className="md:col-span-2">
                <Field label="Delivery Address" required>
                  <TextInput
                    value={delivery.address}
                    onChange={(v) =>
                      setDelivery((d) => ({ ...d, address: v }))
                    }
                    placeholder="Full delivery address including postal code"
                  />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Notes">
                  <TextInput
                    value={delivery.notes}
                    onChange={(v) =>
                      setDelivery((d) => ({ ...d, notes: v }))
                    }
                    placeholder="Special delivery instructions, port of entry, incoterms…"
                  />
                </Field>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-3 border-b border-border">
            <div className="size-8 rounded-md flex items-center justify-center bg-primary/10 flex-shrink-0">
              <ClipboardCheck size={15} className="text-primary-light" />
            </div>
            <div>
              <CardTitle>Details</CardTitle>
              <CardDescription>
                Order included in this packing list
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {picked.length > 0 && (
              <div className="rounded-lg border border-border overflow-hidden mb-4">
                <div
                  className="grid px-4 py-2 border-b border-border text-xs font-semibold uppercase tracking-wide text-muted-foreground bg-muted/40"
                  style={{ gridTemplateColumns: "1fr 120px 120px 120px 120px 120px 36px" }}
                >
                  <span>PO Ref</span>
                  <span>Mode</span>
                  <span className="text-center">PartNum</span>
                  <span className="text-right">Qty</span>
                  <span className="text-right">Unit Price</span>
                  <span className="text-right">Amount</span>
                  <span />
                </div>
                {picked.map((it) => {
                  const ModeIcon = MODE_ICONS[it.mode];
                  const amount = it.qty * it.unitPrice;
                  return (
                    <div
                      key={it.lineId}
                      className="grid items-center px-4 py-3 border-b last:border-b-0 border-border group"
                      style={{
                        gridTemplateColumns: "1fr 120px 120px 120px 120px 120px 36px",
                      }}
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-semibold font-mono truncate">
                          {it.poNum}
                        </div>
                      </div>
                      <div className="flex flex-row items-center gap-0.5">
                        <ModeIcon size={14} />
                        <span className="text-xs font-medium">
                          {it.shipToNum}
                        </span>
                      </div>
                      <div className="flex justify-center">
                        <span className="text-xs px-2 py-0.5 font-medium font-mono truncate max-w-full">
                          {it.partNum}
                        </span>
                      </div>
                      <div className="text-right text-sm font-mono">
                        {formatNumber(it.qty)}
                      </div>
                      <div className="text-right text-sm font-mono">
                        {fmt(it.unitPrice)}
                      </div>
                      <div className="text-right text-sm font-semibold font-mono">
                        {fmt(amount)}
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() =>
                            setPicked((p) =>
                              p.filter((x) => x.lineId !== it.lineId)
                            )
                          }
                          className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded bg-destructive/10 text-destructive transition-opacity"
                          aria-label={`Remove ${it.partNum}`}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {picked.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 rounded-lg border-2 border-dashed border-border">
                <div className="size-10 rounded-full flex items-center justify-center bg-muted">
                  <Inbox size={18} className="text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">
                    No items added yet
                  </p>
                  <p className="text-xs mt-0.5 text-muted-foreground">
                    Pick items from submitted PO lines
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="mt-1"
                >
                  <Plus size={14} /> Pick Items
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPickerOpen(true)}
                >
                  <Plus size={14} /> Pick more items
                </Button>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">
                    {picked.length} item{picked.length !== 1 ? "s" : ""} ·{" "}
                    {formatNumber(totalQty)} units
                  </span>
                  <div className="h-4 w-px bg-border" />
                  <span className="font-bold text-base font-mono text-primary">
                    ${fmt(grandTotal)}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="pb-4" />
      </form>

      <ItemPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        initialPicked={picked}
        onConfirm={setPicked}
      />
    </PageShell>
  );
}

import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/po/Field";
import {
  createPartNum,
  getNextPartNumNo,
  type PartNumOption,
} from "@/lib/apis/partNumApi";

interface AddPartNumDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (item: PartNumOption) => void;
}

interface FormState {
  no: string;
  partNum: string;
  length: string;
  width: string;
  height: string;
  weightKg: string;
}

const EMPTY_FORM: FormState = {
  no: "",
  partNum: "",
  length: "",
  width: "",
  height: "",
  weightKg: "0",
};

interface FormErrors {
  partNum?: string;
  length?: string;
  width?: string;
  height?: string;
  weightKg?: string;
  no?: string;
  _root?: string;
}

const toNumberOrNull = (v: string) => {
  if (v === "" || v === "-") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

export default function AddPartNumDialog({
  open,
  onOpenChange,
  onCreated,
}: AddPartNumDialogProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [nextNo, setNextNo] = useState<number | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm(EMPTY_FORM);
    setErrors({});
    getNextPartNumNo()
      .then((n) => {
        setNextNo(n);
        setForm((prev) => ({ ...prev, no: String(n) }));
      })
      .catch(() => {
        toast.error("Failed to load next sequence number");
        onOpenChange(false);
      });
  }, [open, onOpenChange]);

  const validate = (state: FormState): FormErrors => {
    const e: FormErrors = {};
    if (!state.partNum.trim()) e.partNum = "Required";
    const length = toNumberOrNull(state.length);
    if (length == null || length < 0) e.length = "Required (≥ 0)";
    const width = toNumberOrNull(state.width);
    if (width == null || width < 0) e.width = "Required (≥ 0)";
    const height = toNumberOrNull(state.height);
    if (height == null || height < 0) e.height = "Required (≥ 0)";
    if (state.weightKg !== "") {
      const w = toNumberOrNull(state.weightKg);
      if (w == null || w < 0) e.weightKg = "Must be ≥ 0";
    }
    if (state.no !== "") {
      const n = toNumberOrNull(state.no);
      if (n == null || n < 1 || !Number.isInteger(n)) e.no = "Min 1";
    }
    return e;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    setErrors({});
    try {
      const created = await createPartNum({
        no: form.no === "" ? undefined : Number(form.no),
        partNum: form.partNum.trim().toUpperCase(),
        dimension: {
          length: toNumberOrNull(form.length) ?? 0,
          width: toNumberOrNull(form.width) ?? 0,
          height: toNumberOrNull(form.height) ?? 0,
        },
        weightKg:
          form.weightKg === "" ? 0 : (toNumberOrNull(form.weightKg) ?? 0),
      });
      toast.success(`Part number "${created.partNum}" created`);
      onCreated(created);
      onOpenChange(false);
    } catch (err) {
      const message =
        (typeof err === "object" && err && "response" in err
          ? (err as { response?: { data?: { message?: string } } })
              .response?.data?.message
          : null) ?? "Failed to create part number";
      const fieldErrors =
        (typeof err === "object" && err && "response" in err
          ? (err as { response?: { data?: { errors?: Record<string, string> } } })
              .response?.data?.errors
          : null) ?? {};
      setErrors({ ...fieldErrors, _root: message } as FormErrors);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !submitting && onOpenChange(o)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Part Number</DialogTitle>
          <DialogDescription>
            Create a single part number with its dimensions.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {errors._root && (
            <div
              role="alert"
              className="text-xs text-destructive border border-destructive/40 bg-destructive/10 rounded-md px-3 py-2"
            >
              {errors._root}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="No." error={errors.no} caption="Auto-assigned">
              <Input
                type="number"
                min={1}
                step={1}
                value={form.no}
                onChange={(e) =>
                  setForm((f) => ({ ...f, no: e.target.value }))
                }
                placeholder={nextNo ? String(nextNo) : "—"}
                disabled={submitting}
              />
            </Field>
            <Field label="Part Number" required error={errors.partNum}>
              <Input
                value={form.partNum}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    partNum: e.target.value.toUpperCase(),
                  }))
                }
                placeholder="e.g. RMS120.1"
                disabled={submitting}
                className="font-mono"
                autoFocus
              />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Length (cm)" required error={errors.length}>
              <Input
                type="number"
                min={0}
                step="any"
                value={form.length}
                onChange={(e) =>
                  setForm((f) => ({ ...f, length: e.target.value }))
                }
                placeholder="0"
                disabled={submitting}
              />
            </Field>
            <Field label="Width (cm)" required error={errors.width}>
              <Input
                type="number"
                min={0}
                step="any"
                value={form.width}
                onChange={(e) =>
                  setForm((f) => ({ ...f, width: e.target.value }))
                }
                placeholder="0"
                disabled={submitting}
              />
            </Field>
            <Field label="Height (cm)" required error={errors.height}>
              <Input
                type="number"
                min={0}
                step="any"
                value={form.height}
                onChange={(e) =>
                  setForm((f) => ({ ...f, height: e.target.value }))
                }
                placeholder="0"
                disabled={submitting}
              />
            </Field>
          </div>

          <Field
            label="Weight (kg per piece)"
            error={errors.weightKg}
            caption="Optional. Defaults to 0."
          >
            <Input
              type="number"
              min={0}
              step="any"
              value={form.weightKg}
              onChange={(e) =>
                setForm((f) => ({ ...f, weightKg: e.target.value }))
              }
              placeholder="0"
              disabled={submitting}
            />
          </Field>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : null}
              {submitting ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

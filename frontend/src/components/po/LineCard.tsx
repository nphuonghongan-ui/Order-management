import type { ReactNode } from "react";
import { AlertCircle, Plane, Ship, TrainFront, Truck, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { calcTotal, fmt } from "./utils";
import type { FieldError, LineItem, Mode } from "./types";

const MODE_OPTIONS = [
  { value: "SEA" as const, label: "Sea Freight", icon: Ship },
  { value: "AIR" as const, label: "Air Freight", icon: Plane },
  { value: "ROAD" as const, label: "Road Transport", icon: Truck },
  { value: "RAIL" as const, label: "Rail Freight", icon: TrainFront },
];

interface LineCardProps {
  item: LineItem;
  index: number;
  errors: FieldError;
  onChange: (patch: Partial<LineItem>) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export function LineCard({
  item,
  index,
  errors,
  onChange,
  onRemove,
  canRemove,
}: LineCardProps) {
  const total = calcTotal(item.sellingQuantity, item.unitPrice);

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/50">
        <div className="flex items-center gap-2">
          <div className="w-[29px] h-[24px] rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground bg-primary font-mono">
            {index + 1}
          </div>
          <Input
            value={item.poNum}
            readOnly
            disabled
            placeholder="POSRS0xxxx"
            aria-label="PO Number (auto-generated)"
            className="font-mono"
          />
        </div>
        <div className="flex items-center gap-3">
          {total > 0 && (
            <span className="text-sm font-bold text-foreground font-mono">
              {fmt(total)}
            </span>
          )}
          {canRemove && (
            <Button
              type="button"
              variant="destructive"
              size="icon-sm"
              onClick={onRemove}
              title="Remove line"
            >
              <Trash2 size={14} />
            </Button>
          )}
        </div>
      </div>

      {/* Form grid */}
      <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        

        <Field label="Ship To Num" required error={errors.shipToNum}>
          <Input
            value={item.shipToNum}
            onChange={(e) => onChange({ shipToNum: e.target.value.toUpperCase() })}
            placeholder="GRA-INDIA"
            aria-invalid={!!errors.shipToNum}
            className="font-mono"
          />
        </Field>

        <Field label="Mode" required>
          <Select
            value={item.mode}
            onValueChange={(v) => onChange({ mode: v as Mode })}
          >
            <SelectTrigger className="w-full">
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

        <Field label="Part Number" required error={errors.partNum}>
          <Input
            value={item.partNum}
            onChange={(e) => onChange({ partNum: e.target.value.toUpperCase() })}
            placeholder="RMS120.1"
            aria-invalid={!!errors.partNum}
            className="font-mono"
          />
        </Field>

        <Field label="Order Line">
          <Input
            type="number"
            min={1}
            value={item.orderLine}
            onChange={(e) => onChange({ orderLine: e.target.value })}
            placeholder="1"
            className="font-mono"
          />
        </Field>

        <Field label="Need By Date" required error={errors.needByDate}>
          <Input
            type="date"
            value={item.needByDate}
            onChange={(e) => onChange({ needByDate: e.target.value })}
            aria-invalid={!!errors.needByDate}
          />
        </Field>

        <Field label="Request Date" required error={errors.requestDate}>
          <Input
            type="date"
            value={item.requestDate}
            onChange={(e) => onChange({ requestDate: e.target.value })}
            aria-invalid={!!errors.requestDate}
          />
        </Field>

        <Field label="Selling Quantity" required error={errors.sellingQuantity}>
          <Input
            type="number"
            value={item.sellingQuantity}
            onChange={(e) => onChange({ sellingQuantity: e.target.value })}
            placeholder="0"
            min={1}
            aria-invalid={!!errors.sellingQuantity}
            className="font-mono"
          />
        </Field>

        <Field label="Unit Price" required error={errors.unitPrice}>
          <Input
            type="number"
            value={item.unitPrice}
            onChange={(e) => onChange({ unitPrice: e.target.value })}
            placeholder="0.00"
            min={0}
            step="0.01"
            aria-invalid={!!errors.unitPrice}
            className="font-mono"
          />
        </Field>

        <Field label="Qty per Container" required error={errors.quantityPerCont}>
          <Input
            type="number"
            value={item.quantityPerCont}
            onChange={(e) => onChange({ quantityPerCont: e.target.value })}
            placeholder="0"
            min={1}
            aria-invalid={!!errors.quantityPerCont}
            className="font-mono"
          />
        </Field>

        <Field label="Total (auto)">
          <div className="h-8 px-2.5 flex items-center rounded-lg text-sm font-bold bg-accent text-accent-foreground border border-primary/20 font-mono">
            {total > 0 ? fmt(total) : "—"}
          </div>
        </Field>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold flex items-center gap-1 text-foreground">
        {label}
        {required && <span className="text-destructive">*</span>}
      </label>
      {children}
      {error && (
        <span className="text-xs flex items-center gap-1 text-destructive">
          <AlertCircle size={10} /> {error}
        </span>
      )}
    </div>
  );
}
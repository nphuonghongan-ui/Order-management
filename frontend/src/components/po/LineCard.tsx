import { Plane, Ship, TrainFront, Trash2, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { calcTotal, fmt } from "./utils";
import type { FieldError, LineItem, Mode } from "./types";
import { Field } from "./Field";

interface LineCardProps {
  item: LineItem;
  index: number;
  errors: FieldError;
  mode: Mode;
  onChange: (patch: Partial<LineItem>) => void;
  onRemove: () => void;
  canRemove: boolean;
}

const MODE_ICONS = {
  SEA: Ship,
  AIR: Plane,
  ROAD: Truck,
  RAIL: TrainFront,
} satisfies Record<Mode, typeof Ship>;

export function LineCard({
  item,
  index,
  errors,
  mode,
  onChange,
  onRemove,
  canRemove,
}: LineCardProps) {
  const total = calcTotal(item.sellingQuantity, item.unitPrice);
  const ModeIcon = MODE_ICONS[mode];

  return (
    <div className="rounded-lg border border-[#c8d4e5] bg-white overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#c8d4e5] bg-[#f4f7fb]">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center text-xs font-bold text-white bg-[#0052CC] font-mono py-1 px-2 rounded-[4px]">
            Line Item # {index + 1}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex h-6 items-center gap-1 rounded-full border border-[#7fe7ff] bg-[#e9fbff] px-2.5 text-xs font-semibold text-[#0b6f8b]">
            <ModeIcon size={12} />
            {mode}
          </span>
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
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Field label="Part Number" required error={errors.partNum}>
          <Input
            value={item.partNum}
            onChange={(e) => onChange({ partNum: e.target.value.toUpperCase() })}
            placeholder="RMS120.1"
            aria-invalid={!!errors.partNum}
            className="h-9 rounded-[4px] border-[#c8d4e5] bg-white font-mono placeholder:opacity-70"
          />
        </Field>

        <Field label="Order Line" required error={errors.orderLine}>
          <Input
            type="number"
            min={1}
            value={item.orderLine}
            onChange={(e) => onChange({ orderLine: e.target.value })}
            placeholder="1"
            aria-invalid={!!errors.orderLine}
            className="h-9 rounded-[4px] border-[#c8d4e5] bg-white font-mono placeholder:opacity-70"
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
            className="h-9 rounded-[4px] border-[#c8d4e5] bg-white font-mono placeholder:opacity-70"
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
            className="h-9 rounded-[4px] border-[#c8d4e5] bg-white font-mono placeholder:opacity-70"
          />
        </Field>

        <Field label="Total (auto)">
          <div className="h-9 px-3 flex items-center rounded-[4px] text-sm font-bold bg-[#d9eaff] text-[#075bd8] border border-[#9bc7ff] font-mono">
            {total > 0 ? fmt(total) : "—"}
          </div>
        </Field>
      </div>
    </div>
  );
}

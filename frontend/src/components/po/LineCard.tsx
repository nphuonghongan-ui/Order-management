import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Info, Plane, Ship, TrainFront, Trash2, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DimensionBox } from "./DimensionBox";
import { calcTotal, fmt } from "./utils";
import { EMPTY } from "@/lib/format";
import type { FieldError, LineItem, Mode } from "./types";
import { Field } from "./Field";
import type { PartNumOption } from "@/lib/partNumApi";

interface LineCardProps {
  item: LineItem;
  index: number;
  errors: FieldError;
  mode: Mode;
  partNums: PartNumOption[];
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
  partNums,
  onChange,
  onRemove,
  canRemove,
}: LineCardProps) {
  const total = calcTotal(item.sellingQuantity, item.unitPrice);
  const ModeIcon = MODE_ICONS[mode];
  const [partNumOpen, setPartNumOpen] = useState(false);
  const [hovered, setHovered] = useState<PartNumOption | null>(null);
  const [previewPos, setPreviewPos] = useState<{ top: number; left: number } | null>(null);
  const popoverId = useId();
  const previewRef = useRef<HTMLDivElement | null>(null);

  const computePosFor = useCallback(
    (partNum: string | null) => {
      if (!partNum || !partNumOpen) return null;
      const popEl = document.querySelector<HTMLElement>(
        `[data-popover-id="${popoverId}"]`
      );
      if (!popEl) return null;
      const popRect = popEl.getBoundingClientRect();
      const itemEl = popEl.querySelector<HTMLElement>(
        `[data-part-num="${partNum}"]`
      );
      const itemRect = itemEl?.getBoundingClientRect();
      const W = 140;
      const H = 140;
      const GAP = 8;
      const PAD = 8;
      let top = itemRect
        ? itemRect.top + itemRect.height / 2 - H / 2
        : popRect.top + popRect.height / 2 - H / 2;
      top = Math.max(PAD, Math.min(top, window.innerHeight - H - PAD));
      let left = popRect.right + GAP;
      if (left + W > window.innerWidth - PAD) {
        left = popRect.left - W - GAP;
        if (left < PAD) {
          left = Math.max(PAD, window.innerWidth - W - PAD);
        }
      }
      return { top, left };
    },
    [partNumOpen, popoverId]
  );

  useEffect(() => {
    if (!hovered || !partNumOpen) return;
    const handler = () => setPreviewPos(computePosFor(hovered.partNum));
    window.addEventListener("resize", handler);
    window.addEventListener("scroll", handler, true);
    return () => {
      window.removeEventListener("resize", handler);
      window.removeEventListener("scroll", handler, true);
    };
  }, [computePosFor, hovered, partNumOpen]);

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center text-xs font-bold text-primary-foreground bg-primary-light font-mono py-1 px-2 rounded">
            Line Item # {index + 1}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex h-6 items-center gap-1 rounded-full border border-primary/20 bg-accent px-2.5 text-xs font-semibold text-primary">
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
          <Popover
            open={partNumOpen}
            onOpenChange={(open) => {
              setPartNumOpen(open);
              if (!open) {
                setHovered(null);
                setPreviewPos(null);
              }
            }}
          >
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-invalid={!!errors.partNum}
                className="cursor-pointer h-9 w-full flex items-center justify-between rounded border border-border bg-card px-3 font-mono text-sm text-foreground outline-none transition-colors focus-visible:border-primary aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20"
              >
                {item.partNum || (
                  <span className="text-muted-foreground opacity-70">
                    Select part number
                  </span>
                )}
                <ChevronDown size={16} className="text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              data-popover-id={popoverId}
              className="w-[var(--radix-popover-trigger-width)] p-0"
            >
              <Command>
                <CommandInput placeholder="Search part number…" />
                <CommandList>
                  <CommandEmpty>No part numbers.</CommandEmpty>
                  <CommandGroup>
                    {partNums.map((p) => (
                      <CommandItem
                        key={p.partNum}
                        value={p.partNum}
                        data-part-num={p.partNum}
                        className="group bg-white data-selected:bg-white cursor-pointer"
                        onPointerEnter={() => {
                          setHovered(p);
                          setPreviewPos(computePosFor(p.partNum));
                        }}
                        onSelect={() => {
                          onChange({ partNum: p.partNum });
                          setPartNumOpen(false);
                        }}
                      >
                        <span className="flex-1">{p.partNum}</span>
                        <Info
                          size={14}
                          className="text-muted-foreground opacity-0 group-hover:opacity-100 data-[selected=true]:opacity-100 transition-opacity"
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {partNumOpen &&
            hovered &&
            previewPos &&
            createPortal(
              <div
                ref={previewRef}
                style={{
                  position: "fixed",
                  top: previewPos.top,
                  left: previewPos.left,
                  zIndex: 60,
                }}
                className="rounded-lg border border-border bg-popover p-2.5 shadow-md"
              >
                <DimensionBox {...hovered.dimension} />
              </div>,
              document.body
            )}
        </Field>

        <Field label="Order Line" required error={errors.orderLine}>
          <Input
            type="number"
            min={1}
            value={item.orderLine}
            onChange={(e) => onChange({ orderLine: e.target.value })}
            placeholder="1"
            aria-invalid={!!errors.orderLine}
            className="h-9 font-mono"
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
            className="h-9 font-mono"
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
            className="h-9 font-mono"
          />
        </Field>

        <Field label="Total (auto)">
          <div className="h-9 px-3 flex items-center rounded text-sm font-bold bg-accent text-primary-light border border-primary/20 font-mono">
            {total > 0 ? fmt(total) : EMPTY}
          </div>
        </Field>
      </div>
    </div>
  );
}

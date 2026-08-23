import { useMemo } from "react";
import { useYardStore, containerMatchesFilters } from "@/stores/useYardStore";
import { LEGEND_HEX, slotColor, YARD_HEX } from "./yardColors";
import type { Slot, YardContainer } from "./yardTypes";

const ROW_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"] as const;

export default function YardGrid() {
  const layout = useYardStore((s) => s.layout);
  const selectedSlotId = useYardStore((s) => s.selectedSlotId);
  const setSelectedSlotId = useYardStore((s) => s.setSelectedSlotId);
  const filters = useYardStore((s) => s.filters);
  const blockFilter = useYardStore((s) => s.blockFilter);

  const totalCols = layout?.yard.totalCols ?? 24;
  const totalRows = layout?.yard.totalRows ?? 10;

  const tier1Slots = useMemo(() => {
    if (!layout) return [] as Slot[];
    return layout.slots.filter((s) => s.tier === 1);
  }, [layout]);

  const slotsByCell = useMemo(() => {
    const map = new Map<string, Slot>();
    for (const s of tier1Slots) {
      const key = `${s.row}:${s.col}`;
      if (!map.has(key)) map.set(key, s);
    }
    return map;
  }, [tier1Slots]);

  const containerByCell = useMemo(() => {
    const map = new Map<string, YardContainer | null>();
    for (const s of tier1Slots) {
      const key = `${s.row}:${s.col}`;
      if (!map.has(key)) {
        map.set(key, s.container ?? null);
      }
    }
    return map;
  }, [tier1Slots]);

  const isDimmed = (slot: Slot | undefined, container: YardContainer | null | undefined) => {
    if (!slot) return false;
    if (blockFilter !== "ALL" && slot.blockCode !== blockFilter) return true;
    if (container) return !containerMatchesFilters(container, filters);
    if (filters.typeId !== "ALL" || filters.status !== "ALL") return true;
    return false;
  };

  return (
    <div className="h-full w-full overflow-auto bg-muted/30 p-4">
      <div
        className="mx-auto rounded-lg border border-border bg-card p-3 shadow-sm"
        style={{ background: YARD_HEX.gridSurface, maxWidth: "fit-content" }}
      >
        <div
          className="grid gap-1.5"
          style={{
            gridTemplateColumns: `28px repeat(${totalCols}, minmax(0, 1fr))`,
          }}
        >
          <div />
          {Array.from({ length: totalCols }, (_, i) => i + 1).map((n) => (
            <div
              key={`col-${n}`}
              className="text-center text-[10px] font-mono font-semibold tracking-tight"
              style={{ color: YARD_HEX.colLabel }}
            >
              {n.toString().padStart(2, "0")}
            </div>
          ))}

          {ROW_LETTERS.slice(0, totalRows).map((letter, rowIdx) => {
            const row = rowIdx + 1;
            return (
              <RowLine
                key={letter}
                letter={letter}
                row={row}
                totalCols={totalCols}
                slotsByCell={slotsByCell}
                containerByCell={containerByCell}
                selectedSlotId={selectedSlotId}
                setSelectedSlotId={setSelectedSlotId}
                isDimmed={isDimmed}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface RowLineProps {
  letter: string;
  row: number;
  totalCols: number;
  slotsByCell: Map<string, Slot>;
  containerByCell: Map<string, YardContainer | null>;
  selectedSlotId: string | null;
  setSelectedSlotId: (id: string | null) => void;
  isDimmed: (slot: Slot | undefined, container: YardContainer | null | undefined) => boolean;
}

function RowLine({
  letter,
  row,
  totalCols,
  slotsByCell,
  containerByCell,
  selectedSlotId,
  setSelectedSlotId,
  isDimmed,
}: RowLineProps) {
  return (
    <>
      <div
        className="flex items-center justify-center text-[11px] font-mono font-semibold"
        style={{ color: YARD_HEX.rowLabel }}
      >
        {letter}
      </div>
      {Array.from({ length: totalCols }, (_, i) => i + 1).map((col) => {
        const slot = slotsByCell.get(`${row}:${col}`);
        const container = containerByCell.get(`${row}:${col}`) ?? null;
        return (
          <SlotCell
            key={`${row}-${col}`}
            slot={slot}
            container={container}
            rowLetter={letter}
            col={col}
            selected={!!slot && selectedSlotId === slot._id}
            dimmed={isDimmed(slot, container)}
            onClick={() => slot && setSelectedSlotId(slot._id)}
          />
        );
      })}
    </>
  );
}

interface SlotCellProps {
  slot: Slot | undefined;
  container: YardContainer | null;
  rowLetter: string;
  col: number;
  selected: boolean;
  dimmed: boolean;
  onClick: () => void;
}

function SlotCell({ slot, container, rowLetter, col, selected, dimmed, onClick }: SlotCellProps) {
  const label = `${rowLetter}-${col.toString().padStart(2, "0")}`;
  const isBlocked = !!slot && slot.isReserved && !container;
  const fillColor = slot ? slotColor(slot, container) : YARD_HEX.emptySlot;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!slot}
      className={[
        "relative aspect-square w-full rounded-md border text-[10px] font-mono font-medium transition",
        "flex items-center justify-center select-none",
        slot ? "cursor-pointer" : "cursor-default",
        selected
          ? "ring-2 ring-offset-1 ring-offset-card"
          : "hover:ring-1 hover:ring-offset-1 hover:ring-offset-card",
        dimmed ? "opacity-25" : "opacity-100",
      ].join(" ")}
      style={{
        background: fillColor,
        borderColor: selected ? YARD_HEX.selectedRing : "transparent",
        color: textColorFor(fillColor),
        boxShadow: selected
          ? `0 0 0 2px ${YARD_HEX.selectedRing} inset`
          : undefined,
      }}
      title={slot ? `${label} · Tier ${slot.tier}${slot.isReserved ? " · Reserved" : ""}` : "Outside yard"}
    >
      {slot && <span className="leading-none">{label}</span>}
      {isBlocked && <BlockedXOverlay />}
    </button>
  );
}

function BlockedXOverlay() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="absolute inset-0 m-auto h-3/5 w-3/5 opacity-60 pointer-events-none"
      aria-hidden
    >
      <line
        x1="3"
        y1="3"
        x2="21"
        y2="21"
        stroke="#475569"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="21"
        y1="3"
        x2="3"
        y2="21"
        stroke="#475569"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function textColorFor(bg: string): string {
  const lightSet = new Set([
    LEGEND_HEX.EMPTY.toLowerCase(),
    YARD_HEX.emptySlot.toLowerCase(),
    YARD_HEX.gridSurface.toLowerCase(),
    YARD_HEX.ground.toLowerCase(),
  ]);
  if (lightSet.has(bg.toLowerCase())) return YARD_HEX.label;
  return "#ffffff";
}

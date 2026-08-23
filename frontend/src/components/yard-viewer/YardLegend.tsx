import { YARD_LEGEND } from "./yardColors";

export default function YardLegend() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 px-4 pb-3 text-xs">
      {YARD_LEGEND.map((entry) => (
        <div key={entry.key} className="flex items-center gap-1.5">
          <span
            className="inline-block size-3 rounded-sm border border-border"
            style={{ background: entry.color }}
          />
          <span className="text-foreground/80">{entry.label}</span>
        </div>
      ))}
    </div>
  );
}

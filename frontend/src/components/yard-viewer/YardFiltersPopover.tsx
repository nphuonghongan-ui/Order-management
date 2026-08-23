import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useYardStore } from "@/stores/useYardStore";
import type {
  ContainerTypeId,
  YardContainerStatus,
} from "./yardTypes";

const TYPE_OPTIONS: Array<ContainerTypeId | "ALL"> = [
  "ALL",
  "20GP",
  "40GP",
  "40HC",
  "45HC",
];

const STATUS_OPTIONS: Array<YardContainerStatus | "ALL"> = [
  "ALL",
  "IN_YARD",
  "GROUNDED",
  "LOADED",
  "OUT_GATED",
  "RESERVED",
];

export default function YardFiltersPopover() {
  const filters = useYardStore((s) => s.filters);
  const setFilters = useYardStore((s) => s.setFilters);

  const isActive = filters.typeId !== "ALL" || filters.status !== "ALL";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={[
            "gap-1.5",
            isActive ? "border-primary text-primary" : "",
          ].join(" ")}
        >
          <Filter size={12} />
          Filters
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64">
        <PopoverHeader>
          <PopoverTitle>Filters</PopoverTitle>
        </PopoverHeader>
        <div className="space-y-2">
          <div className="space-y-1">
            <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Container type
            </label>
            <Select
              value={filters.typeId}
              onValueChange={(v) =>
                setFilters({ typeId: v as ContainerTypeId | "ALL" })
              }
            >
              <SelectTrigger size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t === "ALL" ? "All types" : t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Status
            </label>
            <Select
              value={filters.status}
              onValueChange={(v) =>
                setFilters({ status: v as YardContainerStatus | "ALL" })
              }
            >
              <SelectTrigger size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === "ALL" ? "All statuses" : s.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

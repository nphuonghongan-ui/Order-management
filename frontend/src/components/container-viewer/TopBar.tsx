import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CONTAINER_REGISTRY,
} from "@/lib/clp/registry";
import {
  CONTAINER_TYPE_IDS,
  type ContainerTypeId,
} from "@/lib/clp/types";

interface TopBarProps {
  containerTypeId: ContainerTypeId;
  onContainerChange: (id: ContainerTypeId) => void;
  containerLabel: string;
  containerInnerCm: { l: number; w: number; h: number };
  disabled?: boolean;
}

export default function TopBar({
  containerTypeId,
  onContainerChange,
  containerLabel,
  containerInnerCm,
  disabled,
}: TopBarProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 p-3">
      <div className="pointer-events-auto">
        <Select
          value={containerTypeId}
          onValueChange={(v) => onContainerChange(v as ContainerTypeId)}
          disabled={disabled}
        >
          <SelectTrigger className="h-9 min-w-[18rem] rounded-md border-border bg-white text-foreground">
            <SelectValue>
              <span className="text-sm font-medium">{containerLabel}</span>
              <span className="ml-2 text-xs text-muted-foreground">
                {containerInnerCm.l.toFixed(2)} m × {containerInnerCm.w.toFixed(2)} m × {containerInnerCm.h.toFixed(2)} m
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {CONTAINER_TYPE_IDS.map((id) => (
              <SelectItem key={id} value={id}>
                {CONTAINER_REGISTRY[id].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

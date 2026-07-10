import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";

export function Field({
  label,
  required,
  error,
  caption,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  caption?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold flex items-center gap-1 text-foreground">
        {label}
        {required && <span className="text-destructive">*</span>}
        {caption && (
          <span className="text-muted-foreground font-normal ml-1">· {caption}</span>
        )}
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

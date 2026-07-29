import { useEffect } from "react";

export function useSaveShortcut(
  enabled: boolean,
  onSave: () => void,
  options: { allowInInputs?: boolean } = {}
): void {
  const { allowInInputs = false } = options;

  useEffect(() => {
    if (!enabled) return;
    const handler = (e: KeyboardEvent) => {
      const isSave = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s";
      if (!isSave) return;
      const target = e.target as HTMLElement | null;
      const inEditable =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT");
      if (inEditable && !allowInInputs) return;
      e.preventDefault();
      onSave();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [enabled, onSave, allowInInputs]);
}

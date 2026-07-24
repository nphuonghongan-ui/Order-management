import { GizmoHelper, GizmoViewport } from "@react-three/drei";
import { useContainerStore } from "../../stores/useContainerStore";

/**
 * Bottom-left XYZ axis compass (Blender-style).
 * Renders in screen-space and lets users click to snap the camera to an
 * orthographic view of the matching axis.
 */
export function AxisGizmo() {
  const setView = useContainerStore((s) => s.setView);
  return (
    <GizmoHelper alignment="top-left" margin={[100, 200]}>
      <GizmoViewport
        axisColors={["#ef4444", "#10b981", "#3b82f6"]}
        labelColor="#0f172a"
        onClick={(e) => {
          // drei passes a ThreeEvent whose object name is the axis letter
          // (e.g. "x", "y", "z"). Fall back to "iso" if unknown.
          const name = (e?.object?.name ?? "").toLowerCase();
          const map: Record<string, "top" | "front" | "right" | "iso"> = {
            x: "right",
            y: "top",
            z: "front",
            xyz: "iso",
          };
          const v = map[name] ?? "iso";
          setView(v);
          return null;
        }}
      />
    </GizmoHelper>
  );
}

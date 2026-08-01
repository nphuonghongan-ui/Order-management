import { useState } from "react";
import { Html } from "@react-three/drei";
import { useClpStore } from "@/stores/useClpStore";
import type { BoxPlacement } from "@/lib/clp/types";

interface PackedBoxProps {
  box: BoxPlacement;
}

export default function PackedBox({ box }: PackedBoxProps) {
  const selectedId = useClpStore((s) => s.selectedId);
  const setSelectedId = useClpStore((s) => s.setSelectedId);
  const showLabels = useClpStore((s) => s.showLabels);
  const highlightedPartNum = useClpStore((s) => s.highlightedPartNum);
  const [hover, setHover] = useState(false);

  const isSelected = selectedId === box.id;
  const hasHighlight = highlightedPartNum !== null;
  const isHighlighted = hasHighlight && box.partNum === highlightedPartNum;
  const isDimmed = hasHighlight && box.partNum !== highlightedPartNum;
  const color = box.color ?? "#3b6fd9";

  let opacity = 0.85;
  if (isDimmed) opacity = 0.25;
  else if (isHighlighted) opacity = 1;
  else if (isSelected || hover) opacity = 0.95;

  let emissive = "#000000";
  let emissiveIntensity = 0;
  if (isSelected) {
    emissive = "#3b6fd9";
    emissiveIntensity = 0.35;
  } else if (isHighlighted) {
    emissive = "#f59e0b";
    emissiveIntensity = 0.25;
  }

  return (
    <group
      position={[
        box.position.x + box.size.l / 2,
        box.position.y + box.size.h / 2,
        box.position.z + box.size.w / 2,
      ]}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedId(isSelected ? null : box.id);
      }}
      onPointerOver={(e) => {
        if (isDimmed) return;
        e.stopPropagation();
        setHover(true);
      }}
      onPointerOut={() => setHover(false)}
    >
      <mesh rotation={[0, (box.rotationY * Math.PI) / 180, 0]}>
        <boxGeometry args={[box.size.l, box.size.h, box.size.w]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={opacity}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>
      {(isSelected || hover) && !isDimmed && (
        <mesh rotation={[0, (box.rotationY * Math.PI) / 180, 0]}>
          <boxGeometry
            args={[box.size.l + 1, box.size.h + 1, box.size.w + 1]}
          />
          <meshBasicMaterial
            color="#fbbf24"
            wireframe
          />
        </mesh>
      )}
      {isHighlighted && (
        <mesh rotation={[0, (box.rotationY * Math.PI) / 180, 0]}>
          <boxGeometry
            args={[box.size.l + 2, box.size.h + 2, box.size.w + 2]}
          />
          <meshBasicMaterial
            color="#06b6d4"
            wireframe
          />
        </mesh>
      )}
      {showLabels && (
        <Html
          position={[0, box.size.h / 2 + 8, 0]}
          center
          style={{ pointerEvents: "none" }}
        >
          <div className="rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-mono text-white whitespace-nowrap">
            {box.partNum}
          </div>
        </Html>
      )}
    </group>
  );
}

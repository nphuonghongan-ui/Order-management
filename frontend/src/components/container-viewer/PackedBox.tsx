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
  const [hover, setHover] = useState(false);

  const isSelected = selectedId === box.id;
  const color = box.color ?? "#3b6fd9";

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
          opacity={isSelected || hover ? 0.95 : 0.85}
          emissive={isSelected ? "#3b6fd9" : "#000000"}
          emissiveIntensity={isSelected ? 0.35 : 0}
        />
      </mesh>
      {(isSelected || hover) && (
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

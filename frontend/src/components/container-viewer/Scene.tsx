import { useEffect, useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { GizmoHelper, GizmoViewport, OrbitControls, TransformControls } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three/examples/jsm/controls/OrbitControls.js";
import Container from "./Container";
import PackedBox from "./PackedBox";
import { useClpStore } from "@/stores/useClpStore";
import type { BoxPlacement, ViewPreset } from "@/lib/clp/types";

interface SceneProps {
  innerMm: { l: number; w: number; h: number };
  shellColor: string;
  placements: BoxPlacement[];
}

const VIEW_DISTANCE_MM = 8000;
const TOP_AZIMUTH_OFFSET_MM = 500;

function cameraPositionFor(
  view: ViewPreset,
  innerMm: { l: number; w: number; h: number }
): [number, number, number] {
  const cx = innerMm.l / 2;
  const cy = innerMm.h / 2;
  const cz = innerMm.w / 2;
  switch (view) {
    case "iso":
      return [cx + VIEW_DISTANCE_MM, cy + VIEW_DISTANCE_MM, cz + VIEW_DISTANCE_MM];
    case "top":
      return [cx + TOP_AZIMUTH_OFFSET_MM, cy + VIEW_DISTANCE_MM, cz];
    case "front":
      return [cx, cy, cz + VIEW_DISTANCE_MM];
    case "right":
      return [cx + VIEW_DISTANCE_MM, cy, cz];
  }
}

function ViewController({
  innerMm,
  view,
}: {
  innerMm: { l: number; w: number; h: number };
  view: ViewPreset;
}) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls);
  const center = useMemo(
    () => new THREE.Vector3(innerMm.l / 2, innerMm.h / 2, innerMm.w / 2),
    [innerMm.l, innerMm.h, innerMm.w]
  );

  useEffect(() => {
    const [x, y, z] = cameraPositionFor(view, innerMm);
    camera.position.set(x, y, z);
    camera.up.set(0, 1, 0);
    if (view === "top") camera.up.set(0, 0, -1);
    camera.lookAt(center);
    camera.updateProjectionMatrix();

    if (controls && "target" in controls) {
      (controls as OrbitControlsImpl).target.copy(center);
      (controls as OrbitControlsImpl).update();
    }
  }, [camera, controls, view, center, innerMm]);

  return null;
}

function TransformGizmo({ box }: { box: BoxPlacement }) {
  const tool = useClpStore((s) => s.tool);
  if (tool === "select") return null;
  const mode = tool === "move" ? "translate" : tool === "rotate" ? "rotate" : "scale";
  return (
    <TransformControls
      object={undefined}
      mode={mode}
      size={0.6}
    >
      <PackedBox box={box} />
    </TransformControls>
  );
}

export default function Scene({ innerMm, shellColor, placements }: SceneProps) {
  const view = useClpStore((s) => s.view);
  const selectedId = useClpStore((s) => s.selectedId);
  const tool = useClpStore((s) => s.tool);
  const showWalls = useClpStore((s) => s.showWalls);
  const showGrid = useClpStore((s) => s.showGrid);
  const showAxes = useClpStore((s) => s.showAxes);
  const setSelectedId = useClpStore((s) => s.setSelectedId);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSelectedId]);

  const selected = placements.find((p) => p.id === selectedId) ?? null;

  return (
    <div className="h-full w-full">
      <Canvas
        camera={{ position: [3500, 2500, 3500], fov: 45, near: 1, far: 20000 }}
        gl={{ antialias: true, preserveDrawingBuffer: true }}
        onCreated={({ gl }) => {
          gl.setClearColor("#0a1126", 1);
        }}
        onPointerMissed={() => setSelectedId(null)}
      >
        <ViewController innerMm={innerMm} view={view} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[3000, 5000, 2000]} intensity={1.2} />
        <directionalLight position={[-2000, 3000, -2000]} intensity={0.5} />

        <Container
          innerMm={innerMm}
          shellColor={shellColor}
          showWalls={showWalls}
          showGrid={showGrid}
        />

        {placements.map((box) =>
          selected && box.id === selected.id && tool !== "select" ? null : (
            <PackedBox key={box.id} box={box} />
          )
        )}

        {selected && tool !== "select" && <TransformGizmo box={selected} />}

        {showAxes && (
          <GizmoHelper alignment="top-right" margin={[500, 110]}>
            <GizmoViewport
              axisColors={["#ef4444", "#22c55e", "#3b82f6"]}
              labelColor="white"
            />
          </GizmoHelper>
        )}

        <OrbitControls
          target={[innerMm.l / 2, innerMm.h / 2, innerMm.w / 2]}
          makeDefault
        />
      </Canvas>
    </div>
  );
}

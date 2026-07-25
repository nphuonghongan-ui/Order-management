/**
 * MultiScene — the 3D viewport for the multi-container result
 * view. Lays N containers side-by-side along world-X and frames
 * them with a single auto-fit camera.
 *
 * Each container is its own R3F group (via Container3DNode).
 * Boxes per container come from the optimizer result, NOT from
 * the single-container `useContainerStore`.
 */

import { Suspense, useEffect, useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Grid,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import * as THREE from "three";
import { Container3DNode } from "./ContainerStrip";
import { totalStripWidth } from "./containerStripUtils";
import { getContainerType } from "@/components/container-viewer/units";
import type { CLPResult } from "@/lib/clp/types";

interface Props {
  result: CLPResult;
  selectedContainerIdx: number | null;
  onSelectContainer: (idx: number | null) => void;
  selectedBoxId: string | null;
  onSelectBox: (id: string | null) => void;
}

export function MultiScene({
  result,
  selectedContainerIdx,
  onSelectContainer,
  selectedBoxId,
  onSelectBox,
}: Props) {
  const totalWidth = useMemo(
    () =>
      totalStripWidth(
        result.containers.map((c) => getContainerType(c.containerTypeId))
      ),
    [result.containers]
  );
  const totalHeight = useMemo(() => {
    let maxH = 0;
    for (const c of result.containers) {
      const t = getContainerType(c.containerTypeId);
      if (t.inner.h > maxH) maxH = t.inner.h;
    }
    return maxH;
  }, [result.containers]);

  // Center the strip around the world origin.
  const offsets = useMemo(() => {
    const types = result.containers.map((c) =>
      getContainerType(c.containerTypeId)
    );
    const total = totalStripWidth(types);
    const start = -total / 2;
    const out: number[] = [];
    let cursor = start;
    for (let i = 0; i < types.length; i++) {
      out.push(cursor);
      const t = types[i];
      if (!t) continue;
      cursor += t.inner.l + 50;
    }
    return out;
  }, [result.containers]);

  return (
    <Canvas
      shadows="soft"
      frameloop="demand"
      dpr={[1, 1.5]}
      gl={{ antialias: true, preserveDrawingBuffer: false }}
      onPointerMissed={() => onSelectBox(null)}
    >
      <MultiCameraRig totalWidth={totalWidth} totalHeight={totalHeight} />

      <color attach="background" args={["#0b0f1a"]} />
      <fog attach="fog" args={["#0b0f1a", totalWidth * 0.8, totalWidth * 2.5]} />

      <ambientLight intensity={0.45} />
      <directionalLight
        position={[totalWidth * 0.3, totalHeight * 2.5, totalWidth * 0.4]}
        intensity={1.1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={1}
        shadow-camera-far={totalWidth * 4}
        shadow-camera-left={-totalWidth}
        shadow-camera-right={totalWidth}
        shadow-camera-top={totalHeight * 1.5}
        shadow-camera-bottom={-1}
      />
      <directionalLight
        position={[-totalWidth * 0.3, totalHeight, -totalWidth * 0.3]}
        intensity={0.25}
      />

      <Suspense fallback={null}>
        <Environment preset="warehouse" />
      </Suspense>

      {result.containers.length > 0 && (
        <Grid
          args={[totalWidth * 1.2, totalWidth * 0.8]}
          cellSize={10}
          cellThickness={0.5}
          cellColor="#1f2a3d"
          sectionSize={100}
          sectionThickness={1}
          sectionColor="#3b4a63"
          fadeDistance={totalWidth * 1.2}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid={false}
          position={[0, -0.5, 0]}
        />
      )}

      {result.containers.map((c, idx) => {
        const offset = offsets[idx] ?? 0;
        return (
          <Container3DNode
            key={`${c.containerTypeId}-${idx}`}
            containerTypeId={c.containerTypeId}
            boxes={c.placements}
            offsetX={offset}
            highlighted={selectedContainerIdx === idx}
            onBoxClick={(id) => onSelectBox(id)}
            selectedBoxId={selectedBoxId}
          />
        );
      })}

      <ContactShadows
        position={[0, 0.1, 0]}
        opacity={0.45}
        scale={totalWidth * 1.4}
        blur={2.4}
        far={totalHeight * 0.8}
        resolution={256}
        frames={1}
      />

      <OrbitControls
        makeDefault
        target={[0, totalHeight / 2, 0]}
        maxPolarAngle={Math.PI / 2 - 0.05}
        minDistance={totalWidth * 0.3}
        maxDistance={totalWidth * 4}
        enableDamping={false}
      />

      {/* Click empty area in the canvas to deselect container */}
      <mesh
        position={[0, -1, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={() => onSelectContainer(null)}
        visible={false}
      >
        <planeGeometry args={[totalWidth * 2, totalWidth]} />
      </mesh>
    </Canvas>
  );
}

function MultiCameraRig({
  totalWidth,
  totalHeight,
}: {
  totalWidth: number;
  totalHeight: number;
}) {
  const { camera, invalidate } = useThree();
  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;
    const dist = Math.max(totalWidth, totalHeight) * 1.0;
    const pos: [number, number, number] = [totalWidth * 0.05, totalHeight * 0.9, dist];
    animateCamera(camera, pos, [0, totalHeight / 2, 0], invalidate);
  }, [camera, totalWidth, totalHeight, invalidate]);
  return null;
}

function animateCamera(
  camera: THREE.Camera,
  to: [number, number, number],
  lookAt: [number, number, number],
  invalidate: () => void
) {
  if (!(camera instanceof THREE.PerspectiveCamera)) return;
  const start = camera.position.clone();
  const end = new THREE.Vector3(...to);
  const startTime = performance.now();
  const duration = 500;
  function step(now: number) {
    const t = Math.min(1, (now - startTime) / duration);
    const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    camera.position.lerpVectors(start, end, ease);
    camera.lookAt(...lookAt);
    invalidate();
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

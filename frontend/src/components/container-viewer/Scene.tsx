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
import { Container } from "./Container";
import { PackedBoxes, SelectedGizmo } from "./PackedBox";
import { AxisGizmo } from "./AxisGizmo";
import { useContainerStore } from "../../stores/useContainerStore";
import { getContainerType } from "./units";
import type { ViewPreset } from "./types";

export function Scene() {
  const containerTypeId = useContainerStore((s) => s.containerTypeId);
  const showGrid = useContainerStore((s) => s.showGrid);
  const showAxes = useContainerStore((s) => s.showAxes);
  const view = useContainerStore((s) => s.view);
  const contextEpoch = useContainerStore((s) => s.contextEpoch);
  const container = getContainerType(containerTypeId);
  const { l, h, w } = container.inner;
  const cameraPos = useMemo<[number, number, number]>(
    () => [l * 0.9, h * 1.1, w * 1.7],
    [l, h, w],
  );

  return (
    <Canvas
      // `key` forces a full remount on contextEpoch bump — the cleanest
      // recovery path when the GL context is lost and cannot be restored
      // in-place. Keyed remount gives us a fresh WebGL context.
      key={contextEpoch}
      shadows="soft"
      frameloop="demand"
      dpr={[1, 1.5]}
      gl={{ antialias: true, preserveDrawingBuffer: false }}
      onPointerMissed={() => {
        useContainerStore.getState().selectBox(null);
      }}
    >
      <DemandInvalidator />
      <ContextLossHandler />

      <color attach="background" args={["#0b0f1a"]} />
      <fog attach="fog" args={["#0b0f1a", l * 2, l * 5]} />

      <PerspectiveCamera
        makeDefault
        fov={35}
        near={1}
        far={l * 6}
        position={cameraPos}
      />

      <CameraRig view={view} target={[0, h / 2, 0]} container={container} />

      <ambientLight intensity={0.45} />
      <directionalLight
        position={[l * 0.8, h * 2.5, w * 1.2]}
        intensity={1.1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={1}
        shadow-camera-far={l * 4}
        shadow-camera-left={-l}
        shadow-camera-right={l}
        shadow-camera-top={h * 1.5}
        shadow-camera-bottom={-1}
      />
      <directionalLight position={[-l * 0.6, h, -w]} intensity={0.25} />

      <Suspense fallback={null}>
        <Environment preset="warehouse" />
      </Suspense>

      {showGrid && (
        <Grid
          args={[l * 1.5, w * 1.5]}
          cellSize={10}
          cellThickness={0.5}
          cellColor="#1f2a3d"
          sectionSize={100}
          sectionThickness={1}
          sectionColor="#3b4a63"
          fadeDistance={l * 1.2}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid={false}
          position={[0, -0.5, 0]}
        />
      )}

      {showAxes && <axesHelper args={[Math.min(l, w) * 0.4]} />}

      <Container />
      <PackedBoxes />
      <SelectedGizmo />

      <ContactShadows
        position={[0, 0.1, 0]}
        opacity={0.45}
        scale={l * 1.4}
        blur={2.4}
        far={h * 0.8}
        resolution={256}
        frames={1}
      />

      <OrbitControls
        makeDefault
        target={[0, h / 2, 0]}
        maxPolarAngle={Math.PI / 2 - 0.05}
        minDistance={l * 0.3}
        maxDistance={l * 4}
        enableDamping={false}
      />

      <AxisGizmo />
    </Canvas>
  );
}

/**
 * In frameloop="demand" the renderer only draws when something calls
 * `invalidate()`. R3F auto-invalidates on pointer events and OrbitControls
 * drag, but zustand store updates do not. This effect re-invalidates the
 * frame whenever the box array reference or the view preset changes.
 */
function DemandInvalidator() {
  const invalidate = useThree((s) => s.invalidate);
  const boxes = useContainerStore((s) => s.boxes);
  const view = useContainerStore((s) => s.view);
  const showWalls = useContainerStore((s) => s.showWalls);
  const showLabels = useContainerStore((s) => s.showLabels);
  useEffect(() => {
    invalidate();
  }, [invalidate, boxes, view, showWalls, showLabels]);
  return null;
}

/**
 * Wire WebGL context-loss recovery. We must call preventDefault() on
 * `webglcontextlost` for the browser to later fire `webglcontextrestored`;
 * if the browser never restores, the Scene's `key={contextEpoch}` remount
 * is the fallback (driven by `forceContextRestore()` in the store).
 *
 * The previous `PrecompileShaders` microtask is gone — it forced
 * `gl.compile()` during the same frame the Environment HDR and
 * ContactShadows render targets were still binding, which could produce
 * the upstream `GL_INVALID_OPERATION: …sampler type` that escalated into
 * `webglcontextlost`. Three.js compiles shaders lazily on first real
 * render, which now happens after Suspense has settled.
 */
function ContextLossHandler() {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    const canvas = gl.domElement;
    const onLost = (event: Event) => {
      event.preventDefault();
      useContainerStore.getState().setContextLost(true);
    };
    const onRestored = () => {
      useContainerStore.getState().setContextLost(false);
    };
    canvas.addEventListener("webglcontextlost", onLost, false);
    canvas.addEventListener("webglcontextrestored", onRestored, false);
    return () => {
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
    };
  }, [gl]);
  return null;
}

function CameraRig({
  view,
  target,
  container,
}: {
  view: ViewPreset;
  target: [number, number, number];
  container: ReturnType<typeof getContainerType>;
}) {
  const { camera, invalidate } = useThree();
  useEffect(() => {
    const { l, h, w } = container.inner;
    const dist = Math.max(l, h, w) * 1.2;
    let pos: [number, number, number];
    switch (view) {
      case "top":
        pos = [0, dist, 0.001];
        break;
      case "front":
        pos = [0, h / 2, -dist];
        break;
      case "right":
        pos = [dist, h / 2, 0];
        break;
      case "iso":
      default:
        pos = [l * 0.9, h * 1.1, w * 1.7];
        break;
    }
    animateCamera(camera, pos, target, invalidate);
  }, [view, camera, container, target, invalidate]);
  return null;
}

function animateCamera(
  camera: THREE.Camera,
  to: [number, number, number],
  lookAt: [number, number, number],
  invalidate: () => void,
) {
  if (!(camera instanceof THREE.PerspectiveCamera)) return;
  const start = camera.position.clone();
  const end = new THREE.Vector3(...to);
  const startTime = performance.now();
  const duration = 400;
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

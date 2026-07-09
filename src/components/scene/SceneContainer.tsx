import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment } from "@react-three/drei";
import { StarField } from "./StarField";
import { OverviewScene } from "./OverviewScene";
import { OctawebScene } from "./OctawebScene";
import { MerlinEngine } from "./MerlinEngine";
import { MERLIN_ENGINE_PARTS } from "../../data/rocketData";
import type { SceneMode } from "../../hooks/useSceneState";

function SceneContent({
  mode,
  explodeProgress,
  selectedPart,
  onSelectPart,
  onOverviewClick,
  onOctawebClick,
}: {
  mode: SceneMode;
  explodeProgress: number;
  selectedPart: string | null;
  onSelectPart: (id: string) => void;
  onOverviewClick: () => void;
  onOctawebClick: () => void;
}) {
  return (
    <>
      <ambientLight intensity={0.15} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} color="#ffffff" />
      <directionalLight position={[-5, 3, -5]} intensity={0.5} color="#4a6fa5" />
      <pointLight position={[0, -2, 0]} intensity={0.8} color="#ff3b30" distance={5} />

      <StarField count={2000} />

      {mode === "overview" && (
        <OverviewScene onRocketClick={onOverviewClick} />
      )}
      {mode === "octaweb" && (
        <OctawebScene onEngineClick={onOctawebClick} />
      )}
      {mode === "engine" && (
        <MerlinEngine
          parts={MERLIN_ENGINE_PARTS}
          explodeProgress={explodeProgress}
          selectedPart={selectedPart}
          onSelectPart={onSelectPart}
        />
      )}
    </>
  );
}

export function SceneContainer({
  mode,
  explodeProgress,
  selectedPart,
  onSelectPart,
  onOverviewClick,
  onOctawebClick,
}: {
  mode: SceneMode;
  explodeProgress: number;
  selectedPart: string | null;
  onSelectPart: (id: string) => void;
  onOverviewClick: () => void;
  onOctawebClick: () => void;
}) {
  // Camera positions per mode
  const cameraPos: [number, number, number] =
    mode === "overview" ? [0, 0, 4] : mode === "octaweb" ? [0.5, 0.5, 1.2] : [2.0, 0.75, 2.5];

  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      onPointerMissed={() => onSelectPart("")}
    >
      <PerspectiveCamera makeDefault position={cameraPos} fov={45} />
      <Suspense fallback={null}>
        <SceneContent
          mode={mode}
          explodeProgress={explodeProgress}
          selectedPart={selectedPart}
          onSelectPart={onSelectPart}
          onOverviewClick={onOverviewClick}
          onOctawebClick={onOctawebClick}
        />
        <Environment preset="night" />
      </Suspense>
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={0.5}
        maxDistance={8}
        autoRotate={false}
        enableDamping
        dampingFactor={0.08}
      />
    </Canvas>
  );
}

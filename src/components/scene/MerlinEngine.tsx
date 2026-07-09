import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Html, Line } from "@react-three/drei";
import type { EnginePart } from "../../data/rocketData";

function PartMesh({
  part,
  exploded,
  selected,
  simulating,
  onClick,
}: {
  part: EnginePart;
  exploded: number;
  selected: boolean;
  simulating: boolean;
  onClick: () => void;
}) {
  const ref = useRef<THREE.Group>(null);

  const geometry = useMemo(() => {
    switch (part.geometry) {
      case "lathe":
        if (!part.profile) return new THREE.CylinderGeometry(0.05, 0.05, 0.1, 32);
        return new THREE.LatheGeometry(
          part.profile.map(([r, y]) => new THREE.Vector2(r, y)),
          64,
        );
      case "cylinder":
        return new THREE.CylinderGeometry(0.10, 0.10, 0.30, 32);
      case "torus":
        return new THREE.TorusGeometry(0.20, 0.05, 16, 48);
      case "box":
        return new THREE.BoxGeometry(0.15, 0.15, 0.15);
      case "sphere":
        return new THREE.SphereGeometry(0.125, 32, 24);
      case "cone":
        return new THREE.ConeGeometry(0.15, 0.25, 32);
      default:
        return new THREE.BoxGeometry(0.125, 0.125, 0.125);
    }
  }, [part]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const target = new THREE.Vector3(
      THREE.MathUtils.lerp(part.assembledPos[0], part.explodedPos[0], exploded),
      THREE.MathUtils.lerp(part.assembledPos[1], part.explodedPos[1], exploded),
      THREE.MathUtils.lerp(part.assembledPos[2], part.explodedPos[2], exploded),
    );
    ref.current.position.lerp(target, delta * 6);
    if (selected) {
      ref.current.scale.lerp(new THREE.Vector3(1.1, 1.1, 1.1), delta * 8);
    } else {
      ref.current.scale.lerp(new THREE.Vector3(1, 1, 1), delta * 8);
    }
  });

  // Simulating: combustion chamber glows
  const isHot = simulating && (part.id === "combustion-chamber" || part.id === "nozzle");

  return (
    <group ref={ref} position={part.assembledPos}>
      <mesh
        geometry={geometry}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { document.body.style.cursor = "default"; }}
      >
        <meshStandardMaterial
          color={part.color}
          metalness={part.metalness}
          roughness={part.roughness}
          emissive={selected ? "#ff3b30" : isHot ? "#ff6600" : "#000000"}
          emissiveIntensity={selected ? 0.3 : isHot ? 0.6 : 0}
        />
      </mesh>
      {/* Outline for selected */}
      {selected && (
        <mesh geometry={geometry} scale={1.05}>
          <meshBasicMaterial color="#ff3b30" wireframe transparent opacity={0.4} />
        </mesh>
      )}
      {/* Chinese label - small & subtle */}
      {!simulating && (
        <Html
          position={[0, 0.22, 0]}
          center
          style={{
            color: selected ? "#ff3b30" : "rgba(255,255,255,0.55)",
            fontSize: "10px",
            fontWeight: selected ? "bold" : "normal",
            whiteSpace: "nowrap",
            textShadow: "0 0 4px rgba(0,0,0,0.95), 0 0 2px rgba(0,0,0,0.9)",
            pointerEvents: "none",
            userSelect: "none",
            fontFamily: "'Geist', 'Noto Sans SC', sans-serif",
            letterSpacing: "0.05em",
          }}
        >
          {part.name}
        </Html>
      )}
    </group>
  );
}

/**
 * Dynamic pipe connecting turbopump ⇢ gas generator.
 */
function Pipes({ parts, explodeProgress }: { parts: EnginePart[]; explodeProgress: number }) {
  const lineRef = useRef<any>(null);

  const tp = parts.find((p) => p.id === "turbopump")!;
  const gg = parts.find((p) => p.id === "gas-generator")!;

  useFrame(() => {
    if (!lineRef.current) return;
    const pos = lineRef.current.geometry.attributes.position;
    pos.setXYZ(
      0,
      THREE.MathUtils.lerp(tp.assembledPos[0], tp.explodedPos[0], explodeProgress),
      THREE.MathUtils.lerp(tp.assembledPos[1], tp.explodedPos[1], explodeProgress),
      THREE.MathUtils.lerp(tp.assembledPos[2], tp.explodedPos[2], explodeProgress),
    );
    pos.setXYZ(
      1,
      THREE.MathUtils.lerp(gg.assembledPos[0], gg.explodedPos[0], explodeProgress),
      THREE.MathUtils.lerp(gg.assembledPos[1], gg.explodedPos[1], explodeProgress),
      THREE.MathUtils.lerp(gg.assembledPos[2], gg.explodedPos[2], explodeProgress),
    );
    pos.needsUpdate = true;
  });

  const points = useMemo(
    () => [
      new THREE.Vector3(tp.assembledPos[0], tp.assembledPos[1], tp.assembledPos[2]),
      new THREE.Vector3(gg.assembledPos[0], gg.assembledPos[1], gg.assembledPos[2]),
    ],
    [tp, gg],
  );

  return (
    <Line
      ref={lineRef}
      points={points}
      color="#ff6600"
      lineWidth={1}
      transparent
      opacity={0.6}
    />
  );
}

/** Engine flame effect for simulation mode */
function EngineFlame({ active }: { active: boolean }) {
  const flameRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state, delta) => {
    if (!flameRef.current) return;
    // Flicker
    const flicker = 1 + Math.sin(state.clock.elapsedTime * 30) * 0.08 + Math.random() * 0.05;
    flameRef.current.scale.set(flicker, 1 + Math.sin(state.clock.elapsedTime * 20) * 0.12, flicker);
    flameRef.current.rotation.y += delta * 2;

    if (lightRef.current) {
      lightRef.current.intensity = 2 + Math.sin(state.clock.elapsedTime * 25) * 0.5;
    }
  });

  if (!active) return null;

  return (
    <group position={[0, -1.1, 0]}>
      {/* Outer flame plume */}
      <mesh ref={flameRef} position={[0, -0.4, 0]}>
        <coneGeometry args={[0.22, 0.9, 32, 1, true]} />
        <meshBasicMaterial
          color="#ff4400"
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* Inner core */}
      <mesh position={[0, -0.3, 0]}>
        <coneGeometry args={[0.10, 0.5, 32, 1, true]} />
        <meshBasicMaterial
          color="#ffdd66"
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* Brightest center */}
      <mesh position={[0, -0.15, 0]}>
        <coneGeometry args={[0.04, 0.2, 16, 1, true]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* Dynamic light */}
      <pointLight ref={lightRef} position={[0, -0.3, 0]} color="#ff6600" intensity={2} distance={4} />
    </group>
  );
}

export function MerlinEngine({
  parts,
  explodeProgress,
  selectedPart,
  simulating,
  onSelectPart,
}: {
  parts: EnginePart[];
  explodeProgress: number;
  selectedPart: string | null;
  simulating: boolean;
  onSelectPart: (id: string) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      // Slow rotation when exploded, stop when simulating
      if (!simulating) {
        groupRef.current.rotation.y += delta * 0.15;
      }
    }
  });

  return (
    <group ref={groupRef}>
      <Pipes parts={parts} explodeProgress={explodeProgress} />
      {parts.map((part) => (
        <PartMesh
          key={part.id}
          part={part}
          exploded={explodeProgress}
          selected={selectedPart === part.id}
          simulating={simulating}
          onClick={() => onSelectPart(part.id)}
        />
      ))}
      <EngineFlame active={simulating} />
    </group>
  );
}

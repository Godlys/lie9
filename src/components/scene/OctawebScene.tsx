import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/** Single simplified engine for the Octaweb view */
function MiniEngine({ position, index }: { position: [number, number, number]; index: number }) {
  const ref = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * (0.3 + index * 0.05);
    }
  });

  return (
    <group ref={ref} position={position}>
      {/* Nozzle */}
      <mesh position={[0, -0.12, 0]}>
        <coneGeometry args={[0.08, 0.16, 24, 1, true]} />
        <meshStandardMaterial color="#3a3a44" metalness={0.9} roughness={0.35} side={THREE.DoubleSide} />
      </mesh>
      {/* Chamber */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.05, 0.08, 24]} />
        <meshStandardMaterial color="#8b3a2a" metalness={0.7} roughness={0.4} />
      </mesh>
      {/* Top cap */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.035, 0.03, 0.02, 24]} />
        <meshStandardMaterial color="#c0c0c8" metalness={0.85} roughness={0.25} />
      </mesh>
    </group>
  );
}

export function OctawebScene({
  onEngineClick,
}: {
  onEngineClick: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);

  // Octaweb: 8 engines in circle + 1 center
  const enginePositions: [number, number, number][] = useMemo(() => {
    const r = 0.25;
    const pos: [number, number, number][] = [[0, 0, 0]];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      pos.push([Math.cos(angle) * r, 0, Math.sin(angle) * r]);
    }
    return pos;
  }, []);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Base plate */}
      <mesh position={[0, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.38, 0.38, 0.02, 64]} />
        <meshStandardMaterial color="#2a2a36" metalness={0.6} roughness={0.5} />
      </mesh>
      {/* Engines */}
      {enginePositions.map((pos, i) => (
        <group
          key={i}
          position={pos}
          onClick={(e) => { e.stopPropagation(); onEngineClick(); }}
          onPointerOver={() => { document.body.style.cursor = "pointer"; }}
          onPointerOut={() => { document.body.style.cursor = "default"; }}
        >
          <MiniEngine position={[0, 0, 0]} index={i} />
        </group>
      ))}
    </group>
  );
}



import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/** Single simplified engine for the Octaweb view */
function MiniEngine({ position, index }: { position: [number, number, number]; index: number }) {
  const ref = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * (0.2 + index * 0.03);
    }
  });

  return (
    <group ref={ref} position={position}>
      {/* Nozzle - 喇叭口形状 */}
      <mesh position={[0, -0.18, 0]}>
        <coneGeometry args={[0.13, 0.22, 32, 1, true]} />
        <meshStandardMaterial color="#3a3a44" metalness={0.9} roughness={0.35} side={THREE.DoubleSide} />
      </mesh>
      {/* Nozzle throat (narrow part) */}
      <mesh position={[0, -0.08, 0]}>
        <cylinderGeometry args={[0.045, 0.06, 0.06, 32]} />
        <meshStandardMaterial color="#2a2a30" metalness={0.9} roughness={0.4} side={THREE.DoubleSide} />
      </mesh>
      {/* Chamber */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.1, 32]} />
        <meshStandardMaterial color="#8b3a2a" metalness={0.7} roughness={0.4} />
      </mesh>
      {/* Top cap (injector housing) */}
      <mesh position={[0, 0.07, 0]}>
        <cylinderGeometry args={[0.055, 0.05, 0.03, 32]} />
        <meshStandardMaterial color="#c0c0c8" metalness={0.85} roughness={0.25} />
      </mesh>
      {/* Mount ring */}
      <mesh position={[0, 0.09, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.05, 0.07, 32]} />
        <meshStandardMaterial color="#5a5a64" metalness={0.8} roughness={0.3} side={THREE.DoubleSide} />
      </mesh>
      {/* Glow at nozzle exit */}
      <pointLight position={[0, -0.28, 0]} color="#ff3b30" intensity={0.3} distance={0.5} />
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
    const r = 0.28;
    const pos: [number, number, number][] = [[0, 0, 0]];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      pos.push([Math.cos(angle) * r, 0, Math.sin(angle) * r]);
    }
    return pos;
  }, []);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.04;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Thin base plate - semi-transparent, not a "big pancake" */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.42, 0.42, 0.008, 64]} />
        <meshStandardMaterial
          color="#1a1a24"
          metalness={0.5}
          roughness={0.6}
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* Octaweb structural ring (outer edge) */}
      <mesh position={[0, 0.1, 0]}>
        <torusGeometry args={[0.42, 0.015, 8, 64]} />
        <meshStandardMaterial color="#4a4a54" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Inner structural ring */}
      <mesh position={[0, 0.1, 0]}>
        <torusGeometry args={[0.28, 0.01, 8, 48]} />
        <meshStandardMaterial color="#3a3a44" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Per-engine mounting rings (Octaweb cells) */}
      {enginePositions.map((pos, i) => (
        <mesh
          key={`ring-${i}`}
          position={[pos[0], 0.1, pos[2]]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.08, 0.1, 32]} />
          <meshStandardMaterial color="#3a3a44" metalness={0.7} roughness={0.4} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* Radial structural beams (8 spokes connecting center to outer ring) */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const x = Math.cos(angle) * 0.21;
        const z = Math.sin(angle) * 0.21;
        return (
          <mesh
            key={`beam-${i}`}
            position={[x, 0.1, z]}
            rotation={[0, -angle, 0]}
          >
            <boxGeometry args={[0.18, 0.006, 0.015]} />
            <meshStandardMaterial color="#2a2a34" metalness={0.7} roughness={0.4} />
          </mesh>
        );
      })}

      {/* Engines */}
      {enginePositions.map((pos, i) => (
        <group
          key={`engine-${i}`}
          position={pos}
          onClick={(e) => { e.stopPropagation(); onEngineClick(); }}
          onPointerOver={() => { document.body.style.cursor = "pointer"; }}
          onPointerOut={() => { document.body.style.cursor = "default"; }}
        >
          <MiniEngine position={[0, 0, 0]} index={i} />
        </group>
      ))}

      {/* Bottom accent glow ring */}
      <mesh position={[0, -0.35, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.35, 0.42, 64]} />
        <meshBasicMaterial color="#ff3b30" transparent opacity={0.08} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { EnginePart } from "../../data/rocketData";

function PartMesh({
  part,
  exploded,
  selected,
  onClick,
}: {
  part: EnginePart;
  exploded: number;
  selected: boolean;
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
        return new THREE.CylinderGeometry(0.04, 0.04, 0.12, 32);
      case "torus":
        return new THREE.TorusGeometry(0.08, 0.02, 16, 48);
      case "box":
        return new THREE.BoxGeometry(0.06, 0.06, 0.06);
      case "sphere":
        return new THREE.SphereGeometry(0.05, 32, 24);
      case "cone":
        return new THREE.ConeGeometry(0.06, 0.1, 32);
      default:
        return new THREE.BoxGeometry(0.05, 0.05, 0.05);
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
          emissive={selected ? "#ff3b30" : "#000000"}
          emissiveIntensity={selected ? 0.3 : 0}
        />
      </mesh>
      {/* Outline for selected */}
      {selected && (
        <mesh geometry={geometry} scale={1.05}>
          <meshBasicMaterial color="#ff3b30" wireframe transparent opacity={0.4} />
        </mesh>
      )}
    </group>
  );
}

export function MerlinEngine({
  parts,
  explodeProgress,
  selectedPart,
  onSelectPart,
}: {
  parts: EnginePart[];
  explodeProgress: number;
  selectedPart: string | null;
  onSelectPart: (id: string) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      {parts.map((part) => (
        <PartMesh
          key={part.id}
          part={part}
          exploded={explodeProgress}
          selected={selectedPart === part.id}
          onClick={() => onSelectPart(part.id)}
        />
      ))}
    </group>
  );
}

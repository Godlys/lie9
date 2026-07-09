import { useMemo } from "react";
import * as THREE from "three";
import { Line, Html } from "@react-three/drei";

interface AnnotationLineProps {
  position: [number, number, number];
  name: string;
  index: number;
}

export default function AnnotationLine({
  position,
  name,
  index,
}: AnnotationLineProps) {
  const [x, y, z] = position;

  const points = useMemo(
    () => [
      new THREE.Vector3(x, y, z),
      new THREE.Vector3(x + 0.8, y + 0.3, z),
      new THREE.Vector3(x + 1.5, y + 0.3, z),
    ],
    [x, y, z],
  );

  return (
    <group>
      <Line
        points={points}
        color="#ffffff"
        lineWidth={1}
        transparent
        opacity={0.7}
      />
      <Html
        position={[x + 1.5, y + 0.3, z]}
        center
        style={{
          color: "rgba(255,255,255,0.85)",
          fontSize: "11px",
          fontFamily: "'Geist Mono', 'JetBrains Mono', monospace",
          fontWeight: 400,
          whiteSpace: "nowrap",
          pointerEvents: "none",
          userSelect: "none",
          border: "1px solid rgba(255,255,255,0.25)",
          borderRadius: "4px",
          padding: "3px 8px",
          background: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(4px)",
        }}
      >
        {index}. {name}
      </Html>
    </group>
  );
}

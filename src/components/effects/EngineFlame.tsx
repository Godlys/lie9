import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface EngineFlameProps {
  explodeProgress: number;
  enginePositions: [number, number, number][];
}

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  wobbleOffset: number;
}

const PARTICLE_COUNT_PER_ENGINE = 60;
const SPREAD = 0.6;

export default function EngineFlame({ explodeProgress, enginePositions }: EngineFlameProps) {
  const visible = explodeProgress < 0.3;
  const totalCount = enginePositions.length * PARTICLE_COUNT_PER_ENGINE;

  // Shared typed arrays for GPU upload
  const posArray = useRef(new Float32Array(totalCount * 3));
  const opArray = useRef(new Float32Array(totalCount));

  // Particle state — stable ref, re-initialized only when engine count changes
  const stateRef = useRef<Particle[]>([]);

  // (Re-)initialize particles when engine count changes
  if (stateRef.current.length !== totalCount) {
    stateRef.current = [];
    for (let i = 0; i < totalCount; i++) {
      const engineIdx = Math.floor(i / PARTICLE_COUNT_PER_ENGINE);
      const pos = enginePositions[engineIdx] ?? [0, -8, 0];
      stateRef.current.push({
        position: new THREE.Vector3(
          pos[0] + (Math.random() - 0.5) * 0.3,
          pos[1],
          pos[2] + (Math.random() - 0.5) * 0.3,
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * SPREAD,
          -(2 + Math.random() * 3),
          (Math.random() - 0.5) * SPREAD,
        ),
        life: Math.random(),
        maxLife: 0.8 + Math.random() * 1.2,
        wobbleOffset: Math.random() * Math.PI * 2,
      });
    }
  }

  const particles = stateRef.current;

  // Stable geometry ref — re-created only on count change
  const geometryRef = useRef<THREE.BufferGeometry | null>(null);
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(posArray.current, 3));
    geo.setAttribute('opacity', new THREE.Float32BufferAttribute(opArray.current, 1));
    geometryRef.current = geo;
    return geo;
  }, [totalCount]);

  useFrame((_, delta) => {
    const positions = posArray.current;
    const opacities = opArray.current;
    const allFaded = !visible;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const engineIdx = Math.floor(i / PARTICLE_COUNT_PER_ENGINE);
      const basePos = enginePositions[engineIdx] ?? [0, -8, 0];

      if (visible) {
        p.life += delta * 0.8;
      }

      if (p.life >= p.maxLife) {
        p.position.set(
          basePos[0] + (Math.random() - 0.5) * 0.3,
          basePos[1],
          basePos[2] + (Math.random() - 0.5) * 0.3,
        );
        p.velocity.set(
          (Math.random() - 0.5) * SPREAD,
          -(2 + Math.random() * 3),
          (Math.random() - 0.5) * SPREAD,
        );
        p.life = 0;
        p.maxLife = 0.8 + Math.random() * 1.2;
      }

      if (visible) {
        const progress = p.life / p.maxLife;
        const drag = 1 - progress * 0.6;
        const spreadFactor = 1 + progress * 2;

        p.velocity.x += (Math.random() - 0.5) * delta * 2 * spreadFactor;
        p.velocity.z += (Math.random() - 0.5) * delta * 2 * spreadFactor;

        p.position.x += p.velocity.x * delta * drag;
        p.position.y += p.velocity.y * delta * drag;
        p.position.z += p.velocity.z * delta * drag;

        // Wobble
        p.position.x += Math.sin(p.life * 6 + p.wobbleOffset) * delta * 0.3;
        p.position.z += Math.cos(p.life * 6 + p.wobbleOffset) * delta * 0.3;

        // Opacity: bright at start, fade out
        opacities[i] = Math.max(0, 1 - progress * 1.5) * (1 - progress);
      } else {
        // Fade out when not visible
        p.position.y -= delta * 5;
        opacities[i] = Math.max(0, opacities[i] - delta * 3);
      }

      positions[i * 3] = p.position.x;
      positions[i * 3 + 1] = p.position.y;
      positions[i * 3 + 2] = p.position.z;
    }

    // Determine if we can skip rendering
    if (allFaded) {
      let anyAlive = false;
      for (let i = 0; i < particles.length; i++) {
        if (opacities[i] > 0.01) { anyAlive = true; break; }
      }
      if (!anyAlive && geometryRef.current) {
        geometryRef.current.setDrawRange(0, 0);
      } else if (geometryRef.current) {
        geometryRef.current.setDrawRange(0, particles.length);
      }
    } else if (geometryRef.current) {
      geometryRef.current.setDrawRange(0, particles.length);
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.opacity.needsUpdate = true;
  });

  // Use default opacity 1; the custom fragment shader handles per-vertex alpha
  return (
    <points geometry={geometry}>
      <pointsMaterial
        size={0.35}
        color="#ff6600"
        transparent
        opacity={1}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
        onBeforeCompile={(shader) => {
          shader.vertexShader = shader.vertexShader.replace(
            'gl_PointSize = size * scale;',
            'gl_PointSize = size * scale * (0.8 + 0.4 * (1.0 - opacity));',
          );

          shader.fragmentShader = shader.fragmentShader.replace(
            'gl_FragColor = vec4( outgoingLight, diffuseColor.a );',
            `
              float alpha = diffuseColor.a * (1.0 - gl_PointCoord.y) * 0.9;
              vec3 color = mix(vec3(1.0, 0.4, 0.0), vec3(1.0, 0.8, 0.2), 1.0 - gl_PointCoord.y);
              gl_FragColor = vec4(color, alpha);
            `,
          );
        }}
      />
    </points>
  );
}

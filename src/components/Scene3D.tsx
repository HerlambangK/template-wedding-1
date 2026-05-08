"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";
import { getTheme } from "@/config/wedding";

const theme = getTheme();

function GoldRing({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const speed = useMemo(() => 0.3 + Math.random() * 0.3, []);
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * speed + offset) * 0.5;
    ref.current.rotation.y = state.clock.elapsedTime * speed * 0.5;
    ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + offset) * 0.3;
  });

  return (
    <mesh ref={ref} position={position} scale={scale}>
      <torusGeometry args={[1, 0.08, 16, 48]} />
      <meshStandardMaterial
        color={theme.primaryLight}
        metalness={0.9}
        roughness={0.1}
        emissive={theme.primary}
        emissiveIntensity={0.2}
      />
    </mesh>
  );
}

function FloatingHeart({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const speed = useMemo(() => 0.2 + Math.random() * 0.3, []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * speed;
    ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.4) * 0.4;
  });

  const heartShape = useMemo(() => {
    const shape = new THREE.Shape();
    const x = 0, y = 0;
    shape.moveTo(x, y + 0.5);
    shape.bezierCurveTo(x, y + 0.5, x - 0.25, y, x - 0.5, y);
    shape.bezierCurveTo(x - 1, y, x - 1, y + 0.7, x - 1, y + 0.7);
    shape.bezierCurveTo(x - 1, y + 1.1, x - 0.6, y + 1.54, x, y + 1.9);
    shape.bezierCurveTo(x + 0.6, y + 1.54, x + 1, y + 1.1, x + 1, y + 0.7);
    shape.bezierCurveTo(x + 1, y + 0.7, x + 1, y, x + 0.5, y);
    shape.bezierCurveTo(x + 0.25, y, x, y + 0.5, x, y + 0.5);
    return shape;
  }, []);

  return (
    <mesh ref={ref} position={position} scale={scale * 0.15} rotation={[Math.PI, 0, 0]}>
      <extrudeGeometry args={[heartShape, { depth: 0.3, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.05, bevelThickness: 0.05 }]} />
      <meshStandardMaterial
        color={theme.primaryLight}
        metalness={0.8}
        roughness={0.2}
        emissive={theme.primary}
        emissiveIntensity={0.15}
      />
    </mesh>
  );
}

function GoldSphere({ position }: { position: [number, number, number] }) {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh position={position} scale={0.3}>
        <sphereGeometry args={[1, 32, 32]} />
        <MeshDistortMaterial
          color={theme.primaryLight}
          metalness={0.9}
          roughness={0.1}
          distort={0.3}
          speed={2}
        />
      </mesh>
    </Float>
  );
}

function GoldParticles() {
  const count = 80;
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return pos;
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.02;

    const posArray = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      posArray[i * 3 + 1] += 0.003;
      if (posArray[i * 3 + 1] > 6) posArray[i * 3 + 1] = -6;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        size={0.04}
        color={theme.particle}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

export default function Scene3D({ variant = "cover" }: { variant?: "cover" | "hero" | "floating" }) {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        style={{ pointerEvents: "none" }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} color="#FFF5E1" />
        <pointLight position={[-3, 2, 4]} intensity={0.5} color={theme.primaryLight} />

        {variant === "cover" && (
          <>
            <GoldRing position={[-2.5, 1, -1]} scale={0.6} />
            <GoldRing position={[2.5, -0.5, -2]} scale={0.5} />
            <FloatingHeart position={[0, 2, -1]} scale={1} />
            <GoldParticles />
          </>
        )}

        {variant === "hero" && (
          <>
            <GoldRing position={[-3, 0, -2]} scale={0.4} />
            <GoldRing position={[3, 1, -2]} scale={0.35} />
            <FloatingHeart position={[-2, -1.5, -1]} scale={0.7} />
            <FloatingHeart position={[2.5, 2, -1.5]} scale={0.5} />
            <GoldParticles />
          </>
        )}

        {variant === "floating" && (
          <>
            <GoldSphere position={[-3, 0, -1]} />
            <GoldSphere position={[3, 1, -2]} />
            <FloatingHeart position={[0, -1, -1]} scale={0.6} />
            <GoldParticles />
          </>
        )}
      </Canvas>
    </div>
  );
}

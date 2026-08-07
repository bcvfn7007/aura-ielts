import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, OrbitControls, Sparkles } from '@react-three/drei';

function AnimatedOrb() {
  const meshRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.x = time * 0.2;
      meshRef.current.rotation.y = time * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1.5}>
      <Sphere ref={meshRef} args={[1.6, 64, 64]} scale={1.2}>
        <MeshDistortMaterial
          color="#6C63FF"
          attach="material"
          distort={0.4}
          speed={3}
          roughness={0.2}
          metalness={0.8}
          clearcoat={1}
          clearcoatRoughness={0.1}
          wireframe={false}
        />
      </Sphere>
    </Float>
  );
}

function InnerCore() {
  const coreRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (coreRef.current) {
      coreRef.current.rotation.y = -time * 0.5;
    }
  });

  return (
    <mesh ref={coreRef}>
      <icosahedronGeometry args={[0.9, 1]} />
      <meshStandardMaterial
        color="#00F0FF"
        wireframe
        emissive="#00F0FF"
        emissiveIntensity={0.5}
      />
    </mesh>
  );
}

export default function Hero3D() {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '420px', position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
        <pointLight position={[-10, -10, -5]} intensity={1} color="#6C63FF" />
        <pointLight position={[5, 5, 5]} intensity={1.2} color="#00F0FF" />

        <AnimatedOrb />
        <InnerCore />
        <Sparkles count={80} scale={6} size={2.5} speed={0.4} color="#6C63FF" />

        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1.2} />
      </Canvas>
    </div>
  );
}

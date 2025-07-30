"use client";
import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Mesh } from "three";

// Base floating component wrapper
interface FloatingShapeProps {
  children: React.ReactNode;
}

const FloatingWrapper: React.FC<FloatingShapeProps> = ({ children }) => {
  return (
    <div className="w-16 h-16">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        {children}
      </Canvas>
    </div>
  );
};

// Individual 3D shape components with floating animation
const FloatingCubeGeometry: React.FC = () => {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.5;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.2;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <meshStandardMaterial color="#3b82f6" wireframe />
    </mesh>
  );
};

const FloatingPyramidGeometry: React.FC = () => {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.4;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.6;
      meshRef.current.position.y = Math.cos(state.clock.elapsedTime * 1.2) * 0.3;
    }
  });

  return (
    <mesh ref={meshRef}>
      <coneGeometry args={[1, 2, 4]} />
      <meshStandardMaterial color="#8b5cf6" wireframe />
    </mesh>
  );
};

const FloatingTorusGeometry: React.FC = () => {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.25;
    }
  });

  return (
    <mesh ref={meshRef}>
      <torusGeometry args={[1, 0.4, 8, 16]} />
      <meshStandardMaterial color="#10b981" wireframe />
    </mesh>
  );
};

const FloatingDiamondGeometry: React.FC = () => {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.6;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.4;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.2;
    }
  });

  return (
    <mesh ref={meshRef}>
      <octahedronGeometry args={[1.2]} />
      <meshStandardMaterial color="#f59e0b" wireframe />
    </mesh>
  );
};

const FloatingSphereGeometry: React.FC = () => {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.7;
      meshRef.current.position.y = Math.cos(state.clock.elapsedTime * 0.9) * 0.3;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.2, 16, 16]} />
      <meshStandardMaterial color="#ef4444" wireframe />
    </mesh>
  );
};

const FloatingCylinderGeometry: React.FC = () => {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.5;
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.3;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.1) * 0.25;
    }
  });

  return (
    <mesh ref={meshRef}>
      <cylinderGeometry args={[0.8, 0.8, 2, 8]} />
      <meshStandardMaterial color="#06b6d4" wireframe />
    </mesh>
  );
};

// Exported components
export const FloatingCube: React.FC = () => (
  <FloatingWrapper>
    <FloatingCubeGeometry />
  </FloatingWrapper>
);

export const FloatingPyramid: React.FC = () => (
  <FloatingWrapper>
    <FloatingPyramidGeometry />
  </FloatingWrapper>
);

export const FloatingTorus: React.FC = () => (
  <FloatingWrapper>
    <FloatingTorusGeometry />
  </FloatingWrapper>
);

export const FloatingDiamond: React.FC = () => (
  <FloatingWrapper>
    <FloatingDiamondGeometry />
  </FloatingWrapper>
);

export const FloatingSphere: React.FC = () => (
  <FloatingWrapper>
    <FloatingSphereGeometry />
  </FloatingWrapper>
);

export const FloatingCylinder: React.FC = () => (
  <FloatingWrapper>
    <FloatingCylinderGeometry />
  </FloatingWrapper>
);
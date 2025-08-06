import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Text } from '@react-three/drei';
import * as THREE from 'three';

interface QuantumSphereProps {
  bit: number;
  basis: string;
  position: [number, number, number];
  isEveIntercepted?: boolean;
  isMatching?: boolean;
  scale?: number;
}

export const QuantumSphere: React.FC<QuantumSphereProps> = ({
  bit,
  basis,
  position,
  isEveIntercepted = false,
  isMatching = false,
  scale = 1
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.2;
    }
  });

  const sphereColor = basis === 'Z' ? '#4F46E5' : '#EC4899';
  const emissiveColor = isMatching ? '#10B981' : isEveIntercepted ? '#EF4444' : '#000000';

  return (
    <group position={position}>
      {/* Main quantum sphere */}
      <Sphere ref={meshRef} args={[0.5 * scale, 32, 32]}>
        <meshPhongMaterial
          color={sphereColor}
          emissive={emissiveColor}
          emissiveIntensity={isMatching ? 0.3 : isEveIntercepted ? 0.5 : 0.1}
          transparent
          opacity={0.8}
        />
      </Sphere>

      {/* Bit value text */}
      <Text
        position={[0, 0, 0.6 * scale]}
        fontSize={0.3 * scale}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {bit}
      </Text>

      {/* Basis indicator */}
      <Text
        position={[0, -0.8 * scale, 0]}
        fontSize={0.2 * scale}
        color={basis === 'Z' ? '#4F46E5' : '#EC4899'}
        anchorX="center"
        anchorY="middle"
      >
        {basis}
      </Text>

      {/* Eve interference indicator - simple pulsing effect */}
      {isEveIntercepted && (
        <mesh>
          <sphereGeometry args={[0.6 * scale, 16, 16]} />
          <meshBasicMaterial 
            color="#EF4444" 
            transparent 
            opacity={0.3}
            wireframe
          />
        </mesh>
      )}

      {/* Matching indicator ring */}
      {isMatching && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.7 * scale, 0.02 * scale, 8, 32]} />
          <meshBasicMaterial color="#10B981" />
        </mesh>
      )}
    </group>
  );
};
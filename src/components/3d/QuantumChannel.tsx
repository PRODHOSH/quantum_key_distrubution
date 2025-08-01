import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Tube, Text } from '@react-three/drei';
import * as THREE from 'three';

interface QuantumChannelProps {
  isTransmitting: boolean;
  evePresent: boolean;
}

export const QuantumChannel: React.FC<QuantumChannelProps> = ({
  isTransmitting,
  evePresent
}) => {
  const tubeRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  // Create transmission particles
  const particles = useMemo(() => {
    const count = 200;
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = -10 + (i / count) * 20; // X position along tube
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.5; // Y variation
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.5; // Z variation
      velocities[i] = Math.random() * 0.1 + 0.05;
    }
    
    return { positions, velocities };
  }, []);

  useFrame((state) => {
    if (particlesRef.current && isTransmitting) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < positions.length / 3; i++) {
        positions[i * 3] += particles.velocities[i];
        
        // Reset particles that have reached the end
        if (positions[i * 3] > 10) {
          positions[i * 3] = -10;
        }
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  // Create tube curve
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-10, 0, 0),
      new THREE.Vector3(-5, 0.5, 0),
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(5, -0.5, 0),
      new THREE.Vector3(10, 0, 0),
    ]);
  }, []);

  return (
    <group>
      {/* Quantum channel tube */}
      <Tube ref={tubeRef} args={[curve, 64, 0.1, 8, false]}>
        <meshBasicMaterial
          color={evePresent ? "#EF4444" : "#06B6D4"}
          transparent
          opacity={0.3}
        />
      </Tube>

      {/* Transmission particles */}
      {isTransmitting && (
        <points ref={particlesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={particles.positions.length / 3}
              array={particles.positions}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.05}
            color={evePresent ? "#FEF3C7" : "#67E8F9"}
            transparent
            opacity={0.8}
          />
        </points>
      )}

      {/* Channel labels */}
      <Text
        position={[-10, -1, 0]}
        fontSize={0.5}
        color="#4F46E5"
        anchorX="center"
        anchorY="middle"
      >
        👩‍🦰 Alice
      </Text>

      <Text
        position={[10, -1, 0]}
        fontSize={0.5}
        color="#059669"
        anchorX="center"
        anchorY="middle"
      >
        👨‍🦱 Bob
      </Text>

      {evePresent && (
        <Text
          position={[0, 1.5, 0]}
          fontSize={0.4}
          color="#EF4444"
          anchorX="center"
          anchorY="middle"
        >
          🕵️‍♀️ Eve
        </Text>
      )}
    </group>
  );
};
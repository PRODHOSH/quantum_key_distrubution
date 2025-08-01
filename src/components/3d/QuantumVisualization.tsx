import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import { QuantumSphere } from './QuantumSphere';
import { QuantumChannel } from './QuantumChannel';

interface QuantumVisualizationProps {
  simulationData: {
    aliceBits: number[];
    aliceBases: string[];
    bobBases: string[];
    bobBits: number[];
    matchingBases: boolean[];
    eveInterference: boolean[];
  };
  isTransmitting: boolean;
  includeEve: boolean;
}

export const QuantumVisualization: React.FC<QuantumVisualizationProps> = ({
  simulationData,
  isTransmitting,
  includeEve
}) => {
  return (
    <div className="h-96 w-full rounded-lg border border-border overflow-hidden bg-gradient-to-b from-background to-muted">
      <Canvas>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 5, 15]} />
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={30}
          />
          
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -5]} intensity={0.5} />

          {/* Environment */}
          <Environment preset="city" background={false} />

          {/* Quantum Channel */}
          <QuantumChannel
            isTransmitting={isTransmitting}
            evePresent={includeEve}
          />

          {/* Alice's Qubits */}
          {simulationData.aliceBits.map((bit, index) => (
            <QuantumSphere
              key={`alice-${index}`}
              bit={bit}
              basis={simulationData.aliceBases[index]}
              position={[-8, 2 + (index % 4) * 1.5, -2 + Math.floor(index / 4) * 1.5]}
              isEveIntercepted={simulationData.eveInterference[index]}
              isMatching={simulationData.matchingBases[index]}
              scale={0.8}
            />
          ))}

          {/* Bob's Measured Qubits */}
          {simulationData.bobBits.map((bit, index) => (
            <QuantumSphere
              key={`bob-${index}`}
              bit={bit}
              basis={simulationData.bobBases[index]}
              position={[8, 2 + (index % 4) * 1.5, -2 + Math.floor(index / 4) * 1.5]}
              isEveIntercepted={simulationData.eveInterference[index]}
              isMatching={simulationData.matchingBases[index]}
              scale={0.8}
            />
          ))}
        </Suspense>
      </Canvas>
    </div>
  );
};
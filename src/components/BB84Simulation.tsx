import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

// Types for BB84 simulation
interface BB84Data {
  aliceBits: number[];
  aliceBases: string[];
  bobBases: string[];
  bobBits: number[];
  matchingBases: boolean[];
  finalKey: number[];
  eveInterference: boolean[];
  errorRate: number;
}

interface SimulationStep {
  step: number;
  title: string;
  description: string;
  completed: boolean;
}

const BB84Simulation: React.FC = () => {
  const [numQubits, setNumQubits] = useState([8]);
  const [simulationData, setSimulationData] = useState<BB84Data | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [includeEve, setIncludeEve] = useState(false);
  const { toast } = useToast();

  // Simulation steps
  const steps: SimulationStep[] = [
    {
      step: 1,
      title: "Alice Prepares Her Secret",
      description: "👩‍🦰 Alice generates random bits (0s and 1s) and chooses random bases (Z or X) to encode each bit into a qubit.",
      completed: false
    },
    {
      step: 2,
      title: "Quantum Transmission",
      description: "📡 Alice sends her encoded qubits through the quantum channel to Bob.",
      completed: false
    },
    {
      step: 3,
      title: "Bob's Measurements",
      description: "👨‍🦱 Bob randomly chooses measurement bases and measures each incoming qubit.",
      completed: false
    },
    {
      step: 4,
      title: "Basis Comparison",
      description: "📞 Alice and Bob compare their bases publicly (but not the bits!) and keep only matching ones.",
      completed: false
    },
    {
      step: 5,
      title: "Key Generation",
      description: "🔐 The remaining bits form their shared secret key!",
      completed: false
    }
  ];

  // Generate random BB84 data
  const generateBB84Data = (n: number, evePresent: boolean = false): BB84Data => {
    // Alice's random preparation
    const aliceBits = Array.from({ length: n }, () => Math.round(Math.random()));
    const aliceBases = Array.from({ length: n }, () => Math.random() > 0.5 ? 'Z' : 'X');
    
    // Bob's random measurement
    const bobBases = Array.from({ length: n }, () => Math.random() > 0.5 ? 'Z' : 'X');
    
    // Eve's interference (if present)
    const eveInterference = Array.from({ length: n }, () => evePresent && Math.random() > 0.7);
    
    // Bob's measurement results
    const bobBits = aliceBits.map((bit, i) => {
      if (aliceBases[i] === bobBases[i]) {
        // Same basis - Bob should get the same bit (unless Eve interfered)
        if (eveInterference[i]) {
          // Eve introduces error
          return Math.random() > 0.5 ? bit : 1 - bit;
        }
        return bit;
      } else {
        // Different basis - Bob gets random result
        return Math.round(Math.random());
      }
    });

    // Find matching bases
    const matchingBases = aliceBases.map((base, i) => base === bobBases[i]);
    
    // Extract final key (only matching bases)
    const finalKey = aliceBits.filter((_, i) => matchingBases[i]);
    const bobFinalKey = bobBits.filter((_, i) => matchingBases[i]);
    
    // Calculate error rate
    const errors = finalKey.filter((bit, i) => bit !== bobFinalKey[i]).length;
    const errorRate = finalKey.length > 0 ? (errors / finalKey.length) * 100 : 0;

    return {
      aliceBits,
      aliceBases,
      bobBases,
      bobBits,
      matchingBases,
      finalKey,
      eveInterference,
      errorRate
    };
  };

  // Run simulation
  const runSimulation = async () => {
    setIsAnimating(true);
    setCurrentStep(0);
    
    // Reset steps
    const newSteps = steps.map(step => ({ ...step, completed: false }));
    
    // Animate through steps
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i + 1);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Generate simulation data
    const data = generateBB84Data(numQubits[0], includeEve);
    setSimulationData(data);
    
    setIsAnimating(false);
    
    // Show result toast
    if (includeEve && data.errorRate > 10) {
      toast({
        title: "🚨 Eavesdropping Detected!",
        description: `Error rate: ${data.errorRate.toFixed(1)}% - Eve was caught!`,
        variant: "destructive"
      });
    } else {
      toast({
        title: "🔐 Secure Key Generated!",
        description: `Key length: ${data.finalKey.length} bits`,
      });
    }
  };

  // Character avatars
  const CharacterAvatar: React.FC<{ name: string; emoji: string; color: string }> = ({ name, emoji, color }) => (
    <div className={`flex flex-col items-center p-4 rounded-lg bg-${color} bg-opacity-20 border border-${color}`}>
      <div className="text-4xl mb-2 animate-quantum-pulse">{emoji}</div>
      <span className="font-semibold text-sm">{name}</span>
    </div>
  );

  // Qubit visualization
  const QubitVisual: React.FC<{ bit: number; basis: string; index: number }> = ({ bit, basis, index }) => (
    <div className="flex flex-col items-center p-2 m-1 rounded-lg bg-card border">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold
        ${basis === 'Z' ? 'bg-quantum-basis-z' : 'bg-quantum-basis-x'}`}>
        {bit}
      </div>
      <span className="text-xs mt-1">{basis}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-primary/20 bg-gradient-to-r from-card to-card/50">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              🔬 BB84 Quantum Key Distribution
            </CardTitle>
            <p className="text-lg text-muted-foreground mt-2">
              Learn how Alice and Bob can share a secret key using quantum mechanics!
            </p>
          </CardHeader>
        </Card>

        {/* Characters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              👥 Meet the Characters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <CharacterAvatar name="Alice" emoji="👩‍🦰" color="quantum-alice" />
              <CharacterAvatar name="Bob" emoji="👨‍🦱" color="quantum-bob" />
              <CharacterAvatar name="Eve" emoji="🕵️‍♀️" color="quantum-eve" />
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
              <p><strong>Alice:</strong> The sender who wants to share a secret key</p>
              <p><strong>Bob:</strong> The receiver who wants to get the secret key</p>
              <p><strong>Eve:</strong> The sneaky eavesdropper trying to steal the key</p>
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>🎛️ Simulation Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Number of Qubits: {numQubits[0]}</label>
              <Slider
                value={numQubits}
                onValueChange={setNumQubits}
                max={16}
                min={4}
                step={1}
                className="mt-2"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeEve}
                  onChange={(e) => setIncludeEve(e.target.checked)}
                  className="rounded"
                />
                Include Eve (Eavesdropper)
              </label>
            </div>

            <Button 
              onClick={runSimulation} 
              disabled={isAnimating}
              className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90"
            >
              {isAnimating ? "🔄 Simulating..." : "🚀 Run BB84 Simulation"}
            </Button>
          </CardContent>
        </Card>

        {/* Simulation Steps */}
        {isAnimating && (
          <Card>
            <CardHeader>
              <CardTitle>📋 Simulation Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={(currentStep / steps.length) * 100} className="h-3" />
                {steps.map((step, index) => (
                  <div key={index} className={`p-3 rounded-lg border transition-all duration-500
                    ${currentStep > index ? 'bg-primary/10 border-primary' : 
                      currentStep === index + 1 ? 'bg-primary/5 border-primary/50' : 
                      'bg-muted border-border'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold
                        ${currentStep > index ? 'bg-primary text-primary-foreground' : 
                          currentStep === index + 1 ? 'bg-primary/50 text-primary-foreground' : 
                          'bg-muted-foreground text-muted'}`}>
                        {step.step}
                      </div>
                      <div>
                        <h4 className="font-semibold">{step.title}</h4>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {simulationData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Data Table */}
            <Card>
              <CardHeader>
                <CardTitle>📊 Simulation Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Qubit</th>
                        <th className="text-left p-2">Alice Bit</th>
                        <th className="text-left p-2">Alice Base</th>
                        <th className="text-left p-2">Bob Base</th>
                        <th className="text-left p-2">Bob Bit</th>
                        <th className="text-left p-2">Match?</th>
                        {includeEve && <th className="text-left p-2">Eve?</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {simulationData.aliceBits.map((bit, i) => (
                        <tr key={i} className={`border-b ${simulationData.matchingBases[i] ? 'bg-primary/5' : ''}`}>
                          <td className="p-2 font-mono">{i + 1}</td>
                          <td className="p-2 font-mono">{bit}</td>
                          <td className="p-2">
                            <Badge variant={simulationData.aliceBases[i] === 'Z' ? 'default' : 'secondary'}>
                              {simulationData.aliceBases[i]}
                            </Badge>
                          </td>
                          <td className="p-2">
                            <Badge variant={simulationData.bobBases[i] === 'Z' ? 'default' : 'secondary'}>
                              {simulationData.bobBases[i]}
                            </Badge>
                          </td>
                          <td className="p-2 font-mono">{simulationData.bobBits[i]}</td>
                          <td className="p-2">
                            {simulationData.matchingBases[i] ? '✅' : '❌'}
                          </td>
                          {includeEve && (
                            <td className="p-2">
                              {simulationData.eveInterference[i] ? '🕵️' : ''}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Key Summary */}
            <Card>
              <CardHeader>
                <CardTitle>🔐 Final Secret Key</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Shared Secret Key:</h4>
                  <div className="p-3 bg-primary/10 rounded-lg border-2 border-primary/20">
                    <code className="text-lg font-mono">
                      {simulationData.finalKey.join('')}
                    </code>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-card rounded-lg border">
                    <div className="text-2xl font-bold text-primary">{simulationData.finalKey.length}</div>
                    <div className="text-sm text-muted-foreground">Key Length (bits)</div>
                  </div>
                  <div className="p-3 bg-card rounded-lg border">
                    <div className={`text-2xl font-bold ${simulationData.errorRate > 10 ? 'text-destructive' : 'text-quantum-basis-z'}`}>
                      {simulationData.errorRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Error Rate</div>
                  </div>
                </div>

                {includeEve && simulationData.errorRate > 10 && (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <h4 className="font-semibold text-destructive mb-2">🚨 Eavesdropping Detected!</h4>
                    <p className="text-sm">
                      The high error rate indicates that Eve has been interfering with the quantum channel. 
                      Alice and Bob should abort this key and try again!
                    </p>
                  </div>
                )}

                {!includeEve && (
                  <div className="p-4 bg-quantum-basis-z/10 border border-quantum-basis-z/20 rounded-lg">
                    <h4 className="font-semibold text-quantum-basis-z mb-2">✅ Secure Communication!</h4>
                    <p className="text-sm">
                      The low error rate confirms that no eavesdropping occurred. 
                      Alice and Bob can safely use this key for encryption!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Educational Info */}
        <Card>
          <CardHeader>
            <CardTitle>🎓 How BB84 Works (For Beginners)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">🔬 The Quantum Magic</h4>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>• Qubits can be measured in different "bases" (like different orientations)</li>
                  <li>• Measuring in the wrong basis gives random results</li>
                  <li>• Any eavesdropping disturbs the qubits and introduces errors</li>
                  <li>• Alice and Bob can detect Eve by checking error rates</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">🔐 Security Features</h4>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>• Only matching measurement bases produce the correct bits</li>
                  <li>• Public basis comparison doesn't reveal the secret</li>
                  <li>• Quantum mechanics guarantees security</li>
                  <li>• Perfect for one-time pad encryption</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BB84Simulation;
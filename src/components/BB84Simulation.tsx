import React, { useState, useEffect, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { QuantumVisualization } from './3d/QuantumVisualization';
import { AdvancedAnalytics } from './advanced/AdvancedAnalytics';
import { InteractiveControls } from './interactive/InteractiveControls';

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
  const [eveInterceptionRate, setEveInterceptionRate] = useState([30]);
  const [simulationSpeed, setSimulationSpeed] = useState([1]);
  const [activeTab, setActiveTab] = useState('overview');
  const [batchResults, setBatchResults] = useState<any[]>([]);
  const [isTransmitting, setIsTransmitting] = useState(false);
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

  // Generate random BB84 data with enhanced Eve simulation
  const generateBB84Data = (n: number, evePresent: boolean = false): BB84Data => {
    // Alice's random preparation
    const aliceBits = Array.from({ length: n }, () => Math.round(Math.random()));
    const aliceBases = Array.from({ length: n }, () => Math.random() > 0.5 ? 'Z' : 'X');
    
    // Bob's random measurement
    const bobBases = Array.from({ length: n }, () => Math.random() > 0.5 ? 'Z' : 'X');
    
    // Eve's interference (if present) - using configurable rate
    const eveThreshold = evePresent ? (100 - eveInterceptionRate[0]) / 100 : 1;
    const eveInterference = Array.from({ length: n }, () => evePresent && Math.random() > eveThreshold);
    
    // Bob's measurement results
    const bobBits = aliceBits.map((bit, i) => {
      if (aliceBases[i] === bobBases[i]) {
        // Same basis - Bob should get the same bit (unless Eve interfered)
        if (eveInterference[i]) {
          // Eve introduces error with higher probability
          return Math.random() > 0.25 ? bit : 1 - bit;
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

  // Run simulation with enhanced animations
  const runSimulation = async () => {
    setIsAnimating(true);
    setIsTransmitting(true);
    setCurrentStep(0);
    
    const stepDelay = 1000 / simulationSpeed[0];
    
    // Animate through steps
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i + 1);
      await new Promise(resolve => setTimeout(resolve, stepDelay));
    }
    
    // Generate simulation data
    const data = generateBB84Data(numQubits[0], includeEve);
    setSimulationData(data);
    
    setIsAnimating(false);
    setIsTransmitting(false);
    
    // Show enhanced result toast
    if (includeEve && data.errorRate > 10) {
      toast({
        title: "🚨 Eavesdropping Detected!",
        description: `Error rate: ${data.errorRate.toFixed(1)}% - Security compromised!`,
        variant: "destructive"
      });
    } else if (includeEve && data.errorRate > 5) {
      toast({
        title: "⚠️ Suspicious Activity",
        description: `Error rate: ${data.errorRate.toFixed(1)}% - Monitor closely`,
      });
    } else {
      toast({
        title: "🔐 Secure Key Generated!",
        description: `Key length: ${data.finalKey.length} bits | Efficiency: ${((data.finalKey.length / numQubits[0]) * 100).toFixed(1)}%`,
      });
    }
  };

  // Run batch simulations for statistical analysis
  const runBatchSimulation = async () => {
    setIsAnimating(true);
    const results = [];
    
    for (let i = 0; i < 100; i++) {
      const data = generateBB84Data(numQubits[0], includeEve);
      results.push({
        keyLength: data.finalKey.length,
        errorRate: data.errorRate,
        efficiency: (data.finalKey.length / numQubits[0]) * 100
      });
    }
    
    setBatchResults(results);
    setIsAnimating(false);
    
    const avgEfficiency = results.reduce((sum, r) => sum + r.efficiency, 0) / results.length;
    const avgErrorRate = results.reduce((sum, r) => sum + r.errorRate, 0) / results.length;
    
    toast({
      title: "📊 Batch Analysis Complete",
      description: `100 simulations | Avg efficiency: ${avgEfficiency.toFixed(1)}% | Avg error rate: ${avgErrorRate.toFixed(1)}%`,
    });
  };

  // Export simulation data
  const exportData = () => {
    if (!simulationData) return;
    
    const data = {
      parameters: {
        numQubits: numQubits[0],
        includeEve,
        eveInterceptionRate: eveInterceptionRate[0]
      },
      results: simulationData,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bb84-simulation-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "💾 Data Exported",
      description: "Simulation data saved successfully",
    });
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/80 p-4 md:p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="border-primary/20 bg-gradient-to-r from-card via-card/80 to-card/50 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5" />
            <CardHeader className="text-center relative z-10">
              <CardTitle className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
                🔬 BB84 Quantum Key Distribution
              </CardTitle>
              <p className="text-lg md:text-xl text-muted-foreground mt-4 max-w-3xl mx-auto">
                Experience the future of secure communication through interactive quantum mechanics simulation
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                <Badge variant="outline">3D Visualization</Badge>
                <Badge variant="outline">Real-time Analytics</Badge>
                <Badge variant="outline">Interactive Learning</Badge>
                <Badge variant="outline">Security Analysis</Badge>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Main Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="3d-viz">3D Visualization</TabsTrigger>
            <TabsTrigger value="controls">Controls</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="education" className="hidden lg:flex">Learn</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Characters */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    👥 Meet the Quantum Characters
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <CharacterAvatar name="Alice" emoji="👩‍🦰" color="quantum-alice" />
                    <CharacterAvatar name="Bob" emoji="👨‍🦱" color="quantum-bob" />
                    <CharacterAvatar name="Eve" emoji="🕵️‍♀️" color="quantum-eve" />
                  </div>
                  <Separator className="my-6" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <h4 className="font-semibold text-primary mb-2">👩‍🦰 Alice - The Sender</h4>
                      <p className="text-sm text-muted-foreground">
                        Prepares quantum states and sends encrypted information through the quantum channel
                      </p>
                    </div>
                    <div className="text-center">
                      <h4 className="font-semibold text-primary mb-2">👨‍🦱 Bob - The Receiver</h4>
                      <p className="text-sm text-muted-foreground">
                        Measures quantum states and collaborates with Alice to establish the secret key
                      </p>
                    </div>
                    <div className="text-center">
                      <h4 className="font-semibold text-destructive mb-2">🕵️‍♀️ Eve - The Eavesdropper</h4>
                      <p className="text-sm text-muted-foreground">
                        Attempts to intercept and measure quantum states, introducing detectable errors
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Start */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle>🚀 Quick Start</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <Button 
                        onClick={runSimulation} 
                        disabled={isAnimating}
                        className="w-full h-16 text-lg bg-gradient-to-r from-primary to-primary-glow hover:opacity-90"
                      >
                        {isAnimating ? "🔄 Simulating..." : "🚀 Run BB84 Simulation"}
                      </Button>
                      
                      <div className="flex gap-2">
                        <Button 
                          onClick={runBatchSimulation} 
                          disabled={isAnimating}
                          variant="outline"
                          className="flex-1"
                        >
                          🧪 Batch Analysis
                        </Button>
                        <Button 
                          onClick={exportData} 
                          variant="outline"
                          className="flex-1"
                          disabled={!simulationData}
                        >
                          💾 Export Data
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Qubits: {numQubits[0]}</span>
                        <Slider
                          value={numQubits}
                          onValueChange={setNumQubits}
                          max={32}
                          min={4}
                          step={1}
                          className="w-32"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <span className="text-sm">Include Eve</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={includeEve}
                            onChange={(e) => setIncludeEve(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="3d-viz" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🌐 3D Quantum Visualization
                  <Badge variant="secondary">Interactive</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {simulationData ? (
                  <Suspense fallback={
                    <div className="h-96 flex items-center justify-center bg-muted/50 rounded-lg">
                      <div className="text-center">
                        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                        <p className="text-muted-foreground">Loading 3D Visualization...</p>
                      </div>
                    </div>
                  }>
                    <QuantumVisualization
                      simulationData={simulationData}
                      isTransmitting={isTransmitting}
                      includeEve={includeEve}
                    />
                  </Suspense>
                ) : (
                  <div className="h-96 flex items-center justify-center bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/20">
                    <div className="text-center">
                      <div className="text-4xl mb-4">🔬</div>
                      <p className="text-lg font-medium">Run a simulation to see 3D visualization</p>
                      <p className="text-muted-foreground">Interactive quantum spheres and channels await</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="controls" className="space-y-6">
            <InteractiveControls
              numQubits={numQubits}
              setNumQubits={setNumQubits}
              includeEve={includeEve}
              setIncludeEve={setIncludeEve}
              eveInterceptionRate={eveInterceptionRate}
              setEveInterceptionRate={setEveInterceptionRate}
              simulationSpeed={simulationSpeed}
              setSimulationSpeed={setSimulationSpeed}
              onRunSimulation={runSimulation}
              onRunBatch={runBatchSimulation}
              onExportData={exportData}
              isAnimating={isAnimating}
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {simulationData ? (
              <AdvancedAnalytics
                simulationData={simulationData}
                includeEve={includeEve}
              />
            ) : (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <div className="text-4xl mb-4">📊</div>
                    <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
                    <p className="text-muted-foreground mb-4">Run a simulation to see detailed analytics</p>
                    <Button onClick={runSimulation} disabled={isAnimating}>
                      Run First Simulation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="education" className="space-y-6">
            {/* Educational content will be added here */}
          </TabsContent>
        </Tabs>

        {/* Enhanced Simulation Steps */}
        <AnimatePresence>
          {isAnimating && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    📋 Quantum Simulation in Progress
                    <Badge variant="outline" className="animate-pulse">Live</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{currentStep}/{steps.length}</span>
                      </div>
                      <Progress value={(currentStep / steps.length) * 100} className="h-3" />
                    </div>
                    
                    <div className="grid gap-3">
                      {steps.map((step, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`p-4 rounded-lg border transition-all duration-500 ${
                            currentStep > index ? 'bg-primary/10 border-primary shadow-sm' : 
                            currentStep === index + 1 ? 'bg-primary/5 border-primary/50 shadow-md ring-2 ring-primary/20' : 
                            'bg-muted border-border'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                              currentStep > index ? 'bg-primary text-primary-foreground scale-110' : 
                              currentStep === index + 1 ? 'bg-primary/50 text-primary-foreground animate-pulse' : 
                              'bg-muted-foreground text-muted'
                            }`}>
                              {currentStep > index ? '✓' : step.step}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg">{step.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                              {currentStep === index + 1 && (
                                <div className="mt-2 flex items-center gap-2 text-xs text-primary">
                                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                                  Processing...
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Results Section */}
        <AnimatePresence>
          {simulationData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Results Overview */}
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    📊 Simulation Results Overview
                    <Badge variant={simulationData.errorRate > 10 ? "destructive" : "default"}>
                      {simulationData.errorRate > 10 ? "Security Risk" : "Secure"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1 }}
                      className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20"
                    >
                      <div className="text-3xl font-bold text-primary">{simulationData.finalKey.length}</div>
                      <div className="text-sm text-muted-foreground">Final Key Bits</div>
                    </motion.div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-center p-4 bg-secondary/5 rounded-lg border border-secondary/20"
                    >
                      <div className="text-3xl font-bold text-secondary">
                        {((simulationData.finalKey.length / numQubits[0]) * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Efficiency</div>
                    </motion.div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 }}
                      className={`text-center p-4 rounded-lg border ${
                        simulationData.errorRate > 10 
                          ? 'bg-destructive/5 border-destructive/20' 
                          : 'bg-green-500/5 border-green-500/20'
                      }`}
                    >
                      <div className={`text-3xl font-bold ${
                        simulationData.errorRate > 10 ? 'text-destructive' : 'text-green-600'
                      }`}>
                        {simulationData.errorRate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Error Rate</div>
                    </motion.div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-center p-4 bg-muted/50 rounded-lg border"
                    >
                      <div className="text-3xl font-bold text-foreground">
                        {simulationData.matchingBases.filter(Boolean).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Matching Bases</div>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Data Table */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      📋 Detailed Transmission Data
                      <Badge variant="outline">{numQubits[0]} Qubits</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto max-h-96">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-background">
                          <tr className="border-b-2">
                            <th className="text-left p-3 font-semibold">Qubit</th>
                            <th className="text-left p-3 font-semibold">Alice</th>
                            <th className="text-left p-3 font-semibold">Bob</th>
                            <th className="text-left p-3 font-semibold">Status</th>
                            {includeEve && <th className="text-left p-3 font-semibold">Eve</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {simulationData.aliceBits.map((bit, i) => (
                            <motion.tr
                              key={i}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.02 }}
                              className={`border-b transition-colors hover:bg-muted/50 ${
                                simulationData.matchingBases[i] ? 'bg-primary/5' : ''
                              }`}
                            >
                              <td className="p-3">
                                <Badge variant="outline" className="font-mono">#{i + 1}</Badge>
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold">{bit}</span>
                                  <Badge variant={simulationData.aliceBases[i] === 'Z' ? 'default' : 'secondary'}>
                                    {simulationData.aliceBases[i]}
                                  </Badge>
                                </div>
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold">{simulationData.bobBits[i]}</span>
                                  <Badge variant={simulationData.bobBases[i] === 'Z' ? 'default' : 'secondary'}>
                                    {simulationData.bobBases[i]}
                                  </Badge>
                                </div>
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-1">
                                  {simulationData.matchingBases[i] ? (
                                    <Badge variant="default" className="bg-green-500">
                                      ✓ Match
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary">
                                      ✗ Mismatch
                                    </Badge>
                                  )}
                                </div>
                              </td>
                              {includeEve && (
                                <td className="p-3">
                                  {simulationData.eveInterference[i] && (
                                    <Badge variant="destructive">🕵️ Intercepted</Badge>
                                  )}
                                </td>
                              )}
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Enhanced Key Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      🔐 Secret Key Analysis
                      <Badge variant={simulationData.errorRate < 5 ? "default" : "destructive"}>
                        {simulationData.errorRate < 5 ? "Secure" : "Compromised"}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        Final Shared Key:
                        <Badge variant="outline">{simulationData.finalKey.length} bits</Badge>
                      </h4>
                      <div className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border-2 border-primary/20">
                        <code className="text-xl font-mono tracking-wider break-all">
                          {simulationData.finalKey.length > 0 ? simulationData.finalKey.join('') : 'No secure key generated'}
                        </code>
                      </div>
                    </div>

                    {/* Security Assessment */}
                    <div className="space-y-3">
                      <h4 className="font-semibold">Security Assessment:</h4>
                      
                      {simulationData.errorRate < 5 && (
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <h5 className="font-semibold text-green-700 dark:text-green-400">Excellent Security</h5>
                          </div>
                          <p className="text-sm text-green-600 dark:text-green-300">
                            Error rate below 5% indicates no eavesdropping. This key is safe to use for encryption.
                          </p>
                        </div>
                      )}

                      {simulationData.errorRate >= 5 && simulationData.errorRate < 11 && (
                        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <h5 className="font-semibold text-yellow-700 dark:text-yellow-400">Caution Required</h5>
                          </div>
                          <p className="text-sm text-yellow-600 dark:text-yellow-300">
                            Moderate error rate detected. Consider running additional tests before using this key.
                          </p>
                        </div>
                      )}

                      {simulationData.errorRate >= 11 && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            <h5 className="font-semibold text-red-700 dark:text-red-400">Security Breach Detected!</h5>
                          </div>
                          <p className="text-sm text-red-600 dark:text-red-300">
                            High error rate indicates potential eavesdropping. Discard this key and establish a new quantum channel.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Key Usage Recommendations */}
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <h5 className="font-semibold mb-2">💡 Usage Recommendations:</h5>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        {simulationData.finalKey.length >= 128 && (
                          <li>✅ Key length sufficient for AES-128 encryption</li>
                        )}
                        {simulationData.finalKey.length < 128 && simulationData.finalKey.length >= 64 && (
                          <li>⚠️ Consider combining with additional keys for stronger encryption</li>
                        )}
                        {simulationData.finalKey.length < 64 && (
                          <li>❌ Key too short for secure encryption - generate more qubits</li>
                        )}
                        <li>🔄 Use each key only once (one-time pad principle)</li>
                        <li>🛡️ Store keys securely after generation</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Educational Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                🎓 Understanding BB84 Protocol
                <Badge variant="outline">Educational</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="basics" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basics">Basics</TabsTrigger>
                  <TabsTrigger value="quantum">Quantum Magic</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                  <TabsTrigger value="applications">Applications</TabsTrigger>
                </TabsList>

                <TabsContent value="basics" className="space-y-4 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-lg flex items-center gap-2">
                        🔤 The Basics
                      </h4>
                      <ul className="space-y-3 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                          <span><strong>BB84</strong> is a quantum key distribution protocol invented in 1984</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                          <span>Alice prepares <strong>qubits</strong> (quantum bits) in random states</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                          <span>Bob measures these qubits using randomly chosen <strong>bases</strong></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                          <span>They compare bases publicly and keep matching measurements</span>
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-semibold text-lg flex items-center gap-2">
                        ⚙️ How It Works
                      </h4>
                      <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Step 1</Badge>
                          <span>Alice encodes random bits using random bases</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Step 2</Badge>
                          <span>Quantum transmission through channel</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Step 3</Badge>
                          <span>Bob measures with random bases</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Step 4</Badge>
                          <span>Public basis comparison</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Step 5</Badge>
                          <span>Secret key from matching bases</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="quantum" className="space-y-4 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">🔬 Quantum Mechanics Principles</h4>
                      <ul className="space-y-3 text-sm">
                        <li className="p-3 bg-primary/5 rounded border-l-4 border-primary">
                          <strong>Superposition:</strong> Qubits can exist in multiple states simultaneously
                        </li>
                        <li className="p-3 bg-secondary/5 rounded border-l-4 border-secondary">
                          <strong>Measurement:</strong> Observing a qubit collapses it to a definite state
                        </li>
                        <li className="p-3 bg-muted/50 rounded border-l-4 border-muted-foreground">
                          <strong>No-Cloning:</strong> Quantum states cannot be perfectly copied
                        </li>
                        <li className="p-3 bg-destructive/5 rounded border-l-4 border-destructive">
                          <strong>Disturbance:</strong> Any measurement changes the quantum state
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">📐 Measurement Bases</h4>
                      <div className="space-y-3">
                        <div className="p-3 bg-card rounded border">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge>Z Basis</Badge>
                            <span className="text-sm">Rectilinear</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Measures qubits in the computational basis |0⟩ and |1⟩
                          </p>
                        </div>
                        <div className="p-3 bg-card rounded border">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">X Basis</Badge>
                            <span className="text-sm">Diagonal</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Measures qubits in the superposition basis |+⟩ and |−⟩
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="security" className="space-y-4 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">🛡️ Security Guarantees</h4>
                      <div className="space-y-3">
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                          <h5 className="font-semibold text-green-700 dark:text-green-400 mb-2">
                            Information-Theoretic Security
                          </h5>
                          <p className="text-sm text-green-600 dark:text-green-300">
                            Security guaranteed by laws of physics, not computational complexity
                          </p>
                        </div>
                        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                          <h5 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">
                            Eavesdropping Detection
                          </h5>
                          <p className="text-sm text-blue-600 dark:text-blue-300">
                            Any interception attempt introduces detectable errors
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">🕵️ How Eve is Detected</h4>
                      <div className="space-y-2 text-sm">
                        <div className="p-2 bg-muted/50 rounded flex items-center gap-2">
                          <span className="w-6 h-6 bg-destructive/20 rounded-full flex items-center justify-center text-xs">1</span>
                          <span>Eve intercepts and measures qubits</span>
                        </div>
                        <div className="p-2 bg-muted/50 rounded flex items-center gap-2">
                          <span className="w-6 h-6 bg-destructive/20 rounded-full flex items-center justify-center text-xs">2</span>
                          <span>Measurement disturbs quantum states</span>
                        </div>
                        <div className="p-2 bg-muted/50 rounded flex items-center gap-2">
                          <span className="w-6 h-6 bg-destructive/20 rounded-full flex items-center justify-center text-xs">3</span>
                          <span>Eve sends modified qubits to Bob</span>
                        </div>
                        <div className="p-2 bg-muted/50 rounded flex items-center gap-2">
                          <span className="w-6 h-6 bg-destructive/20 rounded-full flex items-center justify-center text-xs">4</span>
                          <span>Increased error rate reveals presence</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="applications" className="space-y-4 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-card rounded-lg border">
                      <h5 className="font-semibold mb-2 flex items-center gap-2">
                        🏛️ Government
                      </h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Classified communications</li>
                        <li>• Military networks</li>
                        <li>• Diplomatic channels</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-card rounded-lg border">
                      <h5 className="font-semibold mb-2 flex items-center gap-2">
                        🏦 Finance
                      </h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Bank transactions</li>
                        <li>• Trading systems</li>
                        <li>• Customer data protection</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-card rounded-lg border">
                      <h5 className="font-semibold mb-2 flex items-center gap-2">
                        🔬 Research
                      </h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Academic collaboration</li>
                        <li>• Quantum networks</li>
                        <li>• Future internet</li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default BB84Simulation;
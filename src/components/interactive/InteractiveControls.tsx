import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';

interface InteractiveControlsProps {
  numQubits: number[];
  setNumQubits: (value: number[]) => void;
  includeEve: boolean;
  setIncludeEve: (value: boolean) => void;
  eveInterceptionRate: number[];
  setEveInterceptionRate: (value: number[]) => void;
  simulationSpeed: number[];
  setSimulationSpeed: (value: number[]) => void;
  onRunSimulation: () => void;
  onRunBatch: () => void;
  onExportData: () => void;
  isAnimating: boolean;
}

export const InteractiveControls: React.FC<InteractiveControlsProps> = ({
  numQubits,
  setNumQubits,
  includeEve,
  setIncludeEve,
  eveInterceptionRate,
  setEveInterceptionRate,
  simulationSpeed,
  setSimulationSpeed,
  onRunSimulation,
  onRunBatch,
  onExportData,
  isAnimating
}) => {
  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🎛️ Advanced Simulation Controls
          <Badge variant="outline">Interactive Mode</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="batch">Batch Mode</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Qubit Count */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  Number of Qubits: 
                  <Badge variant="secondary">{numQubits[0]}</Badge>
                </label>
                <Slider
                  value={numQubits}
                  onValueChange={setNumQubits}
                  max={32}
                  min={4}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>4 qubits</span>
                  <span>32 qubits</span>
                </div>
              </div>

              {/* Eve Toggle */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <div className="font-medium">Include Eavesdropper (Eve)</div>
                  <div className="text-sm text-muted-foreground">
                    Simulate quantum channel interference
                  </div>
                </div>
                <Switch
                  checked={includeEve}
                  onCheckedChange={setIncludeEve}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  onClick={onRunSimulation} 
                  disabled={isAnimating}
                  className="flex-1"
                  size="lg"
                >
                  {isAnimating ? "🔄 Simulating..." : "🚀 Run Simulation"}
                </Button>
                <Button 
                  onClick={onExportData} 
                  variant="outline"
                  size="lg"
                >
                  💾 Export
                </Button>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Simulation Speed */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  Animation Speed: 
                  <Badge variant="secondary">{simulationSpeed[0]}x</Badge>
                </label>
                <Slider
                  value={simulationSpeed}
                  onValueChange={setSimulationSpeed}
                  max={3}
                  min={0.5}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0.5x (Slow)</span>
                  <span>3x (Fast)</span>
                </div>
              </div>

              {/* Eve Interception Rate */}
              {includeEve && (
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    Eve Interception Rate: 
                    <Badge variant="destructive">{eveInterceptionRate[0]}%</Badge>
                  </label>
                  <Slider
                    value={eveInterceptionRate}
                    onValueChange={setEveInterceptionRate}
                    max={100}
                    min={10}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>10% (Minimal)</span>
                    <span>100% (Complete)</span>
                  </div>
                </div>
              )}

              {/* Advanced Options */}
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="sm">
                  🎲 Random Seed
                </Button>
                <Button variant="outline" size="sm">
                  📈 Custom Basis
                </Button>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="batch" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="text-center p-6 bg-muted/50 rounded-lg">
                <h3 className="font-semibold mb-2">🔬 Batch Analysis Mode</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Run multiple simulations to gather statistical data
                </p>
                <Button onClick={onRunBatch} size="lg" className="w-full">
                  🧪 Run 100 Simulations
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-card rounded-lg border">
                  <div className="text-lg font-bold text-primary">🎯</div>
                  <div className="text-xs text-muted-foreground">Statistical Analysis</div>
                </div>
                <div className="p-3 bg-card rounded-lg border">
                  <div className="text-lg font-bold text-primary">📊</div>
                  <div className="text-xs text-muted-foreground">Performance Metrics</div>
                </div>
                <div className="p-3 bg-card rounded-lg border">
                  <div className="text-lg font-bold text-primary">🔍</div>
                  <div className="text-xs text-muted-foreground">Security Assessment</div>
                </div>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

interface AnalyticsProps {
  simulationData: {
    aliceBits: number[];
    aliceBases: string[];
    bobBases: string[];
    bobBits: number[];
    matchingBases: boolean[];
    finalKey: number[];
    eveInterference: boolean[];
    errorRate: number;
  };
  includeEve: boolean;
}

export const AdvancedAnalytics: React.FC<AnalyticsProps> = ({
  simulationData,
  includeEve
}) => {
  const totalQubits = simulationData.aliceBits.length;
  const matchingBases = simulationData.matchingBases.filter(Boolean).length;
  const keyEfficiency = (matchingBases / totalQubits) * 100;
  const eveDetectionRate = includeEve ? simulationData.eveInterference.filter(Boolean).length / totalQubits * 100 : 0;
  
  const securityLevel = simulationData.errorRate < 5 ? 'MAXIMUM' : 
                       simulationData.errorRate < 11 ? 'HIGH' : 
                       simulationData.errorRate < 20 ? 'MEDIUM' : 'COMPROMISED';

  const basisDistribution = {
    aliceZ: simulationData.aliceBases.filter(b => b === 'Z').length,
    aliceX: simulationData.aliceBases.filter(b => b === 'X').length,
    bobZ: simulationData.bobBases.filter(b => b === 'Z').length,
    bobX: simulationData.bobBases.filter(b => b === 'X').length,
  };

  const metrics = [
    {
      label: "Key Efficiency",
      value: keyEfficiency.toFixed(1),
      unit: "%",
      color: "primary",
      description: "Percentage of usable key bits"
    },
    {
      label: "Basis Match Rate",
      value: ((matchingBases / totalQubits) * 100).toFixed(1),
      unit: "%",
      color: "secondary",
      description: "How often Alice and Bob chose the same basis"
    },
    {
      label: "Quantum Fidelity",
      value: (100 - simulationData.errorRate).toFixed(1),
      unit: "%",
      color: simulationData.errorRate < 10 ? "primary" : "destructive",
      description: "Quality of quantum state preservation"
    },
    {
      label: "Security Level",
      value: securityLevel,
      unit: "",
      color: securityLevel === "COMPROMISED" ? "destructive" : "primary",
      description: "Overall communication security"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Security Dashboard */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🛡️ Security Dashboard
            <Badge variant={securityLevel === "COMPROMISED" ? "destructive" : "default"}>
              {securityLevel}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-4 rounded-lg bg-muted/50 border"
              >
                <div className={`text-3xl font-bold ${
                  metric.color === "destructive" ? "text-destructive" : 
                  metric.color === "primary" ? "text-primary" : "text-secondary"
                }`}>
                  {metric.value}{metric.unit}
                </div>
                <div className="text-sm font-medium mt-1">{metric.label}</div>
                <div className="text-xs text-muted-foreground mt-1">{metric.description}</div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Basis Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>📊 Basis Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Alice - Z Basis</span>
                <span>{basisDistribution.aliceZ}/{totalQubits}</span>
              </div>
              <Progress value={(basisDistribution.aliceZ / totalQubits) * 100} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Alice - X Basis</span>
                <span>{basisDistribution.aliceX}/{totalQubits}</span>
              </div>
              <Progress value={(basisDistribution.aliceX / totalQubits) * 100} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Bob - Z Basis</span>
                <span>{basisDistribution.bobZ}/{totalQubits}</span>
              </div>
              <Progress value={(basisDistribution.bobZ / totalQubits) * 100} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Bob - X Basis</span>
                <span>{basisDistribution.bobX}/{totalQubits}</span>
              </div>
              <Progress value={(basisDistribution.bobX / totalQubits) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🔍 Detailed Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-card rounded-lg border text-center">
                <div className="text-xl font-bold text-primary">{totalQubits}</div>
                <div className="text-sm text-muted-foreground">Total Qubits</div>
              </div>
              <div className="p-3 bg-card rounded-lg border text-center">
                <div className="text-xl font-bold text-primary">{matchingBases}</div>
                <div className="text-sm text-muted-foreground">Matching Bases</div>
              </div>
              <div className="p-3 bg-card rounded-lg border text-center">
                <div className="text-xl font-bold text-primary">{simulationData.finalKey.length}</div>
                <div className="text-sm text-muted-foreground">Final Key Length</div>
              </div>
              <div className="p-3 bg-card rounded-lg border text-center">
                <div className={`text-xl font-bold ${includeEve ? "text-destructive" : "text-primary"}`}>
                  {includeEve ? eveDetectionRate.toFixed(1) + "%" : "0%"}
                </div>
                <div className="text-sm text-muted-foreground">Eve Detection</div>
              </div>
            </div>

            {/* Security Recommendations */}
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">💡 Security Recommendations</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                {simulationData.errorRate > 10 && (
                  <li>⚠️ High error rate detected - check for eavesdropping</li>
                )}
                {keyEfficiency < 40 && (
                  <li>📈 Low key efficiency - consider more qubits</li>
                )}
                {!includeEve && (
                  <li>✅ Clean channel - safe to use this key</li>
                )}
                <li>🔄 Run multiple simulations for better statistics</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
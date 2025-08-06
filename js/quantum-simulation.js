// BB84 Quantum Key Distribution Simulation Engine
export class QuantumSimulation {
    constructor() {
        this.parameters = {
            numQubits: 20,
            includeEve: false,
            eveInterceptionRate: 30,
            simulationSpeed: 3,
            noiseLevel: 0.01,
            detectorEfficiency: 0.95
        };
        
        this.isInitialized = false;
        this.serverUrl = 'http://localhost:5000'; // Python backend URL
    }

    async init() {
        try {
            // Test connection to Python backend
            await this.testBackendConnection();
            this.isInitialized = true;
            console.log('Quantum simulation engine initialized');
        } catch (error) {
            console.warn('Python backend not available, using fallback simulation:', error);
            this.isInitialized = true; // Use fallback mode
        }
    }

    async testBackendConnection() {
        const response = await fetch(`${this.serverUrl}/health`);
        if (!response.ok) {
            throw new Error('Backend not responding');
        }
        return await response.json();
    }

    setParameter(param, value) {
        if (param in this.parameters) {
            this.parameters[param] = value;
        }
    }

    setParameters(params) {
        Object.assign(this.parameters, params);
    }

    getParameters() {
        return { ...this.parameters };
    }

    async run(progressCallback) {
        const { numQubits, includeEve, eveInterceptionRate, simulationSpeed } = this.parameters;
        
        // Try to use Python backend first
        try {
            const backendResult = await this.runWithBackend(progressCallback);
            if (backendResult) return backendResult;
        } catch (error) {
            console.warn('Backend simulation failed, using fallback:', error);
        }

        // Fallback to JavaScript simulation
        return this.runFallbackSimulation(progressCallback);
    }

    async runWithBackend(progressCallback) {
        try {
            const response = await fetch(`${this.serverUrl}/simulate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.parameters)
            });

            if (!response.ok) {
                throw new Error('Backend simulation failed');
            }

            const result = await response.json();
            
            // Simulate progress for UI
            for (let i = 0; i <= 100; i += 10) {
                progressCallback(i, this.getStepDescription(i));
                await this.delay(50);
            }

            return result;

        } catch (error) {
            console.error('Backend simulation error:', error);
            return null;
        }
    }

    async runFallbackSimulation(progressCallback) {
        const { numQubits, includeEve, eveInterceptionRate } = this.parameters;
        
        progressCallback(0, 'Initializing quantum states...');
        await this.delay(200);

        // Step 1: Alice generates random bits and bases
        progressCallback(10, 'Alice preparing quantum states...');
        const aliceBits = this.generateRandomBits(numQubits);
        const aliceBases = this.generateRandomBases(numQubits);
        await this.delay(300);

        // Step 2: Alice prepares and sends qubits
        progressCallback(25, 'Transmitting qubits through quantum channel...');
        const transmittedQubits = this.prepareQubits(aliceBits, aliceBases);
        await this.delay(400);

        // Step 3: Eve's potential interference
        let eveInterceptions = new Array(numQubits).fill(false);
        let eveBits = [];
        let eveBases = [];
        
        if (includeEve) {
            progressCallback(40, 'Eve attempting interception...');
            const eveResult = this.simulateEveAttack(transmittedQubits, eveInterceptionRate);
            eveInterceptions = eveResult.interceptions;
            eveBits = eveResult.bits;
            eveBases = eveResult.bases;
            await this.delay(400);
        }

        // Step 4: Bob's measurement
        progressCallback(60, 'Bob measuring received qubits...');
        const bobBases = this.generateRandomBases(numQubits);
        const bobBits = this.measureQubits(transmittedQubits, bobBases, eveInterceptions);
        await this.delay(400);

        // Step 5: Basis comparison
        progressCallback(75, 'Comparing measurement bases...');
        const matchingBases = this.compareBasesWithDelay(aliceBases, bobBases);
        await this.delay(300);

        // Step 6: Key extraction
        progressCallback(90, 'Extracting shared secret key...');
        const finalKey = this.extractKey(aliceBits, bobBits, matchingBases);
        await this.delay(300);

        // Step 7: Error rate calculation
        progressCallback(95, 'Calculating error rates...');
        const errorRate = this.calculateErrorRate(aliceBits, bobBits, matchingBases);
        await this.delay(200);

        progressCallback(100, 'Simulation complete!');

        return {
            aliceBits,
            aliceBases,
            bobBits,
            bobBases,
            eveBits,
            eveBases,
            eveInterceptions,
            matchingBases,
            finalKey,
            errorRate,
            includeEve,
            transmissionEfficiency: matchingBases.filter(m => m).length / numQubits,
            quantumChannelNoise: this.parameters.noiseLevel,
            timestamp: new Date().toISOString()
        };
    }

    generateRandomBits(count) {
        return Array.from({ length: count }, () => Math.random() < 0.5 ? 0 : 1);
    }

    generateRandomBases(count) {
        return Array.from({ length: count }, () => Math.random() < 0.5 ? 'Z' : 'X');
    }

    prepareQubits(bits, bases) {
        return bits.map((bit, index) => ({
            bit,
            basis: bases[index],
            polarization: this.calculatePolarization(bit, bases[index]),
            id: `qubit-${index}`
        }));
    }

    calculatePolarization(bit, basis) {
        // Z basis: 0 = vertical (0°), 1 = horizontal (90°)
        // X basis: 0 = diagonal (45°), 1 = anti-diagonal (135°)
        if (basis === 'Z') {
            return bit === 0 ? 0 : 90;
        } else {
            return bit === 0 ? 45 : 135;
        }
    }

    simulateEveAttack(qubits, interceptionRate) {
        const interceptions = [];
        const eveBits = [];
        const eveBases = [];

        qubits.forEach((qubit, index) => {
            const isIntercepted = Math.random() < (interceptionRate / 100);
            interceptions.push(isIntercepted);

            if (isIntercepted) {
                // Eve measures with random basis
                const eveBasis = Math.random() < 0.5 ? 'Z' : 'X';
                eveBases.push(eveBasis);
                
                // Measurement result depends on basis matching
                let measuredBit;
                if (eveBasis === qubit.basis) {
                    // Correct basis - gets correct result
                    measuredBit = qubit.bit;
                } else {
                    // Wrong basis - random result (quantum measurement)
                    measuredBit = Math.random() < 0.5 ? 0 : 1;
                }
                eveBits.push(measuredBit);
                
                // Eve prepares new qubit based on her measurement
                qubit.bit = measuredBit;
                qubit.basis = eveBasis;
                qubit.polarization = this.calculatePolarization(measuredBit, eveBasis);
                qubit.eveIntercepted = true;
            } else {
                eveBits.push(null);
                eveBases.push(null);
            }
        });

        return {
            interceptions,
            bits: eveBits,
            bases: eveBases
        };
    }

    measureQubits(qubits, bobBases, eveInterceptions) {
        return qubits.map((qubit, index) => {
            const bobBasis = bobBases[index];
            
            // Add detector inefficiency
            if (Math.random() > this.parameters.detectorEfficiency) {
                return Math.random() < 0.5 ? 0 : 1; // Random result for failed detection
            }

            // Add quantum channel noise
            let measurement = qubit.bit;
            if (Math.random() < this.parameters.noiseLevel) {
                measurement = 1 - measurement; // Bit flip due to noise
            }

            // Basis matching affects measurement accuracy
            if (bobBasis === qubit.basis) {
                // Correct basis - should get correct result (with noise)
                return measurement;
            } else {
                // Wrong basis - random measurement result
                return Math.random() < 0.5 ? 0 : 1;
            }
        });
    }

    compareBasesWithDelay(aliceBases, bobBases) {
        return aliceBases.map((aliceBasis, index) => aliceBasis === bobBases[index]);
    }

    extractKey(aliceBits, bobBits, matchingBases) {
        const key = [];
        matchingBases.forEach((matches, index) => {
            if (matches && aliceBits[index] === bobBits[index]) {
                key.push(aliceBits[index]);
            }
        });
        return key;
    }

    calculateErrorRate(aliceBits, bobBits, matchingBases) {
        let matchingCount = 0;
        let errorCount = 0;

        matchingBases.forEach((matches, index) => {
            if (matches) {
                matchingCount++;
                if (aliceBits[index] !== bobBits[index]) {
                    errorCount++;
                }
            }
        });

        return matchingCount > 0 ? errorCount / matchingCount : 0;
    }

    async runBatch(numRuns, progressCallback) {
        const results = [];
        
        for (let i = 0; i < numRuns; i++) {
            const progress = (i / numRuns) * 100;
            progressCallback(progress);
            
            const result = await this.runFallbackSimulation(() => {});
            results.push(result);
            
            // Small delay to prevent UI blocking
            if (i % 10 === 0) {
                await this.delay(10);
            }
        }
        
        progressCallback(100);
        return this.analyzeBatchResults(results);
    }

    analyzeBatchResults(results) {
        const analysis = {
            totalRuns: results.length,
            averageKeyLength: 0,
            averageErrorRate: 0,
            averageEfficiency: 0,
            securityDistribution: { HIGH: 0, MEDIUM: 0, LOW: 0 },
            errorRateDistribution: [],
            keyLengthDistribution: [],
            trends: {
                errorRateByEveRate: {},
                efficiencyByQubitCount: {}
            }
        };

        // Calculate averages
        analysis.averageKeyLength = results.reduce((sum, r) => sum + r.finalKey.length, 0) / results.length;
        analysis.averageErrorRate = results.reduce((sum, r) => sum + r.errorRate, 0) / results.length;
        analysis.averageEfficiency = results.reduce((sum, r) => sum + r.transmissionEfficiency, 0) / results.length;

        // Security level distribution
        results.forEach(result => {
            let securityLevel = 'HIGH';
            if (result.errorRate > 0.11) securityLevel = 'LOW';
            else if (result.errorRate > 0.05) securityLevel = 'MEDIUM';
            
            analysis.securityDistribution[securityLevel]++;
        });

        // Error rate and key length distributions
        analysis.errorRateDistribution = results.map(r => r.errorRate);
        analysis.keyLengthDistribution = results.map(r => r.finalKey.length);

        return analysis;
    }

    getStepDescription(progress) {
        if (progress < 10) return 'Initializing quantum states...';
        if (progress < 25) return 'Alice preparing quantum states...';
        if (progress < 40) return 'Transmitting qubits through quantum channel...';
        if (progress < 60) return 'Eve attempting interception...';
        if (progress < 75) return 'Bob measuring received qubits...';
        if (progress < 90) return 'Comparing measurement bases...';
        if (progress < 95) return 'Extracting shared secret key...';
        if (progress < 100) return 'Calculating error rates...';
        return 'Simulation complete!';
    }

    reset() {
        // Reset any simulation state if needed
        console.log('Quantum simulation reset');
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Educational methods for understanding quantum mechanics
    getQuantumState(bit, basis) {
        // Returns quantum state representation
        if (basis === 'Z') {
            return bit === 0 ? '|0⟩' : '|1⟩';
        } else {
            return bit === 0 ? '|+⟩' : '|-⟩';
        }
    }

    calculateQuantumFidelity(aliceBits, bobBits, matchingBases) {
        // Quantum fidelity calculation for educational purposes
        let totalMatching = 0;
        let correctMeasurements = 0;

        matchingBases.forEach((matches, index) => {
            if (matches) {
                totalMatching++;
                if (aliceBits[index] === bobBits[index]) {
                    correctMeasurements++;
                }
            }
        });

        return totalMatching > 0 ? correctMeasurements / totalMatching : 0;
    }

    getSecurityAnalysis(errorRate, includeEve) {
        const analysis = {
            errorRate,
            securityLevel: 'HIGH',
            eveDetectionProbability: 0,
            recommendations: []
        };

        if (errorRate > 0.11) {
            analysis.securityLevel = 'LOW';
            analysis.recommendations.push('Error rate too high - channel may be compromised');
            analysis.recommendations.push('Consider protocol restart or channel verification');
        } else if (errorRate > 0.05) {
            analysis.securityLevel = 'MEDIUM';
            analysis.recommendations.push('Moderate error rate detected - monitor for eavesdropping');
            analysis.recommendations.push('Consider additional error correction');
        } else {
            analysis.recommendations.push('Error rate within acceptable limits');
            analysis.recommendations.push('Key can be safely used for cryptographic purposes');
        }

        if (includeEve && errorRate > 0.05) {
            analysis.eveDetectionProbability = Math.min(errorRate * 2, 1);
            analysis.recommendations.push(`Eavesdropping detection probability: ${(analysis.eveDetectionProbability * 100).toFixed(1)}%`);
        }

        return analysis;
    }
}
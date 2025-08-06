#!/usr/bin/env python3
"""
BB84 Quantum Key Distribution Engine
Real quantum simulation using Qiskit
"""

import numpy as np
import random
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
import json

try:
    from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister
    from qiskit.providers.aer import AerSimulator
    from qiskit.transpiler.preset_passmanagers import generate_preset_pass_manager
    QISKIT_AVAILABLE = True
except ImportError:
    QISKIT_AVAILABLE = False
    print("Qiskit not available, using classical simulation")

@dataclass
class BB84Result:
    alice_bits: List[int]
    alice_bases: List[str]
    bob_bits: List[int]
    bob_bases: List[str]
    eve_bits: List[Optional[int]]
    eve_bases: List[Optional[str]]
    eve_interceptions: List[bool]
    matching_bases: List[bool]
    final_key: List[int]
    error_rate: float
    include_eve: bool
    transmission_efficiency: float
    quantum_fidelity: float

class BB84Engine:
    def __init__(self):
        self.backend = AerSimulator() if QISKIT_AVAILABLE else None
        
    def simulate(self, params: Dict) -> BB84Result:
        """Run BB84 simulation with given parameters"""
        num_qubits = params.get('numQubits', 20)
        include_eve = params.get('includeEve', False)
        eve_rate = params.get('eveInterceptionRate', 30) / 100
        noise_level = params.get('noiseLevel', 0.01)
        
        if QISKIT_AVAILABLE and num_qubits <= 50:
            return self._quantum_simulation(num_qubits, include_eve, eve_rate, noise_level)
        else:
            return self._classical_simulation(num_qubits, include_eve, eve_rate, noise_level)
    
    def _quantum_simulation(self, num_qubits: int, include_eve: bool, 
                          eve_rate: float, noise_level: float) -> BB84Result:
        """Real quantum simulation using Qiskit"""
        alice_bits = [random.randint(0, 1) for _ in range(num_qubits)]
        alice_bases = [random.choice(['Z', 'X']) for _ in range(num_qubits)]
        bob_bases = [random.choice(['Z', 'X']) for _ in range(num_qubits)]
        
        eve_interceptions = []
        eve_bits = []
        eve_bases = []
        bob_bits = []
        
        for i in range(num_qubits):
            # Create quantum circuit
            qc = QuantumCircuit(1, 1)
            
            # Alice prepares qubit
            if alice_bits[i] == 1:
                qc.x(0)  # Flip to |1⟩
            
            if alice_bases[i] == 'X':
                qc.h(0)  # Hadamard for X basis
            
            # Eve's potential interference
            eve_intercepts = include_eve and random.random() < eve_rate
            eve_interceptions.append(eve_intercepts)
            
            if eve_intercepts:
                eve_basis = random.choice(['Z', 'X'])
                eve_bases.append(eve_basis)
                
                # Eve measures
                if eve_basis == 'X':
                    qc.h(0)
                qc.measure(0, 0)
                
                # Execute Eve's measurement
                pass_manager = generate_preset_pass_manager(backend=self.backend, optimization_level=1)
                transpiled = pass_manager.run(qc)
                job = self.backend.run(transpiled, shots=1)
                result = job.result()
                eve_bit = list(result.get_counts().keys())[0]
                eve_bits.append(int(eve_bit))
                
                # Eve prepares new qubit
                qc_new = QuantumCircuit(1, 1)
                if int(eve_bit) == 1:
                    qc_new.x(0)
                if eve_basis == 'X':
                    qc_new.h(0)
                qc = qc_new
            else:
                eve_bits.append(None)
                eve_bases.append(None)
            
            # Bob's measurement
            if bob_bases[i] == 'X':
                qc.h(0)
            qc.measure(0, 0)
            
            # Execute Bob's measurement
            pass_manager = generate_preset_pass_manager(backend=self.backend, optimization_level=1)
            transpiled = pass_manager.run(qc)
            job = self.backend.run(transpiled, shots=1)
            result = job.result()
            bob_bit = list(result.get_counts().keys())[0]
            bob_bits.append(int(bob_bit))
        
        return self._process_results(alice_bits, alice_bases, bob_bits, bob_bases,
                                   eve_bits, eve_bases, eve_interceptions, include_eve)
    
    def _classical_simulation(self, num_qubits: int, include_eve: bool,
                            eve_rate: float, noise_level: float) -> BB84Result:
        """Classical simulation fallback"""
        alice_bits = [random.randint(0, 1) for _ in range(num_qubits)]
        alice_bases = [random.choice(['Z', 'X']) for _ in range(num_qubits)]
        bob_bases = [random.choice(['Z', 'X']) for _ in range(num_qubits)]
        
        eve_interceptions = []
        eve_bits = []
        eve_bases = []
        bob_bits = []
        
        for i in range(num_qubits):
            # Eve's interference
            eve_intercepts = include_eve and random.random() < eve_rate
            eve_interceptions.append(eve_intercepts)
            
            if eve_intercepts:
                eve_basis = random.choice(['Z', 'X'])
                eve_bases.append(eve_basis)
                
                # Eve measures with quantum uncertainty
                if eve_basis == alice_bases[i]:
                    eve_bit = alice_bits[i]  # Correct measurement
                else:
                    eve_bit = random.randint(0, 1)  # Random due to wrong basis
                eve_bits.append(eve_bit)
                
                # Eve's measurement affects what Bob receives
                transmitted_bit = eve_bit
                transmitted_basis = eve_basis
            else:
                eve_bits.append(None)
                eve_bases.append(None)
                transmitted_bit = alice_bits[i]
                transmitted_basis = alice_bases[i]
            
            # Bob's measurement
            if bob_bases[i] == transmitted_basis:
                bob_bit = transmitted_bit  # Correct basis
                # Add noise
                if random.random() < noise_level:
                    bob_bit = 1 - bob_bit
            else:
                bob_bit = random.randint(0, 1)  # Wrong basis
            
            bob_bits.append(bob_bit)
        
        return self._process_results(alice_bits, alice_bases, bob_bits, bob_bases,
                                   eve_bits, eve_bases, eve_interceptions, include_eve)
    
    def _process_results(self, alice_bits, alice_bases, bob_bits, bob_bases,
                        eve_bits, eve_bases, eve_interceptions, include_eve) -> BB84Result:
        """Process simulation results"""
        # Compare bases
        matching_bases = [a == b for a, b in zip(alice_bases, bob_bases)]
        
        # Extract final key
        final_key = []
        matching_count = 0
        error_count = 0
        
        for i, matches in enumerate(matching_bases):
            if matches:
                matching_count += 1
                if alice_bits[i] == bob_bits[i]:
                    final_key.append(alice_bits[i])
                else:
                    error_count += 1
        
        error_rate = error_count / matching_count if matching_count > 0 else 0
        transmission_efficiency = len(final_key) / len(alice_bits)
        quantum_fidelity = self._calculate_fidelity(alice_bits, bob_bits, matching_bases)
        
        return BB84Result(
            alice_bits=alice_bits,
            alice_bases=alice_bases,
            bob_bits=bob_bits,
            bob_bases=bob_bases,
            eve_bits=eve_bits,
            eve_bases=eve_bases,
            eve_interceptions=eve_interceptions,
            matching_bases=matching_bases,
            final_key=final_key,
            error_rate=error_rate,
            include_eve=include_eve,
            transmission_efficiency=transmission_efficiency,
            quantum_fidelity=quantum_fidelity
        )
    
    def _calculate_fidelity(self, alice_bits, bob_bits, matching_bases):
        """Calculate quantum fidelity"""
        matching_count = sum(matching_bases)
        if matching_count == 0:
            return 0
        
        correct_measurements = sum(1 for i, matches in enumerate(matching_bases) 
                                 if matches and alice_bits[i] == bob_bits[i])
        return correct_measurements / matching_count

if __name__ == "__main__":
    # Test the engine
    engine = BB84Engine()
    params = {
        'numQubits': 20,
        'includeEve': True,
        'eveInterceptionRate': 30,
        'noiseLevel': 0.01
    }
    
    result = engine.simulate(params)
    print(f"Final key length: {len(result.final_key)}")
    print(f"Error rate: {result.error_rate:.3f}")
    print(f"Quantum fidelity: {result.quantum_fidelity:.3f}")
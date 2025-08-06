// Main Application Controller
import { QuantumSimulation } from './quantum-simulation.js';
import { VisualizationEngine } from './3d-visualization.js';
import { AnalyticsEngine } from './analytics-engine.js';
import { UIController } from './ui-controller.js';
import { EducationSystem } from './education-system.js';

class BB84App {
    constructor() {
        this.simulation = new QuantumSimulation();
        this.visualization = new VisualizationEngine();
        this.analytics = new AnalyticsEngine();
        this.ui = new UIController();
        this.education = new EducationSystem();
        
        this.isSimulationRunning = false;
        this.currentStep = 0;
        this.simulationHistory = [];
        
        this.init();
    }

    async init() {
        try {
            console.log('Initializing BB84 Quantum Simulator...');
            
            // Initialize all subsystems
            await this.ui.init();
            await this.simulation.init();
            await this.visualization.init();
            await this.analytics.init();
            await this.education.init();
            
            this.setupEventListeners();
            this.loadUserPreferences();
            
            // Hide loading screen
            setTimeout(() => {
                const loadingScreen = document.getElementById('loading-screen');
                loadingScreen.classList.add('hidden');
            }, 2000);
            
            console.log('BB84 Simulator initialized successfully!');
            
        } catch (error) {
            console.error('Failed to initialize BB84 Simulator:', error);
            this.ui.showNotification('Failed to initialize simulator', 'error');
        }
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Simulation controls
        document.getElementById('run-simulation').addEventListener('click', () => {
            this.runSimulation();
        });

        document.getElementById('reset-simulation').addEventListener('click', () => {
            this.resetSimulation();
        });

        // Parameter controls
        document.getElementById('qubit-count').addEventListener('input', (e) => {
            this.updateParameter('numQubits', parseInt(e.target.value));
        });

        document.getElementById('include-eve').addEventListener('change', (e) => {
            this.updateParameter('includeEve', e.target.checked);
        });

        document.getElementById('eve-rate').addEventListener('input', (e) => {
            this.updateParameter('eveInterceptionRate', parseInt(e.target.value));
        });

        document.getElementById('sim-speed').addEventListener('input', (e) => {
            this.updateParameter('simulationSpeed', parseInt(e.target.value));
        });

        // 3D Controls
        document.getElementById('play-3d').addEventListener('click', () => {
            this.visualization.play();
        });

        document.getElementById('pause-3d').addEventListener('click', () => {
            this.visualization.pause();
        });

        document.getElementById('step-3d').addEventListener('click', () => {
            this.visualization.step();
        });

        document.getElementById('reset-3d').addEventListener('click', () => {
            this.visualization.reset();
        });

        // Analytics controls
        document.getElementById('batch-run').addEventListener('click', () => {
            this.runBatchSimulation();
        });

        document.getElementById('export-data').addEventListener('click', () => {
            this.exportSimulationData();
        });

        document.getElementById('clear-history').addEventListener('click', () => {
            this.clearSimulationHistory();
        });

        // Theme toggle
        document.getElementById('theme-btn').addEventListener('click', () => {
            this.ui.toggleTheme();
        });

        // Window events
        window.addEventListener('resize', () => {
            this.visualization.handleResize();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }

    switchTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });

        // Show selected tab
        document.getElementById(`${tabName}-tab`).classList.add('active');

        // Update navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Tab-specific actions
        switch (tabName) {
            case 'simulation':
                this.visualization.activate();
                break;
            case 'analytics':
                this.analytics.refresh();
                break;
            case 'education':
                this.education.activate();
                break;
        }
    }

    updateParameter(param, value) {
        this.simulation.setParameter(param, value);
        this.ui.updateParameterDisplay(param, value);
        
        // Show/hide Eve controls
        if (param === 'includeEve') {
            const eveControls = document.getElementById('eve-controls');
            const eveCharacter = document.getElementById('eve-character');
            
            if (value) {
                eveControls.style.display = 'block';
                eveCharacter.style.display = 'block';
                this.ui.updateCharacterSpeech('eve', 'Ready to intercept quantum transmissions!');
            } else {
                eveControls.style.display = 'none';
                eveCharacter.style.display = 'none';
            }
        }
    }

    async runSimulation() {
        if (this.isSimulationRunning) return;

        try {
            this.isSimulationRunning = true;
            this.ui.showProgress(true);
            this.ui.updateCharacterSpeech('alice', 'Preparing quantum states...');
            this.ui.updateCharacterSpeech('bob', 'Setting up measurement apparatus...');

            // Start photon animation
            document.getElementById('photon-preview').classList.add('active');

            // Run the simulation
            const results = await this.simulation.run((progress, step) => {
                this.ui.updateProgress(progress, step);
                this.currentStep = progress;
            });

            // Store results
            this.simulationHistory.push(results);
            
            // Update analytics
            this.analytics.addSimulationData(results);
            
            // Update visualization
            this.visualization.setSimulationData(results);
            
            // Update UI
            this.ui.showResults(results);
            this.ui.updateStats(this.getSessionStats());
            
            // Update character speeches
            this.ui.updateCharacterSpeech('alice', `Sent ${results.aliceBits.length} qubits successfully!`);
            this.ui.updateCharacterSpeech('bob', `Received and measured ${results.bobBits.length} qubits!`);
            
            if (results.includeEve) {
                this.ui.updateCharacterSpeech('eve', `Intercepted ${results.eveInterceptions.filter(x => x).length} qubits!`);
            }

            this.ui.showNotification('Simulation completed successfully!', 'success');

        } catch (error) {
            console.error('Simulation failed:', error);
            this.ui.showNotification('Simulation failed: ' + error.message, 'error');
        } finally {
            this.isSimulationRunning = false;
            this.ui.showProgress(false);
            document.getElementById('photon-preview').classList.remove('active');
        }
    }

    resetSimulation() {
        this.simulation.reset();
        this.visualization.reset();
        this.ui.hideResults();
        this.ui.updateProgress(0, 'Ready to simulate');
        this.currentStep = 0;
        
        // Reset character speeches
        this.ui.updateCharacterSpeech('alice', 'Ready to send quantum keys!');
        this.ui.updateCharacterSpeech('bob', 'Waiting to receive...');
        this.ui.updateCharacterSpeech('eve', 'Standing by...');
        
        this.ui.showNotification('Simulation reset', 'info');
    }

    async runBatchSimulation() {
        try {
            this.ui.showNotification('Running batch simulation (100 runs)...', 'info');
            const batchResults = await this.simulation.runBatch(100, (progress) => {
                this.ui.updateProgress(progress, `Batch simulation: ${Math.round(progress)}%`);
            });
            
            this.analytics.setBatchData(batchResults);
            this.ui.showNotification('Batch simulation completed!', 'success');
            
        } catch (error) {
            console.error('Batch simulation failed:', error);
            this.ui.showNotification('Batch simulation failed: ' + error.message, 'error');
        }
    }

    exportSimulationData() {
        try {
            const data = {
                sessionStats: this.getSessionStats(),
                simulationHistory: this.simulationHistory,
                analyticsData: this.analytics.getExportData(),
                timestamp: new Date().toISOString()
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `bb84-simulation-data-${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);

            this.ui.showNotification('Data exported successfully!', 'success');

        } catch (error) {
            console.error('Export failed:', error);
            this.ui.showNotification('Export failed: ' + error.message, 'error');
        }
    }

    clearSimulationHistory() {
        this.simulationHistory = [];
        this.analytics.clearData();
        this.ui.updateStats({
            simulationCount: 0,
            averageKeyLength: '-',
            securityLevel: '-',
            errorRate: '-'
        });
        this.ui.showNotification('Simulation history cleared', 'info');
    }

    getSessionStats() {
        if (this.simulationHistory.length === 0) {
            return {
                simulationCount: 0,
                averageKeyLength: '-',
                securityLevel: '-',
                errorRate: '-'
            };
        }

        const totalSims = this.simulationHistory.length;
        const avgKeyLength = this.simulationHistory.reduce((sum, sim) => sum + sim.finalKey.length, 0) / totalSims;
        const avgErrorRate = this.simulationHistory.reduce((sum, sim) => sum + sim.errorRate, 0) / totalSims;
        
        let securityLevel = 'HIGH';
        if (avgErrorRate > 0.11) securityLevel = 'LOW';
        else if (avgErrorRate > 0.05) securityLevel = 'MEDIUM';

        return {
            simulationCount: totalSims,
            averageKeyLength: Math.round(avgKeyLength * 10) / 10,
            securityLevel,
            errorRate: `${(avgErrorRate * 100).toFixed(1)}%`
        };
    }

    handleKeyboardShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'r':
                    e.preventDefault();
                    this.runSimulation();
                    break;
                case 'e':
                    e.preventDefault();
                    this.exportSimulationData();
                    break;
                case '1':
                    e.preventDefault();
                    this.switchTab('overview');
                    break;
                case '2':
                    e.preventDefault();
                    this.switchTab('simulation');
                    break;
                case '3':
                    e.preventDefault();
                    this.switchTab('analytics');
                    break;
                case '4':
                    e.preventDefault();
                    this.switchTab('education');
                    break;
            }
        }

        // Space to pause/play 3D simulation
        if (e.key === ' ' && document.querySelector('#simulation-tab.active')) {
            e.preventDefault();
            this.visualization.togglePlayPause();
        }
    }

    loadUserPreferences() {
        try {
            const preferences = localStorage.getItem('bb84-preferences');
            if (preferences) {
                const prefs = JSON.parse(preferences);
                this.ui.setTheme(prefs.theme || 'dark');
                this.simulation.setParameters(prefs.simulationParams || {});
            }
        } catch (error) {
            console.warn('Failed to load user preferences:', error);
        }
    }

    saveUserPreferences() {
        try {
            const preferences = {
                theme: this.ui.getCurrentTheme(),
                simulationParams: this.simulation.getParameters()
            };
            localStorage.setItem('bb84-preferences', JSON.stringify(preferences));
        } catch (error) {
            console.warn('Failed to save user preferences:', error);
        }
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.bb84App = new BB84App();
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.bb84App) {
        window.bb84App.saveUserPreferences();
    }
});
/**
 * FlexNetSim Playground - Interactive interface for optical network simulations
 * 
 * This component provides a tabbed interface for running up to three simulations
 * with different parameters. Each simulation has a 3-stage workflow:
 * 1. Network Settings - Configure the network topology and physical parameters
 * 2. Parameters - Set simulation parameters like algorithm and connection rates
 * 3. Results - View simulation progress and results in real-time
 * 
 * The interface features Chrome-style tabs with a "+" button to add new simulations,
 * real-time progress tracking, and proper handling of multiple simulation instances.
 */

import React, { useState, useRef, useEffect } from 'react';
import Layout from '@theme/Layout';
import clsx from 'clsx';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Heading from '@theme/Heading';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import styles from './playground.module.css';

// API endpoint for FlexNetSim simulation service
const API_URL = 'https://fns-api-cloud-run-787143541358.us-central1.run.app/run_simulation_stream';

// Available network topologies
const NETWORKS = ['NSFNet', 'Cost239', 'EuroCore', 'GermanNet', 'UKNet'];

// Available algorithms
const ALGORITHMS = ['FirstFit', 'ExactFit'];

// Available bitrate types
const BITRATES = ['fixed-rate', 'flex-rate'];

// Generate a unique ID
const generateId = () => Math.floor(Math.random() * 1000000);

function PlaygroundPage() {
  const { siteConfig } = useDocusaurusContext();
  
  // Define simulation stages
  const STAGES = {
    NETWORK: 1,
    PARAMETERS: 2,
    RESULTS: 3
  };
  
  // State for all simulations
  const [simulations, setSimulations] = useState([
    {
      id: generateId(),
      name: "Simulation 1",
      stage: STAGES.NETWORK,
      isSimulating: false,
      outputLines: [],
      progress: 0,
      params: {
        algorithm: 'FirstFit',
        networkType: 1,
        goalConnections: 100000,
        confidence: 0.05,
        lambdaParam: 1.0,
        mu: 10.0,
        network: 'NSFNet',
        bitrate: 'fixed-rate',
        K: 3
      }
    }
  ]);
  
  // Active tab state
  const [activeTab, setActiveTab] = useState("sim-0");
  
  // Refs for output containers and event sources
  const outputRefs = useRef({});
  const eventSourceRefs = useRef({});
  
  // Scroll to bottom of output container when lines are added
  useEffect(() => {
    simulations.forEach(sim => {
      if (outputRefs.current[sim.id] && sim.outputLines.length > 0) {
        outputRefs.current[sim.id].scrollTop = outputRefs.current[sim.id].scrollHeight;
      }
    });
  }, [simulations]);

  // Clean up event sources on unmount
  useEffect(() => {
    return () => {
      Object.values(eventSourceRefs.current).forEach(source => {
        if (source) source.close();
      });
    };
  }, []);
  
  // Update a specific simulation's state
  const updateSimulation = (id, updates) => {
    setSimulations(prevSims => prevSims.map(sim => 
      sim.id === id ? { ...sim, ...(typeof updates === 'function' ? updates(sim) : updates) } : sim
    ));
  };
  
  // Handle form field changes
  const handleParamChange = (id, e) => {
    const { name, value } = e.target;
    // Convert numeric values
    const parsedValue = ['goalConnections', 'networkType', 'K'].includes(name)
      ? parseInt(value, 10)
      : ['lambdaParam', 'mu', 'confidence'].includes(name)
      ? parseFloat(value)
      : value;

    updateSimulation(id, sim => ({
      params: {
        ...sim.params,
        [name]: parsedValue
      }
    }));
  };

  // Add a new simulation tab
  const addSimulation = () => {
    if (simulations.length >= 3) return; // Maximum 3 simulations
    
    const newSimIndex = simulations.length;
    const newSimId = generateId();
    
    // Create the new simulation object
    const newSimulation = {
      id: newSimId,
      name: `Simulation ${newSimIndex + 1}`,
      stage: STAGES.NETWORK,
      isSimulating: false,
      outputLines: [],
      progress: 0,
      params: {
        algorithm: 'FirstFit',
        networkType: 1,
        goalConnections: 100000,
        confidence: 0.05,
        lambdaParam: 1.0,
        mu: 10.0,
        network: 'NSFNet',
        bitrate: 'fixed-rate',
        K: 3
      }
    };
    
    // Using a functional state update to ensure we get the latest state
    // and can reliably switch to the new tab
    setSimulations(prev => {
      // First update the simulations
      const newSims = [...prev, newSimulation];
      
      // Then switch to the new tab (after a small delay to ensure React has processed the state change)
      setTimeout(() => {
        setActiveTab(`sim-${newSims.length - 1}`);
      }, 10);
      
      return newSims;
    });
  };
  
  // Remove a simulation tab
  const removeSimulation = (index) => {
    // Can't remove if only one simulation
    if (simulations.length <= 1) return;
    
    const simToRemove = simulations[index];
    
    // Close any active event source
    if (eventSourceRefs.current[simToRemove.id]) {
      eventSourceRefs.current[simToRemove.id].close();
      delete eventSourceRefs.current[simToRemove.id];
    }
    
    setSimulations(prev => prev.filter((_, idx) => idx !== index));
    
    // Switch to first tab if we removed the active tab
    if (activeTab === `sim-${index}`) {
      setActiveTab("sim-0");
    } else if (parseInt(activeTab.split('-')[1]) > index) {
      // If we removed a tab before the active tab, adjust the active tab index
      const newActiveIdx = parseInt(activeTab.split('-')[1]) - 1;
      setActiveTab(`sim-${newActiveIdx}`);
    }
  };
  
  // Update simulation name
  const updateSimulationName = (index, name) => {
    const sim = simulations[index];
    if (!sim) return;
    
    updateSimulation(sim.id, { name });
  };
  
  // Function to run simulation with mock data for demo/development purposes
  const runMockSimulation = (id) => {
    const simulation = simulations.find(sim => sim.id === id);
    if (!simulation) return;
    
    const currentParams = simulation.params;
    
    updateSimulation(id, { 
      stage: STAGES.RESULTS,
      isSimulating: true,
      outputLines: [],
      progress: 0
    });
    
    // Mock simulation data matching the exact format from the example
    const mockOutput = [
      "--- Flex Net Sim (0.8.0) ---",
      " ",
      `Nodes:              ${currentParams.network === 'NSFNet' ? '14' : currentParams.network === 'Cost239' ? '11' : '16'}`,
      `Links:              ${currentParams.network === 'NSFNet' ? '42' : currentParams.network === 'Cost239' ? '26' : '48'}`,
      `Goal Connections:   ${currentParams.goalConnections}`,
      `Lambda:             ${currentParams.lambdaParam}`,
      `Mu:                 ${currentParams.mu}`,
      `Algorithm:          ${currentParams.algorithm}`,
      " ",
      "+----------+----------+----------+----------+----------+----------+----------+",
      "| progress | arrives  | blocking | time(s)  | Wald CI  | A-C. CI  | Wilson CI|",
      "+----------+----------+----------+----------+----------+----------+----------+"
    ];
    
    // Add all these lines immediately
    updateSimulation(id, {
      outputLines: mockOutput
    });
    
    // Track the step counter in an outer variable
    let step = 0;
    const totalSteps = 20;
    
    // Generate progress updates
    const mockInterval = setInterval(() => {
      step++;
      
      if (step <= totalSteps) {
        const progressPct = step * 5;
        const arrives = Math.floor((progressPct / 100) * currentParams.goalConnections);
        const blocking = (Math.random() * 5).toFixed(1) + 'e-05';
        const time = Math.floor(progressPct * 75 / 100);
        const waldCI = (Math.random() * 2).toFixed(1) + 'e-05';
        const acCI = (Math.random() * 5 + 1).toFixed(1) + 'e-05';
        const wilsonCI = (Math.random() * 4 + 1).toFixed(1) + 'e-05';
        
        const progressLine = `|   ${progressPct.toFixed(1)}%  | ${arrives.toString().padStart(6, ' ')}   |  ${blocking} |      ${time.toString().padStart(2, ' ')}  |  ${waldCI} |  ${acCI} |  ${wilsonCI} |`;
        
        updateSimulation(id, sim => ({
          outputLines: [...sim.outputLines, progressLine],
          progress: progressPct
        }));
      } else {
        clearInterval(mockInterval);
        updateSimulation(id, { isSimulating: false });
      }
    }, 1000);
    
    return () => clearInterval(mockInterval);
  };

  // Start the simulation process
  const startSimulation = async (id) => {
    const simulation = simulations.find(sim => sim.id === id);
    if (!simulation) return;
    
    const currentParams = simulation.params;
    
    updateSimulation(id, { 
      stage: STAGES.RESULTS,
      isSimulating: true,
      outputLines: [],
      progress: 0
    });
    
    // Close any existing event source
    if (eventSourceRefs.current[id]) {
      eventSourceRefs.current[id].close();
    }

    // Add initial message about connecting to the API
    updateSimulation(id, {
      outputLines: ["Connecting to FlexNetSim API..."]
    });

    try {
      // Toggle between API and mock mode
      // For development/demo, set this to true to use mock data instead of real API
      const useMockData = true;
      
      if (useMockData) {
        runMockSimulation(id);
        return;
      }
      
      // Set up Server-Sent Events connection
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentParams),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      // Process the stream
      const processStream = async () => {
        while (true) {
          try {
            const { done, value } = await reader.read();
            
            if (done) {
              updateSimulation(id, { isSimulating: false });
              break;
            }
            
            // Decode the received chunk and add it to our buffer
            buffer += decoder.decode(value, { stream: true });
            
            // Process complete SSE messages in the buffer
            let lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep the last incomplete line in buffer
            
            for (const line of lines) {
              if (line.startsWith('data:')) {
                try {
                  const eventData = JSON.parse(line.substring(5).trim());
                  
                  if (eventData.status === 'running' && eventData.data) {
                    // Add the new line to our output
                    updateSimulation(id, sim => ({
                      outputLines: [...sim.outputLines, eventData.data]
                    }));
                    
                    // Extract progress information if available
                    const progressMatch = eventData.data.match(/\s*(\d+\.\d+)%\s*\|/);
                    if (progressMatch && progressMatch[1]) {
                      updateSimulation(id, {
                        progress: parseFloat(progressMatch[1])
                      });
                    }
                  }
                  
                  if (eventData.status === 'completed' || eventData.status === 'error') {
                    updateSimulation(id, { isSimulating: false });
                  }
                } catch (e) {
                  console.error('Error parsing SSE data:', e);
                  updateSimulation(id, sim => ({
                    outputLines: [...sim.outputLines, `Warning: Error parsing data from server: ${e.message}`]
                  }));
                }
              }
            }
          } catch (streamError) {
            console.error('Error reading stream:', streamError);
            updateSimulation(id, sim => ({
              outputLines: [...sim.outputLines, `Error reading data stream: ${streamError.message}`],
              isSimulating: false
            }));
            break;
          }
        }
      };

      processStream();
    } catch (error) {
      console.error('Error starting simulation:', error);
      updateSimulation(id, sim => ({
        outputLines: [
          ...sim.outputLines,
          `Error: ${error.message}`,
          "",
          "Possible reasons:",
          "- The API server might be down or unreachable",
          "- CORS policies might be preventing the connection",
          "- Network connectivity issues",
          "",
          "Using mock simulation data instead..."
        ]
      }));
      
      // Fall back to mock data on error
      setTimeout(() => {
        runMockSimulation(id);
      }, 2000);
    }
  };

  // Move to next stage in the workflow
  const advanceStage = (id) => {
    updateSimulation(id, sim => ({
      stage: sim.stage < STAGES.RESULTS ? sim.stage + 1 : sim.stage
    }));
  };

  // Move to previous stage in the workflow
  const goBack = (id) => {
    updateSimulation(id, sim => ({
      stage: sim.stage > STAGES.NETWORK ? sim.stage - 1 : sim.stage
    }));
  };

  // Render progress steps for a simulation
  const renderStageIndicator = (simulation) => {
    return (
      <div className={styles.stageContainer}>
        <div className={styles.stageIndicator}>
          <div 
            className={clsx(styles.stageStep, simulation.stage >= STAGES.NETWORK && styles.activeStage)}
            onClick={() => !simulation.isSimulating && updateSimulation(simulation.id, { stage: STAGES.NETWORK })}
          >
            <span className={styles.stageNumber}>1</span>
            <span className={styles.stageName}>Network</span>
          </div>
          <div className={styles.stageLine}></div>
          <div 
            className={clsx(styles.stageStep, simulation.stage >= STAGES.PARAMETERS && styles.activeStage)}
            onClick={() => !simulation.isSimulating && simulation.stage >= STAGES.PARAMETERS && 
              updateSimulation(simulation.id, { stage: STAGES.PARAMETERS })}
          >
            <span className={styles.stageNumber}>2</span>
            <span className={styles.stageName}>Parameters</span>
          </div>
          <div className={styles.stageLine}></div>
          <div 
            className={clsx(styles.stageStep, simulation.stage >= STAGES.RESULTS && styles.activeStage)}
            onClick={() => !simulation.isSimulating && simulation.stage >= STAGES.RESULTS && 
              updateSimulation(simulation.id, { stage: STAGES.RESULTS })}
          >
            <span className={styles.stageNumber}>3</span>
            <span className={styles.stageName}>Results</span>
          </div>
        </div>
      </div>
    );
  };
  
  // Render the network settings stage for a simulation
  const renderNetworkSettings = (simulation) => {
    return (
      <div className={styles.parametersContainer}>
        <Heading as="h3" className={styles.sectionTitle}>Network Settings</Heading>
        
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label htmlFor={`network-${simulation.id}`}>Network Topology</label>
            <select 
              id={`network-${simulation.id}`}
              name="network"
              value={simulation.params.network}
              onChange={(e) => handleParamChange(simulation.id, e)}
              className={styles.select}
            >
              {NETWORKS.map(network => (
                <option key={network} value={network}>{network}</option>
              ))}
            </select>
            <span className={styles.inputHint}>Physical network to simulate</span>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor={`networkType-${simulation.id}`}>Network Type</label>
            <select 
              id={`networkType-${simulation.id}`}
              name="networkType"
              value={simulation.params.networkType}
              onChange={(e) => handleParamChange(simulation.id, e)}
              className={styles.select}
            >
              <option value={1}>EON (Elastic Optical Network)</option>
            </select>
            <span className={styles.inputHint}>Only EON is currently supported</span>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor={`bitrate-${simulation.id}`}>Bitrate Type</label>
            <select 
              id={`bitrate-${simulation.id}`}
              name="bitrate"
              value={simulation.params.bitrate}
              onChange={(e) => handleParamChange(simulation.id, e)}
              className={styles.select}
            >
              {BITRATES.map(bitrate => (
                <option key={bitrate} value={bitrate}>{bitrate}</option>
              ))}
            </select>
            <span className={styles.inputHint}>Fixed or flex-rate transmission</span>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor={`K-${simulation.id}`}>Path Count (K)</label>
            <input 
              type="number" 
              id={`K-${simulation.id}`}
              name="K"
              min="1"
              max="6"
              value={simulation.params.K}
              onChange={(e) => handleParamChange(simulation.id, e)}
              className={styles.input}
            />
            <span className={styles.inputHint}>Number of candidate paths (1-6)</span>
          </div>
        </div>
        
        <div className={styles.buttonContainer}>
          <button 
            className={styles.primaryButton}
            onClick={() => advanceStage(simulation.id)}
          >
            Next: Simulation Parameters
          </button>
        </div>
      </div>
    );
  };
  
  // Render the simulation parameters stage for a simulation
  const renderSimulationParameters = (simulation) => {
    return (
      <div className={styles.parametersContainer}>
        <Heading as="h3" className={styles.sectionTitle}>Simulation Parameters</Heading>
        
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label htmlFor={`algorithm-${simulation.id}`}>RSA Algorithm</label>
            <select 
              id={`algorithm-${simulation.id}`}
              name="algorithm"
              value={simulation.params.algorithm}
              onChange={(e) => handleParamChange(simulation.id, e)}
              className={styles.select}
            >
              {ALGORITHMS.map(algorithm => (
                <option key={algorithm} value={algorithm}>{algorithm}</option>
              ))}
            </select>
            <span className={styles.inputHint}>Resource allocation algorithm</span>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor={`goalConnections-${simulation.id}`}>Target Connections</label>
            <input 
              type="number" 
              id={`goalConnections-${simulation.id}`}
              name="goalConnections"
              min="1000"
              max="10000000"
              value={simulation.params.goalConnections}
              onChange={(e) => handleParamChange(simulation.id, e)}
              className={styles.input}
            />
            <span className={styles.inputHint}>Number of connection requests</span>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor={`lambdaParam-${simulation.id}`}>Arrival Rate (λ)</label>
            <input 
              type="number" 
              id={`lambdaParam-${simulation.id}`}
              name="lambdaParam"
              min="0.1"
              step="0.1"
              value={simulation.params.lambdaParam}
              onChange={(e) => handleParamChange(simulation.id, e)}
              className={styles.input}
            />
            <span className={styles.inputHint}>Connection arrival rate</span>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor={`mu-${simulation.id}`}>Service Rate (μ)</label>
            <input 
              type="number" 
              id={`mu-${simulation.id}`}
              name="mu"
              min="0.1"
              step="0.1"
              value={simulation.params.mu}
              onChange={(e) => handleParamChange(simulation.id, e)}
              className={styles.input}
            />
            <span className={styles.inputHint}>Connection service rate</span>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor={`confidence-${simulation.id}`}>Confidence Level</label>
            <input 
              type="number" 
              id={`confidence-${simulation.id}`}
              name="confidence"
              min="0.01"
              max="0.99"
              step="0.01"
              value={simulation.params.confidence}
              onChange={(e) => handleParamChange(simulation.id, e)}
              className={styles.input}
            />
            <span className={styles.inputHint}>Statistical confidence (0.05 = 95%)</span>
          </div>
        </div>
        
        <div className={styles.buttonContainer}>
          <button 
            className={styles.secondaryButton}
            onClick={() => goBack(simulation.id)}
          >
            Back
          </button>
          <button 
            className={styles.primaryButton}
            onClick={() => startSimulation(simulation.id)}
            disabled={simulation.isSimulating}
          >
            {simulation.isSimulating ? 'Simulating...' : 'Run Simulation'}
          </button>
        </div>
      </div>
    );
  };
  
  // Render the results stage for a simulation
  const renderSimulationResults = (simulation) => {
    return (
      <div className={styles.resultsContainer}>
        <div className={styles.resultsHeader}>
          <Heading as="h3" className={styles.sectionTitle}>Simulation Results</Heading>
          
          {simulation.isSimulating && (
            <div className={styles.progressContainer}>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill} 
                  style={{ width: `${simulation.progress}%` }}
                ></div>
              </div>
              <span className={styles.progressText}>{simulation.progress.toFixed(1)}% Complete</span>
            </div>
          )}
        </div>
        
        <div 
          className={styles.outputContainer} 
          ref={el => outputRefs.current[simulation.id] = el}
        >
          <pre className={styles.outputPre}>
            {simulation.outputLines.map((line, index) => (
              <div key={index} className={styles.outputLine}>
                {line}
              </div>
            ))}
            {simulation.isSimulating && <div className={styles.cursor}>▋</div>}
          </pre>
        </div>
        
        <div className={styles.buttonContainer}>
          <button 
            className={styles.secondaryButton}
            onClick={() => goBack(simulation.id)}
            disabled={simulation.isSimulating}
          >
            Back
          </button>
          
          {!simulation.isSimulating && simulation.outputLines.length > 0 && (
            <button 
              className={styles.primaryButton}
              onClick={() => startSimulation(simulation.id)}
            >
              Run Again
            </button>
          )}
        </div>
      </div>
    );
  };
  
  // Render the content for a simulation based on its current stage
  const renderSimulationContent = (simulation) => {
    switch (simulation.stage) {
      case STAGES.NETWORK:
        return renderNetworkSettings(simulation);
      case STAGES.PARAMETERS:
        return renderSimulationParameters(simulation);
      case STAGES.RESULTS:
        return renderSimulationResults(simulation);
      default:
        return null;
    }
  };

  // We no longer need this as we're now rendering tabs directly
  const handleTabNameUpdate = (e, index) => {
    e.stopPropagation();
    updateSimulationName(index, e.target.value);
  };

  return (
    <Layout
      title={`Playground | ${siteConfig.title}`}
      description="Interactive playground for FlexNetSim optical network simulations">
      <div className={styles.appContainer}>
        <header className={styles.header}>
          <Heading as="h1">Optical Network Simulation Playground</Heading>
          <p className={styles.subtitle}>
            Experiment with the Flex Net Sim C++ library through an interactive interface
          </p>
        </header>

        <div className={styles.mainContentWrapper}>
          <div className={styles.tabsContainer}>
            {/* Main tab interface with Chrome-style add tab button */}
            <div className={styles.tabsHeader}>
              <div className={styles.tabsList}>
                {simulations.map((sim, index) => (
                  <div 
                    key={`tab-${index}`}
                    className={clsx(
                      styles.tabButton, 
                      activeTab === `sim-${index}` && styles.activeTab,
                      sim.isSimulating && styles.simulatingTab
                    )}
                    onClick={() => setActiveTab(`sim-${index}`)}
                  >
                    <span className={styles.tabLabel}>
                      {sim.name}
                      {sim.isSimulating && (
                        <span className={styles.tabProgress}>
                          {" "}({sim.progress.toFixed(0)}%)
                        </span>
                      )}
                    </span>
                    {index > 0 && (
                      <button 
                        className={styles.tabCloseButton}
                        onClick={(e) => {
                          e.stopPropagation(); 
                          removeSimulation(index);
                        }}
                        disabled={sim.isSimulating}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                
                {/* Chrome-style add tab button */}
                {simulations.length < 3 && (
                  <button 
                    className={styles.addTabButton}
                    onClick={addSimulation}
                    title="Add new simulation"
                  >
                    +
                  </button>
                )}
              </div>
            </div>
            
            {/* Tab content area with fixed height */}
            <div className={styles.tabsContentArea}>
              {simulations.map((sim, index) => (
                <div 
                  key={`content-${index}`}
                  className={clsx(
                    styles.tabContent,
                    activeTab === `sim-${index}` ? styles.activeContent : styles.hiddenContent
                  )}
                >
                  {renderStageIndicator(sim)}
                  {renderSimulationContent(sim)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default PlaygroundPage;
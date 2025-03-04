---
sidebar_position: 2
---

# Developer Guide

This guide provides detailed information about the implementation of the FlexNetSim Playground page, its architecture, and how to extend or modify it.

## Overview

The Playground is a web-based interface for FlexNetSim, an optical network simulation library. It allows users to run up to three independent simulations with different parameters and compare their results.

The interface uses a Chrome-style tabbed design where each tab represents an independent simulation. Users can add, name, and remove simulation tabs (up to a maximum of 3). Each simulation follows a 3-stage workflow:

1. **Network Settings**: Configure the network topology and physical characteristics
2. **Parameters**: Set simulation parameters like algorithm, request counts, and rates
3. **Results**: View real-time progress and output from the simulation

## Recent Changes

- Redesigned the interface with Chrome-style tabs for better user experience
- Implemented a "+"-button tab control for adding new simulations
- Optimized container width (1900px) to accommodate simulation output without scrolling
- Added proper dark mode support with theme-appropriate colors
- Fixed tab switching and simulation output formatting
- Improved responsiveness for various screen sizes

## File Structure

- **`/src/pages/playground.js`**: Main component implementation
- **`/src/pages/playground.module.css`**: Component styling

## Component Architecture

The Playground uses React functional components with hooks to manage state and lifecycle. 

### State Management

The primary state is managed in the `simulations` array, which stores objects with the following structure:

```javascript
{
  id: 123456,              // Unique identifier for the simulation
  name: "Simulation 1",    // User-editable name displayed in the tab
  stage: 1,                // Current workflow stage (1-3)
  isSimulating: false,     // Whether simulation is running
  outputLines: [],         // Output text lines from simulation
  progress: 0,             // Progress percentage (0-100)
  params: {                // Simulation parameters
    algorithm: 'FirstFit', // RSA algorithm
    networkType: 1,        // Network type (EON)
    goalConnections: 100000, // Target connection requests
    confidence: 0.05,      // Statistical confidence (95%)
    lambdaParam: 1.0,      // Connection arrival rate 
    mu: 10.0,              // Connection service rate
    network: 'NSFNet',     // Network topology
    bitrate: 'fixed-rate', // Bitrate type
    K: 3                   // Number of candidate paths
  }
}
```

Other key state variables:
- `activeTab`: Tracks which tab is currently active (format: "sim-0", "sim-1", etc.)

### Key Components

- **Custom Tab System**: Implements a Chrome-style tabbed interface with "+" button for adding tabs
- **Stage Indicator**: Visual indicator for the 3-stage workflow process with numbered steps
- **Simulation Forms**: Dynamic forms for configuring network and simulation parameters
- **Results Display**: Terminal-like output with progress bar and formatted simulation results
- **API Integration**: Supports streaming updates from server or mock data for development
- **Dark Mode Support**: Automatically adapts to the user's theme preference

## Adding or Modifying Features

### Adding a New Parameter

1. Add the parameter to the initial state in `useState` for simulations
2. Add form control in the appropriate stage render function
3. Update the API request payload (in `startSimulation`)

Example:
```javascript
// Add to initial state
{
  params: {
    // ...existing params
    newParam: defaultValue,
  }
}

// Add form control
<div className={styles.formGroup}>
  <label htmlFor={`newParam-${simulation.id}`}>New Parameter</label>
  <input 
    type="text" 
    id={`newParam-${simulation.id}`}
    name="newParam"
    value={simulation.params.newParam}
    onChange={(e) => handleParamChange(simulation.id, e)}
    className={styles.input}
  />
  <span className={styles.inputHint}>Description of the parameter</span>
</div>
```

### Adding a New Stage

1. Update the `STAGES` constant in the component
2. Add a new render function for the stage
3. Update the stage indicator component to include the new stage
4. Add case to the `renderSimulationContent` switch statement

### Styling Guidelines

- Use CSS modules (imported as `styles`) for component styling
- Follow the established color scheme using Docusaurus CSS variables
- For dark mode support, use `[data-theme='dark']` selectors in the CSS
- Use custom CSS variables to maintain consistent theming in both light and dark mode
- Keep fixed dimensions for the container width (1900px) to ensure simulation output fits properly
- Maintain responsive design for various screen sizes, falling back gracefully on smaller displays

## API Integration

The Playground connects to the FlexNetSim API or uses mock data for development. Key functions:

- `startSimulation`: Initiates the simulation and sets up streaming updates
- `runMockSimulation`: Generates mock data for testing without API
- `processStream`: Handles the streaming response from the server

To switch between real API and mock data, modify:
```javascript
const useMockData = true; // Set to false to use real API
```

When implementing a real API connection, ensure proper error handling and maintain the same data format as the mock implementation.

## Troubleshooting

### Common Issues

1. **Tab management issues**: Check the `activeTab` state and ensure proper cleanup when removing tabs
2. **Simulation state not updating**: Verify the correct simulation ID is being passed to `updateSimulation`
3. **UI not reflecting parameter changes**: Check that form inputs have correct `name` attributes matching params
4. **Dark mode inconsistencies**: Ensure appropriate theme variables in CSS

### Development Tools

- Use React DevTools to inspect component state
- Monitor network traffic when testing API integration
- Check browser console for errors or warnings

## Future Improvements

Potential enhancements to consider:

1. **Simulation Comparison**: Add side-by-side comparison of multiple simulation results
2. **Visualization**: Add charts and graphs to visualize simulation results
3. **Configuration Management**: Save/load simulation configurations for reuse
4. **Simulation Presets**: Add predefined settings for common simulation scenarios
5. **Export Functionality**: Allow exporting results in various formats (CSV, JSON, etc.)
6. **Responsive Design**: Improve mobile and tablet support with adaptive layouts
7. **Real-time Collaboration**: Allow multiple users to view the same simulation with shared state

## API Reference

### Constants

- `NETWORKS`: Available network topologies (NSFNet, Cost239, EuroCore, etc.)
- `ALGORITHMS`: Available RSA algorithms (FirstFit, ExactFit, etc.)
- `BITRATES`: Available bitrate modes (fixed-rate, flex-rate)
- `STAGES`: Workflow stages object defining the three simulation stages

### Key Functions

- `updateSimulation(id, updates)`: Updates a specific simulation's state by ID
- `handleParamChange(id, event)`: Handles form input changes and converts to appropriate types
- `addSimulation()`: Adds a new simulation tab and switches to it
- `removeSimulation(index)`: Removes a simulation tab and handles tab switching
- `updateSimulationName(index, name)`: Updates the name displayed in the tab
- `startSimulation(id)`: Starts the simulation process and switches to results view
- `runMockSimulation(id)`: Generates mock simulation data for testing
- `advanceStage(id)` / `goBack(id)`: Navigate between simulation workflow stages

### UI Components

- `renderStageIndicator(simulation)`: Renders the 3-step workflow indicator
- `renderNetworkSettings(simulation)`: Renders the network configuration form
- `renderSimulationParameters(simulation)`: Renders the simulation parameters form
- `renderSimulationResults(simulation)`: Renders the output display and progress indicators
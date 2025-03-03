# FlexNetSim WebApp Changelog

## [Unreleased]

### Added
- Chrome-style tabbed interface for simulations
- "+" button tab for adding new simulations (up to 3)
- Fixed-width optimized container (1900px) for simulation display
- Dark mode support with consistent theming
- Tab renaming functionality
- Proper tab management with automatic switching to new tabs
- Improved simulation output formatting matching the CLI format

### Changed
- Redesigned simulation workflow UI with 3-stage process indicators
- Improved layout for network and parameter settings
- Enhanced results view with better progress indicators
- Optimized mock simulation output to match real output format
- Improved real-time progress reporting in both tab headers and results view

### Fixed
- Tab switching when adding or removing simulation tabs
- Output display formatting to prevent horizontal scrolling
- Dark mode inconsistencies in the tab interface
- Simulation progress tracking with proper data updates
- Error handling with graceful fallback to mock data

## [0.1.0] - Initial Release - 2024-06-20

### Added
- Basic simulation interface
- Support for configuring network parameters
- Support for setting simulation parameters
- Mock simulation data for development/testing
- API integration for real simulations
- Initial styling for light and dark mode
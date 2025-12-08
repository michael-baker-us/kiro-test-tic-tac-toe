// Main application entry point
import { createStateManager } from './src/stateManager.js';
import { createGameController } from './src/gameController.js';
import { createUIController } from './src/uiController.js';

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Check if battle mode is enabled
  const battleModeEnabled = localStorage.getItem('battleMode') === 'true';
  
  // Set checkbox state
  const battleModeCheckbox = document.getElementById('battleModeCheckbox');
  if (battleModeCheckbox) {
    battleModeCheckbox.checked = battleModeEnabled;
  }
  
  // Restore game mode preference
  const savedGameMode = localStorage.getItem('gameMode') || 'pvp';
  const gameModeRadios = document.querySelectorAll('input[name="gameMode"]');
  gameModeRadios.forEach(radio => {
    if (radio.value === savedGameMode) {
      radio.checked = true;
    }
  });
  
  // Show/hide difficulty selector based on saved mode
  const difficultySelector = document.getElementById('difficultySelector');
  if (difficultySelector) {
    difficultySelector.style.display = savedGameMode === 'ai' ? 'block' : 'none';
  }
  
  // Create state manager with battle mode option
  const stateManager = createStateManager({ battleMode: battleModeEnabled });
  
  // Create game controller
  const gameController = createGameController(stateManager);
  
  // Set the game mode from saved preference
  gameController.setGameMode(savedGameMode);
  
  // Create UI controller
  const uiController = createUIController(stateManager, gameController);
  
  // Initialize the UI controller (subscribes to state and renders)
  uiController.init();
});

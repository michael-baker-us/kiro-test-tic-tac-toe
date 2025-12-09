// Main application entry point
import createTicTacToeGame from './src/games/tic-tac-toe/index.js';
import createSnakeGame from './src/games/snake/index.js';

// Game instances
let snakeGame = null;
let ticTacToeGame = null;

// Current active game
let activeGame = 'snake';

/**
 * Initialize both games
 */
async function initGames() {
  const snakeContainer = document.getElementById('snake-container');
  const ticTacToeContainer = document.getElementById('tic-tac-toe-container');
  
  try {
    // Initialize Snake game
    snakeGame = createSnakeGame();
    await snakeGame.init(snakeContainer);
    
    // Initialize Tic-Tac-Toe game
    ticTacToeGame = createTicTacToeGame();
    await ticTacToeGame.init(ticTacToeContainer);
    
    // Show default game
    showGame('snake');
  } catch (error) {
    console.error('Failed to initialize games:', error);
    document.getElementById('app').innerHTML = `
      <div class="error-message">
        <h2>Failed to load games</h2>
        <p>${error.message}</p>
        <button onclick="location.reload()">Reload Page</button>
      </div>
    `;
  }
}

/**
 * Switch between games
 * @param {string} gameName - Name of the game to show ('snake' or 'tic-tac-toe')
 */
function showGame(gameName) {
  const snakeContainer = document.getElementById('snake-container');
  const ticTacToeContainer = document.getElementById('tic-tac-toe-container');
  
  // Hide all containers
  snakeContainer.style.display = 'none';
  ticTacToeContainer.style.display = 'none';
  
  // Show selected container
  if (gameName === 'snake') {
    snakeContainer.style.display = 'block';
  } else if (gameName === 'tic-tac-toe') {
    ticTacToeContainer.style.display = 'block';
  }
  
  activeGame = gameName;
}

/**
 * Update tab styles to reflect active game
 * @param {string} activeGameName - Name of the active game
 */
function updateTabStyles(activeGameName) {
  const tabButtons = document.querySelectorAll('.tab-button');
  tabButtons.forEach(button => {
    if (button.dataset.game === activeGameName) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });
}

/**
 * Set up tab navigation
 */
function setupTabNavigation() {
  const tabButtons = document.querySelectorAll('.tab-button');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const gameName = button.dataset.game;
      showGame(gameName);
      updateTabStyles(gameName);
    });
  });
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  setupTabNavigation();
  initGames();
});

// Main application entry point
import { Router } from './src/router.js';
import { GameRegistry } from './src/gameRegistry.js';
import { LandingPage } from './src/landingPage.js';
import { ErrorHandler } from './src/errorHandler.js';
import createTicTacToeGame from './src/games/tic-tac-toe/index.js';
import createSnakeGame from './src/games/snake/index.js';

// Page state management
let currentPage = null;
let currentGameInstance = null;
let landingPageInstance = null;
let errorHandler = null;

// Get DOM containers
const landingContainer = document.getElementById('landing-container');
const gameContainer = document.getElementById('game-container');
const gameContent = document.getElementById('game-content');
const backButton = document.getElementById('back-button');

// Initialize game registry
const gameRegistry = new GameRegistry();

// Register tic-tac-toe game with error handling
try {
  gameRegistry.registerGame({
    id: 'tic-tac-toe',
    name: 'Tic-Tac-Toe',
    description: 'Classic strategy game for two players',
    route: '/tic-tac-toe',
    loader: async () => createTicTacToeGame()
  });
} catch (error) {
  console.error('Failed to register tic-tac-toe game:', error);
  // This is a critical error during initialization
  // Show error immediately if DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      showRegistrationError(error);
    });
  } else {
    showRegistrationError(error);
  }
}

// Register snake game with error handling
try {
  gameRegistry.registerGame({
    id: 'snake',
    name: 'Snake',
    description: 'Classic arcade game - eat food and grow longer!',
    route: '/snake',
    loader: async () => createSnakeGame()
  });
} catch (error) {
  console.error('Failed to register snake game:', error);
  // This is a critical error during initialization
  // Show error immediately if DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      showRegistrationError(error);
    });
  } else {
    showRegistrationError(error);
  }
}

// Initialize router
const router = new Router();

/**
 * Show landing page and hide game page
 */
function showLandingPage() {
  // Clean up current game if any
  if (currentGameInstance) {
    currentGameInstance.destroy();
    currentGameInstance = null;
  }
  
  // Hide game container
  gameContainer.style.display = 'none';
  
  // Show landing container
  landingContainer.style.display = 'block';
  
  // Render landing page if not already rendered
  if (!landingPageInstance) {
    landingPageInstance = new LandingPage(gameRegistry, (route) => {
      router.navigate(route);
    }, router);
  }
  
  landingPageInstance.render(landingContainer);
  currentPage = 'landing';
  
  // Update page title
  document.title = 'Game Collection';
}

/**
 * Show game page and hide landing page
 * @param {string} route - The game route
 */
async function showGamePage(route) {
  // Clean up landing page
  if (landingPageInstance) {
    landingPageInstance.destroy();
  }
  
  // Hide landing container
  landingContainer.style.display = 'none';
  
  // Show game container
  gameContainer.style.display = 'block';
  
  // Find the game by route
  const game = gameRegistry.getGameByRoute(route);
  
  if (!game) {
    console.error(`No game found for route: ${route}`);
    // Show 404 error in game container
    show404Error(route);
    return;
  }
  
  try {
    // Clear any previous error
    gameContent.innerHTML = '';
    
    // Load and initialize the game
    const gameInstance = await game.loader();
    await gameInstance.init(gameContent);
    
    currentGameInstance = gameInstance;
    currentPage = 'game';
    
    // Update page title
    document.title = game.name;
  } catch (error) {
    console.error('Failed to load game:', error);
    // Show error with retry option
    showGameLoadError(game.name, error, route);
  }
}

// Register back button as a navigation element
router.registerNavigationElement(backButton);

// Set up back button handler
backButton.addEventListener('click', () => {
  router.navigate('/');
});

// Configure router routes
router.registerRoute('/', () => {
  showLandingPage();
});

router.registerRoute('/tic-tac-toe', () => {
  showGamePage('/tic-tac-toe');
});

router.registerRoute('/snake', () => {
  showGamePage('/snake');
});

/**
 * Show 404 error page
 * @param {string} path - The invalid path
 */
function show404Error(path) {
  // Initialize error handler if needed
  if (!errorHandler) {
    errorHandler = new ErrorHandler(gameContent);
  }
  
  errorHandler.show404Error(path, () => {
    router.navigate('/');
  });
  
  currentPage = 'error';
  document.title = 'Page Not Found';
}

/**
 * Show game loading error
 * @param {string} gameName - Name of the game that failed
 * @param {Error} error - The error that occurred
 * @param {string} route - The game route for retry
 */
function showGameLoadError(gameName, error, route) {
  // Initialize error handler if needed
  if (!errorHandler) {
    errorHandler = new ErrorHandler(gameContent);
  }
  
  errorHandler.showGameLoadError(
    gameName,
    error,
    () => {
      router.navigate('/');
    },
    () => {
      // Retry loading the game
      showGamePage(route);
    }
  );
  
  currentPage = 'error';
  document.title = 'Error Loading Game';
}

/**
 * Show registration error (critical error during initialization)
 * @param {Error} error - The validation error
 */
function showRegistrationError(error) {
  // Show error in landing container
  if (!errorHandler) {
    errorHandler = new ErrorHandler(landingContainer);
  }
  
  landingContainer.style.display = 'block';
  gameContainer.style.display = 'none';
  
  errorHandler.showValidationError(error);
  
  currentPage = 'error';
  document.title = 'Configuration Error';
}

// Handle 404 errors
router.registerRoute('404', (path) => {
  console.warn(`Invalid route: ${path}`);
  show404Error(path);
});

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  router.init();
});

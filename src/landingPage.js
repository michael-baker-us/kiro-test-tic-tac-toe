/**
 * LandingPage - Main landing page component that displays available games
 * 
 * Renders game tiles from the game registry and handles navigation to games.
 */
export class LandingPage {
  /**
   * Create a new LandingPage instance
   * @param {GameRegistry} gameRegistry - The game registry containing available games
   * @param {Function} onNavigate - Callback function for navigation (receives game route)
   * @param {Router} router - Optional router instance for registering navigation elements
   */
  constructor(gameRegistry, onNavigate, router = null) {
    this.gameRegistry = gameRegistry;
    this.onNavigate = onNavigate;
    this.router = router;
    this.container = null;
    this.tileClickHandlers = new Map();
  }

  /**
   * Render the landing page into a container element
   * @param {HTMLElement} container - The container element to render into
   */
  render(container) {
    if (!container) {
      throw new Error('Container element is required');
    }

    this.container = container;
    this.container.innerHTML = '';
    this.container.className = 'landing-page';

    // Create and append title
    const title = document.createElement('h1');
    title.className = 'landing-title';
    title.textContent = 'Game Collection';
    this.container.appendChild(title);

    // Get all games from registry
    const games = this.gameRegistry.getAllGames();

    // Handle empty registry case
    if (games.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'empty-message';
      emptyMessage.textContent = 'No games are currently available';
      this.container.appendChild(emptyMessage);
      return;
    }

    // Create game tiles container
    const tilesContainer = document.createElement('div');
    tilesContainer.className = 'game-tiles';
    
    // Create a tile for each game
    games.forEach(game => {
      const tile = this.createGameTile(game);
      tilesContainer.appendChild(tile);
    });

    this.container.appendChild(tilesContainer);
  }

  /**
   * Create a game tile element
   * @param {Object} gameConfig - Game configuration object
   * @returns {HTMLElement} The game tile element
   */
  createGameTile(gameConfig) {
    const tile = document.createElement('div');
    tile.className = 'game-tile';
    tile.setAttribute('data-game-id', gameConfig.id);

    // Add thumbnail if available
    if (gameConfig.thumbnail) {
      const thumbnail = document.createElement('img');
      thumbnail.className = 'game-thumbnail';
      thumbnail.src = gameConfig.thumbnail;
      thumbnail.alt = `${gameConfig.name} thumbnail`;
      tile.appendChild(thumbnail);
    }

    // Create content container
    const content = document.createElement('div');
    content.className = 'game-tile-content';

    // Add game name
    const name = document.createElement('h2');
    name.className = 'game-name';
    name.textContent = gameConfig.name;
    content.appendChild(name);

    // Add game description
    const description = document.createElement('p');
    description.className = 'game-description';
    description.textContent = gameConfig.description;
    content.appendChild(description);

    tile.appendChild(content);

    // Add click handler
    const clickHandler = () => this.handleTileClick(gameConfig.id);
    tile.addEventListener('click', clickHandler);
    
    // Store handler for cleanup
    this.tileClickHandlers.set(tile, clickHandler);
    
    // Register tile with router for interaction blocking
    if (this.router) {
      this.router.registerNavigationElement(tile);
    }

    return tile;
  }

  /**
   * Handle tile click events
   * @param {string} gameId - The ID of the clicked game
   */
  handleTileClick(gameId) {
    const game = this.gameRegistry.getGame(gameId);
    if (game && this.onNavigate) {
      this.onNavigate(game.route);
    }
  }

  /**
   * Clean up event listeners and resources
   */
  destroy() {
    // Unregister tiles from router
    if (this.router) {
      this.tileClickHandlers.forEach((handler, tile) => {
        this.router.unregisterNavigationElement(tile);
      });
    }
    
    // Remove all tile click handlers
    this.tileClickHandlers.forEach((handler, tile) => {
      tile.removeEventListener('click', handler);
    });
    this.tileClickHandlers.clear();

    // Clear container
    if (this.container) {
      this.container.innerHTML = '';
      this.container = null;
    }
  }
}

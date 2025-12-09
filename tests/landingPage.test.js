import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LandingPage } from '../src/landingPage.js';
import { GameRegistry } from '../src/gameRegistry.js';

describe('LandingPage', () => {
  let gameRegistry;
  let landingPage;
  let mockNavigate;
  let container;

  beforeEach(() => {
    gameRegistry = new GameRegistry();
    mockNavigate = vi.fn();
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  describe('render()', () => {
    it('should render landing page with title', () => {
      landingPage = new LandingPage(gameRegistry, mockNavigate);
      landingPage.render(container);

      const title = container.querySelector('.landing-title');
      expect(title).toBeTruthy();
      expect(title.textContent).toBe('Game Collection');
    });

    it('should render game tiles for registered games', () => {
      gameRegistry.registerGame({
        id: 'test-game',
        name: 'Test Game',
        description: 'A test game',
        route: '/test-game',
        loader: async () => ({})
      });

      landingPage = new LandingPage(gameRegistry, mockNavigate);
      landingPage.render(container);

      const tiles = container.querySelectorAll('.game-tile');
      expect(tiles.length).toBe(1);
      
      const gameName = container.querySelector('.game-name');
      expect(gameName.textContent).toBe('Test Game');
      
      const gameDescription = container.querySelector('.game-description');
      expect(gameDescription.textContent).toBe('A test game');
    });

    it('should render multiple game tiles', () => {
      gameRegistry.registerGame({
        id: 'game-1',
        name: 'Game 1',
        description: 'First game',
        route: '/game-1',
        loader: async () => ({})
      });
      
      gameRegistry.registerGame({
        id: 'game-2',
        name: 'Game 2',
        description: 'Second game',
        route: '/game-2',
        loader: async () => ({})
      });

      landingPage = new LandingPage(gameRegistry, mockNavigate);
      landingPage.render(container);

      const tiles = container.querySelectorAll('.game-tile');
      expect(tiles.length).toBe(2);
    });

    it('should display empty message when no games are registered', () => {
      landingPage = new LandingPage(gameRegistry, mockNavigate);
      landingPage.render(container);

      const emptyMessage = container.querySelector('.empty-message');
      expect(emptyMessage).toBeTruthy();
      expect(emptyMessage.textContent).toBe('No games are currently available');
      
      const tiles = container.querySelectorAll('.game-tile');
      expect(tiles.length).toBe(0);
    });

    it('should render thumbnail when game has thumbnail property', () => {
      gameRegistry.registerGame({
        id: 'game-with-thumb',
        name: 'Game With Thumbnail',
        description: 'Has a thumbnail',
        route: '/game-with-thumb',
        loader: async () => ({}),
        thumbnail: 'https://example.com/thumb.jpg'
      });

      landingPage = new LandingPage(gameRegistry, mockNavigate);
      landingPage.render(container);

      const thumbnail = container.querySelector('.game-thumbnail');
      expect(thumbnail).toBeTruthy();
      expect(thumbnail.src).toBe('https://example.com/thumb.jpg');
      expect(thumbnail.alt).toBe('Game With Thumbnail thumbnail');
    });

    it('should not render thumbnail when game has no thumbnail', () => {
      gameRegistry.registerGame({
        id: 'game-no-thumb',
        name: 'Game Without Thumbnail',
        description: 'No thumbnail',
        route: '/game-no-thumb',
        loader: async () => ({})
      });

      landingPage = new LandingPage(gameRegistry, mockNavigate);
      landingPage.render(container);

      const thumbnail = container.querySelector('.game-thumbnail');
      expect(thumbnail).toBeFalsy();
    });

    it('should throw error if container is not provided', () => {
      landingPage = new LandingPage(gameRegistry, mockNavigate);
      
      expect(() => landingPage.render(null)).toThrow('Container element is required');
    });
  });

  describe('handleTileClick()', () => {
    it('should call onNavigate with game route when tile is clicked', () => {
      gameRegistry.registerGame({
        id: 'clickable-game',
        name: 'Clickable Game',
        description: 'Click me',
        route: '/clickable-game',
        loader: async () => ({})
      });

      landingPage = new LandingPage(gameRegistry, mockNavigate);
      landingPage.render(container);

      const tile = container.querySelector('.game-tile');
      tile.click();

      expect(mockNavigate).toHaveBeenCalledWith('/clickable-game');
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('should handle clicks on multiple different tiles', () => {
      gameRegistry.registerGame({
        id: 'game-1',
        name: 'Game 1',
        description: 'First',
        route: '/game-1',
        loader: async () => ({})
      });
      
      gameRegistry.registerGame({
        id: 'game-2',
        name: 'Game 2',
        description: 'Second',
        route: '/game-2',
        loader: async () => ({})
      });

      landingPage = new LandingPage(gameRegistry, mockNavigate);
      landingPage.render(container);

      const tiles = container.querySelectorAll('.game-tile');
      
      tiles[0].click();
      expect(mockNavigate).toHaveBeenCalledWith('/game-1');
      
      tiles[1].click();
      expect(mockNavigate).toHaveBeenCalledWith('/game-2');
      
      expect(mockNavigate).toHaveBeenCalledTimes(2);
    });
  });

  describe('destroy()', () => {
    it('should remove event listeners and clear container', () => {
      gameRegistry.registerGame({
        id: 'test-game',
        name: 'Test Game',
        description: 'Test',
        route: '/test-game',
        loader: async () => ({})
      });

      landingPage = new LandingPage(gameRegistry, mockNavigate);
      landingPage.render(container);

      const tile = container.querySelector('.game-tile');
      
      landingPage.destroy();

      // Click should not trigger navigation after destroy
      tile.click();
      expect(mockNavigate).not.toHaveBeenCalled();

      // Container should be cleared
      expect(container.innerHTML).toBe('');
    });

    it('should handle destroy when not rendered', () => {
      landingPage = new LandingPage(gameRegistry, mockNavigate);
      
      // Should not throw error
      expect(() => landingPage.destroy()).not.toThrow();
    });
  });
});

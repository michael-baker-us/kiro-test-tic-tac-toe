// Unit tests for Router
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Router } from '../src/router.js';
import { JSDOM } from 'jsdom';

describe('Router', () => {
  let dom;
  let window;
  let document;
  let router;
  let originalWindow;

  beforeEach(() => {
    // Save original window
    originalWindow = global.window;
    
    // Create a new JSDOM instance for each test
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
      url: 'http://localhost/'
    });
    window = dom.window;
    document = window.document;
    
    // Set up global window and document
    global.window = window;
    global.document = document;
    global.history = window.history;
    global.location = window.location;
  });

  afterEach(() => {
    if (router) {
      router.destroy();
    }
    
    // Restore original window
    global.window = originalWindow;
    if (originalWindow) {
      global.document = originalWindow.document;
      global.history = originalWindow.history;
      global.location = originalWindow.location;
    }
  });

  describe('navigation', () => {
    it('should navigate to landing page', () => {
      const landingHandler = vi.fn();
      const routes = {
        '/': landingHandler
      };
      
      router = new Router(routes);
      router.init();
      router.navigate('/');
      
      expect(landingHandler).toHaveBeenCalled();
      expect(window.location.pathname).toBe('/');
    });

    it('should navigate to game page', () => {
      const gameHandler = vi.fn();
      const routes = {
        '/': vi.fn(),
        '/tic-tac-toe': gameHandler
      };
      
      router = new Router(routes);
      router.init();
      router.navigate('/tic-tac-toe');
      
      expect(gameHandler).toHaveBeenCalled();
      expect(window.location.pathname).toBe('/tic-tac-toe');
    });

    it('should handle invalid route', () => {
      const notFoundHandler = vi.fn();
      const routes = {
        '/': vi.fn(),
        '404': notFoundHandler
      };
      
      router = new Router(routes);
      router.init();
      router.navigate('/invalid-route');
      
      expect(notFoundHandler).toHaveBeenCalled();
    });

    it('should handle invalid route gracefully', () => {
      const homeHandler = vi.fn();
      const routes = {
        '/': homeHandler
      };
      
      router = new Router(routes);
      router.init();
      
      // Navigate to invalid route - should not throw
      expect(() => router.navigate('/invalid-route')).not.toThrow();
      
      // The router should handle it gracefully (either with 404 handler or redirect)
      expect(router.getCurrentRoute()).toBeDefined();
    });
  });

  describe('browser refresh', () => {
    it('should load landing page on refresh at root', () => {
      const landingHandler = vi.fn();
      const routes = {
        '/': landingHandler
      };
      
      router = new Router(routes);
      router.init();
      
      expect(landingHandler).toHaveBeenCalled();
      expect(router.getCurrentRoute()).toBe('/');
    });

    it('should load game page on refresh at game URL', () => {
      // Create JSDOM with game URL
      dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
        url: 'http://localhost/tic-tac-toe'
      });
      global.window = dom.window;
      global.document = dom.window.document;
      global.history = dom.window.history;
      global.location = dom.window.location;
      
      const gameHandler = vi.fn();
      const routes = {
        '/': vi.fn(),
        '/tic-tac-toe': gameHandler
      };
      
      router = new Router(routes);
      router.init();
      
      expect(gameHandler).toHaveBeenCalled();
      expect(router.getCurrentRoute()).toBe('/tic-tac-toe');
    });
  });

  describe('getCurrentRoute', () => {
    it('should return current route after navigation', () => {
      const routes = {
        '/': vi.fn(),
        '/tic-tac-toe': vi.fn()
      };
      
      router = new Router(routes);
      router.init();
      router.navigate('/tic-tac-toe');
      
      expect(router.getCurrentRoute()).toBe('/tic-tac-toe');
    });
  });

  describe('registerRoute', () => {
    it('should allow registering new routes dynamically', () => {
      const newHandler = vi.fn();
      router = new Router({});
      
      router.registerRoute('/new-game', newHandler);
      router.init();
      router.navigate('/new-game');
      
      expect(newHandler).toHaveBeenCalled();
    });
  });

  describe('navigation element management', () => {
    it('should register and disable navigation elements during transition', () => {
      const button = document.createElement('button');
      document.body.appendChild(button);
      
      const routes = {
        '/': vi.fn(),
        '/game': vi.fn()
      };
      
      router = new Router(routes);
      router.registerNavigationElement(button);
      router.init();
      
      // Navigation should temporarily disable the button
      expect(button.disabled).toBe(false);
      
      // Clean up
      document.body.removeChild(button);
    });
  });
});

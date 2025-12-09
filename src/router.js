/**
 * Client-side Router for managing navigation between pages
 * Implements URL management using the History API
 */
export class Router {
  /**
   * Create a new Router instance
   * @param {Object} routes - Map of route paths to handler functions
   *   Example: { '/': landingPageHandler, '/tic-tac-toe': gameHandler }
   */
  constructor(routes = {}) {
    this.routes = routes;
    this.currentRoute = null;
    this.isNavigating = false;
    this.navigationElements = new Set();
    
    // Bind methods to maintain context
    this.handlePopState = this.handlePopState.bind(this);
  }
  
  /**
   * Initialize the router
   * Sets up event listeners and renders the initial page based on current URL
   */
  init() {
    // Listen for browser back/forward button events
    window.addEventListener('popstate', this.handlePopState);
    
    // Handle initial page load
    const initialPath = window.location.pathname;
    this.renderRoute(initialPath);
  }
  
  /**
   * Navigate to a specific route
   * @param {string} path - The path to navigate to (e.g., '/', '/tic-tac-toe')
   * @param {boolean} pushState - Whether to push to browser history (default: true)
   */
  navigate(path, pushState = true) {
    // Validate path
    if (!path || typeof path !== 'string') {
      console.error('Invalid path provided to navigate:', path);
      path = '/';
    }
    
    // Prevent concurrent navigation
    if (this.isNavigating) {
      console.warn('Navigation already in progress, ignoring request');
      return;
    }
    
    this.isNavigating = true;
    this.disableNavigation();
    
    try {
      // Update browser URL if needed
      if (pushState && path !== window.location.pathname) {
        window.history.pushState({ path }, '', path);
      }
      
      // Render the route
      this.renderRoute(path);
    } catch (error) {
      console.error('Navigation error:', error);
      // Try to recover by going to home
      if (path !== '/') {
        this.renderRoute('/');
      }
    } finally {
      this.isNavigating = false;
      this.enableNavigation();
    }
  }
  
  /**
   * Handle browser back/forward button events
   * @param {PopStateEvent} event - The popstate event
   */
  handlePopState(event) {
    const path = event.state?.path || window.location.pathname;
    this.renderRoute(path); // Don't push to history for back/forward
  }
  
  /**
   * Render the appropriate page for a given route
   * @param {string} path - The path to render
   * @private
   */
  renderRoute(path) {
    // Find matching route handler
    const handler = this.routes[path];
    
    if (handler) {
      try {
        // Store current route
        this.currentRoute = path;
        
        // Call the route handler
        handler(path);
      } catch (error) {
        console.error(`Error rendering route ${path}:`, error);
        // Try to handle as 404
        this.handle404(path);
      }
    } else {
      // Handle 404 - route not found
      this.handle404(path);
    }
  }
  
  /**
   * Handle 404 errors for invalid routes
   * @param {string} path - The invalid path
   * @private
   */
  handle404(path) {
    console.error(`Route not found: ${path}`);
    
    // Check if there's a 404 handler registered
    if (this.routes['404']) {
      this.routes['404'](path);
    } else {
      // Default 404 handling - redirect to home
      console.warn('No 404 handler registered, redirecting to home');
      this.navigate('/', true);
    }
  }
  
  /**
   * Get the current route path
   * @returns {string} The current route path
   */
  getCurrentRoute() {
    return this.currentRoute || window.location.pathname;
  }
  
  /**
   * Register a new route
   * @param {string} path - The route path
   * @param {Function} handler - The handler function for this route
   */
  registerRoute(path, handler) {
    this.routes[path] = handler;
  }
  
  /**
   * Register a navigation element to be disabled during transitions
   * @param {HTMLElement} element - The element to register
   */
  registerNavigationElement(element) {
    if (element) {
      this.navigationElements.add(element);
    }
  }
  
  /**
   * Unregister a navigation element
   * @param {HTMLElement} element - The element to unregister
   */
  unregisterNavigationElement(element) {
    this.navigationElements.delete(element);
  }
  
  /**
   * Disable all registered navigation elements
   * @private
   */
  disableNavigation() {
    this.navigationElements.forEach(element => {
      // Store original pointer-events style if not already stored
      if (!element.dataset.originalPointerEvents) {
        element.dataset.originalPointerEvents = element.style.pointerEvents || 'auto';
      }
      
      // Disable the element
      if (element.tagName === 'BUTTON' || element.tagName === 'INPUT') {
        element.disabled = true;
      }
      
      // Prevent pointer events
      element.style.pointerEvents = 'none';
      element.style.opacity = '0.6';
    });
  }
  
  /**
   * Enable all registered navigation elements
   * @private
   */
  enableNavigation() {
    this.navigationElements.forEach(element => {
      // Re-enable the element
      if (element.tagName === 'BUTTON' || element.tagName === 'INPUT') {
        element.disabled = false;
      }
      
      // Restore pointer events
      const originalPointerEvents = element.dataset.originalPointerEvents || 'auto';
      element.style.pointerEvents = originalPointerEvents;
      element.style.opacity = '1';
      
      // Clean up stored value
      delete element.dataset.originalPointerEvents;
    });
  }
  
  /**
   * Clean up the router
   * Removes event listeners
   */
  destroy() {
    window.removeEventListener('popstate', this.handlePopState);
    this.navigationElements.clear();
  }
}

/**
 * ErrorHandler - Centralized error handling and display
 * 
 * Provides methods to display user-friendly error messages
 * and handle various error scenarios.
 */
export class ErrorHandler {
  /**
   * Create a new ErrorHandler instance
   * @param {HTMLElement} container - Container element for error messages
   */
  constructor(container) {
    this.container = container;
    this.currentErrorElement = null;
  }

  /**
   * Display a 404 error for invalid routes
   * @param {string} path - The invalid path that was requested
   * @param {Function} onReturnHome - Callback to return to home page
   */
  show404Error(path, onReturnHome) {
    const errorContent = `
      <div class="error-container error-404">
        <div class="error-icon">🔍</div>
        <h1 class="error-title">Page Not Found</h1>
        <p class="error-message">
          The page <code>${this.escapeHtml(path)}</code> doesn't exist.
        </p>
        <p class="error-hint">
          The game you're looking for might have been removed or the URL might be incorrect.
        </p>
        <button class="error-button" id="error-return-home">
          Return to Game Collection
        </button>
      </div>
    `;

    this.displayError(errorContent, () => {
      const button = document.getElementById('error-return-home');
      if (button && onReturnHome) {
        button.addEventListener('click', onReturnHome);
      }
    });
  }

  /**
   * Display a game loading error
   * @param {string} gameName - Name of the game that failed to load
   * @param {Error} error - The error that occurred
   * @param {Function} onReturnHome - Callback to return to home page
   * @param {Function} onRetry - Optional callback to retry loading
   */
  showGameLoadError(gameName, error, onReturnHome, onRetry = null) {
    const errorMessage = error?.message || 'Unknown error occurred';
    const showRetry = typeof onRetry === 'function';

    const errorContent = `
      <div class="error-container error-game-load">
        <div class="error-icon">⚠️</div>
        <h1 class="error-title">Failed to Load Game</h1>
        <p class="error-message">
          We couldn't load <strong>${this.escapeHtml(gameName)}</strong>.
        </p>
        <details class="error-details">
          <summary>Technical Details</summary>
          <pre class="error-stack">${this.escapeHtml(errorMessage)}</pre>
        </details>
        <div class="error-actions">
          ${showRetry ? '<button class="error-button error-button-secondary" id="error-retry">Try Again</button>' : ''}
          <button class="error-button" id="error-return-home">
            Return to Game Collection
          </button>
        </div>
      </div>
    `;

    this.displayError(errorContent, () => {
      const homeButton = document.getElementById('error-return-home');
      if (homeButton && onReturnHome) {
        homeButton.addEventListener('click', onReturnHome);
      }

      if (showRetry) {
        const retryButton = document.getElementById('error-retry');
        if (retryButton && onRetry) {
          retryButton.addEventListener('click', onRetry);
        }
      }
    });

    // Log error for debugging
    console.error(`Game loading error for ${gameName}:`, error);
  }

  /**
   * Display a validation error for game configuration
   * @param {Error} error - The validation error
   */
  showValidationError(error) {
    const errorMessage = error?.message || 'Invalid game configuration';

    const errorContent = `
      <div class="error-container error-validation">
        <div class="error-icon">❌</div>
        <h1 class="error-title">Configuration Error</h1>
        <p class="error-message">
          There was a problem with the game configuration:
        </p>
        <pre class="error-stack">${this.escapeHtml(errorMessage)}</pre>
        <p class="error-hint">
          This is a developer error. Please check the game registration code.
        </p>
      </div>
    `;

    this.displayError(errorContent);

    // Log error for debugging
    console.error('Game configuration validation error:', error);
  }

  /**
   * Display a generic error message
   * @param {string} title - Error title
   * @param {string} message - Error message
   * @param {Function} onDismiss - Optional callback when error is dismissed
   */
  showGenericError(title, message, onDismiss = null) {
    const errorContent = `
      <div class="error-container error-generic">
        <div class="error-icon">⚠️</div>
        <h1 class="error-title">${this.escapeHtml(title)}</h1>
        <p class="error-message">${this.escapeHtml(message)}</p>
        ${onDismiss ? '<button class="error-button" id="error-dismiss">Dismiss</button>' : ''}
      </div>
    `;

    this.displayError(errorContent, () => {
      if (onDismiss) {
        const dismissButton = document.getElementById('error-dismiss');
        if (dismissButton) {
          dismissButton.addEventListener('click', onDismiss);
        }
      }
    });
  }

  /**
   * Display error content in the container
   * @param {string} htmlContent - HTML content to display
   * @param {Function} setupCallback - Optional callback to set up event listeners
   * @private
   */
  displayError(htmlContent, setupCallback = null) {
    // Clear any existing error
    this.clearError();

    // Create error element
    this.currentErrorElement = document.createElement('div');
    this.currentErrorElement.className = 'error-display';
    this.currentErrorElement.innerHTML = htmlContent;

    // Add to container
    if (this.container) {
      this.container.innerHTML = '';
      this.container.appendChild(this.currentErrorElement);

      // Run setup callback if provided
      if (setupCallback) {
        setupCallback();
      }
    }
  }

  /**
   * Clear the current error display
   */
  clearError() {
    if (this.currentErrorElement && this.currentErrorElement.parentNode) {
      this.currentErrorElement.parentNode.removeChild(this.currentErrorElement);
    }
    this.currentErrorElement = null;
  }

  /**
   * Escape HTML to prevent XSS attacks
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   * @private
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Check if an error is currently being displayed
   * @returns {boolean} True if error is displayed
   */
  hasError() {
    return this.currentErrorElement !== null;
  }
}

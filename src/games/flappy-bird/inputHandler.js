/**
 * Input handler module for Flappy Bird game
 * Handles mouse clicks, keyboard input, and touch events
 */

/**
 * Creates an input handler for Flappy Bird controls
 * @param {Function} onFlap - Callback for flap action (during gameplay)
 * @param {Function} onStart - Callback for starting the game (from menu)
 * @param {Function} onRestart - Callback for restarting the game (from game over)
 * @returns {Object} Input handler with init, destroy, enableTouchControls, and disableTouchControls methods
 */
export function createInputHandler(onFlap, onStart, onRestart) {
  let element = null;
  let touchControlsEnabled = false;
  
  // Event handler references for cleanup
  let clickHandler = null;
  let keydownHandler = null;
  let touchStartHandler = null;
  
  /**
   * Handles mouse click events
   * Requirements 1.1, 5.2, 5.3: Trigger flap/start/restart on click
   * @param {MouseEvent} event - Mouse event
   */
  function handleClick(event) {
    event.preventDefault();
    
    // Call all callbacks - they will check game state internally
    // The order matters: flap first (for playing), then start (for menu), then restart (for game over)
    if (onFlap) onFlap();
    if (onStart) onStart();
    if (onRestart) onRestart();
  }
  
  /**
   * Handles keyboard input
   * Requirements 1.1, 5.2, 5.3: Trigger flap/start/restart on spacebar
   * @param {KeyboardEvent} event - Keyboard event
   */
  function handleKeydown(event) {
    const key = event.key;
    
    // Spacebar triggers flap/start/restart
    if (key === ' ' || key === 'Spacebar') {
      event.preventDefault();
      
      // Call all callbacks - the state manager will determine which action to take
      if (onFlap) onFlap();
      if (onStart) onStart();
      if (onRestart) onRestart();
    }
  }
  
  /**
   * Handles touch start events
   * Requirements 6.1, 6.2, 6.5: Handle touch input on mobile devices
   * @param {TouchEvent} event - Touch event
   */
  function handleTouchStart(event) {
    if (!touchControlsEnabled) return;
    
    // Requirement 6.2: Prevent default browser behaviors (scrolling)
    event.preventDefault();
    
    // Call all callbacks - the state manager will determine which action to take
    if (onFlap) onFlap();
    if (onStart) onStart();
    if (onRestart) onRestart();
  }
  
  /**
   * Initializes the input handler
   * Requirements 1.1, 5.2, 5.3: Set up event listeners
   * @param {HTMLElement} targetElement - Element to attach event listeners to
   */
  function init(targetElement) {
    element = targetElement;
    
    // Create event handlers
    clickHandler = handleClick;
    keydownHandler = handleKeydown;
    touchStartHandler = handleTouchStart;
    
    // Add mouse click listener to the element
    if (element) {
      element.addEventListener('click', clickHandler);
    }
    
    // Add keyboard listener to document (global)
    document.addEventListener('keydown', keydownHandler);
    
    // Touch listeners will be added when enableTouchControls is called
  }
  
  /**
   * Enables touch controls for mobile devices
   * Requirements 6.1, 6.2, 6.5: Enable touch input handling
   */
  function enableTouchControls() {
    touchControlsEnabled = true;
    
    // Add touch listener if element exists
    if (element && touchStartHandler) {
      // Use passive: false to allow preventDefault()
      element.addEventListener('touchstart', touchStartHandler, { passive: false });
    }
  }
  
  /**
   * Disables touch controls
   */
  function disableTouchControls() {
    touchControlsEnabled = false;
    
    // Remove touch listener if it was added
    if (element && touchStartHandler) {
      element.removeEventListener('touchstart', touchStartHandler);
    }
  }
  
  /**
   * Cleans up event listeners
   * Requirement 8.5: Ensure no memory leaks from event handlers
   */
  function destroy() {
    // Remove click listener
    if (element && clickHandler) {
      element.removeEventListener('click', clickHandler);
    }
    
    // Remove keyboard listener
    if (keydownHandler) {
      document.removeEventListener('keydown', keydownHandler);
    }
    
    // Remove touch listener
    if (element && touchStartHandler) {
      element.removeEventListener('touchstart', touchStartHandler);
    }
    
    // Clear references
    element = null;
    clickHandler = null;
    keydownHandler = null;
    touchStartHandler = null;
    touchControlsEnabled = false;
  }
  
  return {
    init,
    destroy,
    enableTouchControls,
    disableTouchControls
  };
}

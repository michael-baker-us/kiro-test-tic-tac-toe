/**
 * Input handler module for Snake game
 * Handles keyboard and touch input for game controls
 */

import { DIRECTIONS } from './gameLogic.js';

// Minimum swipe distance in pixels to register as a swipe
const MIN_SWIPE_THRESHOLD = 30;

/**
 * Calculates swipe direction based on touch deltas
 * @param {number} deltaX - Horizontal distance traveled
 * @param {number} deltaY - Vertical distance traveled
 * @returns {string|null} Direction ('up', 'down', 'left', 'right') or null if below threshold
 */
export function calculateSwipeDirection(deltaX, deltaY) {
  const absDeltaX = Math.abs(deltaX);
  const absDeltaY = Math.abs(deltaY);
  
  // Check if swipe meets minimum threshold
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  if (distance < MIN_SWIPE_THRESHOLD) {
    return null;
  }
  
  // Determine primary axis and direction
  if (absDeltaX > absDeltaY) {
    // Horizontal swipe
    return deltaX > 0 ? DIRECTIONS.RIGHT : DIRECTIONS.LEFT;
  } else {
    // Vertical swipe
    return deltaY > 0 ? DIRECTIONS.DOWN : DIRECTIONS.UP;
  }
}

/**
 * Creates an input handler for keyboard and touch controls
 * @param {Function} onDirectionChange - Callback for direction changes
 * @param {Function} onPause - Callback for pause/resume
 * @param {Function} onRestart - Callback for restart
 * @returns {Object} Input handler with init and destroy methods
 */
export function createInputHandler(onDirectionChange, onPause, onRestart) {
  let element = null;
  let touchStartX = 0;
  let touchStartY = 0;
  let touchControlsEnabled = false;
  
  // Event handler references for cleanup
  let keydownHandler = null;
  let touchStartHandler = null;
  let touchEndHandler = null;
  
  /**
   * Handles keyboard input
   * @param {KeyboardEvent} event - Keyboard event
   */
  function handleKeydown(event) {
    const key = event.key;
    
    // Arrow keys for direction
    if (key === 'ArrowUp') {
      event.preventDefault();
      onDirectionChange(DIRECTIONS.UP);
    } else if (key === 'ArrowDown') {
      event.preventDefault();
      onDirectionChange(DIRECTIONS.DOWN);
    } else if (key === 'ArrowLeft') {
      event.preventDefault();
      onDirectionChange(DIRECTIONS.LEFT);
    } else if (key === 'ArrowRight') {
      event.preventDefault();
      onDirectionChange(DIRECTIONS.RIGHT);
    }
    // Space bar for pause/resume
    else if (key === ' ' || key === 'Spacebar') {
      event.preventDefault();
      onPause();
    }
    // Enter or 'r' for restart
    else if (key === 'Enter' || key === 'r' || key === 'R') {
      event.preventDefault();
      onRestart();
    }
  }
  
  /**
   * Handles touch start event
   * @param {TouchEvent} event - Touch event
   */
  function handleTouchStart(event) {
    if (!touchControlsEnabled) return;
    
    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    
    // Prevent default to avoid scrolling
    event.preventDefault();
  }
  
  /**
   * Handles touch end event
   * @param {TouchEvent} event - Touch event
   */
  function handleTouchEnd(event) {
    if (!touchControlsEnabled) return;
    
    const touch = event.changedTouches[0];
    const touchEndX = touch.clientX;
    const touchEndY = touch.clientY;
    
    // Calculate deltas
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    
    // Calculate and apply swipe direction
    const direction = calculateSwipeDirection(deltaX, deltaY);
    if (direction) {
      onDirectionChange(direction);
    }
    
    // Prevent default to avoid scrolling
    event.preventDefault();
  }
  
  /**
   * Initializes the input handler
   * @param {HTMLElement} targetElement - Element to attach event listeners to
   */
  function init(targetElement) {
    element = targetElement;
    
    // Create event handlers
    keydownHandler = handleKeydown;
    touchStartHandler = handleTouchStart;
    touchEndHandler = handleTouchEnd;
    
    // Add keyboard listeners
    document.addEventListener('keydown', keydownHandler);
    
    // Add touch listeners if element is provided
    if (element) {
      element.addEventListener('touchstart', touchStartHandler, { passive: false });
      element.addEventListener('touchend', touchEndHandler, { passive: false });
    }
  }
  
  /**
   * Enables touch controls
   */
  function enableTouchControls() {
    touchControlsEnabled = true;
  }
  
  /**
   * Disables touch controls
   */
  function disableTouchControls() {
    touchControlsEnabled = false;
  }
  
  /**
   * Cleans up event listeners
   */
  function destroy() {
    // Remove keyboard listeners
    if (keydownHandler) {
      document.removeEventListener('keydown', keydownHandler);
    }
    
    // Remove touch listeners
    if (element) {
      if (touchStartHandler) {
        element.removeEventListener('touchstart', touchStartHandler);
      }
      if (touchEndHandler) {
        element.removeEventListener('touchend', touchEndHandler);
      }
    }
    
    // Clear references
    element = null;
    keydownHandler = null;
    touchStartHandler = null;
    touchEndHandler = null;
  }
  
  return {
    init,
    destroy,
    enableTouchControls,
    disableTouchControls
  };
}

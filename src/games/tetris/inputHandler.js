/**
 * Input handler module for Tetris game
 * Handles keyboard and touch input for game controls
 */

// Minimum swipe distance in pixels to register as a swipe
const MIN_SWIPE_THRESHOLD = 30;

// Tap detection threshold
const TAP_THRESHOLD = 10; // Max movement for tap
const TAP_TIME_THRESHOLD = 200; // Max time for tap (ms)
const DOUBLE_TAP_THRESHOLD = 300; // Max time between taps (ms)

/**
 * Calculates swipe direction based on touch deltas
 * @param {number} deltaX - Horizontal distance traveled
 * @param {number} deltaY - Vertical distance traveled
 * @returns {string|null} Direction ('left', 'right', 'down') or null if below threshold
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
    return deltaX > 0 ? 'right' : 'left';
  } else {
    // Vertical swipe (only down for soft drop)
    return deltaY > 0 ? 'down' : null;
  }
}

/**
 * Creates an input handler for keyboard and touch controls
 * @param {Object} callbacks - Object containing callback functions
 * @param {Function} callbacks.onMoveLeft - Callback for left movement
 * @param {Function} callbacks.onMoveRight - Callback for right movement
 * @param {Function} callbacks.onMoveDown - Callback for soft drop
 * @param {Function} callbacks.onRotateCW - Callback for clockwise rotation
 * @param {Function} callbacks.onRotateCCW - Callback for counter-clockwise rotation
 * @param {Function} callbacks.onHardDrop - Callback for hard drop
 * @param {Function} callbacks.onPause - Callback for pause/resume
 * @returns {Object} Input handler with init, destroy, and setCallbacks methods
 */
export function createInputHandler(callbacks = {}) {
  let activeCallbacks = { ...callbacks };
  let element = null;
  let touchControlsEnabled = false;
  
  // Key repeat state
  let keyRepeatIntervals = {};
  const KEY_REPEAT_DELAY = 150; // Milliseconds before repeat starts
  const KEY_REPEAT_RATE = 50; // Milliseconds between repeats
  
  // Rotation debouncing state
  let rotationDebounceTimeout = null;
  const ROTATION_DEBOUNCE_MS = 100;
  let lastRotationTime = 0;
  
  // Touch state
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;
  let lastTapTime = 0;
  
  // Event handler reference for cleanup
  let keydownHandler = null;
  let keyupHandler = null;
  let touchStartHandler = null;
  let touchEndHandler = null;
  
  /**
   * Handles keydown events
   * @param {KeyboardEvent} event - Keyboard event
   */
  function handleKeydown(event) {
    const key = event.key;
    
    // Prevent default for game keys to avoid page scrolling
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'p', 'P', 'Escape', 'x', 'X', 'z', 'Z'].includes(key)) {
      event.preventDefault();
    }
    
    // Ignore if key is already being held (for movement keys)
    const isMovementKey = ['ArrowLeft', 'ArrowRight', 'ArrowDown'].includes(key);
    if (isMovementKey && keyRepeatIntervals[key]) {
      return; // Already handling this key
    }
    
    // Handle movement keys with repeat
    if (key === 'ArrowLeft') {
      if (activeCallbacks.onMoveLeft) {
        activeCallbacks.onMoveLeft();
        // Set up key repeat
        const timeoutId = setTimeout(() => {
          keyRepeatIntervals[key] = setInterval(() => {
            if (activeCallbacks.onMoveLeft) {
              activeCallbacks.onMoveLeft();
            }
          }, KEY_REPEAT_RATE);
        }, KEY_REPEAT_DELAY);
        keyRepeatIntervals[key] = timeoutId;
      }
    } else if (key === 'ArrowRight') {
      if (activeCallbacks.onMoveRight) {
        activeCallbacks.onMoveRight();
        // Set up key repeat
        const timeoutId = setTimeout(() => {
          keyRepeatIntervals[key] = setInterval(() => {
            if (activeCallbacks.onMoveRight) {
              activeCallbacks.onMoveRight();
            }
          }, KEY_REPEAT_RATE);
        }, KEY_REPEAT_DELAY);
        keyRepeatIntervals[key] = timeoutId;
      }
    } else if (key === 'ArrowDown') {
      if (activeCallbacks.onMoveDown) {
        activeCallbacks.onMoveDown();
        // Set up key repeat
        const timeoutId = setTimeout(() => {
          keyRepeatIntervals[key] = setInterval(() => {
            if (activeCallbacks.onMoveDown) {
              activeCallbacks.onMoveDown();
            }
          }, KEY_REPEAT_RATE);
        }, KEY_REPEAT_DELAY);
        keyRepeatIntervals[key] = timeoutId;
      }
    }
    // Handle rotation keys with debouncing
    else if (key === 'ArrowUp' || key === 'x' || key === 'X') {
      const now = Date.now();
      if (now - lastRotationTime >= ROTATION_DEBOUNCE_MS) {
        if (activeCallbacks.onRotateCW) {
          activeCallbacks.onRotateCW();
          lastRotationTime = now;
        }
      }
    } else if (key === 'z' || key === 'Z') {
      const now = Date.now();
      if (now - lastRotationTime >= ROTATION_DEBOUNCE_MS) {
        if (activeCallbacks.onRotateCCW) {
          activeCallbacks.onRotateCCW();
          lastRotationTime = now;
        }
      }
    }
    // Handle hard drop (space bar)
    else if (key === ' ') {
      if (activeCallbacks.onHardDrop) {
        activeCallbacks.onHardDrop();
      }
    }
    // Handle pause (P or Escape)
    else if (key === 'p' || key === 'P' || key === 'Escape') {
      if (activeCallbacks.onPause) {
        activeCallbacks.onPause();
      }
    }
  }
  
  /**
   * Handles keyup events to stop key repeat
   * @param {KeyboardEvent} event - Keyboard event
   */
  function handleKeyup(event) {
    const key = event.key;
    
    // Clear key repeat for movement keys
    if (keyRepeatIntervals[key]) {
      clearTimeout(keyRepeatIntervals[key]);
      clearInterval(keyRepeatIntervals[key]);
      delete keyRepeatIntervals[key];
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
    touchStartTime = Date.now();
    
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
    const touchEndTime = Date.now();
    
    // Calculate deltas
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const deltaTime = touchEndTime - touchStartTime;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Check if it's a tap (short time and small movement)
    if (distance < TAP_THRESHOLD && deltaTime < TAP_TIME_THRESHOLD) {
      const timeSinceLastTap = touchEndTime - lastTapTime;
      
      // Check for double tap (hard drop)
      if (timeSinceLastTap < DOUBLE_TAP_THRESHOLD && lastTapTime > 0) {
        if (activeCallbacks.onHardDrop) {
          activeCallbacks.onHardDrop();
        }
        lastTapTime = 0; // Reset to prevent triple tap
      } else {
        // Single tap (rotate clockwise)
        if (activeCallbacks.onRotateCW) {
          activeCallbacks.onRotateCW();
        }
        lastTapTime = touchEndTime;
      }
    } else {
      // It's a swipe
      const direction = calculateSwipeDirection(deltaX, deltaY);
      
      if (direction === 'left' && activeCallbacks.onMoveLeft) {
        activeCallbacks.onMoveLeft();
      } else if (direction === 'right' && activeCallbacks.onMoveRight) {
        activeCallbacks.onMoveRight();
      } else if (direction === 'down' && activeCallbacks.onMoveDown) {
        activeCallbacks.onMoveDown();
      }
      
      lastTapTime = 0; // Reset tap detection after swipe
    }
    
    // Prevent default to avoid scrolling
    event.preventDefault();
  }
  
  /**
   * Initializes the input handler
   * @param {HTMLElement} targetElement - Optional element to attach touch listeners to
   */
  function init(targetElement = null) {
    element = targetElement;
    
    // Create event handlers
    keydownHandler = handleKeydown;
    keyupHandler = handleKeyup;
    touchStartHandler = handleTouchStart;
    touchEndHandler = handleTouchEnd;
    
    // Add keyboard listeners
    document.addEventListener('keydown', keydownHandler);
    document.addEventListener('keyup', keyupHandler);
    
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
   * Updates the callbacks
   * @param {Object} newCallbacks - New callback functions
   */
  function setCallbacks(newCallbacks) {
    activeCallbacks = { ...newCallbacks };
  }
  
  /**
   * Cleans up event listeners and intervals
   */
  function destroy() {
    // Remove keyboard listeners
    if (keydownHandler) {
      document.removeEventListener('keydown', keydownHandler);
    }
    if (keyupHandler) {
      document.removeEventListener('keyup', keyupHandler);
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
    
    // Clear all key repeat intervals
    Object.keys(keyRepeatIntervals).forEach(key => {
      clearTimeout(keyRepeatIntervals[key]);
      clearInterval(keyRepeatIntervals[key]);
    });
    keyRepeatIntervals = {};
    
    // Clear rotation debounce timeout
    if (rotationDebounceTimeout) {
      clearTimeout(rotationDebounceTimeout);
      rotationDebounceTimeout = null;
    }
    
    // Clear references
    element = null;
    keydownHandler = null;
    keyupHandler = null;
    touchStartHandler = null;
    touchEndHandler = null;
    activeCallbacks = {};
  }
  
  return {
    init,
    destroy,
    setCallbacks,
    enableTouchControls,
    disableTouchControls
  };
}

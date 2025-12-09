/**
 * Pure functions for Snake game logic
 * Handles movement, collision detection, and food spawning
 */

// Direction constants
export const DIRECTIONS = {
  UP: 'up',
  DOWN: 'down',
  LEFT: 'left',
  RIGHT: 'right'
};

/**
 * Creates a game board with specified dimensions
 * @param {number} width - Board width in cells
 * @param {number} height - Board height in cells
 * @returns {Object} Board object with width and height
 */
export function createGameBoard(width, height) {
  return { width, height };
}

/**
 * Initializes a snake at the center of the board
 * @param {Object} board - Board object with width and height
 * @param {number} initialLength - Initial snake length (default: 3)
 * @returns {Object} Snake object with head, body, and direction
 */
export function initializeSnake(board, initialLength = 3) {
  const centerX = Math.floor(board.width / 2);
  const centerY = Math.floor(board.height / 2);
  
  const head = { x: centerX, y: centerY };
  const body = [];
  
  // Create body segments extending to the left
  for (let i = 1; i < initialLength; i++) {
    body.push({ x: centerX - i, y: centerY });
  }
  
  return {
    head,
    body,
    direction: DIRECTIONS.RIGHT
  };
}

/**
 * Checks if a direction is valid
 * @param {string} direction - Direction to validate
 * @returns {boolean} True if direction is valid
 */
export function isValidDirection(direction) {
  return Object.values(DIRECTIONS).includes(direction);
}

/**
 * Checks if two directions are opposite
 * @param {string} current - Current direction
 * @param {string} newDirection - New direction to check
 * @returns {boolean} True if directions are opposite
 */
export function isOppositeDirection(current, newDirection) {
  const opposites = {
    [DIRECTIONS.UP]: DIRECTIONS.DOWN,
    [DIRECTIONS.DOWN]: DIRECTIONS.UP,
    [DIRECTIONS.LEFT]: DIRECTIONS.RIGHT,
    [DIRECTIONS.RIGHT]: DIRECTIONS.LEFT
  };
  
  return opposites[current] === newDirection;
}

/**
 * Calculates the next head position based on direction with wrapping
 * @param {Object} head - Current head position {x, y}
 * @param {string} direction - Movement direction
 * @param {Object} board - Board object with width and height (optional, for wrapping)
 * @returns {Object} New head position {x, y}
 */
export function getNextHeadPosition(head, direction, board = null) {
  const deltas = {
    [DIRECTIONS.UP]: { x: 0, y: -1 },
    [DIRECTIONS.DOWN]: { x: 0, y: 1 },
    [DIRECTIONS.LEFT]: { x: -1, y: 0 },
    [DIRECTIONS.RIGHT]: { x: 1, y: 0 }
  };
  
  const delta = deltas[direction];
  let newX = head.x + delta.x;
  let newY = head.y + delta.y;
  
  // Wrap around boundaries if board is provided
  if (board) {
    if (newX < 0) newX = board.width - 1;
    if (newX >= board.width) newX = 0;
    if (newY < 0) newY = board.height - 1;
    if (newY >= board.height) newY = 0;
  }
  
  return {
    x: newX,
    y: newY
  };
}

/**
 * Moves the snake in the current direction
 * @param {Object} snake - Snake object with head, body, and direction
 * @param {boolean} grow - Whether to grow (keep tail) or not
 * @param {Object} board - Board object with width and height (optional, for wrapping)
 * @returns {Object} New snake object after movement
 */
export function moveSnake(snake, grow = false, board = null) {
  const newHead = getNextHeadPosition(snake.head, snake.direction, board);
  const newBody = [snake.head, ...snake.body];
  
  // Remove tail unless growing
  if (!grow) {
    newBody.pop();
  }
  
  return {
    head: newHead,
    body: newBody,
    direction: snake.direction
  };
}

/**
 * Checks if a position is within board boundaries
 * @param {Object} position - Position to check {x, y}
 * @param {Object} board - Board object with width and height
 * @returns {boolean} True if position is within bounds
 */
export function isWithinBounds(position, board) {
  return position.x >= 0 && 
         position.x < board.width && 
         position.y >= 0 && 
         position.y < board.height;
}

/**
 * Checks if the snake head collides with board boundaries
 * @param {Object} head - Head position {x, y}
 * @param {Object} board - Board object with width and height
 * @returns {boolean} True if collision detected
 */
export function checkBoundaryCollision(head, board) {
  return !isWithinBounds(head, board);
}

/**
 * Checks if two positions are equal
 * @param {Object} pos1 - First position {x, y}
 * @param {Object} pos2 - Second position {x, y}
 * @returns {boolean} True if positions are equal
 */
export function positionsEqual(pos1, pos2) {
  return pos1.x === pos2.x && pos1.y === pos2.y;
}

/**
 * Checks if the snake head collides with its body
 * @param {Object} head - Head position {x, y}
 * @param {Array} body - Array of body segment positions
 * @returns {boolean} True if collision detected
 */
export function checkSelfCollision(head, body) {
  return body.some(segment => positionsEqual(head, segment));
}

/**
 * Checks if the snake head is at the food position
 * @param {Object} head - Head position {x, y}
 * @param {Object} foodPosition - Food position {x, y}
 * @returns {boolean} True if snake is eating food
 */
export function checkFoodCollision(head, foodPosition) {
  return positionsEqual(head, foodPosition);
}

/**
 * Gets all positions occupied by the snake
 * @param {Object} snake - Snake object with head and body
 * @returns {Array} Array of all occupied positions
 */
export function getOccupiedPositions(snake) {
  return [snake.head, ...snake.body];
}

/**
 * Checks if a position is occupied by the snake
 * @param {Object} position - Position to check {x, y}
 * @param {Object} snake - Snake object
 * @returns {boolean} True if position is occupied
 */
export function isPositionOccupied(position, snake) {
  return getOccupiedPositions(snake).some(pos => positionsEqual(pos, position));
}

/**
 * Gets a random empty position on the board
 * @param {Object} board - Board object with width and height
 * @param {Object} snake - Snake object
 * @returns {Object|null} Random empty position {x, y} or null if board is full
 */
export function getRandomEmptyPosition(board, snake) {
  const occupiedPositions = getOccupiedPositions(snake);
  const totalCells = board.width * board.height;
  
  // If board is full, return null
  if (occupiedPositions.length >= totalCells) {
    return null;
  }
  
  // Generate random positions until we find an empty one
  let position;
  let attempts = 0;
  const maxAttempts = totalCells * 2; // Prevent infinite loop
  
  do {
    position = {
      x: Math.floor(Math.random() * board.width),
      y: Math.floor(Math.random() * board.height)
    };
    attempts++;
  } while (isPositionOccupied(position, snake) && attempts < maxAttempts);
  
  return isPositionOccupied(position, snake) ? null : position;
}

/**
 * Spawns food at a random empty position
 * @param {Object} board - Board object with width and height
 * @param {Object} snake - Snake object
 * @returns {Object|null} Food position {x, y} or null if board is full
 */
export function spawnFood(board, snake) {
  return getRandomEmptyPosition(board, snake);
}

/**
 * Updates snake direction if the new direction is valid
 * @param {Object} snake - Snake object
 * @param {string} newDirection - New direction to set
 * @returns {Object} Snake object with updated direction
 */
export function updateSnakeDirection(snake, newDirection) {
  // Validate direction
  if (!isValidDirection(newDirection)) {
    return snake;
  }
  
  // Reject opposite direction
  if (isOppositeDirection(snake.direction, newDirection)) {
    return snake;
  }
  
  return {
    ...snake,
    direction: newDirection
  };
}

/**
 * Core game logic module for Flappy Bird
 * Handles physics, collision detection, pipe management, and scoring
 */

/**
 * Updates bird physics by applying gravity and velocity
 * Requirements 1.2, 1.3, 1.5, 7.1, 7.2
 * 
 * @param {Object} bird - Bird state object
 * @param {number} deltaTime - Time elapsed since last update (seconds)
 * @param {Object} config - Game configuration
 * @returns {Object} Updated bird state
 */
export function updateBirdPhysics(bird, deltaTime, config) {
  const updatedBird = { ...bird };
  
  updatedBird.velocity += config.gravity * deltaTime;
  updatedBird.y += updatedBird.velocity * deltaTime;
  
  if (updatedBird.y < 0) {
    updatedBird.y = 0;
    updatedBird.velocity = 0;
  }
  
  // Calculate rotation based on velocity
  // Negative velocity (moving up) -> negative rotation (tilted up)
  // Positive velocity (falling) -> positive rotation (tilted down)
  const targetRotation = (updatedBird.velocity / Math.abs(config.flapVelocity)) * config.maxRotation;
  updatedBird.rotation = Math.max(
    -config.maxRotation,
    Math.min(config.maxRotation, targetRotation)
  );
  
  return updatedBird;
}

/**
 * Checks for collision between bird and pipes or boundaries
 * Requirements 3.1, 3.2, 3.4, 1.4
 * 
 * @param {Object} bird - Bird state object
 * @param {Array} pipes - Array of pipe objects
 * @param {number} canvasHeight - Height of the game canvas
 * @returns {boolean} True if collision detected, false otherwise
 */
export function checkCollision(bird, pipes, canvasHeight) {
  if (bird.y + bird.height >= canvasHeight) {
    return true;
  }
  
  for (const pipe of pipes) {
    const birdRight = bird.x + bird.width;
    const pipeRight = pipe.x + pipe.width;
    
    if (birdRight > pipe.x && bird.x < pipeRight) {
      const gapTop = pipe.gapY - pipe.gapHeight / 2;
      const gapBottom = pipe.gapY + pipe.gapHeight / 2;
      
      if (bird.y < gapTop || bird.y + bird.height > gapBottom) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Updates pipe positions and removes off-screen pipes
 * Requirements 2.2, 2.3
 * 
 * @param {Array} pipes - Array of pipe objects
 * @param {number} deltaTime - Time elapsed since last update (seconds)
 * @param {Object} config - Game configuration
 * @returns {Array} Updated array of pipes
 */
export function updatePipes(pipes, deltaTime, config) {
  const updatedPipes = pipes.map(pipe => ({
    ...pipe,
    x: pipe.x - config.pipeSpeed * deltaTime
  }));
  
  return updatedPipes.filter(pipe => pipe.x + pipe.width >= 0);
}

/**
 * Generates a new pipe with random gap position
 * Requirements 2.1, 2.4, 2.5
 * 
 * @param {number} canvasWidth - Width of the game canvas
 * @param {number} canvasHeight - Height of the game canvas
 * @param {Object} config - Game configuration
 * @returns {Object} New pipe object
 */
export function generatePipe(canvasWidth, canvasHeight, config) {
  const gapHeight = config.pipeGap;
  const minGapY = gapHeight / 2;
  const maxGapY = canvasHeight - gapHeight / 2;
  const gapY = minGapY + Math.random() * (maxGapY - minGapY);
  
  return {
    x: canvasWidth,
    gapY: gapY,
    gapHeight: gapHeight,
    width: config.pipeWidth,
    passed: false
  };
}

/**
 * Checks if bird has passed any pipes and updates scoring
 * Requirements 4.1, 4.5
 * 
 * @param {Object} bird - Bird state object
 * @param {Array} pipes - Array of pipe objects
 * @returns {number} Number of pipes passed (0 or 1)
 */
export function checkScoring(bird, pipes) {
  let scoreIncrement = 0;
  
  for (const pipe of pipes) {
    const pipeCenterX = pipe.x + pipe.width / 2;
    
    if (!pipe.passed && bird.x > pipeCenterX) {
      pipe.passed = true;
      scoreIncrement += 1;
    }
  }
  
  return scoreIncrement;
}

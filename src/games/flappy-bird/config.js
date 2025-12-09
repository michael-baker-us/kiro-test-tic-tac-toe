/**
 * Flappy Bird Game Configuration
 * Contains all game constants and tunable parameters
 */

export const CONFIG = {
  // Physics constants
  gravity: 1200,              // Downward acceleration (pixels/s²)
  flapVelocity: -400,         // Upward velocity on flap (pixels/s)
  
  // Bird properties
  birdX: 80,                  // Fixed horizontal position of bird
  birdSize: 34,               // Bird dimensions (square)
  
  // Pipe properties
  pipeWidth: 52,              // Width of pipes
  pipeGap: 150,               // Height of gap between pipes
  pipeSpeed: 200,             // Horizontal pipe movement speed (pixels/s)
  pipeSpawnInterval: 1500,    // Time between pipe spawns (ms)
  
  // Visual properties
  maxRotation: 90,            // Maximum bird rotation (degrees)
  rotationSpeed: 3,           // Rotation change rate
  
  // Canvas dimensions (default, will be adjusted for mobile)
  canvasWidth: 400,           // Default canvas width
  canvasHeight: 600,          // Default canvas height
  
  // Scoring
  initialScore: 0,            // Starting score
  
  // Game states
  GAME_STATES: {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameOver'
  }
};

# Requirements Document

## Introduction

This document specifies the requirements for implementing a Tetris game as part of a multi-game web application. The Tetris game will provide classic block-stacking gameplay with standard Tetris mechanics including piece rotation, line clearing, scoring, and progressive difficulty. The game will integrate seamlessly with the existing game selection interface and maintain consistency with the Snake and Tic-Tac-Toe games already implemented.

## Glossary

- **Tetris System**: The complete Tetris game implementation including game logic, UI, and state management
- **Tetromino**: A geometric shape composed of four square blocks connected orthogonally (I, O, T, S, Z, J, L pieces)
- **Game Board**: A 10-column by 20-row grid where Tetrominoes fall and stack
- **Active Piece**: The currently falling Tetromino that the player controls
- **Locked Piece**: A Tetromino that has landed and become part of the static board state
- **Line Clear**: The removal of a completely filled horizontal row from the Game Board
- **Ghost Piece**: A visual indicator showing where the Active Piece will land
- **Next Piece Preview**: A display showing the upcoming Tetromino
- **Game Loop**: The continuous cycle that updates game state and renders the display
- **Drop Speed**: The rate at which the Active Piece automatically moves downward
- **Hard Drop**: An instant drop of the Active Piece to its landing position
- **Soft Drop**: Player-controlled faster downward movement of the Active Piece
- **Wall Kick**: A mechanism that allows rotation near walls by shifting the piece position
- **Lock Delay**: A brief period after a piece touches down before it locks in place

## Requirements

### Requirement 1

**User Story:** As a player, I want to control falling Tetrominoes using keyboard inputs, so that I can position and rotate pieces strategically.

#### Acceptance Criteria

1. WHEN a player presses the left arrow key, THE Tetris System SHALL move the Active Piece one column left if the destination is valid
2. WHEN a player presses the right arrow key, THE Tetris System SHALL move the Active Piece one column right if the destination is valid
3. WHEN a player presses the up arrow key or X key, THE Tetris System SHALL rotate the Active Piece 90 degrees clockwise if the rotation is valid
4. WHEN a player presses the Z key, THE Tetris System SHALL rotate the Active Piece 90 degrees counter-clockwise if the rotation is valid
5. WHEN a player presses the down arrow key, THE Tetris System SHALL apply Soft Drop by moving the Active Piece down faster
6. WHEN a player presses the space bar, THE Tetris System SHALL execute a Hard Drop moving the Active Piece instantly to its landing position
7. WHEN a movement or rotation would cause collision with Locked Pieces or board boundaries, THE Tetris System SHALL prevent the movement and maintain the current position

### Requirement 2

**User Story:** As a player, I want pieces to spawn at the top and fall automatically, so that the game progresses without constant input.

#### Acceptance Criteria

1. WHEN the game starts or a piece locks, THE Tetris System SHALL spawn a new Active Piece at the top center of the Game Board
2. WHILE the game is running, THE Tetris System SHALL move the Active Piece down one row at intervals determined by the Drop Speed
3. WHEN the Active Piece cannot move down, THE Tetris System SHALL lock the piece after the Lock Delay expires
4. WHEN a new piece spawns in a position occupied by Locked Pieces, THE Tetris System SHALL trigger game over
5. WHEN the Drop Speed timer elapses, THE Tetris System SHALL move the Active Piece down by one row

### Requirement 3

**User Story:** As a player, I want completed lines to clear and award points, so that I can achieve high scores and progress through the game.

#### Acceptance Criteria

1. WHEN a horizontal row becomes completely filled with blocks, THE Tetris System SHALL remove that row from the Game Board
2. WHEN one or more lines are cleared, THE Tetris System SHALL move all rows above the cleared lines down by the number of cleared lines
3. WHEN one line is cleared, THE Tetris System SHALL award 100 points multiplied by the current level
4. WHEN two lines are cleared simultaneously, THE Tetris System SHALL award 300 points multiplied by the current level
5. WHEN three lines are cleared simultaneously, THE Tetris System SHALL award 500 points multiplied by the current level
6. WHEN four lines are cleared simultaneously (Tetris), THE Tetris System SHALL award 800 points multiplied by the current level
7. WHEN a Hard Drop is executed, THE Tetris System SHALL award 2 points per row dropped

### Requirement 4

**User Story:** As a player, I want the game difficulty to increase as I clear more lines, so that the game remains challenging.

#### Acceptance Criteria

1. WHEN the game starts, THE Tetris System SHALL initialize the level to 1
2. WHEN the player clears 10 lines, THE Tetris System SHALL increment the level by 1
3. WHEN the level increases, THE Tetris System SHALL decrease the Drop Speed to make pieces fall faster
4. WHEN calculating Drop Speed, THE Tetris System SHALL use the formula: max(100, 1000 - (level - 1) * 100) milliseconds per row

### Requirement 5

**User Story:** As a player, I want to see the next piece that will spawn, so that I can plan my strategy ahead.

#### Acceptance Criteria

1. WHEN the game initializes, THE Tetris System SHALL generate a random sequence of Tetrominoes
2. WHEN displaying the game interface, THE Tetris System SHALL show the Next Piece Preview with the upcoming Tetromino
3. WHEN a new Active Piece spawns, THE Tetris System SHALL update the Next Piece Preview with the following piece in the sequence

### Requirement 6

**User Story:** As a player, I want to see a ghost piece showing where my current piece will land, so that I can make precise placements.

#### Acceptance Criteria

1. WHILE an Active Piece is falling, THE Tetris System SHALL display a Ghost Piece at the position where the Active Piece would land if dropped
2. WHEN the Active Piece moves or rotates, THE Tetris System SHALL update the Ghost Piece position immediately
3. WHEN rendering the Ghost Piece, THE Tetris System SHALL use a semi-transparent or outlined visual style to distinguish it from the Active Piece

### Requirement 7

**User Story:** As a player, I want to pause and resume the game, so that I can take breaks without losing progress.

#### Acceptance Criteria

1. WHEN a player presses the P key or Escape key during gameplay, THE Tetris System SHALL pause the game
2. WHILE the game is paused, THE Tetris System SHALL stop the Game Loop and ignore gameplay inputs
3. WHEN a player presses the P key or Escape key while paused, THE Tetris System SHALL resume the game
4. WHEN the game is paused, THE Tetris System SHALL display a pause indicator on the screen

### Requirement 8

**User Story:** As a player, I want the game to implement standard Tetris rotation rules with wall kicks, so that piece rotation feels natural and fair.

#### Acceptance Criteria

1. WHEN a rotation would cause collision, THE Tetris System SHALL attempt Wall Kick adjustments by testing alternative positions
2. WHEN all Wall Kick positions result in collision, THE Tetris System SHALL prevent the rotation and maintain the current orientation
3. WHEN rotating the I-piece, THE Tetris System SHALL use I-piece specific Wall Kick data
4. WHEN rotating other pieces, THE Tetris System SHALL use standard Wall Kick data (JLSTZ pieces)
5. WHEN the O-piece rotates, THE Tetris System SHALL maintain its position without applying Wall Kicks

### Requirement 9

**User Story:** As a player, I want the game to display my current score, level, and lines cleared, so that I can track my progress.

#### Acceptance Criteria

1. WHEN the game interface renders, THE Tetris System SHALL display the current score
2. WHEN the game interface renders, THE Tetris System SHALL display the current level
3. WHEN the game interface renders, THE Tetris System SHALL display the total number of lines cleared
4. WHEN any of these values change, THE Tetris System SHALL update the display immediately

### Requirement 10

**User Story:** As a player, I want to restart the game after game over, so that I can play again without refreshing the page.

#### Acceptance Criteria

1. WHEN the game ends, THE Tetris System SHALL display a game over message with the final score
2. WHEN the game over screen is displayed, THE Tetris System SHALL provide a restart button or instruction
3. WHEN the player clicks restart or presses a designated key, THE Tetris System SHALL reset the game state to initial values
4. WHEN the game resets, THE Tetris System SHALL clear the Game Board, reset score to 0, reset level to 1, and reset lines cleared to 0

### Requirement 11

**User Story:** As a player, I want the game to use standard Tetris colors for each piece type, so that pieces are easily recognizable.

#### Acceptance Criteria

1. WHEN rendering the I-piece, THE Tetris System SHALL use cyan color
2. WHEN rendering the O-piece, THE Tetris System SHALL use yellow color
3. WHEN rendering the T-piece, THE Tetris System SHALL use purple color
4. WHEN rendering the S-piece, THE Tetris System SHALL use green color
5. WHEN rendering the Z-piece, THE Tetris System SHALL use red color
6. WHEN rendering the J-piece, THE Tetris System SHALL use blue color
7. WHEN rendering the L-piece, THE Tetris System SHALL use orange color

### Requirement 12

**User Story:** As a developer, I want the Tetris game to integrate with the existing multi-game interface, so that users can switch between games seamlessly.

#### Acceptance Criteria

1. WHEN the main page loads, THE Tetris System SHALL appear as a selectable option in the game menu
2. WHEN a user selects Tetris from the menu, THE Tetris System SHALL initialize and display the game interface
3. WHEN a user switches away from Tetris, THE Tetris System SHALL pause or stop the game loop
4. WHEN a user switches back to Tetris, THE Tetris System SHALL resume from the paused state or allow starting a new game
5. WHEN integrating with the existing codebase, THE Tetris System SHALL follow the same architectural patterns as Snake and Tic-Tac-Toe games

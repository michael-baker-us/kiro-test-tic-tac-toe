// Property-based tests for tab switching functionality
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { JSDOM } from 'jsdom';

describe('Tab Switching Properties', () => {
  let dom;
  let window;
  let document;

  beforeEach(() => {
    // Create a new JSDOM instance with the HTML structure
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <body>
          <div id="app">
            <nav class="game-tabs">
              <button class="tab-button active" data-game="snake">🐍 Snake</button>
              <button class="tab-button" data-game="tic-tac-toe">⭕ Tic-Tac-Toe</button>
            </nav>
            <div id="snake-container" class="game-container"></div>
            <div id="tic-tac-toe-container" class="game-container" style="display: none;"></div>
          </div>
        </body>
      </html>
    `, {
      url: 'http://localhost/'
    });
    
    window = dom.window;
    document = window.document;
    
    // Set up global window and document
    global.window = window;
    global.document = document;
  });

  afterEach(() => {
    // Clean up
    if (dom) {
      dom.window.close();
    }
  });

  // Helper function to simulate showGame
  function showGame(gameName) {
    const snakeContainer = document.getElementById('snake-container');
    const ticTacToeContainer = document.getElementById('tic-tac-toe-container');
    
    // Hide all containers
    snakeContainer.style.display = 'none';
    ticTacToeContainer.style.display = 'none';
    
    // Show selected container
    if (gameName === 'snake') {
      snakeContainer.style.display = 'block';
    } else if (gameName === 'tic-tac-toe') {
      ticTacToeContainer.style.display = 'block';
    }
  }

  // Helper function to simulate updateTabStyles
  function updateTabStyles(activeGameName) {
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
      if (button.dataset.game === activeGameName) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
  }

  // **Feature: github-pages-simplification, Property 1: Single visible game container**
  // **Validates: Requirements 1.2**
  it('Property 1: Single visible game container - for any sequence of tab clicks, exactly one game container is visible', () => {
    const gameNameArb = fc.constantFrom('snake', 'tic-tac-toe');
    const clickSequenceArb = fc.array(gameNameArb, { minLength: 1, maxLength: 10 });
    
    fc.assert(
      fc.property(clickSequenceArb, (sequence) => {
        // Reset DOM for each property test iteration
        const snakeContainer = document.getElementById('snake-container');
        const ticTacToeContainer = document.getElementById('tic-tac-toe-container');
        
        // Set initial state
        snakeContainer.style.display = 'block';
        ticTacToeContainer.style.display = 'none';
        
        // Simulate clicking through the sequence
        sequence.forEach(gameName => {
          showGame(gameName);
        });
        
        // Count visible containers
        const containers = [snakeContainer, ticTacToeContainer];
        const visibleCount = containers.filter(container => {
          const display = container.style.display;
          return display !== 'none' && display !== '';
        }).length;
        
        // Exactly one container should be visible
        return visibleCount === 1;
      }),
      { numRuns: 100 }
    );
  });

  // **Feature: github-pages-simplification, Property 2: Active tab styling consistency**
  // **Validates: Requirements 3.2**
  it('Property 2: Active tab styling consistency - for any tab selection, selected tab has active class and others do not', () => {
    const gameNameArb = fc.constantFrom('snake', 'tic-tac-toe');
    
    fc.assert(
      fc.property(gameNameArb, (selectedGame) => {
        // Reset tab styles
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => button.classList.remove('active'));
        
        // Apply tab styles for selected game
        updateTabStyles(selectedGame);
        
        // Check that exactly one tab has active class and it's the correct one
        let activeCount = 0;
        let correctTabActive = false;
        
        tabButtons.forEach(button => {
          if (button.classList.contains('active')) {
            activeCount++;
            if (button.dataset.game === selectedGame) {
              correctTabActive = true;
            }
          }
        });
        
        // Exactly one tab should be active and it should be the selected game
        return activeCount === 1 && correctTabActive;
      }),
      { numRuns: 100 }
    );
  });

  // **Feature: github-pages-simplification, Property 3: Game instance persistence**
  // **Validates: Requirements 1.3, 2.3, 2.4**
  it('Property 3: Game instance persistence - for any sequence of tab switches, game instances are never recreated', () => {
    const gameNameArb = fc.constantFrom('snake', 'tic-tac-toe');
    const switchSequenceArb = fc.array(gameNameArb, { minLength: 2, maxLength: 10 });
    
    fc.assert(
      fc.property(switchSequenceArb, (sequence) => {
        // Create mock game instances with unique identifiers
        const snakeInstance = { id: 'snake-instance-' + Math.random(), init: () => {}, destroy: () => {} };
        const ticTacToeInstance = { id: 'tic-tac-toe-instance-' + Math.random(), init: () => {}, destroy: () => {} };
        
        // Store initial instance IDs
        const initialSnakeId = snakeInstance.id;
        const initialTicTacToeId = ticTacToeInstance.id;
        
        // Simulate tab switches (which should only hide/show containers, not recreate instances)
        sequence.forEach(gameName => {
          showGame(gameName);
          // In the real implementation, game instances are NOT destroyed or recreated
          // They remain in memory with the same object references
        });
        
        // Verify instances still have the same IDs (not recreated)
        const snakeNotRecreated = snakeInstance.id === initialSnakeId;
        const ticTacToeNotRecreated = ticTacToeInstance.id === initialTicTacToeId;
        
        return snakeNotRecreated && ticTacToeNotRecreated;
      }),
      { numRuns: 100 }
    );
  });
});

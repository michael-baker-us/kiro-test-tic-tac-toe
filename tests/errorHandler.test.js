import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ErrorHandler } from '../src/errorHandler.js';

describe('ErrorHandler', () => {
  let container;
  let errorHandler;

  beforeEach(() => {
    // Create a fresh container for each test
    container = document.createElement('div');
    document.body.appendChild(container);
    errorHandler = new ErrorHandler(container);
  });

  describe('404 Error Display', () => {
    it('should display 404 error with invalid path', () => {
      const invalidPath = '/invalid-game';
      const onReturnHome = vi.fn();

      errorHandler.show404Error(invalidPath, onReturnHome);

      // Check that error is displayed
      expect(container.querySelector('.error-404')).toBeTruthy();
      expect(container.textContent).toContain('Page Not Found');
      expect(container.textContent).toContain(invalidPath);
    });

    it('should call onReturnHome when button is clicked', () => {
      const onReturnHome = vi.fn();
      errorHandler.show404Error('/invalid', onReturnHome);

      // Button should be in the document (not just container)
      const button = document.getElementById('error-return-home');
      expect(button).toBeTruthy();
      
      button.click();
      expect(onReturnHome).toHaveBeenCalledOnce();
    });

    it('should escape HTML in path to prevent XSS', () => {
      const maliciousPath = '<script>alert("xss")</script>';
      errorHandler.show404Error(maliciousPath, vi.fn());

      // Should not contain actual script tag
      expect(container.querySelector('script')).toBeNull();
      // Should contain escaped version
      expect(container.innerHTML).toContain('&lt;script&gt;');
    });
  });

  describe('Game Load Error Display', () => {
    it('should display game loading error with game name', () => {
      const gameName = 'Tic-Tac-Toe';
      const error = new Error('Failed to load module');
      const onReturnHome = vi.fn();

      errorHandler.showGameLoadError(gameName, error, onReturnHome);

      expect(container.querySelector('.error-game-load')).toBeTruthy();
      expect(container.textContent).toContain('Failed to Load Game');
      expect(container.textContent).toContain(gameName);
    });

    it('should display error message in details', () => {
      const error = new Error('Network timeout');
      errorHandler.showGameLoadError('Test Game', error, vi.fn());

      expect(container.textContent).toContain('Network timeout');
    });

    it('should show retry button when onRetry is provided', () => {
      const onRetry = vi.fn();
      errorHandler.showGameLoadError('Test Game', new Error('test'), vi.fn(), onRetry);

      const retryButton = container.querySelector('#error-retry');
      expect(retryButton).toBeTruthy();
      
      retryButton.click();
      expect(onRetry).toHaveBeenCalledOnce();
    });

    it('should not show retry button when onRetry is not provided', () => {
      errorHandler.showGameLoadError('Test Game', new Error('test'), vi.fn());

      const retryButton = container.querySelector('#error-retry');
      expect(retryButton).toBeNull();
    });

    it('should call onReturnHome when return button is clicked', () => {
      const onReturnHome = vi.fn();
      errorHandler.showGameLoadError('Test Game', new Error('test'), onReturnHome);

      // Button should be in the document (not just container)
      const button = document.getElementById('error-return-home');
      expect(button).toBeTruthy();
      button.click();
      expect(onReturnHome).toHaveBeenCalledOnce();
    });
  });

  describe('Validation Error Display', () => {
    it('should display validation error', () => {
      const error = new Error('Missing required field: name');
      errorHandler.showValidationError(error);

      expect(container.querySelector('.error-validation')).toBeTruthy();
      expect(container.textContent).toContain('Configuration Error');
      expect(container.textContent).toContain('Missing required field: name');
    });

    it('should handle error without message', () => {
      errorHandler.showValidationError(new Error());

      expect(container.querySelector('.error-validation')).toBeTruthy();
      expect(container.textContent).toContain('Configuration Error');
    });
  });

  describe('Generic Error Display', () => {
    it('should display generic error with title and message', () => {
      const title = 'Something Went Wrong';
      const message = 'Please try again later';
      
      errorHandler.showGenericError(title, message);

      expect(container.querySelector('.error-generic')).toBeTruthy();
      expect(container.textContent).toContain(title);
      expect(container.textContent).toContain(message);
    });

    it('should show dismiss button when onDismiss is provided', () => {
      const onDismiss = vi.fn();
      errorHandler.showGenericError('Error', 'Message', onDismiss);

      const dismissButton = container.querySelector('#error-dismiss');
      expect(dismissButton).toBeTruthy();
      
      dismissButton.click();
      expect(onDismiss).toHaveBeenCalledOnce();
    });

    it('should not show dismiss button when onDismiss is not provided', () => {
      errorHandler.showGenericError('Error', 'Message');

      const dismissButton = container.querySelector('#error-dismiss');
      expect(dismissButton).toBeNull();
    });
  });

  describe('Error Management', () => {
    it('should clear previous error when showing new error', () => {
      errorHandler.show404Error('/path1', vi.fn());
      const firstError = container.querySelector('.error-404');
      expect(firstError).toBeTruthy();

      errorHandler.show404Error('/path2', vi.fn());
      
      // Should only have one error displayed
      const errors = container.querySelectorAll('.error-container');
      expect(errors.length).toBe(1);
    });

    it('should report hasError() correctly', () => {
      expect(errorHandler.hasError()).toBe(false);

      errorHandler.show404Error('/test', vi.fn());
      expect(errorHandler.hasError()).toBe(true);

      errorHandler.clearError();
      expect(errorHandler.hasError()).toBe(false);
    });

    it('should clear error completely', () => {
      errorHandler.show404Error('/test', vi.fn());
      expect(container.querySelector('.error-container')).toBeTruthy();

      errorHandler.clearError();
      expect(container.querySelector('.error-container')).toBeNull();
    });
  });

  describe('HTML Escaping', () => {
    it('should escape HTML in all user-provided content', () => {
      const maliciousContent = '<img src=x onerror=alert(1)>';
      
      errorHandler.showGenericError(maliciousContent, maliciousContent);

      // Should not contain actual HTML tags
      expect(container.querySelector('img')).toBeNull();
      // Should contain escaped version
      expect(container.innerHTML).toContain('&lt;img');
    });
  });
});

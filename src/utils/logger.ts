/**
 * Logging utility that can be disabled in production.
 * In development mode, passes through to console methods.
 * In production mode, only errors are logged.
 */

class Logger {
  private isEnabled: boolean;

  constructor() {
    // Enable logging in development mode
    this.isEnabled = import.meta.env.DEV;
  }

  /**
   * Debug-level logging (verbose information for debugging).
   * Only logs in development mode.
   */
  debug(...args: any[]): void {
    if (this.isEnabled) {
      console.debug(...args);
    }
  }

  /**
   * Informational logging (general information about app state).
   * Only logs in development mode.
   */
  log(...args: any[]): void {
    if (this.isEnabled) {
      console.log(...args);
    }
  }

  /**
   * Warning-level logging (potentially problematic situations).
   * Only logs in development mode.
   */
  warn(...args: any[]): void {
    if (this.isEnabled) {
      console.warn(...args);
    }
  }

  /**
   * Error-level logging (error conditions).
   * Always logs, even in production.
   */
  error(...args: any[]): void {
    // Always log errors, even in production
    console.error(...args);
  }
}

export const logger = new Logger();
export default logger;

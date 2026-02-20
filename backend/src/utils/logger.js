/**
 * Simple logger utility
 * In production, this could be replaced with winston or pino
 */

const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const currentLevel = process.env.LOG_LEVEL || 'info';

/**
 * Format log message with timestamp
 * @param {string} level
 * @param {string} message
 * @param {any[]} args
 * @returns {string}
 */
function formatMessage(level, message, args) {
  const timestamp = new Date().toISOString();
  const argsStr = args.length > 0 ? ' ' + args.map((a) => JSON.stringify(a)).join(' ') : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${argsStr}`;
}

/**
 * Check if logging at given level is enabled
 * @param {string} level
 * @returns {boolean}
 */
function shouldLog(level) {
  return LOG_LEVELS[level] <= LOG_LEVELS[currentLevel];
}

/**
 * Logger object with standard logging methods
 */
export const logger = {
  /**
   * Log error message
   * @param {string} message
   * @param {...any} args
   */
  error(message, ...args) {
    if (shouldLog('error')) {
      console.error(formatMessage('error', message, args));
    }
  },

  /**
   * Log warning message
   * @param {string} message
   * @param {...any} args
   */
  warn(message, ...args) {
    if (shouldLog('warn')) {
      console.warn(formatMessage('warn', message, args));
    }
  },

  /**
   * Log info message
   * @param {string} message
   * @param {...any} args
   */
  info(message, ...args) {
    if (shouldLog('info')) {
      console.info(formatMessage('info', message, args));
    }
  },

  /**
   * Log debug message
   * @param {string} message
   * @param {...any} args
   */
  debug(message, ...args) {
    if (shouldLog('debug')) {
      console.debug(formatMessage('debug', message, args));
    }
  },
};

export default logger;

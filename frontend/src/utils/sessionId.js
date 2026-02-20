const SESSION_ID_KEY = 'guest_session_id';

/**
 * Generate a random session ID
 * @returns {string}
 */
function generateSessionId() {
  return `sess_${crypto.randomUUID()}`;
}

/**
 * Get or create session ID for guest users
 * @returns {string}
 */
export function getSessionId() {
  let sessionId = localStorage.getItem(SESSION_ID_KEY);

  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }

  return sessionId;
}

/**
 * Clear the session ID (e.g., when user logs in)
 */
export function clearSessionId() {
  localStorage.removeItem(SESSION_ID_KEY);
}

/**
 * Check if session ID exists
 * @returns {boolean}
 */
export function hasSessionId() {
  return !!localStorage.getItem(SESSION_ID_KEY);
}

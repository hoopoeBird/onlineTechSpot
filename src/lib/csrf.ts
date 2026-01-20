/**
 * CSRF Token Management
 * Handles generation, storage, and retrieval of CSRF tokens
 */

const CSRF_TOKEN_KEY = "X-CSRF-Token";
const CSRF_COOKIE_NAME = "csrf-token";

/**
 * Generate a random CSRF token
 */
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
};

/**
 * Get CSRF token from localStorage
 */
export const getCSRFToken = (): string | null => {
  return localStorage.getItem(CSRF_TOKEN_KEY);
};

/**
 * Set CSRF token in localStorage
 */
export const setCSRFToken = (token: string): void => {
  localStorage.setItem(CSRF_TOKEN_KEY, token);
};

/**
 * Initialize or get CSRF token
 * If no token exists, generate a new one
 */
export const initializeCSRFToken = (): string => {
  let token = getCSRFToken();

  if (!token) {
    token = generateCSRFToken();
    setCSRFToken(token);
  }

  return token;
};

/**
 * Clear CSRF token (useful on logout)
 */
export const clearCSRFToken = (): void => {
  localStorage.removeItem(CSRF_TOKEN_KEY);
};

/**
 * Refresh CSRF token (call this periodically or after sensitive operations)
 */
export const refreshCSRFToken = (): string => {
  const token = generateCSRFToken();
  setCSRFToken(token);
  return token;
};

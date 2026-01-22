/**
 * JWT Token Management Utilities
 */

const TOKEN_KEY = "jwt_token";

/**
 * Store JWT token in localStorage
 */
export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Retrieve JWT token from localStorage
 */
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Remove JWT token from localStorage
 */
export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Check if user has a valid token
 */
export const hasToken = (): boolean => {
  return !!localStorage.getItem(TOKEN_KEY);
};

/**
 * Get Authorization header value with Bearer token
 */
export const getAuthHeader = (): Record<string, string> | {} => {
  const token = getToken();
  if (token) {
    return {
      Authorization: `Bearer ${token}`,
    };
  }
  return {};
};

/**
 * API utility for making authenticated requests to the backend
 * Automatically includes JWT token from localStorage in Authorization header
 */

const getToken = (): string | null => {
  return localStorage.getItem("authToken");
};

interface FetchOptions extends RequestInit {
  includeAuth?: boolean;
}

export const apiCall = async <T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<T> => {
  const { includeAuth = true, ...fetchOptions } = options;

  const headers = new Headers(fetchOptions.headers || {});

  // Add authorization header if token exists and includeAuth is true
  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  // Ensure Content-Type is set
  if (!headers.has("Content-Type") && fetchOptions.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
    credentials: "include",
  });

  // Handle 401 Unauthorized - token might be expired
  if (response.status === 401) {
    localStorage.removeItem("authToken");
    // Optionally redirect to login or trigger logout event
    window.dispatchEvent(new CustomEvent("unauthorized"));
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "API request failed");
  }

  return data;
};

/**
 * Store JWT token in localStorage
 */
export const setAuthToken = (token: string): void => {
  localStorage.setItem("authToken", token);
};

/**
 * Remove JWT token from localStorage
 */
export const removeAuthToken = (): void => {
  localStorage.removeItem("authToken");
};

/**
 * Get JWT token from localStorage
 */
export const getAuthToken = (): string | null => {
  return getToken();
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

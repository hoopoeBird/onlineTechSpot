/**
 * API Client with CSRF Protection
 * Wraps the fetch API to automatically include CSRF tokens
 */

import { getCSRFToken, initializeCSRFToken } from "./csrf";

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

/**
 * Safe HTTP methods that don't require CSRF tokens
 */
const SAFE_METHODS = ["GET", "HEAD", "OPTIONS"];

/**
 * Methods that should include CSRF tokens
 */
const CSRF_PROTECTED_METHODS = ["POST", "PUT", "DELETE", "PATCH"];

/**
 * Enhanced fetch with automatic CSRF token injection
 */
export const secureApiFetch = async (
  url: string,
  options: FetchOptions = {}
): Promise<Response> => {
  const method = (options.method || "GET").toUpperCase();
  const headers = { ...options.headers } as Record<string, string>;

  // Initialize CSRF token if it doesn't exist
  initializeCSRFToken();

  // Add CSRF token to requests that modify data
  if (CSRF_PROTECTED_METHODS.includes(method)) {
    const csrfToken = getCSRFToken();
    if (csrfToken) {
      headers["X-CSRF-Token"] = csrfToken;
    }
  }

  // Ensure Content-Type is set for JSON requests
  if (
    options.body &&
    typeof options.body === "string" &&
    !headers["Content-Type"]
  ) {
    headers["Content-Type"] = "application/json";
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: "include", // Always include credentials for cookie-based CSRF
  });
};

/**
 * Convenience methods for common HTTP operations
 */

export const apiGet = (url: string, options?: FetchOptions) =>
  secureApiFetch(url, { ...options, method: "GET" });

export const apiPost = (
  url: string,
  body?: any,
  options?: FetchOptions
) =>
  secureApiFetch(url, {
    ...options,
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });

export const apiPut = (
  url: string,
  body?: any,
  options?: FetchOptions
) =>
  secureApiFetch(url, {
    ...options,
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  });

export const apiDelete = (url: string, options?: FetchOptions) =>
  secureApiFetch(url, { ...options, method: "DELETE" });

export const apiPatch = (
  url: string,
  body?: any,
  options?: FetchOptions
) =>
  secureApiFetch(url, {
    ...options,
    method: "PATCH",
    body: body ? JSON.stringify(body) : undefined,
  });

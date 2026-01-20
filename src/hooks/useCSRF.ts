/**
 * Hook for CSRF token management in React components
 */

import { useEffect, useState } from "react";
import {
  getCSRFToken,
  initializeCSRFToken,
  refreshCSRFToken,
  clearCSRFToken,
} from "@/lib/csrf";

interface UseCSRFReturn {
  token: string | null;
  refresh: () => string;
  clear: () => void;
  initialize: () => string;
}

export const useCSRF = (): UseCSRFReturn => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Initialize token on component mount
    const initialToken = initializeCSRFToken();
    setToken(initialToken);
  }, []);

  const refresh = () => {
    const newToken = refreshCSRFToken();
    setToken(newToken);
    return newToken;
  };

  const clear = () => {
    clearCSRFToken();
    setToken(null);
  };

  const initialize = () => {
    const initialToken = initializeCSRFToken();
    setToken(initialToken);
    return initialToken;
  };

  return { token, refresh, clear, initialize };
};

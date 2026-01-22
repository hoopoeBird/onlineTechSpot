const getToken = (): string | null => {
  return localStorage.getItem("authToken");
};

interface FetchOptions extends RequestInit {
  includeAuth?: boolean;
}

export const apiCall = async <T = any>(
  url: string,
  options: FetchOptions = {},
): Promise<T> => {
  const { includeAuth = true, ...fetchOptions } = options;

  const headers = new Headers(fetchOptions.headers || {});

  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  if (!headers.has("Content-Type") && fetchOptions.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
    credentials: "include",
  });

  if (response.status === 401) {
    localStorage.removeItem("authToken");
    window.dispatchEvent(new CustomEvent("unauthorized"));
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "API request failed");
  }

  return data;
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem("authToken", token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem("authToken");
};

export const getAuthToken = (): string | null => {
  return getToken();
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

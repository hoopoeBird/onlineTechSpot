# JWT Authentication with localStorage

## Overview
This implementation provides automatic JWT token management and authenticated API requests.

## Key Features

1. **Automatic Token Storage**: JWT tokens from Strapi are automatically stored in localStorage
2. **Auto-attached Authorization Headers**: All authenticated API requests automatically include the JWT token
3. **Token Expiration Handling**: 401 responses trigger token removal and logout event

## Usage

### 1. After Login/Registration
The AuthContext automatically:
- Extracts JWT from Strapi response
- Stores it in localStorage via `setAuthToken()`
- Sends it with subsequent authenticated requests

### 2. Making Authenticated API Calls

Use the `apiCall` utility instead of `fetch`:

```tsx
import { apiCall } from "@/lib/api";

// Token is automatically included in Authorization header
const userData = await apiCall(`//${serverUrl}/api/v1/users/me`);

// For requests that don't need auth:
const publicData = await apiCall(`//${serverUrl}/api/v1/products`, {
  includeAuth: false,
});

// POST requests with auth
await apiCall(`//${serverUrl}/api/v1/users/update`, {
  method: "PUT",
  body: JSON.stringify({ name: "John" }),
});
```

### 3. Token Management Functions

```tsx
import { setAuthToken, removeAuthToken, getAuthToken, isAuthenticated } from "@/lib/api";

// Set token manually (done automatically after login)
setAuthToken(jwtToken);

// Get current token
const token = getAuthToken();

// Remove token (done automatically on logout/401)
removeAuthToken();

// Check if user is authenticated
if (isAuthenticated()) {
  // User has valid token
}
```

### 4. Handling Unauthorized (401)

The app automatically handles 401 responses by:
1. Removing the token from localStorage
2. Dispatching an 'unauthorized' event
3. Components can listen to this event to redirect to login

```tsx
useEffect(() => {
  const handleUnauthorized = () => {
    // Redirect to login or show login modal
    navigate("/signin");
  };

  window.addEventListener("unauthorized", handleUnauthorized);
  return () => window.removeEventListener("unauthorized", handleUnauthorized);
}, []);
```

## Implementation Details

### LocalStorage Key
- `authToken` - Stores the JWT token

### API Call Flow
1. Check if token exists in localStorage
2. If yes, add to Authorization header: `Bearer {token}`
3. Include `credentials: "include"` for CORS requests
4. Handle 401 responses by clearing token

### Migration from Cookies
Previous implementation used js-cookie to store tokens. This is now replaced with localStorage for better React compatibility and simpler management.

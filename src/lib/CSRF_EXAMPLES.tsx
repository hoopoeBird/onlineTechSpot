/**
 * Example: How to Use CSRF-Protected API in Your Components
 * 
 * Copy and modify these patterns for your own pages
 */

import { useState } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api-client";
import { useCSRF } from "@/hooks/useCSRF";
import Cookies from "js-cookie";

/**
 * Example 1: Simple Form Submission with CSRF Protection
 */
export function ExampleFormSubmission() {
  const [loading, setLoading] = useState(false);
  const { token } = useCSRF();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      // The CSRF token is automatically added by apiPost
      const response = await apiPost("/api/endpoint", {
        name: "John Doe",
        email: "john@example.com",
      });

      const data = await response.json();
      console.log("Success:", data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Name" required />
      <input type="email" placeholder="Email" required />
      <button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}

/**
 * Example 2: Protected DELETE Request
 */
export function ExampleDeleteOperation() {
  const handleDelete = async (itemId: string) => {
    try {
      // CSRF token is automatically included
      const response = await apiDelete(`/api/items/${itemId}`);

      if (response.ok) {
        console.log("Item deleted successfully");
      }
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  return (
    <button onClick={() => handleDelete("123")}>Delete Item</button>
  );
}

/**
 * Example 3: Protected UPDATE with Authorization
 */
export function ExampleUpdateProfile() {
  const [loading, setLoading] = useState(false);
  const serverUrl = import.meta.env.VITE_SERVER;

  const handleUpdate = async (profileData: any) => {
    setLoading(true);

    try {
      // Pass custom headers (like Authorization) as second argument
      const response = await apiPut(
        `//${serverUrl}/api/users/me`,
        profileData,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
          },
        }
      );

      const data = await response.json();
      console.log("Profile updated:", data);
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={() => handleUpdate({ name: "Jane Doe" })}>
      Update Profile
    </button>
  );
}

/**
 * Example 4: Protected POST with Custom Headers
 */
export function ExampleCreateOrder() {
  const serverUrl = import.meta.env.VITE_SERVER;

  const createOrder = async (items: any[], customer: any) => {
    try {
      const response = await apiPost(
        `//${serverUrl}/api/orders`,
        {
          data: {
            customer_name: customer.name,
            customer_email: customer.email,
            order_items: items,
            order_status: "pending",
          },
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
            "X-Custom-Header": "custom-value",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const order = await response.json();
      return order;
    } catch (error) {
      console.error("Order creation failed:", error);
      throw error;
    }
  };

  return (
    <button
      onClick={() =>
        createOrder(
          [{ id: 1, quantity: 2 }],
          { name: "John", email: "john@example.com" }
        )
      }
    >
      Create Order
    </button>
  );
}

/**
 * Example 5: Manual CSRF Token Management
 * Use this when you need more control over token rotation
 */
export function ExampleManualCSRFControl() {
  const { token, refresh, clear } = useCSRF();

  const handleSensitiveOperation = async () => {
    try {
      // Perform sensitive operation
      const response = await apiPost("/api/sensitive-operation", {
        action: "critical",
      });

      // After sensitive operation, refresh token for security
      refresh();

      console.log("Operation successful, token refreshed");
    } catch (error) {
      console.error("Operation failed:", error);
    }
  };

  const handleLogout = () => {
    // Clear CSRF token on logout
    clear();
  };

  return (
    <div>
      <button onClick={handleSensitiveOperation}>
        Perform Sensitive Operation
      </button>
      <button onClick={handleLogout}>Logout (Clear Token)</button>
      <p>Current Token: {token?.substring(0, 10)}...</p>
    </div>
  );
}

/**
 * Example 6: Fetch with Error Handling and CSRF
 */
export async function fetchWithCSRFProtection(
  url: string,
  options: RequestInit = {}
) {
  try {
    // Use the secure API fetch wrapper
    const response = await apiPost(url, options.body, {
      ...options,
      headers: {
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
}

/**
 * Example 7: Batch Operations with CSRF
 */
export async function batchDeleteItems(itemIds: string[]) {
  const promises = itemIds.map((id) =>
    apiDelete(`/api/items/${id}`).catch((err) => ({
      id,
      error: err,
    }))
  );

  const results = await Promise.all(promises);
  return results;
}

/**
 * Example 8: Upload File with CSRF Protection
 */
export async function uploadFileWithCSRF(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  // Note: Don't use apiPost for FormData, use secureApiFetch instead
  import { secureApiFetch } from "@/lib/api-client";

  const response = await secureApiFetch("/api/upload", {
    method: "POST",
    body: formData,
    // Don't set Content-Type header, browser will set it automatically
    // with correct boundary for multipart/form-data
  });

  return response.json();
}

export default {
  ExampleFormSubmission,
  ExampleDeleteOperation,
  ExampleUpdateProfile,
  ExampleCreateOrder,
  ExampleManualCSRFControl,
  fetchWithCSRFProtection,
  batchDeleteItems,
  uploadFileWithCSRF,
};

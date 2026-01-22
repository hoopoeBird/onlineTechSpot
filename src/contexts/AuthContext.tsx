import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { toast } from "sonner";
import {
  apiCall,
  setAuthToken,
  removeAuthToken,
  getAuthToken,
} from "@/lib/api";

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    username: string,
    phone: string,
    name: string,
  ) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  console.log("useAuth: ", user);

  const serverUrl = import.meta.env.VITE_SERVER;

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      apiCall(`//${serverUrl}/api/v1/users/me`)
        .then((data) => {
          console.log("useauth: ", data);
          if (data.id) {
            setUser(data);
          }
        })
        .catch((error) => {
          console.error("Failed to fetch user:", error);
          removeAuthToken();
        });
    }
  }, []);

  const login = async (email: string, password: string) => {
    if (email && password) {
      try {
        const data = await apiCall(`//${serverUrl}/api/v1/auth/local`, {
          method: "POST",
          body: JSON.stringify({
            identifier: email,
            password,
          }),
          includeAuth: false,
        });

        console.log("data: ", data);

        if (data.error) {
          if (data.error.message == "Invalid identifier or password") {
            toast.error("Invalid Email or Password");
          } else {
            toast.error("Registration failed. Please try again.");
          }
          return null;
        }

        setAuthToken(data.jwt);
        delete data.jwt;
        setUser(data);
      } catch (error) {
        toast.error("Failed to login");
        throw error;
      }
      toast.success("Logged in successfully");
    } else {
      throw new Error("Invalid credentials");
    }
  };

  const register = async (
    email: string,
    password: string,
    username: string,
    phone: string,
    name: string,
  ) => {
    if (email && password && username) {
      try {
        const data = await apiCall(
          `//${serverUrl}/api/v1/auth/local/register`,
          {
            method: "POST",
            body: JSON.stringify({
              email,
              password,
              username,
            }),
            includeAuth: false,
          },
        );

        if (data.error) {
          if (data.error.message == "Email or Username are already taken") {
            toast.error("Email or Username are already taken");
          } else {
            toast.error("Registration failed. Please try again.");
          }
          return null;
        }

        setAuthToken(data.jwt);
        delete data.jwt;
        setUser(data);

        try {
          await apiCall(`//${serverUrl}/api/v1/users-permissions/users/me`, {
            method: "PUT",
            body: JSON.stringify({
              phone_number: phone,
              firstName: name,
            }),
          });
        } catch (error) {
          console.error("Failed to update user profile:", error);
        }
      } catch (error) {
        toast.error("Failed to register");
        throw error;
      }
      toast.success("Account Added successfully");
    } else {
      throw new Error("Invalid registration data");
    }
  };

  const logout = () => {
    const token = getAuthToken();
    if (token) {
      apiCall(`//${serverUrl}/api/v1/auth/logout`, {
        method: "DELETE",
      }).catch((error) => {
        console.error("Logout API call failed:", error);
      });
    }

    removeAuthToken();
    setUser(null);
    localStorage.removeItem("userPreferences");
    localStorage.removeItem("userOrders");
    window.location.reload();
    toast.success("Logged out successfully");
  };

  const updateProfile = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
      toast.success("Profile updated successfully");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

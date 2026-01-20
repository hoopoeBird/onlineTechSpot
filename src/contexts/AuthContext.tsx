import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { secureApiFetch, apiGet, apiPost, apiPut, apiDelete } from "@/lib/api-client";
import { clearCSRFToken } from "@/lib/csrf";

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
    name: string
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
    apiGet(`//${serverUrl}/api/users/me`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("accessToken")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("useauth: ", data);
        if (data.id) {
          setUser(data);
        }
      });
  }, []);

  const login = async (email: string, password: string) => {
    if (email && password) {
      try {
        let res = await apiPost(`//${serverUrl}/api/auth/local`, {
          identifier: email,
          password,
        });
        let data = await res.json();

        console.log("data: ", data);

        if (data.error) {
          if (data.error.message == "Invalid identifier or password") {
            toast.error("Invalid Email or Password");
          } else {
            toast.error("Registration failed. Please try again.");
          }
          return null;
        }

        Cookies.set("accessToken", data.jwt, {
          secure: true,
          sameSite: "strict",
          expires: 7,
        });
        delete data.jwt;
        setUser(data);
      } catch (error) {
        toast.error("Failed to login");
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
    name: string
  ) => {
    if (email && password && username) {
      try {
        let res = await apiPost(`//${serverUrl}/api/auth/local/register`, {
          email,
          password,
          username,
        });
        let data = await res.json();

        if (data.error) {
          if (data.error.message == "Email or Username are already taken") {
            toast.error("Email or Username are already taken");
          } else {
            toast.error("Registration failed. Please try again.");
          }
          return null;
        }

        Cookies.set("accessToken", data.jwt, {
          secure: true,
          sameSite: "strict",
          expires: 7,
        });
        delete data.jwt;
        setUser(data);

        try {
          let res = await apiPut(
            `//${serverUrl}/api/users-permissions/users/me`,
            {
              phone_number: phone,
              firstName: name,
            },
            {
              headers: {
                Authorization: `Bearer ${Cookies.get("accessToken")}`,
              },
            }
          );
        } catch (error) {}
      } catch (error) {
        toast.error("Failed to register");
      }
      toast.success("Account Added successfully");
    } else {
      throw new Error("Invalid registration data");
    }
  };

  const logout = () => {
    apiDelete(`//${serverUrl}/api/auth/logout`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("accessToken")}`,
      },
    });
    Cookies.remove("accessToken", {
      secure: true,
      sameSite: "strict",
    });
    clearCSRFToken();
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

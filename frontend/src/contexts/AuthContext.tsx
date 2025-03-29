import axios from "axios";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { toast } from "react-toastify";

interface AuthState {
  isAuthenticated: boolean;
  email: string | null;
}

interface AuthResponse {
  success: boolean;
  email?: string;
  message?: string;
}

interface AuthContextType {
  auth: AuthState;
  isLoading: boolean;
  error: string | null;
  setAuth: (auth: AuthState) => void;
  login: (email: string) => Promise<boolean>;
  logout: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    email: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const validateStoredToken = async () => {
      const storedAuth = localStorage.getItem("authToken");
      if (!storedAuth) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.post<AuthResponse>(`${import.meta.env.VITE_BACKEND_URL}/api/admin/auth`, {
          email: storedAuth,
        });

        if (response.data.success) {
          setAuth({
            isAuthenticated: true,
            email: response.data.email || null,
          });
        } else {
          setAuth({
            isAuthenticated: false,
            email: null,
          });
          const errorMessage = response.data.message || "Authentication failed";
          setError(errorMessage);
          toast.error(errorMessage, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          localStorage.removeItem("authToken");
        }
      } catch (err) {
        const errorMessage = "Failed to validate authentication";
        setError(errorMessage);
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setAuth({
          isAuthenticated: false,
          email: null,
        });
        localStorage.removeItem("authToken");
      } finally {
        setIsLoading(false);
      }
    };

    validateStoredToken();
  }, []);

  const login = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post<AuthResponse>(`${import.meta.env.VITE_BACKEND_URL}/api/admin/auth`, {
        email: email,
      });

      if (response.data.success) {
        setAuth({
          isAuthenticated: true,
          email: response.data.email || null,
        });
        localStorage.setItem("authToken", email);
        toast.success("Login successful!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return true;
      }

      setAuth({
        isAuthenticated: false,
        email: null,
      });
      const errorMessage = response.data.message || "Email not authorized";
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return false;
    } catch (err) {
      let errorMessage = "Login failed. Please try again.";
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setAuth({
        isAuthenticated: false,
        email: null,
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setAuth({
      isAuthenticated: false,
      email: null,
    });
    setError(null);
    localStorage.removeItem("authToken");
    toast.info("Logged out successfully", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const value = {
    auth,
    isLoading,
    error,
    setAuth,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

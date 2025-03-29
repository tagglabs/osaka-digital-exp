import axios from "axios";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface AuthContextType {
  auth: boolean;
  isLoading: boolean;
  error: string | null;
  setAuth: (auth: boolean) => void;
  login: (email: string) => Promise<boolean>;
  logout: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<
  AuthContextType | undefined
>(undefined);

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [auth, setAuth] = useState(false);
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
        const response = await axios.post(
          `/api/admin/auth`,
          {
            email: storedAuth,
          },
        );

        setAuth(response.data === true);
      } catch (err) {
        setError("Failed to validate authentication");
        setAuth(false);
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
      const response = await axios.post(
        "http://localhost:3000/api/admin/auth",
        { email: email },
      );
      const isAuthenticated = response.data === true;

      if (isAuthenticated) {
        setAuth(true);
        localStorage.setItem("authToken", email);
        return true;
      }
      return false;
    } catch (err) {
      setError("Login failed. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setAuth(false);
    setError(null);
    localStorage.removeItem("authToken");
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
    throw new Error(
      "useAuth must be used within an AuthProvider",
    );
  }
  return context;
}

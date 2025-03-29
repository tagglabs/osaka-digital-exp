import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

interface AuthContextType {
  auth: boolean;
  setAuth: (auth: boolean) => void;
  login: (email: string) => boolean;
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
  const [auth, setAuth] = useState(() => {
    const storedAuth = localStorage.getItem("authToken");
    return storedAuth === "true";
  });

  const login = (email: string): boolean => {
    const adminEmail = import.meta.env
      .OSAKAARTIFACT25_CMS_VITE_ADMIN_EMAIL;

    if (email === adminEmail) {
      setAuth(true);
      localStorage.setItem("authToken", "true");
      return true;
    }
    return false;
  };

  const logout = () => {
    setAuth(false);
    localStorage.removeItem("authToken");
  };

  const value = {
    auth,
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

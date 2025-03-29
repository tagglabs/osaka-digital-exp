import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import AuthModal from "./AuthModal";
import { Button } from "./Button";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const LockIcon = () => (
  <svg
    className="w-16 h-16 text-gray-400 mb-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z"
    />
  </svg>
);

const LoadingSpinner = () => (
  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700" />
);

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { auth, isLoading, error } = useAuth();
  const [showModal, setShowModal] = useState(!auth.isAuthenticated);

  useEffect(() => {
    if (!auth.isAuthenticated) {
      setShowModal(true);
    }
  }, [auth.isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return (
      <div className="relative min-h-screen">
        <AuthModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
        {/* Overlay with styled content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-gray-50/95">
          <div className="flex flex-col justify-center items-center text-center p-8 rounded-lg max-w-md">
            <LockIcon />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-6">
              This is a protected area. Please login with your administrator email to access this page.
            </p>
            {error && (
              <div className="text-red-500 text-sm font-medium mb-4">
                {error}
              </div>
            )}
            <Button
              placeholder="Login"
              onClick={() => setShowModal(true)}
            />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;

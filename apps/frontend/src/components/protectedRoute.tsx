import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token, loading } = useAuth();

  // Wait for session restore
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-text">
        <p className="text-sm text-muted">Loading...</p>
      </div>
    );
  }

  // Not authenticated
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

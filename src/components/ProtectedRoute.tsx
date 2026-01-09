import { Navigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { IconBottle } from "./icons";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-blue-400 z-50">
        <IconBottle className="w-16 h-16 text-white mb-4 animate-pulse" />
        <h1 className="text-2xl font-semibold text-white">Baby Track</h1>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

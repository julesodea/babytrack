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
      <div 
        className="fixed flex flex-col items-center justify-center bg-blue-400 z-50" 
        style={{ 
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)'
        }}
      >
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

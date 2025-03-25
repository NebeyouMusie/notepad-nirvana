
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface RequireAuthProps {
  children: React.ReactNode;
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex h-screen w-screen items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" />;
  }

  return <>{children}</>;
}

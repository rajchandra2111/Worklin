import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useUiStore } from '../../store/uiStore';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  allowedRoles?: ('client' | 'freelancer')[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, role, isLoading } = useAuth();
  const { openAuthModal } = useUiStore();

  useEffect(() => {
    if (!isLoading && !user) {
      openAuthModal('login');
    }
  }, [isLoading, user, openAuthModal]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!role) {
    return <Navigate to="/onboarding" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role as any)) {
    // If they are logged in but don't have the right role, send them to their own dashboard
    return <Navigate to={`/${role}/dashboard`} replace />;
  }

  return <Outlet />;
}

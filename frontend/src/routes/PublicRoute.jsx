import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export function PublicRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-primary mb-4" size={32} />
        <p className="text-muted-foreground animate-pulse">Checking session...</p>
      </div>
    );
  }

  if (user) {
    return <Navigate to={from} replace />;
  }

  return <Outlet />;
}

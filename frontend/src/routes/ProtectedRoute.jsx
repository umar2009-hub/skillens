import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export function ProtectedRoute({ isAuthenticated }) {
  // Mock authentication for milestone 0
  const isAuth = true; 
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

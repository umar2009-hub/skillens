import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export function PublicRoute({ isAuthenticated }) {
  // Mock authentication for milestone 0
  const isAuth = false;
  if (isAuth) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}

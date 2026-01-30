import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'ADMIN' | 'EMPLOYEE';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAuth();
  // Fallback: treat as authenticated if token is in localStorage (avoids redirect to login
  // when navigating to /dashboard right after login before context state has updated)
  const hasStoredAuth =
    typeof window !== 'undefined' &&
    !!localStorage.getItem('access_token') &&
    !!localStorage.getItem('user');
  const authenticated = isAuthenticated || hasStoredAuth;

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole === 'ADMIN' && user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

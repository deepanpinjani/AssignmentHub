import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-gray-600">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to specific portal login based on route path
    const fallbackPath = allowedRole === 'admin' ? '/admin/login' : '/student/login';
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Role validation check
  if (allowedRole && user.role !== allowedRole) {
    // If student attempts to view admin dashboard -> send to student dashboard
    if (user.role === 'student') {
      return <Navigate to="/student/dashboard" replace />;
    }
    // If admin attempts to view student dashboard -> send to admin dashboard
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

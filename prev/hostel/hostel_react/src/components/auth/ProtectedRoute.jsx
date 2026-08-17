import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthData } from '../../hooks/useAuthData';

function ProtectedRoute({ children }) {
  const { token, isAuthenticated, initialized, loading } = useAuthData();
  
  // Show loading while auth is being initialized
  if (!initialized || loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!token || !isAuthenticated) {
    return <Navigate to="/login-prompt" replace />;
  }
  
  return children;
}

export default ProtectedRoute;

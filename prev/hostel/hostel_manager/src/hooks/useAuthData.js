import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { initializeAuth, logout } from '../store/slices/authSlice';

// Clean auth hook with proper error handling
export const useAuthData = () => {
  const dispatch = useDispatch();
  
  // Select from Redux state
  const authState = useSelector(state => state.auth);
  const { isAuthenticated, token, email, user, loading, error, initialized } = authState;

  // Initialize auth from localStorage on mount - only run once
  useEffect(() => {
    // Only initialize if not already initialized
    if (initialized) return;

    const initializeFromStorage = () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedEmail = localStorage.getItem('email');
        const storedUser = localStorage.getItem('userData');


        if (storedToken) {
          dispatch(initializeAuth({
            token: storedToken,
            email: storedEmail || null,
            user: storedUser ? JSON.parse(storedUser) : null
          }));
        } else {
          dispatch(logout());
        }
      } catch (error) {
        // Clear invalid data and logout
        localStorage.clear();
        dispatch(logout());
      }
    };

    initializeFromStorage();
  }, [dispatch, initialized]); // Add initialized to dependencies

  // Helper functions for external use
  const login = (authData) => {
    try {
      // Save to localStorage
      localStorage.setItem('token', authData.token);
      if (authData.email) localStorage.setItem('email', authData.email);
      if (authData.user) localStorage.setItem('userData', JSON.stringify(authData.user));
      
      // Update Redux
      dispatch(initializeAuth(authData));
    } catch (error) {
    }
  };

  const logoutUser = () => {
    try {
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('email');
      localStorage.removeItem('userData');
      localStorage.removeItem('information');
      localStorage.removeItem('reservation_data');
      
      // Update Redux
      dispatch(logout());
    } catch (error) {
    }
  };

  return {
    isAuthenticated,
    token,
    email,
    user,
    loading,
    error,
    initialized,
    login,
    logout: logoutUser,
  };
};
// Authentication utility functions

/**
 * Checks if a response indicates an unverified account
 * @param {Response} response - The fetch response object
 * @returns {Promise<boolean>} - True if account is unverified
 */
export const checkResponseForUnverifiedAccount = async (response) => {
  if (response.status === 401 || response.status === 403) {
    try {
      const data = await response.json();
      return data.error === "Account not verified" || 
             data.account_verified === false ||
             data.requires_verification === true;
    } catch (error) {
      // If we can't parse the response, assume it might be an auth issue
      return true;
    }
  }
  return false;
};

/**
 * Handles unverified account by redirecting to email verification
 * @param {string} email - The user's email
 * @param {Function} navigate - React Router navigate function
 */
export const handleUnverifiedAccount = (email, navigate) => {
  // Store email for verification process
  if (email && email !== 'undefined') {
    localStorage.setItem('email', email);
  }
  
  // Clear any existing auth data
  localStorage.removeItem('token');
  localStorage.removeItem('userData');
  localStorage.removeItem('name');
  
  // Navigate to email verification
  navigate('/email-verification');
};

/**
 * Safely sets email in localStorage, preventing 'undefined' or 'null' strings
 * @param {string} email - The email to store
 */
export const setEmailSafely = (email) => {
  if (email && email !== 'undefined' && email !== 'null' && email.trim() !== '') {
    localStorage.setItem('email', email);
    return true;
  }
  return false;
};

/**
 * Clears all authentication data from localStorage
 */
export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('email');
  localStorage.removeItem('userData');
  localStorage.removeItem('name');
  localStorage.removeItem('reservation_data');
};

/**
 * Checks if the current auth data is valid
 * @returns {boolean} - True if auth data is valid
 */
export const isAuthDataValid = () => {
  const token = localStorage.getItem('token');
  const email = localStorage.getItem('email');
  
  return !!(token && email && email !== 'undefined' && email !== 'null');
};

/**
 * Gets valid auth data from localStorage
 * @returns {Object|null} - Auth data object or null if invalid
 */
export const getValidAuthData = () => {
  if (!isAuthDataValid()) {
    return null;
  }
  
  try {
    const userData = localStorage.getItem('userData');
    return {
      token: localStorage.getItem('token'),
      email: localStorage.getItem('email'),
      user: userData ? JSON.parse(userData) : null
    };
  } catch (error) {
    return null;
  }
};
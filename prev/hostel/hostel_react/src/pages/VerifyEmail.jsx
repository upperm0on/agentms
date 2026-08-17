import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { buildApiUrl, API_ENDPOINTS } from '../config/api';
import { Check, X, Loader2 } from 'lucide-react';
import './VerifyEmail.css';

/**
 * VerifyEmail Component
 * 
 * Handles email verification flow when users click verification links from their email.
 * 
 * Flow:
 * 1. User clicks email link: https://hosttels.com/verify-email/12345abcde
 * 2. Component extracts token from URL params
 * 3. Makes GET request to Django backend: GET /hq/api/verify-email/12345abcde/
 * 4. Displays appropriate success/error message
 * 5. Redirects to dashboard on success
 */
const VerifyEmail = () => {
  // Extract token from URL parameters
  const { token } = useParams();
  const navigate = useNavigate();
  
  // Component state
  const [verificationStatus, setVerificationStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Verify email using the token from URL
   */
  const verifyEmail = async () => {
    try {
      // Validate token exists
      if (!token) {
        setVerificationStatus('error');
        setMessage('Invalid verification link. No token provided.');
        setIsLoading(false);
        return;
      }

      // Make GET request to Django verification endpoint
      const response = await fetch(buildApiUrl(`${API_ENDPOINTS.VERIFY_EMAIL}${token}/`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        // Verification successful
        setVerificationStatus('success');
        setMessage(data.message || 'Email verified successfully!');
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        // Verification failed
        setVerificationStatus('error');
        setMessage(data.message || 'Link expired or invalid.');
      }
    } catch (error) {
      // Network or other error
      setVerificationStatus('error');
      setMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Run verification on component mount
  useEffect(() => {
    verifyEmail();
  }, [token]); // Re-run if token changes

  /**
   * Handle navigation to login page
   */
  const handleGoToLogin = () => {
    navigate('/login');
  };

  /**
   * Handle navigation to dashboard
   */
  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  /**
   * Handle retry verification
   */
  const handleRetry = () => {
    setIsLoading(true);
    setVerificationStatus('verifying');
    verifyEmail();
  };

  return (
    <div className="verify-email-container">
      <div className="verify-email-card">
        {/* Header with icon and title */}
        <div className="verify-email-header">
          <div className="verify-email-icon">
            {verificationStatus === 'verifying' && (
              <div className="loading-spinner" aria-label="Verifying email">
                <Loader2 className="spinner" size={40} />
              </div>
            )}
            {verificationStatus === 'success' && (
              <div className="success-icon" aria-label="Email verified">
                <Check size={28} />
              </div>
            )}
            {verificationStatus === 'error' && (
              <div className="error-icon" aria-label="Verification failed">
                <X size={28} />
              </div>
            )}
          </div>
          
          <h1 className="verify-email-title">
            {verificationStatus === 'verifying' && 'Verifying Your Email...'}
            {verificationStatus === 'success' && 'Email Verified Successfully!'}
            {verificationStatus === 'error' && 'Verification Failed'}
          </h1>
        </div>

        {/* Content area */}
        <div className="verify-email-content">
          {/* Loading state */}
          {verificationStatus === 'verifying' && (
            <div className="verifying-message">
              <p>Please wait while we verify your email address.</p>
              <p>This may take a few moments...</p>
            </div>
          )}

          {/* Success state */}
          {verificationStatus === 'success' && (
            <div className="success-message">
              <p className="success-text">{message}</p>
              <p className="redirect-notice">
                You will be automatically redirected to your dashboard in a few seconds.
              </p>
              <div className="success-actions">
                <button 
                  className="btn btn-primary"
                  onClick={handleGoToDashboard}
                  aria-label="Go to dashboard"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          )}

          {/* Error state */}
          {verificationStatus === 'error' && (
            <div className="error-message">
              <p className="error-text">{message}</p>
              <div className="error-actions">
                <button 
                  className="btn btn-primary"
                  onClick={handleRetry}
                  aria-label="Try verification again"
                >
                  Try Again
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={handleGoToLogin}
                  aria-label="Go back to login"
                >
                  Back to Login
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Loading overlay */}
        {isLoading && verificationStatus === 'verifying' && (
          <div className="loading-overlay">
            <div className="loading-text">Verifying...</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
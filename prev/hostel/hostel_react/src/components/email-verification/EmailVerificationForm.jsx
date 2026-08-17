import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../assets/css/email-verification/EmailVerificationForm.css";
import { buildApiUrl, API_ENDPOINTS } from "../../config/api";
import { Mail, CheckCircle, AlertCircle, RefreshCw, ArrowLeft, CheckCircle2 } from "lucide-react";

function EmailVerificationForm() {
  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState(null);
  const [isCheckingVerification, setIsCheckingVerification] = useState(false);
  const [verificationError, setVerificationError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get email from localStorage if available
    const storedEmail = localStorage.getItem("email");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const handleResendVerification = async () => {
    if (!email) {
      setResendError("Please enter your email address");
      return;
    }

    setIsResending(true);
    setResendError(null);
    setResendSuccess(false);

    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.RESEND_VERIFICATION), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setResendSuccess(true);
        // Clear success message after 5 seconds
        setTimeout(() => setResendSuccess(false), 5000);
      } else {
        const errorData = await response.json();
        setResendError(errorData.message || "Failed to resend verification email");
      }
    } catch (error) {
      setResendError("Network error. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const handleCheckVerification = async () => {
    if (!email) {
      setVerificationError("Please enter your email address");
      return;
    }

    setIsCheckingVerification(true);
    setVerificationError(null);

    try {
      // Try to login again to check if account is now verified
      const response = await fetch(buildApiUrl(API_ENDPOINTS.LOGIN), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: "dummy_password" // We're just checking verification status
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // If login succeeds, account is verified
        navigate("/dashboard");
      } else {
        // Check if it's still an unverified account error
        if (data.error === "Account not verified" || data.account_verified === false) {
          setVerificationError("Account is still not verified. Please check your email and click the verification link.");
        } else if (data.error === "Invalid credentials") {
          // This means account is verified but password is wrong (which is expected)
          navigate("/dashboard");
        } else {
          setVerificationError("Please try logging in again to verify your account.");
        }
      }
    } catch (error) {
      setVerificationError("Network error. Please try again.");
    } finally {
      setIsCheckingVerification(false);
    }
  };

  const handleBackToLogin = () => {
    // Clear any stored data and go back to login
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("name");
    window.dispatchEvent(new Event("authChange"));
    navigate("/login");
  };

  return (
    <div className="email-verification-container">
      <div className="verification-card">
        <div className="verification-header">
          <div className="verification-icon">
            <Mail size={48} />
          </div>
          <h1 className="verification-title">Check Your Email</h1>
          <p className="verification-subtitle">
            We've sent a verification link to your email address
          </p>
        </div>

        <div className="verification-content">
          <div className="email-display">
            <div className="email-icon">
              <Mail size={20} />
            </div>
            <span className="email-text">{email || "your email address"}</span>
          </div>

          <div className="verification-steps">
            <div className="step">
              <div className="step-icon">
                <CheckCircle size={20} />
              </div>
              <div className="step-content">
                <h3>Check your inbox</h3>
                <p>Look for an email from us with the subject "Verify your account"</p>
              </div>
            </div>

            <div className="step">
              <div className="step-icon">
                <CheckCircle size={20} />
              </div>
              <div className="step-content">
                <h3>Click the verification link</h3>
                <p>This will activate your account and redirect you to the login page</p>
              </div>
            </div>

            <div className="step">
              <div className="step-icon">
                <CheckCircle size={20} />
              </div>
              <div className="step-content">
                <h3>Sign in to your account</h3>
                <p>Once verified, you can access all features of the platform</p>
              </div>
            </div>
          </div>

          {resendError && (
            <div className="error-message">
              <AlertCircle size={16} />
              {resendError}
            </div>
          )}

          {resendSuccess && (
            <div className="success-message">
              <CheckCircle size={16} />
              Verification email sent successfully! Please check your inbox.
            </div>
          )}

          {verificationError && (
            <div className="error-message">
              <AlertCircle size={16} />
              {verificationError}
            </div>
          )}

          <div className="verification-actions">
            <button
              type="button"
              className="verify-button"
              onClick={handleCheckVerification}
            >
              <CheckCircle2 size={16} />
              I've Verified My Email
            </button>

            <button
              type="button"
              className="resend-button"
              onClick={handleResendVerification}
              disabled={isResending}
            >
              {isResending ? (
                <>
                  <RefreshCw size={16} className="spinning" />
                  Sending...
                </>
              ) : (
                <>
                  <RefreshCw size={16} />
                  Resend Verification Email
                </>
              )}
            </button>

            <button
              type="button"
              className="back-button"
              onClick={handleBackToLogin}
            >
              <ArrowLeft size={16} />
              Back to Login
            </button>
          </div>

          <div className="help-section">
            <h4>Need help?</h4>
            <ul>
              <li>After clicking the verification link in your email, click "I've Verified My Email" above</li>
              <li>Check your spam or junk folder if you didn't receive the email</li>
              <li>Make sure you entered the correct email address</li>
              <li>Wait a few minutes and try resending if needed</li>
              <li>Contact support if the problem persists</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmailVerificationForm;

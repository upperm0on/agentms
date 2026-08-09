import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../assets/css/signup/SignUpForms.css";
import { buildApiUrl, API_ENDPOINTS } from "../../config/api";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { setEmailSafely } from "../../utils/authUtils";
import { useAuthData } from "../../hooks/useAuthData";

function LoginForms() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthData();
  const googleButtonRef = useRef(null);

  async function handleLogin(e) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const email = e.target.querySelector("#email").value;
    const password = e.target.querySelector("#password").value;

    try {
      const res = await fetch(buildApiUrl(API_ENDPOINTS.LOGIN), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        
        // Check if the error is due to unverified account
        if (errorData.error === "Account not verified" || errorData.account_verified === false) {
          // User needs to verify their email
          setEmailSafely(email);
          navigate("/email-verification");
          return;
        }
        
        throw new Error(errorData.message || "Invalid credentials");
      }

      const data = await res.json();

      if (data.token) {
        // Use the auth hook to handle login
        login({
          token: data.token,
          email: email,
          user: {
            name: data.name || email.split('@')[0],
            email: email
          }
        });

        setEmailSafely(email);
        localStorage.setItem("name", data.name || email.split('@')[0]);

        // 🔔 Tell NavBar to update immediately
        window.dispatchEvent(new Event("authChange"));

        // Small delay to ensure Redux state is updated
        setTimeout(() => {
          navigate("/");
        }, 100);
      } else if (data.requires_verification) {
        // User needs to verify their email
        setEmailSafely(email);
        navigate("/email-verification");
      } else {
        setError("Invalid login. Please try again.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleLogin(credentialResponse) {
    setIsGoogleLoading(true);
    setError(null);

    try {
      // Send the credential (JWT) to backend
      const res = await fetch(buildApiUrl(API_ENDPOINTS.GOOGLE_OAUTH), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Google login failed");
      }

      const data = await res.json();

      if (data.token) {
        // Use the auth hook to handle login
        login({
          token: data.token,
          email: data.email,
          user: {
            name: data.name || data.email.split('@')[0],
            email: data.email
          }
        });

        setEmailSafely(data.email);
        localStorage.setItem("name", data.name || data.email.split('@')[0]);

        // 🔔 Tell NavBar to update immediately
        window.dispatchEvent(new Event("authChange"));

        // Small delay to ensure Redux state is updated
        setTimeout(() => {
          navigate("/");
        }, 100);
      } else {
        setError("Google login failed. Please try again.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGoogleLoading(false);
    }
  }

  useEffect(() => {
    // Initialize Google Sign-In when component mounts
    let retryCount = 0;
    const maxRetries = 50; // 5 seconds max wait
    
    const initGoogleSignIn = () => {
      if (window.google && window.google.accounts && googleButtonRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: '826839521219-9u0v1qimobnrfnt7plch3nlr8phsnsia.apps.googleusercontent.com',
            callback: handleGoogleLogin,
          });

          window.google.accounts.id.renderButton(
            googleButtonRef.current,
            {
              theme: 'outline',
              size: 'large',
              text: 'signin_with',
              locale: 'en',
            }
          );
        } catch (error) {
          console.error('Error initializing Google Sign-In:', error);
        }
      } else if (retryCount < maxRetries) {
        retryCount++;
        // Retry after a short delay if Google script hasn't loaded yet
        setTimeout(initGoogleSignIn, 100);
      } else {
        console.warn('Google Sign-In script failed to load after maximum retries');
      }
    };

    // Start initialization
    initGoogleSignIn();
  }, []);

  return (
    <form className="sign_up" onSubmit={handleLogin}>
      <h2 className="form-title">Jump Back In</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="sign_up-item">
        <label htmlFor="email">
          <div className="label_container">
            <Mail size={20} />
          </div>
        </label>
        <input type="email" id="email" placeholder="Email Address" autoFocus required />
      </div>

      <div className="sign_up-item">
        <label htmlFor="password">
          <div className="label_container">
            <Lock size={20} />
          </div>
        </label>
        <input
          type={showPassword ? "text" : "password"}
          id="password"
          placeholder="Password"
          required
        />
        <div
          className="show_hide"
          onClick={() => setShowPassword((prev) => !prev)}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </div>
      </div>

      <button type="submit" className="form_submit" disabled={isLoading}>
        {isLoading ? "Signing In..." : "Submit"}
      </button>

      <div className="divider" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        margin: '20px 0',
        textAlign: 'center'
      }}>
        <div style={{ flex: 1, height: '1px', background: '#e0e0e0' }}></div>
        <span style={{ padding: '0 15px', color: '#666', fontSize: '14px' }}>OR</span>
        <div style={{ flex: 1, height: '1px', background: '#e0e0e0' }}></div>
      </div>

      <div 
        ref={googleButtonRef}
        id="google-signin-button"
        style={{ 
          width: '100%', 
          minHeight: '40px',
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '20px'
        }}
      ></div>
      
      <p className="login_option">
        Don't have an account yet? <Link to="/signup">Sign-Up Here</Link>
      </p>
    </form>
  );
}

export default LoginForms;

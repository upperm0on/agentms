import React from 'react';
import { Link } from 'react-router-dom';
import { LogIn, UserPlus, Shield, Lock } from 'lucide-react';
import '../assets/css/auth/LoginPrompt.css';

function LoginPrompt() {
  return (
    <div className="login-prompt-container">
      <div className="login-prompt-card">
        <div className="login-prompt-header">
          <div className="login-prompt-icon">
            <Shield size={48} />
          </div>
          <h1 className="login-prompt-title">Authentication Required</h1>
          <p className="login-prompt-subtitle">
            Please log in to access the hostel booking system
          </p>
        </div>

        <div className="login-prompt-content">
          <div className="login-prompt-features">
            <div className="feature-item">
              <Lock size={20} />
              <span>Secure booking system</span>
            </div>
            <div className="feature-item">
              <UserPlus size={20} />
              <span>Easy registration process</span>
            </div>
            <div className="feature-item">
              <Shield size={20} />
              <span>Protected user data</span>
            </div>
          </div>

          <div className="login-prompt-actions">
            <Link to="/login" className="login-prompt-btn primary">
              <LogIn size={20} />
              <span>Log In</span>
            </Link>
            <Link to="/signup" className="login-prompt-btn secondary">
              <UserPlus size={20} />
              <span>Create Account</span>
            </Link>
          </div>
        </div>

        <div className="login-prompt-footer">
          <p className="login-prompt-note">
            New to our platform? Create an account to start booking hostels.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPrompt;

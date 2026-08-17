import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Building2, Lock } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { adminAuthAPI } from '../../services/adminApi'
import toast from 'react-hot-toast'
import './Login.css'

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const googleButtonRef = useRef(null)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      // No test bypass - always use real API
      
      console.log('Attempting login with:', formData.email)
      
      // Try the actual API call - using correct endpoint
      const response = await fetch('/hq/api/admin-login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          is_admin: true
        })
      })

      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)

      if (response.ok && data.token) {
        // Store the real token from API response
        localStorage.setItem('adminToken', data.token)
        localStorage.setItem('adminUser', JSON.stringify({
          name: data.username,
          email: data.email,
          is_manager: data.is_manager,
          account_verified: data.account_verified
        }))
        
        // Use the auth context login method
        const userData = { 
          name: data.username, 
          email: data.email,
          is_manager: data.is_manager,
          account_verified: data.account_verified
        }
        
        login(userData, data.token)
        toast.success('Login successful!')
        navigate('/dashboard')
      } else {
        toast.error(data.error || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Login failed. Please try again.')
    }
  }

  async function handleGoogleLogin(credentialResponse) {
    setIsGoogleLoading(true)
    
    try {
      const response = await fetch('/hq/api/google-oauth/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      })

      const data = await response.json()

      if (response.ok && data.token) {
        localStorage.setItem('adminToken', data.token)
        localStorage.setItem('adminUser', JSON.stringify({
          name: data.username,
          email: data.email,
          is_manager: data.is_manager,
          account_verified: data.account_verified
        }))
        
        const userData = { 
          name: data.username, 
          email: data.email,
          is_manager: data.is_manager,
          account_verified: data.account_verified
        }
        
        login(userData, data.token)
        toast.success('Login successful with Google!')
        navigate('/dashboard')
      } else {
        toast.error(data.error || 'Google login failed')
      }
    } catch (error) {
      console.error('Google login error:', error)
      toast.error('Google login failed. Please try again.')
    } finally {
      setIsGoogleLoading(false)
    }
  }

  useEffect(() => {
    let retryCount = 0
    const maxRetries = 50 // 5 seconds max wait
    
    const initGoogleSignIn = () => {
      if (window.google && window.google.accounts && googleButtonRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: '826839521219-9u0v1qimobnrfnt7plch3nlr8phsnsia.apps.googleusercontent.com',
            callback: handleGoogleLogin,
          })

          window.google.accounts.id.renderButton(
            googleButtonRef.current,
            {
              theme: 'outline',
              size: 'large',
              text: 'signin_with',
              locale: 'en',
            }
          )
        } catch (error) {
          console.error('Error initializing Google Sign-In:', error)
        }
      } else if (retryCount < maxRetries) {
        retryCount++
        setTimeout(initGoogleSignIn, 100)
      } else {
        console.warn('Google Sign-In script failed to load after maximum retries')
      }
    }

    initGoogleSignIn()
  }, [])

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <Building2 size={32} />
            <h1>Hostel Admin</h1>
          </div>
          <p className="login-subtitle">Sign in to your admin account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <div className="form-input-container">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="form-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>


          <button
            type="submit"
            className="login-button"
          >
            <Lock size={20} />
            Sign In
          </button>
        </form>

        <div style={{ 
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

        <div className="login-footer">
          <p>© 2024 Hostel Admin. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

export default Login

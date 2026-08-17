import React, { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { setAuth } from '../store/slices/authSlice'
import { fetchDelivererStatus } from '../store/slices/delivererSlice'
import { login, checkEntrepreneurWithToken } from '../services/authService'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { useToast } from '../contexts/ToastContext'
import '../components/auth/LoginForms.css'

function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useSelector(state => state.auth)
  const { success, error: showError } = useToast()
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const googleButtonRef = useRef(null)

  // Support receiving token via URL param (?token=...&username=...)
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const token = params.get('token')
    const username = params.get('username')
    const role = params.get('role')
    if (token) {
      localStorage.setItem('token', token)
      if (username) {
        localStorage.setItem('name', username)
      }
      dispatch(setAuth({ user: { username }, token, role }))
      if (role) dispatch(setRole(role))
      setMessage('Logged in successfully')
      // Redirect to previous or home
      navigate('/', { replace: true })
    }
  }, [location.search, dispatch, navigate])

  useEffect(() => {
    // If already authenticated, go home
    if (isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const mainAppSignupUrl = '/signup' // Replace with actual main app signup URL if different

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setMessage('')
    
    if (!email || !password) {
      setError('Please enter your email and password')
      return
    }
    
    setSubmitting(true)
    try {
      // Step 1: Login with regular endpoint (buyer login - not is_ent)
      console.log('Attempting login...')
      const loginData = await login(email, password, false)
      
      if (loginData.token) {
        console.log('Login successful, checking entrepreneur status...')
        
        // Save token and user data
        localStorage.setItem('token', loginData.token)
        if (loginData.username) {
          localStorage.setItem('name', loginData.username)
        }
        
        // Step 2: Check if user is entrepreneur using token-based endpoint
        // This is more efficient than trying entrepreneur login
        let isEntrepreneur = false
        let entrepreneurData = null
        
        try {
          const entrepreneurStatus = await checkEntrepreneurWithToken(loginData.token)
          if (entrepreneurStatus.is_entrepreneur && entrepreneurStatus.entrepreneur) {
            console.log('User is an entrepreneur (seller)', entrepreneurStatus)
            isEntrepreneur = true
            entrepreneurData = entrepreneurStatus.entrepreneur
          } else {
            console.log('User is not an entrepreneur (buyer) - will show Become Seller button')
            isEntrepreneur = false
          }
        } catch (entErr) {
          // User is not an entrepreneur - this is expected for buyers
          // Will show "Become a Seller" button in NavBar
          console.log('Error checking entrepreneur status (user is buyer):', entErr)
          isEntrepreneur = false
        }
        
        // Step 3: Check if user is a deliverer
        let isDeliverer = false
        let delivererData = null
        
        try {
          const delivererStatus = await dispatch(fetchDelivererStatus()).unwrap()
          if (delivererStatus.is_deliverer && delivererStatus.deliverer) {
            console.log('User is a deliverer', delivererStatus)
            isDeliverer = true
            delivererData = delivererStatus.deliverer
          }
        } catch (delErr) {
          // User is not a deliverer - this is expected
          console.log('User is not a deliverer:', delErr)
          isDeliverer = false
        }
        
        // Step 4: Set auth state based on entrepreneur and deliverer status
        dispatch(setAuth({
          user: {
            username: loginData.username,
            email: loginData.email,
          },
          token: loginData.token,
          role: isEntrepreneur ? 'seller' : 'buyer',
          entrepreneur: entrepreneurData,
          deliverer: delivererData,
          account_verified: loginData.account_verified || false,
        }))
        
        if (isEntrepreneur && isDeliverer) {
          success('Welcome back! You can access seller and deliverer features.')
        } else if (isEntrepreneur) {
          success('Welcome back, seller!')
        } else if (isDeliverer) {
          success('Welcome back, deliverer!')
        } else {
          success('Welcome back! You can become a seller or deliverer anytime.')
        }
        
        navigate('/', { replace: true })
      }
    } catch (err) {
      console.error('Login error:', err)
      const errorMessage = err.message || err.response?.data?.error || 'Login failed. Please check your credentials.'
      setError(errorMessage)
      showError(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoogleLogin = async (credentialResponse) => {
    setIsGoogleLoading(true)
    setError(null)
    setMessage('')

    try {
      const response = await fetch('/hq/api/google-oauth/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Google login failed')
      }

      const data = await response.json()

      if (data.token) {
        localStorage.setItem('token', data.token)
        if (data.username) {
          localStorage.setItem('name', data.username)
        }

        // Check if user is entrepreneur
        let isEntrepreneur = data.is_entrepreneur || false
        let entrepreneurData = data.entrepreneur || null

        dispatch(setAuth({
          user: {
            username: data.username,
            email: data.email,
          },
          token: data.token,
          role: isEntrepreneur ? 'seller' : 'buyer',
          entrepreneur: entrepreneurData,
          account_verified: data.account_verified || false,
        }))

        if (isEntrepreneur) {
          success('Welcome back, seller!')
        } else {
          success('Welcome back! You can become a seller anytime.')
        }

        navigate('/', { replace: true })
      } else {
        setError('Google login failed. Please try again.')
      }
    } catch (err) {
      console.error('Google login error:', err)
      const errorMessage = err.message || 'Google login failed. Please try again.'
      setError(errorMessage)
      showError(errorMessage)
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
    <form className="sign_up" onSubmit={handleSubmit}>
      <h2 className="form-title">Jump Back In</h2>

      {error && <div className="error-message">{error}</div>}
      {message && <div className="error-message" style={{ color: '#10b981', background: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.4)' }}>{message}</div>}

      <div className="sign_up-item">
        <label htmlFor="email">
          <div className="label_container">
            <Mail size={20} />
          </div>
        </label>
        <input
          type="email"
          id="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
          autoFocus
        />
      </div>

      <div className="sign_up-item">
        <label htmlFor="password">
          <div className="label_container">
            <Lock size={20} />
          </div>
        </label>
        <input
          type={showPassword ? 'text' : 'password'}
          id="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
        <div className="show_hide" onClick={() => setShowPassword(prev => !prev)}>
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </div>
      </div>

      <button type="submit" className="form_submit" disabled={submitting}>
        {submitting ? 'Signing In...' : 'Submit'}
      </button>

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

      <p className="login_option">
        Don't have an account yet? <a href={mainAppSignupUrl}>Sign-Up Here</a>
      </p>
    </form>
  )
}

export default Login



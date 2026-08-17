import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ArrowLeft, CheckCircle2, LoaderCircle, Mail, ShieldCheck } from 'lucide-react'
import type { AppProps } from '../../app/types'
import { Brand } from '../../components/layout/AppShell'
import { Field } from '../../components/shared/Primitives'
import './AuthPage.css'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: { client_id: string; callback: (response: { credential?: string }) => void }) => void
          renderButton: (element: HTMLElement, options: Record<string, string | number | boolean>) => void
        }
      }
    }
  }
}

function roleValue(role: 'Student' | 'Agent') {
  return role.toLowerCase() as 'student' | 'agent'
}

function loadGoogleScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve()
      return
    }
    const existing = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]')
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('Google login script failed to load.')), { once: true })
      return
    }
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Google login script failed to load.'))
    document.head.appendChild(script)
  })
}

export function AuthPage(props: AppProps) {
  const { path, navigate, busy } = props
  const [role, setRole] = useState<'Student' | 'Agent'>('Student')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const googleButtonRef = useRef<HTMLDivElement | null>(null)
  const title = path === '/login' ? 'Welcome back' : path === '/signup' ? 'Create your AgentMS account' : path === '/forgot-password' ? 'Reset your password' : path.startsWith('/verify-email') ? 'Email verified' : 'Choose a new password'
  const showAccountForm = path === '/login' || path === '/signup'

  useEffect(() => {
    setSent(false)
    setError('')
  }, [path])

  useEffect(() => {
    const button = googleButtonRef.current
    if (!button || !showAccountForm || !googleClientId) return
    button.innerHTML = ''
    let cancelled = false
    loadGoogleScript()
      .then(() => {
        if (cancelled || !window.google || !googleButtonRef.current) return
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response) => {
            if (!response.credential) {
              setError('Google did not return a credential.')
              return
            }
            setError('')
            try {
              await props.loginWithGoogle(response.credential, roleValue(role))
            } catch {
              setError('Google login failed. Try again or use email and password.')
            }
          },
        })
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          width: 360,
          text: path === '/signup' ? 'signup_with' : 'signin_with',
        })
      })
      .catch(() => setError('Google login is unavailable right now.'))
    return () => {
      cancelled = true
    }
  }, [path, props, role, showAccountForm])

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const form = new FormData(e.currentTarget)
    const email = String(form.get('email') ?? '')
    const password = String(form.get('password') ?? '')
    try {
      if (path === '/login') {
        await props.loginWithPassword(email, password)
        return
      }
      if (path === '/signup') {
        await props.registerWithPassword({
          email,
          password,
          firstName: String(form.get('firstName') ?? ''),
          lastName: String(form.get('lastName') ?? ''),
          role: roleValue(role),
        })
        return
      }
      setSent(true)
    } catch {
      setError(path === '/signup' ? 'Account creation failed. Check the details and try again.' : 'Invalid login details.')
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-context">
        <Brand navigate={navigate} />
        <div><span className="eyebrow">Trusted student accommodation</span><h1>Current rooms.<br />Accountable agents.</h1><p>Search and follow up without losing track of who said what or when availability was checked.</p></div>
        <div className="auth-proof"><ShieldCheck /><span><strong>Freshness is visible</strong>Every room shows its last confirmation.</span></div>
      </section>
      <section className="auth-form-wrap">
        <form className="form-card" onSubmit={submit}>
          <button className="back-button" type="button" onClick={() => navigate('/')}><ArrowLeft size={17} />Back to search</button>
          {path.startsWith('/verify-email') ? (
            <>
              <div className="success-illustration"><Mail /><CheckCircle2 /></div>
              <h2>{title}</h2>
              <p>Your account is ready. Continue to your student dashboard.</p>
              <button className="btn primary full" type="button" onClick={() => navigate('/student/dashboard')}>Continue</button>
            </>
          ) : (
            <>
              <div><span className="eyebrow">{path === '/login' ? 'Sign in' : 'Account access'}</span><h2>{title}</h2><p>{path === '/forgot-password' ? 'We will send a reset link to your verified email.' : path === '/reset-password' ? 'Use at least 8 characters with one number.' : 'Use Google or your email and password.'}</p></div>
              {showAccountForm && <div className="segmented large"><button type="button" className={role === 'Student' ? 'active' : ''} onClick={() => setRole('Student')}>Student</button><button type="button" className={role === 'Agent' ? 'active' : ''} onClick={() => setRole('Agent')}>Agent</button></div>}
              {showAccountForm && (googleClientId ? <div className="google-login" ref={googleButtonRef} /> : <button className="google-login-fallback" type="button" disabled>Continue with Google</button>)}
              {showAccountForm && <div className="auth-divider"><span>or</span></div>}
              {path === '/signup' && <div className="form-row"><Field label="First name"><input required name="firstName" autoComplete="given-name" /></Field><Field label="Last name"><input required name="lastName" autoComplete="family-name" /></Field></div>}
              <Field label="Email address"><input required name="email" type="email" autoComplete="email" /></Field>
              {path !== '/forgot-password' && <Field label={path === '/reset-password' ? 'New password' : 'Password'}><input required name="password" type="password" autoComplete={path === '/login' ? 'current-password' : 'new-password'} /></Field>}
              {path === '/reset-password' && <Field label="Confirm password"><input required name="confirmPassword" type="password" autoComplete="new-password" /></Field>}
              {sent && <div className="inline-success"><CheckCircle2 size={17} />{path === '/forgot-password' ? 'Reset link sent. Check your inbox.' : 'Success.'}</div>}
              {error && <div className="inline-error">{error}</div>}
              <button className="btn primary full" disabled={busy}>{busy && <LoaderCircle className="spin" />}{path === '/login' ? 'Sign in' : path === '/signup' ? 'Create account' : path === '/forgot-password' ? 'Send reset link' : 'Update password'}</button>
              {path === '/login' && <button className="text-button center" type="button" onClick={() => navigate('/forgot-password')}>Forgot password?</button>}
              {path === '/signup' ? <p className="form-switch">Already registered? <button type="button" onClick={() => navigate('/login')}>Log in</button></p> : path === '/login' && <p className="form-switch">New to AgentMS? <button type="button" onClick={() => navigate('/signup')}>Create an account</button></p>}
            </>
          )}
        </form>
      </section>
    </div>
  )
}

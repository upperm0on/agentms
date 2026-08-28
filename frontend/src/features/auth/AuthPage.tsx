import { useState, type FormEvent } from 'react'
import { ArrowLeft, CheckCircle2, LoaderCircle, Mail, ShieldCheck } from 'lucide-react'
import type { AppProps } from '../../app/types'
import { Brand } from '../../components/layout/AppShell'
import { Field } from '../../components/shared/Primitives'
import { apiUrl } from '../../api/backendApi'
import './AuthPage.css'

function roleValue(role: 'Student' | 'Agent') {
  return role.toLowerCase() as 'student' | 'agent'
}

const authErrorText: Record<string, string> = {
  google_not_configured: 'Google login needs the client secret in .env.',
  google_denied: 'Google login was cancelled.',
  google_missing_code: 'Google did not return a login code.',
  google_bad_state: 'Google login expired. Try again.',
  google_token_failed: 'Google could not exchange the login code.',
  google_invalid_token: 'Google returned an invalid token.',
  google_email_failed: 'Google account email could not be verified.',
}

export function AuthPage(props: AppProps) {
  const { path, navigate, busy } = props
  const [role, setRole] = useState<'Student' | 'Agent'>('Student')
  const authError = new URLSearchParams(window.location.search).get('auth_error') ?? ''
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(authError ? authErrorText[authError] ?? 'Google login failed. Try again.' : '')
  const [statusText, setStatusText] = useState('')
  const title = path === '/login' ? 'Welcome back' : path === '/signup' ? 'Create your AgentMS account' : path === '/forgot-password' ? 'Reset your password' : path.startsWith('/verify-email') ? 'Email verified' : 'Choose a new password'
  const showAccountForm = path === '/login' || path === '/signup'

  function startGoogleLogin() {
    setError('')
    setStatusText('Opening Google...')
    window.location.href = apiUrl(`/auth/google/start/?role=${roleValue(role)}`)
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setStatusText(path === '/signup' ? 'Creating your account...' : path === '/login' ? 'Checking your account...' : '')
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
    } catch (submitError) {
      setStatusText('')
      setError(submitError instanceof Error ? submitError.message : path === '/signup' ? 'Account creation failed. Check the details and try again.' : 'Invalid login details.')
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
              {showAccountForm && <button className="google-login-fallback" type="button" onClick={startGoogleLogin}>Continue with Google</button>}
              {showAccountForm && <div className="auth-divider"><span>or</span></div>}
              {path === '/signup' && <div className="form-row"><Field label="First name"><input required name="firstName" autoComplete="given-name" /></Field><Field label="Last name"><input required name="lastName" autoComplete="family-name" /></Field></div>}
              <Field label="Email address"><input required name="email" type="email" autoComplete="email" /></Field>
              {path !== '/forgot-password' && <Field label={path === '/reset-password' ? 'New password' : 'Password'}><input required name="password" type="password" autoComplete={path === '/login' ? 'current-password' : 'new-password'} /></Field>}
              {path === '/reset-password' && <Field label="Confirm password"><input required name="confirmPassword" type="password" autoComplete="new-password" /></Field>}
              {(busy || statusText) && <div className="inline-progress"><LoaderCircle className="spin" size={17} />{statusText || 'Opening your workspace...'}</div>}
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

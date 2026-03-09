import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { loginWithCredentials, forgotPassword, verifyResetCode, resetCredentials } from '../auth/auth'
import { Badge } from '../components/ui/Badge'
import { Lock, User, Mail, ShieldCheck, KeyRound } from 'lucide-react'

export function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // Reset Flow State
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [showReset, setShowReset] = useState(false)
  const [resetStep, setResetStep] = useState(1) // 1: Email, 2: Code, 3: New Creds
  const [resetEmail, setResetEmail] = useState('sdeenadhayalan235@gmail.com')
  const [resetCode, setResetCode] = useState('')
  const [newUsername, setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [resetMsg, setResetMsg] = useState('')
  const [resetError, setResetError] = useState('')

  const redirectTo = useMemo(() => {
    return (location.state && location.state.from) || '/'
  }, [location.state])

  const onSubmit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const res = await loginWithCredentials(username, password)
      if (!res.ok) {
        setError(res.message || 'Login failed.')
        setFailedAttempts(prev => prev + 1)
        return
      }
      setFailedAttempts(0)
      navigate(redirectTo, { replace: true })
    } finally {
      setBusy(false)
    }
  }

  const handleRequestCode = async (e) => {
    e.preventDefault()
    setBusy(true)
    setResetError('')
    setResetMsg('')
    const res = await forgotPassword(resetEmail)
    setBusy(false)
    if (res.ok) {
      setResetMsg('Verification code sent! Please check your email or backend logs.')
      setResetStep(2)
    } else {
      setResetError(res.message)
    }
  }

  const handleVerifyCode = async (e) => {
    e.preventDefault()
    setBusy(true)
    setResetError('')
    setResetMsg('')
    const res = await verifyResetCode(resetEmail, resetCode)
    setBusy(false)
    if (res.ok) {
      setResetMsg('Code verified! Please enter your new login details.')
      setResetStep(3)
    } else {
      setResetError(res.message)
    }
  }

  const handleResetCreds = async (e) => {
    e.preventDefault()
    if (!newUsername || !newPassword) {
      setResetError('Please fill in both fields.')
      return
    }
    setBusy(true)
    setResetError('')
    setResetMsg('')
    const res = await resetCredentials(resetEmail, newUsername, newPassword)
    setBusy(false)
    if (res.ok) {
      setResetMsg('Login details updated! You can now log in.')
      setTimeout(() => {
        setShowReset(false)
        setFailedAttempts(0)
        setResetStep(1)
        setResetMsg('')
        setUsername(newUsername)
        setPassword('')
      }, 2000)
    } else {
      setResetError(res.message)
    }
  }

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2 lg:items-stretch">
        <div className="glass rounded-2xl p-6 lg:p-8">
          <div className="flex items-center gap-3">
            <img
              src="/zerona-icon.svg"
              alt="ZeroNa Protection"
              className="h-11 w-11 rounded-2xl border border-white/10 bg-white/5 p-2"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">ZeroNa Protection</p>
              <p className="text-[11px] text-muted-foreground">Ransomware Readiness & Response</p>
            </div>
          </div>

          <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground">
            Secure access to your organization dashboard
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your access password to continue. After login, you’ll be redirected to the main site.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border/70 bg-secondary/20 p-4">
              <p className="text-xs font-semibold text-foreground">Prevention</p>
              <p className="mt-1 text-[11px] text-muted-foreground">Controls & scoring</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-secondary/20 p-4">
              <p className="text-xs font-semibold text-foreground">Detection</p>
              <p className="mt-1 text-[11px] text-muted-foreground">Signals & timeline</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-secondary/20 p-4">
              <p className="text-xs font-semibold text-foreground">Reporting</p>
              <p className="mt-1 text-[11px] text-muted-foreground">Export-ready output</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 lg:p-8">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Login</p>
              <p className="mt-1 text-xs text-muted-foreground">Authorized users only</p>
            </div>
            <Badge variant="outline" className="text-[10px]">
              DB
            </Badge>
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Login ID</label>
              <div className="mt-2 flex items-center gap-2 rounded-2xl border border-border/70 bg-secondary/20 px-4 py-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your login id"
                  className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">Password</label>
              <div className="mt-2 flex items-center gap-2 rounded-2xl border border-border/70 bg-secondary/20 px-4 py-3">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter access password"
                  className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
              </div>
              {error ? <p className="mt-2 text-xs text-danger">{error}</p> : null}
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
            >
              {busy ? 'Signing in…' : 'Sign in'}
            </button>

            {failedAttempts >= 3 && (
              <button
                type="button"
                onClick={() => setShowReset(true)}
                className="w-full mt-2 rounded-2xl border border-danger/50 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger hover:bg-danger/20 transition-colors"
              >
                Reset Password
              </button>
            )}

            <p className="text-[11px] text-muted-foreground text-center mt-4">
              Tip: credentials are checked securely by the backend against credentials.json.
            </p>
          </form>
        </div>
      </div>

      {showReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="glass w-full max-w-md rounded-2xl p-6 lg:p-8 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowReset(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              &times;
            </button>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-foreground">Account Recovery</h2>
              <p className="text-sm text-muted-foreground">Follow the steps to reset your access.</p>
            </div>

            {resetError && <div className="mb-4 rounded-xl bg-danger/20 p-3 text-sm text-danger">{resetError}</div>}
            {resetMsg && <div className="mb-4 rounded-xl bg-primary/20 p-3 text-sm text-primary">{resetMsg}</div>}

            {resetStep === 1 && (
              <form onSubmit={handleRequestCode} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Recovery Email</label>
                  <div className="mt-2 flex items-center gap-2 rounded-2xl border border-border/70 bg-secondary/20 px-4 py-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <input
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="Enter recovery email"
                      className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={busy || !resetEmail}
                  className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                >
                  {busy ? 'Sending...' : 'Send Verification Code'}
                </button>
              </form>
            )}

            {resetStep === 2 && (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Verification Code</label>
                  <p className="text-xs text-muted-foreground mb-2">Sent to {resetEmail}</p>
                  <div className="mt-2 flex items-center gap-2 rounded-2xl border border-border/70 bg-secondary/20 px-4 py-3">
                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                    <input
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      placeholder="Enter 6-digit code"
                      className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={busy || !resetCode}
                  className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                >
                  {busy ? 'Verifying...' : 'Verify Code'}
                </button>
              </form>
            )}

            {resetStep === 3 && (
              <form onSubmit={handleResetCreds} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">New Login ID</label>
                  <div className="mt-2 flex items-center gap-2 rounded-2xl border border-border/70 bg-secondary/20 px-4 py-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <input
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="Enter new login ID"
                      className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">New Password</label>
                  <div className="mt-2 flex items-center gap-2 rounded-2xl border border-border/70 bg-secondary/20 px-4 py-3">
                    <KeyRound className="h-4 w-4 text-muted-foreground" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={busy || !newUsername || !newPassword}
                  className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                >
                  {busy ? 'Saving...' : 'Save New Credentials'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}


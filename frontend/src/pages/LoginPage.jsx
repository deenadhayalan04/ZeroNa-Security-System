import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { loginWithCredentials } from '../auth/auth'
import { Badge } from '../components/ui/Badge'
import { Lock, User } from 'lucide-react'

export function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

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
        return
      }
      navigate(redirectTo, { replace: true })
    } finally {
      setBusy(false)
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
              Demo Gate
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
              className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {busy ? 'Signing in…' : 'Sign in'}
            </button>

            <p className="text-[11px] text-muted-foreground">
              Tip: credentials are checked securely by the backend (Render env vars).
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}


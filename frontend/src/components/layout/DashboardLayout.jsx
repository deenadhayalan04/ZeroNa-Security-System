import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  ShieldAlert,
  Settings,
  HelpCircle,
  Activity,
  LogOut,
} from 'lucide-react'
import { cn } from '../../lib/cn'
import { Badge } from '../ui/Badge'
import { logout } from '../../auth/auth'

const nav = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, section: 'Assessment' },
  { to: '/assessment', label: 'Assessment', icon: ClipboardList, section: 'Assessment' },
  { to: '/reports', label: 'Reports', icon: BarChart3, section: 'Assessment' },
  { to: '/risks', label: 'Risks', icon: ShieldAlert, section: 'Assessment' },
  { to: '/simulation', label: 'Live Simulation', icon: Activity, section: 'Assessment' },
]

export function DashboardLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const current = nav.find((n) => n.to === location.pathname)?.label ?? 'Overview'

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-[1400px] gap-5 px-4 py-5">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="glass sticky top-5 rounded-2xl p-4">
            <div className="flex items-center gap-3 px-2 pb-4">
              <img
                src="/zerona-icon.svg"
                alt="ZeroNa Protection"
                className="h-10 w-10 rounded-2xl border border-white/10 bg-white/5 p-2"
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-tight">ZeroNa</p>
                <p className="text-[11px] text-muted-foreground">PROTECTION</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="px-2 pb-2 text-[11px] font-semibold tracking-wide text-muted-foreground">
                  ASSESSMENT
                </p>
                <nav className="space-y-1">
                  {nav
                    .filter((n) => n.section === 'Assessment')
                    .map((item) => {
                      const Icon = item.icon
                      return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          end={item.to === '/'}
                          className={({ isActive }) =>
                            cn(
                              'flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors',
                              'text-muted-foreground hover:bg-secondary/40 hover:text-foreground',
                              isActive && 'bg-primary/15 text-foreground border border-primary/20'
                            )
                          }
                        >
                          <Icon className="h-4 w-4" />
                          <span className="truncate">{item.label}</span>
                        </NavLink>
                      )
                    })}
                </nav>
              </div>

              <div>
                <p className="px-2 pb-2 text-[11px] font-semibold tracking-wide text-muted-foreground">
                  SYSTEM
                </p>
                <div className="space-y-1">
                  <a
                    href="#"
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                    onClick={(e) => e.preventDefault()}
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </a>
                  <a
                    href="#"
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                    onClick={(e) => e.preventDefault()}
                  >
                    <HelpCircle className="h-4 w-4" />
                    Help Center
                  </a>
                </div>
              </div>

              <div className="rounded-2xl border border-border/70 bg-secondary/30 p-3">
                <p className="text-[11px] font-semibold text-muted-foreground">READINESS SCORE</p>
                <div className="mt-2 flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold font-mono text-foreground">68</p>
                    <p className="text-[11px] text-muted-foreground">Moderate risk posture</p>
                  </div>
                  <Badge variant="warning" className="uppercase">
                    Moderate
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="glass mb-5 rounded-2xl px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 rounded-xl border border-border/70 bg-secondary/30 px-3 py-2">
                  <span className="text-xs text-muted-foreground">Tenant</span>
                  <span className="text-xs font-semibold text-foreground">Acme Corp</span>
                </div>
                <Badge variant="warning" className="uppercase">
                  Moderate risk
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-xs text-muted-foreground">
                  Last assessed: <span className="text-foreground font-semibold">Mar 02, 2026</span>
                </p>
                <button
                  className="inline-flex h-9 items-center gap-2 rounded-full border border-border/70 bg-secondary/30 px-3 text-xs text-foreground hover:bg-secondary/40"
                  onClick={() => {
                    logout()
                    navigate('/login', { replace: true })
                  }}
                >
                  <LogOut className="h-4 w-4 text-muted-foreground" />
                  Logout
                </button>
              </div>
            </div>
            <div className="mt-2">
              <p className="text-sm font-semibold text-foreground">{current}</p>
            </div>
          </header>

          <Outlet />
        </main>
      </div>
    </div>
  )
}


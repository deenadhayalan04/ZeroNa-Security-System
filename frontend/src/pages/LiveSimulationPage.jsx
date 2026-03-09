import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Progress } from '../components/ui/Progress'
import { cn } from '../lib/cn'
import { startSimulation, stepSimulation, resetSimulation, getSimulationState } from '../api/simulation'
import { AlertTriangle, Pause, Play, RefreshCw } from 'lucide-react'

function statusConfig(status) {
  switch (status) {
    case 'monitoring':
      return { label: 'Monitoring', badge: 'success', description: 'Baseline activity, no active incident.' }
    case 'under_attack':
      return { label: 'Ransomware Detected', badge: 'danger', description: 'Malicious encryption activity in progress.' }
    case 'quarantined':
      return { label: 'Quarantine Active', badge: 'warning', description: 'High-impact data isolated in Safety Vault.' }
    case 'recovered':
      return { label: 'Recovered', badge: 'success', description: 'Systems restored from clean backups.' }
    default:
      return { label: 'Idle', badge: 'outline', description: 'Start the simulation to see ZeroNa in action.' }
  }
}

export function LiveSimulationPage() {
  const [state, setState] = useState(null)
  const [loading, setLoading] = useState(false)
  const [autoAdvance, setAutoAdvance] = useState(false)

  // Poll state when auto-advance is enabled
  useEffect(() => {
    if (!autoAdvance) return
    const id = setInterval(async () => {
      try {
        const next = await stepSimulation()
        setState(next)
        if (next.step >= 4) {
          setAutoAdvance(false)
        }
      } catch {
        // ignore transient errors in demo
      }
    }, 2500)
    return () => clearInterval(id)
  }, [autoAdvance])

  const onStart = async () => {
    setLoading(true)
    try {
      const s = await startSimulation()
      setState(s)
      setAutoAdvance(true)
    } finally {
      setLoading(false)
    }
  }

  const onStep = async () => {
    setLoading(true)
    try {
      const s = await stepSimulation()
      setState(s)
    } finally {
      setLoading(false)
    }
  }

  const onReset = async () => {
    setLoading(true)
    try {
      const s = await resetSimulation()
      setState(s)
      setAutoAdvance(false)
    } finally {
      setLoading(false)
    }
  }

  const onSync = async () => {
    try {
      const s = await getSimulationState()
      setState(s)
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    onSync()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const status = statusConfig(state?.status)

  return (
    <div className="flex flex-col gap-5">
      <div className="glass rounded-2xl px-5 py-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Live Ransomware Simulation</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Safe demo that shows how ZeroNa detects ransomware, quarantines critical data, and restores from clean backups.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={status.badge} className="uppercase">
              {status.label}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Simulation Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={onStart}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                <Play className="h-4 w-4" />
                Start Scenario
              </button>
              <button
                onClick={onStep}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-border/70 bg-secondary/20 px-4 py-2 text-sm text-foreground hover:bg-secondary/30 disabled:opacity-60"
              >
                <AlertTriangle className="h-4 w-4" />
                Advance One Step
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setAutoAdvance((v) => !v)}
                disabled={loading || !state || state.step >= 4}
                className="inline-flex items-center gap-2 rounded-2xl border border-border/70 bg-secondary/20 px-4 py-2 text-sm text-foreground hover:bg-secondary/30 disabled:opacity-60"
              >
                {autoAdvance ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {autoAdvance ? 'Pause Auto-Advance' : 'Auto-Advance'}
              </button>
              <button
                onClick={onReset}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-border/70 bg-secondary/20 px-4 py-2 text-sm text-foreground hover:bg-secondary/30 disabled:opacity-60"
              >
                <RefreshCw className="h-4 w-4" />
                Reset
              </button>
            </div>
            <p className="text-xs text-muted-foreground">{status.description}</p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-8">
          <CardHeader>
            <CardTitle>Protected Systems</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {(state?.systems ?? []).map((s) => (
                <div key={s.id} className="glass rounded-2xl p-3">
                  <p className="text-sm font-semibold text-foreground">{s.name}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">Status</p>
                  <Badge
                    variant={
                      s.status === 'quarantined'
                        ? 'warning'
                        : s.status === 'recovered'
                        ? 'success'
                        : 'outline'
                    }
                    className="mt-1 text-[10px] uppercase"
                  >
                    {s.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardHeader>
            <CardTitle>Critical Folders & Safety Vault</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            {(state?.folders ?? []).map((f) => (
              <div key={f.id} className="glass rounded-2xl p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{f.name}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Business impact: {f.criticality}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={f.quarantined ? 'warning' : 'outline'}
                      className={cn('text-[10px] uppercase')}
                    >
                      {f.quarantined ? 'Quarantined to Safety Vault' : 'Online'}
                    </Badge>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <Progress
                    value={f.encrypted_percent}
                    className={cn(
                      '[&>div]:bg-danger',
                      f.encrypted_percent === 0 && '[&>div]:bg-success'
                    )}
                  />
                  <span className="w-12 text-right font-mono text-sm font-bold text-foreground">
                    {f.encrypted_percent}%
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader>
            <CardTitle>Incident Timeline</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="max-h-72 space-y-2 overflow-y-auto pr-1 text-xs">
              {(state?.events ?? []).length === 0 ? (
                <p className="text-muted-foreground">No events yet. Start the scenario to see activity.</p>
              ) : (
                state.events
                  .slice()
                  .reverse()
                  .map((e, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        'glass flex items-start gap-2 rounded-2xl px-3 py-2',
                        e.level === 'danger' && 'border-danger/30',
                        e.level === 'warning' && 'border-warning/30',
                        e.level === 'success' && 'border-success/30'
                      )}
                    >
                      <span className="mt-0.5 font-mono text-[10px] text-muted-foreground w-12 shrink-0">
                        {e.time}
                      </span>
                      <p className="text-[11px] text-foreground">{e.message}</p>
                    </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


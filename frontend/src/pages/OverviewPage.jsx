import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Progress } from '../components/ui/Progress'
import { cn } from '../lib/cn'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { AlertTriangle, CheckCircle2, ChevronRight, ClipboardList, FileText, ShieldAlert } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { getAssessment } from '../api/assessment'
import { Link } from 'react-router-dom'

const domainMeta = {
  backup: { label: 'Strong', variant: 'success' },
  endpoint: { label: 'Moderate', variant: 'warning' },
  network: { label: 'Moderate', variant: 'warning' },
  training: { label: 'Moderate', variant: 'warning' },
  access: { label: 'Moderate', variant: 'warning' },
  patching: { label: 'Strong', variant: 'success' },
  ir: { label: 'Critical', variant: 'danger' },
  email: { label: 'Weak', variant: 'danger' }
}

const trend = [
  { month: 'Sep', score: 38 },
  { month: 'Oct', score: 44 },
  { month: 'Nov', score: 49 },
  { month: 'Dec', score: 52 },
  { month: 'Jan', score: 57 },
  { month: 'Feb', score: 63 },
  { month: 'Mar', score: 68 },
]

function ScoreRing({ value = 68 }) {
  const score = value || 0
  const size = 220
  const stroke = 16
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const dash = (score / 100) * c

  const label = score >= 80 ? 'Strong Readiness' : score >= 60 ? 'Moderate Readiness' : 'Critical Readiness'
  const colorClass = score >= 80 ? 'stroke-success' : score >= 60 ? 'stroke-warning' : 'stroke-danger'
  const dotColorClass = score >= 80 ? 'bg-success' : score >= 60 ? 'bg-warning' : 'bg-danger'
  const textColorClass = score >= 80 ? 'text-success' : score >= 60 ? 'text-warning' : 'text-danger'

  return (
    <div className="relative mx-auto grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          className="stroke-border/60"
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="transparent"
          className={cn(colorClass, "drop-shadow-[0_0_18px_rgba(245,158,11,0.22)]")}
          strokeDasharray={`${dash} ${c - dash}`}
        />
      </svg>
      <div className="absolute text-center px-4">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground leading-tight">Overall readiness score</p>
        <p className="mt-2 font-mono text-5xl font-bold text-foreground">{score}</p>
        <p className="text-xs text-muted-foreground">out of 100</p>
        <div className={cn("mt-3 flex items-center justify-center gap-2 text-xs font-semibold", textColorClass)}>
          <span className={cn("h-2 w-2 rounded-full", dotColorClass)} />
          <span>{label}</span>
        </div>
      </div>
    </div>
  )
}

export function OverviewPage() {
  const [assessment, setAssessment] = useState(null)

  useEffect(() => {
    getAssessment()
      .then(setAssessment)
      .catch(() => setAssessment(null))
  }, [])

  const categories = useMemo(() => {
    if (!assessment?.domains) return []
    return assessment.domains.map(d => ({
      ...d,
      label: domainMeta[d.id]?.label || 'Unrated',
      variant: domainMeta[d.id]?.variant || 'outline',
      findings: d.controls.filter(c => c.status !== 'pass').length,
      updated: 'recently'
    }))
  }, [assessment])

  const riskStats = useMemo(() => {
    if (!categories.length) return { critical: 0, findings: 0, completed: 0 }
    let critical = 0, findings = 0, completed = 0
    categories.forEach(c => {
      c.controls.forEach(ctrl => {
        if (ctrl.status === 'fail') critical++
        if (ctrl.status !== 'pass') findings++
        else completed++
      })
    })
    return { critical, findings, completed }
  }, [categories])

  const score = assessment?.overall_score ?? 68

  return (
    <div className="flex flex-col gap-5">
      <div className="glass rounded-2xl px-5 py-5">
        <h2 className="text-xl font-bold tracking-tight text-foreground text-balance leading-tight">
          Ransomware Readiness Overview
        </h2>
        <p className="mt-1 text-sm text-muted-foreground leading-snug">
          Evaluate and improve your organization&apos;s preparedness against ransomware threats
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Readiness Score</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <ScoreRing value={score} />
            <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
              Your organization has {score >= 80 ? 'strong' : score >= 60 ? 'moderate' : 'critical'} ransomware preparedness.
              {score < 80 ? ' Key areas require immediate attention.' : ' Continue monitoring and improving controls.'}
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>Readiness Score Trend</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">7-month improvement trajectory across key domains</p>
              </div>
              <Badge variant="outline" className="text-[10px]">
                last 7 months
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ top: 10, right: 14, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.30} />
                      <stop offset="90%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                  <XAxis dataKey="month" stroke="rgba(148,163,184,0.6)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis
                    domain={[0, 100]}
                    stroke="rgba(148,163,184,0.6)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    width={30}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(15, 23, 42, 0.85)',
                      border: '1px solid rgba(148, 163, 184, 0.18)',
                      borderRadius: 12,
                      backdropFilter: 'blur(12px)',
                      color: 'white',
                    }}
                  />
                  <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#trendFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-4">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>Risk Summary</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">Key metrics from your latest assessment</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-3">
              <Link
                to="/risks"
                className="glass flex items-center justify-between gap-3 rounded-2xl px-4 py-3 hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-danger/10 border border-danger/20">
                    <AlertTriangle className="h-5 w-5 text-danger" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{riskStats.critical} Critical Actions</p>
                    <p className="text-xs text-muted-foreground leading-tight">Require immediate remediation</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>

              <Link
                to="/assessment"
                className="glass flex items-center justify-between gap-3 rounded-2xl px-4 py-3 hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-warning/10 border border-warning/20">
                    <ClipboardList className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{riskStats.findings} Open Findings</p>
                    <p className="text-xs text-muted-foreground leading-tight">Pending remediation actions</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>

              <div
                className="glass flex items-center justify-between gap-3 rounded-2xl px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-success/10 border border-success/20">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{riskStats.completed} Completed</p>
                    <p className="text-xs text-muted-foreground leading-tight">Successfully remediated</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-border/70 bg-secondary/20 p-4">
              <p className="text-[11px] font-semibold tracking-wide text-muted-foreground leading-tight">KEY INSIGHT</p>
              <p className="mt-2 text-sm text-foreground leading-snug">
                Your weakest area is currently <span className="font-bold text-danger">{(categories.find(c => c.score < 50) || categories.sort((a, b) => a.score - b.score)[0])?.name || 'N/A'}</span>.
                Addressing these findings could improve your overall score significantly.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="glass rounded-2xl px-5 py-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Assessment Categories</h3>
            <p className="mt-1 text-xs text-muted-foreground">{categories.length} domains evaluated against industry frameworks</p>
          </div>
          <Badge variant="outline" className="text-[10px]">
            {categories.length} domains
          </Badge>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {categories.map((c) => (
            <div key={c.name} className="glass rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-foreground">{c.name}</p>
                    <Badge variant={c.variant} className="uppercase">
                      {c.label}
                    </Badge>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground leading-tight">
                    {c.findings} findings <span className="mx-1">•</span> updated {c.updated}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-lg font-bold">{c.score}%</p>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-3">
                <Progress
                  value={c.score}
                  className={cn(
                    '[&>div]:bg-primary',
                    c.variant === 'success' && '[&>div]:bg-success',
                    c.variant === 'warning' && '[&>div]:bg-warning',
                    c.variant === 'danger' && '[&>div]:bg-danger'
                  )}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-border/70 bg-secondary/20 p-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-danger" />
              <p className="text-sm font-semibold">{riskStats.critical} Critical</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground leading-tight">High-impact issues to fix now</p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-secondary/20 p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-warning" />
              <p className="text-sm font-semibold">{riskStats.findings} Findings</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground leading-tight">Open remediation actions</p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-secondary/20 p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <p className="text-sm font-semibold">{riskStats.completed} Completed</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground leading-tight">Successfully remediated</p>
          </div>
        </div>
      </div>
    </div>
  )
}


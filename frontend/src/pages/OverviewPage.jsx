import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Progress } from '../components/ui/Progress'
import { cn } from '../lib/cn'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { AlertTriangle, CheckCircle2, ChevronRight, ClipboardList, FileText, ShieldAlert } from 'lucide-react'

const categories = [
  { name: 'Backup & Recovery', score: 82, label: 'Strong', variant: 'success', findings: 2, updated: '2 days ago' },
  { name: 'Endpoint Protection', score: 71, label: 'Moderate', variant: 'warning', findings: 5, updated: '1 day ago' },
  { name: 'Email Security', score: 58, label: 'Weak', variant: 'danger', findings: 8, updated: '3 days ago' },
  { name: 'Network Segmentation', score: 64, label: 'Moderate', variant: 'warning', findings: 6, updated: '1 day ago' },
  { name: 'Incident Response', score: 45, label: 'Critical', variant: 'danger', findings: 12, updated: '5 days ago' },
  { name: 'Employee Training', score: 72, label: 'Moderate', variant: 'warning', findings: 4, updated: '1 week ago' },
  { name: 'Patch Management', score: 79, label: 'Strong', variant: 'success', findings: 3, updated: '12 hours ago' },
  { name: 'Access Control', score: 67, label: 'Moderate', variant: 'warning', findings: 7, updated: '2 days ago' },
]

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
  const size = 220
  const stroke = 16
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const dash = (value / 100) * c

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
          className="stroke-warning drop-shadow-[0_0_18px_rgba(245,158,11,0.22)]"
          strokeDasharray={`${dash} ${c - dash}`}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Overall readiness score</p>
        <p className="mt-2 font-mono text-5xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">out of 100</p>
        <div className="mt-3 flex items-center justify-center gap-2 text-xs text-warning">
          <span className="h-2 w-2 rounded-full bg-warning" />
          <span className="font-semibold">Moderate Readiness</span>
        </div>
      </div>
    </div>
  )
}

export function OverviewPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="glass rounded-2xl px-5 py-5">
        <h2 className="text-xl font-bold tracking-tight text-foreground text-balance">
          Ransomware Readiness Overview
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Evaluate and improve your organization&apos;s preparedness against ransomware threats
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Readiness Score</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <ScoreRing value={68} />
            <p className="mt-4 text-xs text-muted-foreground">
              Your organization has moderate ransomware preparedness. Key areas require immediate attention.
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
              <Badge variant="outline" className="text-[10px]">
                v0 block
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-3">
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="glass flex items-center justify-between gap-3 rounded-2xl px-4 py-3 hover:bg-secondary/30"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-danger/10 border border-danger/20">
                    <AlertTriangle className="h-5 w-5 text-danger" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">2 Critical Actions</p>
                    <p className="text-xs text-muted-foreground">Require immediate remediation</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </a>

              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="glass flex items-center justify-between gap-3 rounded-2xl px-4 py-3 hover:bg-secondary/30"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-warning/10 border border-warning/20">
                    <ClipboardList className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">5 Open Findings</p>
                    <p className="text-xs text-muted-foreground">Pending remediation actions</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </a>

              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="glass flex items-center justify-between gap-3 rounded-2xl px-4 py-3 hover:bg-secondary/30"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-success/10 border border-success/20">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">2 Completed</p>
                    <p className="text-xs text-muted-foreground">Successfully remediated this quarter</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </a>
            </div>

            <div className="mt-4 rounded-2xl border border-border/70 bg-secondary/20 p-4">
              <p className="text-[11px] font-semibold tracking-wide text-muted-foreground">KEY INSIGHT</p>
              <p className="mt-2 text-sm text-foreground">
                <span className="font-semibold">Incident Response</span> is your weakest area at{' '}
                <span className="font-semibold text-danger">45%</span>. Developing a ransomware-specific IR playbook could
                improve your overall score by up to 12 points.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="glass rounded-2xl px-5 py-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Assessment Categories</h3>
            <p className="mt-1 text-xs text-muted-foreground">8 domains evaluated against industry frameworks</p>
          </div>
          <Badge variant="outline" className="text-[10px]">
            8 domains
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
                  <p className="mt-1 text-[11px] text-muted-foreground">
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
              <p className="text-sm font-semibold">2 Critical</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">High-impact issues to fix now</p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-secondary/20 p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-warning" />
              <p className="text-sm font-semibold">18 Findings</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Open remediation actions</p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-secondary/20 p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <p className="text-sm font-semibold">2 Completed</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Remediated this quarter</p>
          </div>
        </div>
      </div>
    </div>
  )
}


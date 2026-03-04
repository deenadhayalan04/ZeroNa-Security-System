import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Progress } from '../components/ui/Progress'
import { AlertTriangle, ChevronRight, ShieldAlert } from 'lucide-react'

const risks = [
  {
    id: 'R-01',
    title: 'Backups not encrypted on all repositories',
    impact: 'High',
    likelihood: 'Medium',
    owner: 'Infrastructure',
    score: 78,
    status: 'Open',
  },
  {
    id: 'R-02',
    title: 'Phishing simulation cadence below target',
    impact: 'Medium',
    likelihood: 'High',
    owner: 'Security Awareness',
    score: 72,
    status: 'Open',
  },
  {
    id: 'R-03',
    title: 'Critical patch SLA missed for servers',
    impact: 'High',
    likelihood: 'High',
    owner: 'IT Ops',
    score: 88,
    status: 'Open',
  },
  {
    id: 'R-04',
    title: 'No PAWs for privileged administration',
    impact: 'High',
    likelihood: 'Medium',
    owner: 'Identity',
    score: 69,
    status: 'Planned',
  },
]

function badgeForScore(score) {
  if (score >= 80) return { variant: 'danger', label: 'Critical' }
  if (score >= 60) return { variant: 'warning', label: 'Moderate' }
  return { variant: 'success', label: 'Low' }
}

export function RisksPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="glass rounded-2xl px-5 py-5">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Risks</h2>
        <p className="mt-1 text-sm text-muted-foreground">Prioritized risks mapped from your assessment findings</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>Top Risks</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">High-risk items requiring remediation planning</p>
            </div>
            <Badge variant="outline" className="text-[10px]">
              4 items
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="space-y-3">
            {risks.map((r) => {
              const risk = badgeForScore(r.score)
              return (
                <div key={r.id} className="glass rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-danger/10 border border-danger/20">
                        <ShieldAlert className="h-5 w-5 text-danger" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">{r.title}</p>
                          <Badge variant="outline" className="text-[10px] font-mono">
                            {r.id}
                          </Badge>
                          <Badge variant={risk.variant} className="uppercase">
                            {risk.label}
                          </Badge>
                        </div>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          Owner: {r.owner} <span className="mx-1">•</span> Impact: {r.impact}{' '}
                          <span className="mx-1">•</span> Likelihood: {r.likelihood}
                        </p>
                      </div>
                    </div>
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-secondary/20 px-3 py-2 text-xs text-foreground hover:bg-secondary/30"
                    >
                      View
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </a>
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <AlertTriangle className="h-4 w-4 text-warning" />
                      Risk score
                    </div>
                    <Progress value={r.score} className="[&>div]:bg-danger" />
                    <span className="w-12 text-right font-mono text-sm font-bold text-foreground">{r.score}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Progress } from '../components/ui/Progress'
import { cn } from '../lib/cn'
import { getAssessment } from '../api/assessment'
import {
  CheckCircle,
  Circle,
  ClipboardCheck,
  ChevronDown,
  ChevronRight,
  HardDrive,
  ShieldCheck,
  Network,
  Users,
  Lock,
  RefreshCw,
  FileKey,
  Play,
  XCircle,
} from 'lucide-react'

const domainMeta = {
  backup: { icon: HardDrive, description: 'Data backup strategy, immutable storage, and disaster recovery procedures' },
  endpoint: { icon: ShieldCheck, description: 'Endpoint detection, anti-malware, and device security posture' },
  network: { icon: Network, description: 'Network isolation, micro-segmentation, and traffic monitoring' },
  training: { icon: Users, description: 'Security awareness, phishing simulations, and incident reporting culture' },
  access: { icon: Lock, description: 'Multi-factor authentication, privilege management, and identity governance' },
  patching: { icon: RefreshCw, description: 'Vulnerability scanning, patch deployment SLA, and system hardening' },
  ir: { icon: FileKey, description: 'Response playbooks, tabletop exercises, and communication protocols' },
  email: { icon: ShieldCheck, description: 'Email security, phishing protection, and attachment filtering' }
}

const statusConfig = {
  pass: { icon: CheckCircle, color: 'text-success', bg: 'bg-success/10', label: 'Pass' },
  fail: { icon: XCircle, color: 'text-danger', bg: 'bg-danger/10', label: 'Fail' },
  partial: { icon: Circle, color: 'text-warning', bg: 'bg-warning/10', label: 'Partial' },
  'not-assessed': { icon: Circle, color: 'text-muted-foreground', bg: 'bg-muted', label: 'N/A' },
}

export function AssessmentPage() {
  const [assessment, setAssessment] = useState(null)
  const [expandedDomain, setExpandedDomain] = useState('backup')
  const [isRunning, setIsRunning] = useState(false)

  const fetchAssessment = () => {
    getAssessment()
      .then(setAssessment)
      .catch(() => setAssessment(null))
  }

  useEffect(() => {
    fetchAssessment()
  }, [])

  const domains = useMemo(() => {
    if (!assessment?.domains) return []
    return assessment.domains.map(d => ({
      ...d,
      icon: domainMeta[d.id]?.icon || ShieldCheck,
      description: domainMeta[d.id]?.description || 'Security domain evaluations'
    }))
  }, [assessment])

  const summary = useMemo(() => {
    if (!domains.length) return { total: 0, passed: 0, failed: 0, partial: 0 }
    let total = 0, passed = 0, failed = 0, partial = 0
    domains.forEach(d => {
      d.controls.forEach(c => {
        total++
        if (c.status === 'pass') passed++
        else if (c.status === 'fail') failed++
        else if (c.status === 'partial') partial++
      })
    })
    return { total, passed, failed, partial }
  }, [domains])

  const handleRunAssessment = () => {
    setIsRunning(true)
    setTimeout(() => {
      setIsRunning(false)
      fetchAssessment()
    }, 2000)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="glass rounded-2xl px-5 py-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Readiness Assessment</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Evaluate security controls across ransomware defense domains
            </p>
          </div>
          <button
            onClick={handleRunAssessment}
            className="flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {isRunning ? (
              <>
                <ClipboardCheck className="animate-pulse h-4 w-4" />
                Assessment Running...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Run New Assessment
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 py-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary/50 border border-border/70">
              <ClipboardCheck className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <p className="font-mono text-2xl font-bold text-foreground">{summary.total}</p>
              <p className="text-[11px] text-muted-foreground">Total Controls</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-success/10 border border-success/20">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="font-mono text-2xl font-bold text-foreground">{summary.passed}</p>
              <p className="text-[11px] text-muted-foreground">Passed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-danger/10 border border-danger/20">
              <XCircle className="h-5 w-5 text-danger" />
            </div>
            <div>
              <p className="font-mono text-2xl font-bold text-foreground">{summary.failed}</p>
              <p className="text-[11px] text-muted-foreground">Failed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-warning/10 border border-warning/20">
              <Circle className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="font-mono text-2xl font-bold text-foreground">{summary.partial}</p>
              <p className="text-[11px] text-muted-foreground">Partial</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3">
        {domains.map((domain) => {
          const score = domain.score
          const isExpanded = expandedDomain === domain.id
          const scoreColor = score >= 80 ? 'text-success' : score >= 60 ? 'text-warning' : 'text-danger'
          const barColor =
            score >= 80 ? '[&>div]:bg-success' : score >= 60 ? '[&>div]:bg-warning' : '[&>div]:bg-danger'

          const Icon = domain.icon
          return (
            <Card key={domain.id} className="overflow-hidden">
              <button
                onClick={() => setExpandedDomain(isExpanded ? null : domain.id)}
                className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-secondary/20"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-secondary/40 border border-border/70">
                  <Icon className="h-5 w-5 text-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-[14px] font-semibold text-foreground">{domain.name}</h3>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {domain.controls.length} controls
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{domain.description}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex w-36 items-center gap-3">
                    <Progress value={score} className={cn('h-2 flex-1', barColor)} />
                    <span className={cn('font-mono text-sm font-bold', scoreColor)}>{score}%</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-border/70">
                  {domain.controls.map((control, ci) => {
                    const config = statusConfig[control.status]
                    const StatusIcon = config.icon
                    return (
                      <div
                        key={control.id}
                        className={cn(
                          'flex items-start gap-4 px-5 py-3.5 transition-colors hover:bg-secondary/15',
                          ci !== domain.controls.length - 1 && 'border-b border-border/40'
                        )}
                      >
                        <StatusIcon className={cn('mt-0.5 h-5 w-5 shrink-0', config.color)} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-[13px] text-foreground leading-snug">{control.question}</p>
                              {control.evidence && (
                                <p className="mt-1 text-[11px] text-success">Evidence: {control.evidence}</p>
                              )}
                              {control.recommendation && (
                                <p className="mt-1 text-[11px] text-warning">
                                  Recommendation: {control.recommendation}
                                </p>
                              )}
                            </div>
                            <div className="flex shrink-0 items-center gap-3">
                              <Badge variant="outline" className={cn('text-[10px] border-current/20', config.color, config.bg)}>
                                {config.label}
                              </Badge>
                              <span className="font-mono text-[10px] text-muted-foreground">{control.id}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}


import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Progress } from '../components/ui/Progress'
import { cn } from '../lib/cn'
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

const domains = [
  {
    id: 'backup',
    name: 'Backup & Recovery',
    icon: HardDrive,
    description: 'Data backup strategy, immutable storage, and disaster recovery procedures',
    controls: [
      { id: 'BK-01', question: 'Does the organization maintain at least 3 copies of critical data?', status: 'pass', weight: 15, evidence: 'Verified via backup reports' },
      { id: 'BK-02', question: 'Are backups stored in at least 2 different media types?', status: 'pass', weight: 12, evidence: 'NAS + Cloud archive' },
      { id: 'BK-03', question: 'Is at least 1 backup copy stored offsite or air-gapped?', status: 'pass', weight: 15, evidence: 'Air-gapped copy in secondary site' },
      { id: 'BK-04', question: 'Are backup restoration tests conducted at least quarterly?', status: 'partial', weight: 10, recommendation: 'Last test was 4 months ago. Schedule quarterly.' },
      { id: 'BK-05', question: 'Are backups encrypted at rest and in transit?', status: 'fail', weight: 13, recommendation: 'Enable AES-256 for all backup repositories.' },
      { id: 'BK-06', question: 'Is there an immutable backup copy that ransomware cannot modify?', status: 'pass', weight: 15, evidence: 'Object Lock enabled on immutable storage' },
    ],
  },
  {
    id: 'endpoint',
    name: 'Endpoint Protection',
    icon: ShieldCheck,
    description: 'Endpoint detection, anti-malware, and device security posture',
    controls: [
      { id: 'EP-01', question: 'Is EDR deployed on all endpoints?', status: 'partial', weight: 15, recommendation: '3 file servers missing EDR agent' },
      { id: 'EP-02', question: 'Are all endpoint security agents reporting to a central console?', status: 'pass', weight: 10, evidence: 'Central console active' },
      { id: 'EP-03', question: 'Is application whitelisting enforced on critical servers?', status: 'fail', weight: 12, recommendation: 'Implement allowlisting on domain controllers' },
      { id: 'EP-04', question: 'Are USB and removable media controls in place?', status: 'pass', weight: 8, evidence: 'GPO blocks USB mass storage' },
      { id: 'EP-05', question: 'Is full disk encryption enabled on all laptops?', status: 'partial', weight: 10, recommendation: '12 laptops need encryption activation' },
    ],
  },
  {
    id: 'network',
    name: 'Network Segmentation',
    icon: Network,
    description: 'Network isolation, micro-segmentation, and traffic monitoring',
    controls: [
      { id: 'NS-01', question: 'Is the network segmented into functional zones (VLANs)?', status: 'pass', weight: 15, evidence: 'Corporate, DMZ, OT, Guest VLANs' },
      { id: 'NS-02', question: 'Is east-west traffic monitored for lateral movement?', status: 'partial', weight: 12, recommendation: 'Expand monitoring to inter-VLAN traffic' },
      { id: 'NS-03', question: 'Are critical assets isolated in dedicated network segments?', status: 'pass', weight: 13, evidence: 'DB and backup servers restricted' },
      { id: 'NS-04', question: 'Is a zero-trust network architecture in place or planned?', status: 'fail', weight: 10, recommendation: 'Begin zero-trust pilot with identity-aware policies' },
    ],
  },
  {
    id: 'training',
    name: 'Employee Training',
    icon: Users,
    description: 'Security awareness, phishing simulations, and incident reporting culture',
    controls: [
      { id: 'ET-01', question: 'Do all employees complete annual security awareness training?', status: 'partial', weight: 12, recommendation: 'Raise completion rate above 95% and enforce deadlines' },
      { id: 'ET-02', question: 'Are phishing simulations conducted at least monthly?', status: 'fail', weight: 15, recommendation: 'Resume monthly simulations and track click rates' },
      { id: 'ET-03', question: 'Is there a clear process for employees to report suspicious emails?', status: 'pass', weight: 10, evidence: 'Report button available in email client' },
      { id: 'ET-04', question: 'Are role-specific training modules available for high-risk teams?', status: 'fail', weight: 12, recommendation: 'Provide targeted modules for Finance and HR' },
      { id: 'ET-05', question: 'Is the phishing click rate below 5%?', status: 'fail', weight: 15, recommendation: 'Current rate above target; improve awareness and controls' },
    ],
  },
  {
    id: 'access',
    name: 'Access Control',
    icon: Lock,
    description: 'Multi-factor authentication, privilege management, and identity governance',
    controls: [
      { id: 'AC-01', question: 'Is MFA enforced for all user accounts?', status: 'partial', weight: 15, recommendation: 'Enforce MFA for service and legacy accounts' },
      { id: 'AC-02', question: 'Is the principle of least privilege enforced?', status: 'pass', weight: 12, evidence: 'Quarterly access reviews' },
      { id: 'AC-03', question: 'Are privileged access workstations (PAWs) used for admin tasks?', status: 'fail', weight: 10, recommendation: 'Adopt PAWs for all privileged operations' },
      { id: 'AC-04', question: 'Are inactive accounts disabled within 30 days?', status: 'pass', weight: 8, evidence: 'Automated cleanup workflow' },
    ],
  },
  {
    id: 'patching',
    name: 'Patch Management',
    icon: RefreshCw,
    description: 'Vulnerability scanning, patch deployment SLA, and system hardening',
    controls: [
      { id: 'PM-01', question: 'Are critical patches deployed within 48 hours of release?', status: 'fail', weight: 15, recommendation: 'Automate critical patch deployment for servers' },
      { id: 'PM-02', question: 'Is automated vulnerability scanning performed weekly?', status: 'pass', weight: 12, evidence: 'Weekly scans scheduled' },
      { id: 'PM-03', question: 'Are end-of-life systems identified and tracked?', status: 'partial', weight: 10, recommendation: 'Create a migration plan for EOL systems' },
      { id: 'PM-04', question: 'Is there a formal patch management policy?', status: 'pass', weight: 8, evidence: 'Policy approved by security leadership' },
    ],
  },
  {
    id: 'ir',
    name: 'Incident Response',
    icon: FileKey,
    description: 'Response playbooks, tabletop exercises, and communication protocols',
    controls: [
      { id: 'IR-01', question: 'Does a documented ransomware-specific IR playbook exist?', status: 'pass', weight: 15, evidence: 'Playbook includes containment and recovery steps' },
      { id: 'IR-02', question: 'Are tabletop exercises conducted at least semi-annually?', status: 'pass', weight: 12, evidence: 'Recent exercise completed' },
      { id: 'IR-03', question: 'Is there a defined communication plan for ransomware incidents?', status: 'pass', weight: 10, evidence: 'Stakeholder notification templates available' },
      { id: 'IR-04', question: 'Are incident response team roles and responsibilities documented?', status: 'pass', weight: 10, evidence: 'RACI matrix maintained' },
      { id: 'IR-05', question: 'Is there a relationship with a retainer-based IR provider?', status: 'partial', weight: 8, recommendation: 'Renew retainer and confirm escalation paths' },
    ],
  },
]

const statusConfig = {
  pass: { icon: CheckCircle, color: 'text-success', bg: 'bg-success/10', label: 'Pass' },
  fail: { icon: XCircle, color: 'text-danger', bg: 'bg-danger/10', label: 'Fail' },
  partial: { icon: Circle, color: 'text-warning', bg: 'bg-warning/10', label: 'Partial' },
  'not-assessed': { icon: Circle, color: 'text-muted-foreground', bg: 'bg-muted', label: 'N/A' },
}

function getDomainScore(controls) {
  const totalWeight = controls.reduce((sum, c) => sum + c.weight, 0)
  const earned = controls.reduce((sum, c) => {
    if (c.status === 'pass') return sum + c.weight
    if (c.status === 'partial') return sum + c.weight * 0.5
    return sum
  }, 0)
  return Math.round((earned / totalWeight) * 100)
}

export function AssessmentPage() {
  const [expandedDomain, setExpandedDomain] = useState('backup')
  const [isRunning, setIsRunning] = useState(false)

  const summary = useMemo(() => {
    const total = domains.reduce((sum, d) => sum + d.controls.length, 0)
    const passed = domains.reduce((sum, d) => sum + d.controls.filter((c) => c.status === 'pass').length, 0)
    const failed = domains.reduce((sum, d) => sum + d.controls.filter((c) => c.status === 'fail').length, 0)
    const partial = domains.reduce((sum, d) => sum + d.controls.filter((c) => c.status === 'partial').length, 0)
    return { total, passed, failed, partial }
  }, [])

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
            onClick={() => setIsRunning((v) => !v)}
            className="flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {isRunning ? (
              <>
                <ClipboardCheck className="h-4 w-4" />
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
          const score = getDomainScore(domain.controls)
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


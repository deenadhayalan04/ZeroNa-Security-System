import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useEffect, useMemo, useState } from 'react'
import { downloadReportCsv, getAssessment } from '../api/assessment'
import { Download } from 'lucide-react'

export function ReportsPage() {
  const [assessment, setAssessment] = useState(null)

  useEffect(() => {
    getAssessment()
      .then(setAssessment)
      .catch(() => setAssessment(null))
  }, [])

  const data = useMemo(() => {
    if (!assessment?.domains) return []
    return assessment.domains.map((d) => ({ domain: d.name, score: d.score }))
  }, [assessment])

  return (
    <div className="flex flex-col gap-5">
      <div className="glass rounded-2xl px-5 py-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Reports</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Executive-ready reporting for ransomware readiness
            </p>
          </div>
          <button
            onClick={async () => {
              const blob = await downloadReportCsv()
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = 'zerona_readiness_report.csv'
              document.body.appendChild(a)
              a.click()
              a.remove()
              URL.revokeObjectURL(url)
            }}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Download className="h-4 w-4" />
            Download CSV
          </button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>Domain Score Distribution</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                {assessment?.generated_at ? `Generated at ${assessment.generated_at}` : 'Snapshot of readiness per domain'}
              </p>
            </div>
            <Badge variant="outline" className="text-[10px]">
              Overall: {assessment?.overall_score ?? '--'}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 14, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                <XAxis dataKey="domain" stroke="rgba(148,163,184,0.6)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} stroke="rgba(148,163,184,0.6)" fontSize={11} tickLine={false} axisLine={false} width={30} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15, 23, 42, 0.85)',
                    border: '1px solid rgba(148, 163, 184, 0.18)',
                    borderRadius: 12,
                    backdropFilter: 'blur(12px)',
                    color: 'white',
                  }}
                />
                <Bar dataKey="score" fill="hsl(var(--primary))" radius={[10, 10, 10, 10]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            This report is generated from the backend readiness controls (prevention + detection + usability + reporting).
          </p>
        </CardContent>
      </Card>
    </div>
  )
}


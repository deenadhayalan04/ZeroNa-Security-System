import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const data = [
  { domain: 'Backup', score: 82 },
  { domain: 'Endpoint', score: 71 },
  { domain: 'Email', score: 58 },
  { domain: 'Network', score: 64 },
  { domain: 'IR', score: 45 },
  { domain: 'Training', score: 72 },
  { domain: 'Patching', score: 79 },
  { domain: 'Access', score: 67 },
]

export function ReportsPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="glass rounded-2xl px-5 py-5">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Reports</h2>
        <p className="mt-1 text-sm text-muted-foreground">Export-ready summary of assessment performance</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>Domain Score Distribution</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">Snapshot of current readiness per domain</p>
            </div>
            <Badge variant="outline" className="text-[10px]">
              Sample report
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
            Tip: connect your backend to replace these sample values with live assessment data.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}


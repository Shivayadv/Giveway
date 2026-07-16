import { cookies } from "next/headers"
import { BarChart3, Users, Ticket, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { apiFetch, type SellerStats } from "@/lib/api"

const STATUS_COLORS: Record<string, string> = {
  active:   "bg-green-500/10 text-green-400 border-green-500/20",
  pending:  "bg-amber-500/10 text-amber-400 border-amber-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
  ended:    "bg-muted/60 text-muted-foreground border-border/40",
}

export default async function SellerAnalyticsPage() {
  const token = (await cookies()).get("token")?.value ?? ""
  let stats: SellerStats = { total_campaigns: 0, total_leads: 0, avg_conversion: "0%", campaigns: [] }
  try {
    stats = await apiFetch<SellerStats>("/api/stats/seller", {}, token)
  } catch {}

  const maxLeads = Math.max(...stats.campaigns.map((c) => c.leads), 1)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">Performance overview across all your campaigns.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { title: "Total Campaigns", value: stats.total_campaigns, icon: Ticket,    color: "text-primary",   bg: "bg-primary/10" },
          { title: "Total Leads",     value: stats.total_leads,     icon: Users,     color: "text-amber-400", bg: "bg-amber-400/10" },
          { title: "Avg Conversion",  value: stats.avg_conversion,  icon: TrendingUp, color: "text-green-400", bg: "bg-green-400/10" },
        ].map((s) => (
          <Card key={s.title} className="border border-border/50 bg-card relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.title}</CardTitle>
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {stats.campaigns.length > 0 && (
        <Card className="border border-border/50 bg-card">
          <CardHeader className="border-b border-border/50">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-semibold">Leads by Campaign</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            {stats.campaigns.map((c) => {
              const pct = Math.round((c.leads / maxLeads) * 100)
              return (
                <div key={c.id} className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{c.name}</p>
                      <Badge variant="outline" className={`text-xs capitalize shrink-0 ${STATUS_COLORS[c.status] ?? STATUS_COLORS.ended}`}>
                        {c.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 text-right">
                      <span className="text-xs text-muted-foreground">{c.conversion}</span>
                      <span className="text-sm font-bold w-8 text-right">{c.leads}</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-amber-400 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {stats.campaigns.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-border/50 rounded-2xl bg-card/30">
          <BarChart3 className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">No data yet</h3>
          <p className="text-muted-foreground text-sm mt-1">Analytics will appear once your first campaign goes live.</p>
        </div>
      )}
    </div>
  )
}

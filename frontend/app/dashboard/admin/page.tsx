import { Users, Ticket, DollarSign, Activity, TrendingUp, ShieldCheck, ArrowUpRight } from "lucide-react"
import { cookies } from "next/headers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiFetch, type PlatformStats } from "@/lib/api"

const ROLE_BADGE: Record<string, string> = {
  user:   "bg-primary/10 text-primary border-primary/20",
  seller: "bg-amber-400/10 text-amber-400 border-amber-400/20",
  admin:  "bg-red-400/10 text-red-400 border-red-400/20",
}

export default async function AdminDashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  let stats: PlatformStats = {
    total_users: 0,
    total_campaigns: 0,
    active_giveaways: 0,
    total_entries: 0,
    total_revenue: "$0",
    recent_signups: [],
  }
  try {
    if (token) {
      stats = await apiFetch<PlatformStats>("/api/stats/platform", {}, token)
    }
  } catch {
    // backend offline
  }

  const STATS = [
    { title: "Total Users",      value: stats.total_users.toLocaleString(),     icon: Users,      color: "text-primary",   bg: "bg-primary/10",   sub: "registered accounts", subColor: "text-primary" },
    { title: "Total Campaigns",  value: stats.total_campaigns.toLocaleString(), icon: Ticket,     color: "text-amber-400", bg: "bg-amber-400/10", sub: "all time",             subColor: "text-amber-400" },
    { title: "Total Revenue",    value: stats.total_revenue,                    icon: DollarSign, color: "text-green-400", bg: "bg-green-400/10", sub: "platform lifetime",    subColor: "text-green-400" },
    { title: "Active Giveaways", value: stats.active_giveaways.toLocaleString(),icon: Activity,   color: "text-red-400",   bg: "bg-red-400/10",   sub: "running now",          subColor: "text-red-400" },
  ]

  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Admin Overview</h1>
        <p className="text-muted-foreground mt-1">Platform-wide statistics, growth metrics, and recent activity.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s) => (
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
              <p className={`text-xs mt-1 font-medium flex items-center gap-1 ${s.subColor}`}>
                <TrendingUp className="h-3 w-3" /> {s.sub}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="border border-border/50 bg-card lg:col-span-4 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/50">
            <CardTitle className="text-base font-semibold">Platform Growth</CardTitle>
            <button className="text-xs text-primary hover:underline flex items-center gap-1">
              Export <ArrowUpRight className="h-3 w-3" />
            </button>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center min-h-[280px]">
            <div className="text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Activity className="h-8 w-8 text-primary/40" />
              </div>
              <p className="text-muted-foreground text-sm font-medium">Chart coming soon</p>
              <p className="text-xs text-muted-foreground mt-1">Analytics integration in Phase 2</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/50 bg-card lg:col-span-3">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="text-base font-semibold">Recent Signups</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {stats.recent_signups.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground text-sm">No signups yet.</div>
            ) : (
              stats.recent_signups.map((u, i) => {
                const initials = u.name.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2)
                return (
                  <div key={u.email} className={`flex items-center justify-between px-5 py-3.5 ${i !== stats.recent_signups.length - 1 ? "border-b border-border/40" : ""} hover:bg-muted/30 transition-colors`}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-xs text-primary ring-1 ring-primary/20 flex-shrink-0">{initials}</div>
                      <div>
                        <p className="font-medium text-sm">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${ROLE_BADGE[u.role] ?? ROLE_BADGE.user}`}>{u.role}</span>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>

      <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center flex-shrink-0">
          <ShieldCheck className="h-5 w-5 text-amber-400" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm text-amber-400">Review pending campaign submissions</p>
          <p className="text-xs text-muted-foreground mt-0.5">Review brand submissions to keep the platform active and compliant.</p>
        </div>
        <a href="/dashboard/admin/approvals">
          <button className="px-4 py-2 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/25 text-sm font-semibold hover:bg-amber-500/25 transition-colors flex-shrink-0">
            Review Now
          </button>
        </a>
      </div>

    </div>
  )
}

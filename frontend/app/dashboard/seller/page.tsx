import { BarChart3, Ticket, Users, TrendingUp, PlusCircle, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { cookies } from "next/headers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { apiFetch, type SellerStats } from "@/lib/api"

export default async function SellerDashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  let stats: SellerStats = { total_campaigns: 0, total_leads: 0, avg_conversion: "0%", campaigns: [] }
  try {
    if (token) {
      stats = await apiFetch<SellerStats>("/api/stats/seller", {}, token)
    }
  } catch {
    // backend offline
  }

  return (
    <div className="space-y-8">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Brand Dashboard</h1>
          <p className="text-muted-foreground mt-1">Your campaign performance and lead pipeline.</p>
        </div>
        <Link href="/dashboard/seller/campaigns/new">
          <Button className="gap-2 shadow-sm shadow-primary/20">
            <PlusCircle className="h-4 w-4" />
            New Campaign
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { title: "Total Campaigns", value: String(stats.total_campaigns),            icon: Ticket,   color: "text-primary",   bg: "bg-primary/10",   sub: "created by you",            subColor: "text-primary" },
          { title: "Total Leads",     value: stats.total_leads.toLocaleString(),        icon: Users,    color: "text-amber-400", bg: "bg-amber-400/10", sub: "across all campaigns",       subColor: "text-amber-400" },
          { title: "Avg. Conversion", value: stats.avg_conversion,                     icon: BarChart3, color: "text-green-400", bg: "bg-green-400/10", sub: "entries per participant",    subColor: "text-green-400" },
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
              <p className={`text-xs mt-1 font-medium flex items-center gap-1 ${s.subColor}`}>
                <TrendingUp className="h-3 w-3" /> {s.sub}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border border-border/50 bg-card">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/50">
            <CardTitle className="text-base font-semibold">Top Campaigns</CardTitle>
            <Link href="/dashboard/seller/campaigns">
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10 text-xs gap-1">
                View All <ArrowUpRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {stats.campaigns.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-sm">
                No campaigns yet.{" "}
                <Link href="/dashboard/seller/campaigns/new" className="text-primary hover:underline">Create one</Link>
              </div>
            ) : (
              stats.campaigns.map((c, i) => (
                <div key={c.id} className={`flex items-center justify-between px-5 py-4 ${i !== stats.campaigns.length - 1 ? "border-b border-border/40" : ""} hover:bg-muted/30 transition-colors`}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{c.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">{c.leads.toLocaleString()} leads</span>
                        <Badge variant="outline" className={`text-xs ${c.status === "active" ? "text-green-400 bg-green-500/10 border-green-500/20" : "text-muted-foreground border-border"}`}>
                          {c.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-primary">{c.conversion}</div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border border-border/50 bg-card flex flex-col">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="text-base font-semibold">Lead Generation Trend</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center min-h-[220px]">
            <div className="text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="h-8 w-8 text-primary/40" />
              </div>
              <p className="text-muted-foreground text-sm font-medium">Chart coming soon</p>
              <p className="text-xs text-muted-foreground mt-1">Analytics integration in Phase 2</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-border/50 bg-card">
        <CardHeader className="border-b border-border/50">
          <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "New Campaign", href: "/dashboard/seller/campaigns/new", icon: PlusCircle, primary: true },
            { label: "View Leads",   href: "/dashboard/seller/leads",          icon: Users,       primary: false },
            { label: "Analytics",   href: "/dashboard/seller/analytics",       icon: BarChart3,   primary: false },
            { label: "Payments",    href: "/dashboard/seller/payments",        icon: TrendingUp,  primary: false },
          ].map((a) => (
            <Link key={a.label} href={a.href}>
              <button className={`w-full flex flex-col items-center gap-2 rounded-xl p-4 text-sm font-medium transition-all hover:-translate-y-0.5 ${
                a.primary
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/30"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}>
                <a.icon className="h-5 w-5" />
                {a.label}
              </button>
            </Link>
          ))}
        </CardContent>
      </Card>

    </div>
  )
}

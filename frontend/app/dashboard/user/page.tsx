import { Ticket, Trophy, Target, Clock, ChevronRight, Zap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { cookies } from "next/headers"
import { getSession } from "@/lib/session"
import { apiFetch, type UserStats } from "@/lib/api"

const STATUS_CONFIG = {
  Active: { label: "Active",   class: "bg-primary/15 text-primary border-primary/25" },
  Won:    { label: "Won 🎉",   class: "bg-green-500/15 text-green-400 border-green-500/25" },
  Lost:   { label: "Lost",     class: "bg-muted text-muted-foreground border-border" },
}

export default async function UserDashboardPage() {
  const session = await getSession()
  const firstName = session?.name?.split(" ")[0] ?? "there"

  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  let stats: UserStats = { total_participations: 0, active_campaigns: 0, total_wins: 0, entries: [] }
  try {
    if (token) {
      stats = await apiFetch<UserStats>("/api/stats/user", {}, token)
    }
  } catch {
    // backend offline — show zero-state
  }

  const firstActive = stats.entries.find((e) => e.entry_status === "Active")

  return (
    <div className="space-y-8">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Welcome back, <span className="text-primary">{firstName}</span> 👋
          </h1>
          <p className="text-muted-foreground mt-1">Track your active entries and previous wins.</p>
        </div>
        <Link href="/campaigns">
          <Button className="shadow-sm shadow-primary/20">Browse Campaigns <ChevronRight className="ml-1 h-4 w-4" /></Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { title: "Total Participations", value: String(stats.total_participations), icon: Target, color: "text-primary",   bg: "bg-primary/10",   sub: "all time",         subColor: "text-primary" },
          { title: "Active Campaigns",     value: String(stats.active_campaigns),     icon: Ticket, color: "text-amber-400", bg: "bg-amber-400/10", sub: "draws upcoming",   subColor: "text-amber-400" },
          { title: "Total Wins",           value: String(stats.total_wins),           icon: Trophy, color: "text-green-400", bg: "bg-green-400/10", sub: "verified winners", subColor: "text-green-400" },
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
              <p className={`text-xs mt-1 font-medium ${s.subColor}`}>{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {firstActive && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">{firstActive.campaign_title} draw on {firstActive.draw_date}!</p>
            <p className="text-xs text-muted-foreground mt-0.5">You&apos;re entered. Stay tuned — winners get notified via email.</p>
          </div>
          <Badge className="bg-primary/15 text-primary border border-primary/25 text-xs flex-shrink-0">
            <Clock className="h-3 w-3 mr-1" /> Draw: {firstActive.draw_date}
          </Badge>
        </div>
      )}

      <Card className="border border-border/50 bg-card">
        <CardHeader className="border-b border-border/50">
          <CardTitle className="text-base font-semibold">Campaign History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {stats.entries.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground text-sm">
              You haven&apos;t entered any campaigns yet.{" "}
              <Link href="/campaigns" className="text-primary hover:underline">Browse campaigns</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead className="text-xs uppercase tracking-wide text-muted-foreground pl-6">Campaign</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">Prize Value</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide text-muted-foreground hidden md:table-cell">Joined</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide text-muted-foreground hidden md:table-cell">Draw Date</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide text-muted-foreground text-right pr-6">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.entries.map((c) => {
                    const st = STATUS_CONFIG[c.entry_status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.Active
                    const joinedDate = c.joined_at ? new Date(c.joined_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "—"
                    return (
                      <TableRow key={c.id} className="border-border/40 hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium pl-6 py-4">{c.campaign_title}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{c.prize}</TableCell>
                        <TableCell className="text-muted-foreground text-sm hidden md:table-cell">{joinedDate}</TableCell>
                        <TableCell className="text-muted-foreground text-sm hidden md:table-cell">{c.draw_date}</TableCell>
                        <TableCell className="text-right pr-6">
                          <Badge variant="outline" className={`text-xs ${st.class}`}>{st.label}</Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  )
}

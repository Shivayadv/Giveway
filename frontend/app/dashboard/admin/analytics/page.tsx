"use client"

import { useEffect, useState } from "react"
import { Loader2, TrendingUp, Users, Ticket } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, Cell,
} from "recharts"

interface SeriesPoint { date: string; entries: number; users: number }
interface TopCampaign  { name: string; leads: number; status: string }
interface Analytics    { series: SeriesPoint[]; top_campaigns: TopCampaign[] }

const STATUS_COLORS: Record<string, string> = {
  active: "#f97316", pending: "#f59e0b", ended: "#6b7280", rejected: "#ef4444",
}

const TOOLTIP_STYLE = {
  backgroundColor: "#1a1a1a",
  border: "1px solid #333",
  borderRadius: 10,
  color: "#f5f5f5",
  fontSize: 12,
}

function shortDate(d: string) {
  const [, m, day] = d.split("-")
  return `${parseInt(m)}/${parseInt(day)}`
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!data) {
    return <div className="text-center py-20 text-muted-foreground text-sm">Failed to load analytics.</div>
  }

  const totalEntries = data.series.reduce((s, d) => s + d.entries, 0)
  const totalUsers   = data.series.reduce((s, d) => s + d.users, 0)
  const peakEntries  = Math.max(...data.series.map((d) => d.entries))

  const chartData = data.series.map((p) => ({ ...p, date: shortDate(p.date) }))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Platform Analytics</h1>
        <p className="text-muted-foreground mt-1">Last 30 days of platform activity.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { title: "Entries (30d)",    value: totalEntries, icon: Ticket, color: "text-primary",   bg: "bg-primary/10" },
          { title: "New Users (30d)",  value: totalUsers,   icon: Users,  color: "text-amber-400", bg: "bg-amber-400/10" },
          { title: "Peak Entries/Day", value: peakEntries,  icon: TrendingUp, color: "text-green-400", bg: "bg-green-400/10" },
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
              <div className="text-3xl font-extrabold">{s.value.toLocaleString()}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border border-border/50 bg-card">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="text-base font-semibold">Daily Entries</CardTitle>
          </CardHeader>
          <CardContent className="pt-5 pr-3">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#888" }} tickLine={false} axisLine={false} interval={4} />
                <YAxis tick={{ fontSize: 11, fill: "#888" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Line type="monotone" dataKey="entries" stroke="#f97316" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border border-border/50 bg-card">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="text-base font-semibold">Daily New Users</CardTitle>
          </CardHeader>
          <CardContent className="pt-5 pr-3">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#888" }} tickLine={false} axisLine={false} interval={4} />
                <YAxis tick={{ fontSize: 11, fill: "#888" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Line type="monotone" dataKey="users" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {data.top_campaigns.length > 0 && (
        <Card className="border border-border/50 bg-card">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="text-base font-semibold">Top Campaigns by Leads</CardTitle>
          </CardHeader>
          <CardContent className="pt-5 pr-3">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.top_campaigns} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#222" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#888" }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#ccc" }} tickLine={false} axisLine={false} width={140} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="leads" radius={[0, 6, 6, 0]}>
                  {data.top_campaigns.map((c, i) => (
                    <Cell key={i} fill={STATUS_COLORS[c.status] ?? "#f97316"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 mt-4 justify-end">
              {Object.entries(STATUS_COLORS).map(([s, c]) => (
                <div key={s} className="flex items-center gap-1.5 text-xs text-muted-foreground capitalize">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />
                  {s}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

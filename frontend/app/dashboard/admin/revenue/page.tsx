"use client"

import { useEffect, useState } from "react"
import { Loader2, DollarSign, CreditCard, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface RevenueData {
  total_revenue: string
  total_payments: number
  by_plan: { plan: string; amount: number; count: number }[]
  recent_payments: { seller_name: string; plan: string; amount_display: string; paid_at: string }[]
}

const PLAN_COLORS: Record<string, string> = {
  basic: "bg-primary/10 text-primary border-primary/20",
  pro:   "bg-amber-500/10 text-amber-400 border-amber-500/20",
}

export default function RevenuePage() {
  const [data, setData]       = useState<RevenueData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/payments/admin/revenue")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Revenue</h1>
        <p className="text-muted-foreground mt-1">Platform earnings from campaign listing fees.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { title: "Total Revenue",   value: data?.total_revenue ?? "₹0",            icon: DollarSign,  color: "text-green-400", bg: "bg-green-400/10" },
          { title: "Total Payments",  value: String(data?.total_payments ?? 0),       icon: CreditCard,  color: "text-primary",   bg: "bg-primary/10" },
          { title: "Avg per Payment", value: data && data.total_payments > 0
              ? `₹${Math.round((data.by_plan.reduce((s,p)=>s+p.amount,0)/100) / data.total_payments).toLocaleString()}`
              : "₹0",                                                                  icon: TrendingUp,  color: "text-amber-400", bg: "bg-amber-400/10" },
        ].map((s) => (
          <Card key={s.title} className="border border-border/50 bg-card relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.title}</CardTitle>
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
            </CardHeader>
            <CardContent><div className="text-3xl font-extrabold">{s.value}</div></CardContent>
          </Card>
        ))}
      </div>

      {data && data.by_plan.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-4">
          {data.by_plan.map((p) => (
            <Card key={p.plan} className="border border-border/50 bg-card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <Badge variant="outline" className={`capitalize text-xs mb-2 ${PLAN_COLORS[p.plan] ?? PLAN_COLORS.basic}`}>{p.plan} plan</Badge>
                  <p className="text-2xl font-extrabold">₹{(p.amount/100).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">{p.count} payment{p.count !== 1 ? "s" : ""}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {data && data.recent_payments.length > 0 ? (
        <Card className="border border-border/50 bg-card">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="text-base font-semibold">Recent Payments</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="pl-6 text-xs uppercase tracking-wide text-muted-foreground">Seller</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">Plan</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">Amount</TableHead>
                  <TableHead className="text-right pr-6 text-xs uppercase tracking-wide text-muted-foreground">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recent_payments.map((p, i) => (
                  <TableRow key={i} className="border-border/40 hover:bg-muted/30">
                    <TableCell className="pl-6 py-4 font-medium">{p.seller_name}</TableCell>
                    <TableCell><Badge variant="outline" className={`capitalize text-xs ${PLAN_COLORS[p.plan] ?? PLAN_COLORS.basic}`}>{p.plan}</Badge></TableCell>
                    <TableCell className="font-semibold text-green-400">{p.amount_display}</TableCell>
                    <TableCell className="text-right pr-6 text-muted-foreground text-xs">
                      {p.paid_at ? new Date(p.paid_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-16 border-2 border-dashed border-border/50 rounded-2xl bg-card/30 text-muted-foreground text-sm">
          No payments yet. Revenue will appear here once sellers start paying.
        </div>
      )}
    </div>
  )
}

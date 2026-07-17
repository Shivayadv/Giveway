"use client"

import { useEffect, useState } from "react"
import { Ticket, Loader2, Users, Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Campaign {
  id: string
  title: string
  brand: string
  category: string
  status: string
  price: string
  leads: number
  winners: number
  created_at: string
}

const STATUS_COLORS: Record<string, string> = {
  active:   "bg-green-500/10 text-green-400 border-green-500/20",
  pending:  "bg-amber-500/10 text-amber-400 border-amber-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
  ended:    "bg-muted/60 text-muted-foreground border-border/40",
}

const FILTERS = ["all", "active", "pending", "rejected", "ended"] as const

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [total, setTotal]         = useState(0)
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState<string>("all")
  const [search, setSearch]       = useState("")

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filter !== "all") params.set("status", filter)
    fetch(`/api/admin/campaigns?${params}`)
      .then((r) => r.json())
      .then((d) => { setCampaigns(d.campaigns ?? []); setTotal(d.total ?? 0); setLoading(false) })
      .catch(() => setLoading(false))
  }, [filter])

  const filtered = campaigns.filter((c) => {
    const q = search.toLowerCase()
    return !q || c.title.toLowerCase().includes(q) || c.brand.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">All Campaigns</h1>
        <p className="text-muted-foreground mt-1">Monitor and manage every campaign on the platform.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors capitalize ${
                filter === f
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border/50 text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search campaigns..."
            className="pl-9 h-10 bg-background border-border/60 rounded-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card className="border border-border/50 bg-card">
        <CardHeader className="border-b border-border/50 py-4">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            {loading ? "Loading..." : `${filtered.length} of ${total} campaigns`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">No campaigns found.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead className="pl-6 text-xs uppercase tracking-wide text-muted-foreground">Campaign</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide text-muted-foreground hidden md:table-cell">Brand</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide text-muted-foreground hidden lg:table-cell">Category</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" /> Leads</span>
                    </TableHead>
                    <TableHead className="text-xs uppercase tracking-wide text-muted-foreground hidden md:table-cell">Created</TableHead>
                    <TableHead className="text-right pr-6 text-xs uppercase tracking-wide text-muted-foreground">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c) => (
                    <TableRow key={c.id} className="border-border/40 hover:bg-muted/30 transition-colors">
                      <TableCell className="pl-6 py-4">
                        <p className="font-medium">{c.title}</p>
                        <p className="text-xs text-primary font-semibold mt-0.5">{c.price}</p>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm hidden md:table-cell">{c.brand}</TableCell>
                      <TableCell className="text-muted-foreground text-sm hidden lg:table-cell">{c.category}</TableCell>
                      <TableCell className="font-semibold">{c.leads.toLocaleString()}</TableCell>
                      <TableCell className="text-muted-foreground text-xs hidden md:table-cell">
                        {c.created_at ? new Date(c.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Badge variant="outline" className={`text-xs capitalize ${STATUS_COLORS[c.status] ?? STATUS_COLORS.ended}`}>
                          {c.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

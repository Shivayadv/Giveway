"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Download, Search, Loader2, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Lead {
  id: string
  name: string
  email: string
  phone: string
  city: string
  campaign_title: string
  joined_at: string
  entry_status: string
}

export default function LeadsPage() {
  const searchParams = useSearchParams()
  const campaignId = searchParams.get("campaign") ?? ""
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (!campaignId) { setLoading(false); return }
    fetch(`/api/entries/campaign/${campaignId}`)
      .then((r) => r.json())
      .then((data) => { setLeads(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [campaignId])

  const filtered = leads.filter((l) => {
    const q = search.toLowerCase()
    return !q || l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || l.city.toLowerCase().includes(q)
  })

  function handleCsvDownload() {
    if (campaignId) {
      window.open(`/api/entries/campaign/${campaignId}/csv`, "_blank")
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Campaign Leads</h1>
          <p className="text-muted-foreground mt-1">View and export the leads generated from your campaigns.</p>
        </div>
        <Button
          variant="outline"
          className="gap-2 border-border/60 hover:border-primary/40"
          onClick={handleCsvDownload}
          disabled={!campaignId || loading}
        >
          <Download className="h-4 w-4" /> Download CSV
        </Button>
      </div>

      {!campaignId ? (
        <div className="text-center py-20 border-2 border-dashed border-border/50 rounded-2xl bg-card/30">
          <Users className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Select a Campaign</h3>
          <p className="text-muted-foreground mt-1 text-sm">Go to <a href="/dashboard/seller/campaigns" className="text-primary hover:underline">My Campaigns</a> and click &quot;View Leads&quot; on any active campaign.</p>
        </div>
      ) : (
        <Card className="border border-border/50 bg-card">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50">
            <CardTitle className="text-base font-semibold">
              {leads.length > 0 ? leads[0].campaign_title : "All Leads"}
              {!loading && <span className="ml-2 text-sm font-normal text-muted-foreground">({filtered.length.toLocaleString()})</span>}
            </CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email or city..."
                className="pl-9 bg-background h-10 rounded-lg border-border/60"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground text-sm">
                {search ? "No leads match your search." : "No leads yet for this campaign."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border/50">
                      <TableHead className="pl-6 text-xs uppercase tracking-wide text-muted-foreground">Name</TableHead>
                      <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">Contact</TableHead>
                      <TableHead className="text-xs uppercase tracking-wide text-muted-foreground hidden md:table-cell">City</TableHead>
                      <TableHead className="text-xs uppercase tracking-wide text-muted-foreground hidden lg:table-cell">Joined</TableHead>
                      <TableHead className="text-right pr-6 text-xs uppercase tracking-wide text-muted-foreground">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((lead) => {
                      const isWon = lead.entry_status === "Won"
                      const isLost = lead.entry_status === "Lost"
                      return (
                        <TableRow key={lead.id} className="border-border/40 hover:bg-muted/30 transition-colors">
                          <TableCell className="font-medium pl-6 py-4">{lead.name}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm">{lead.phone}</span>
                              <span className="text-xs text-muted-foreground">{lead.email}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm hidden md:table-cell">{lead.city}</TableCell>
                          <TableCell className="text-muted-foreground text-xs hidden lg:table-cell">
                            {lead.joined_at ? new Date(lead.joined_at).toLocaleDateString() : "—"}
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <Badge
                              variant="outline"
                              className={
                                isWon  ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                isLost ? "bg-red-500/10 text-red-400 border-red-500/20" :
                                         "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              }
                            >
                              {lead.entry_status}
                            </Badge>
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
      )}
    </div>
  )
}

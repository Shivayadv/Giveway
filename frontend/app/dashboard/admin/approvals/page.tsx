"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, XCircle, Clock, Loader2, Trophy, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Campaign {
  id: string
  title: string
  brand: string
  price: string
  winners: number
  category: string
  created_at?: string
  status: string
  description: string
}

export default function ApprovalsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState<Record<string, "approving" | "rejecting">>({})

  useEffect(() => {
    fetch("/api/campaigns/pending")
      .then((r) => r.json())
      .then((data) => { setCampaigns(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function act(id: string, action: "approve" | "reject") {
    setActing((a) => ({ ...a, [id]: action === "approve" ? "approving" : "rejecting" }))
    await fetch(`/api/campaigns/${id}/${action}`, { method: "PATCH" })
    setCampaigns((c) => c.filter((x) => x.id !== id))
    setActing((a) => { const n = { ...a }; delete n[id]; return n })
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Campaign Approvals</h1>
        <p className="text-muted-foreground mt-1">Review and moderate pending giveaway campaigns before they go live.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-border/50 rounded-2xl bg-card/30">
          <CheckCircle2 className="h-10 w-10 text-green-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">All caught up!</h3>
          <p className="text-muted-foreground mt-1 text-sm">No pending campaigns to review at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((c) => (
            <Card key={c.id} className="border border-border/50 bg-card overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-6">
                <div className="space-y-1 md:w-2/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20">
                      <Clock className="w-3 h-3 mr-1" /> Pending Review
                    </Badge>
                    <Badge variant="outline" className="text-xs border-border/50 text-muted-foreground">{c.category}</Badge>
                  </div>
                  <h3 className="text-lg font-bold">{c.title}</h3>
                  <p className="text-muted-foreground text-sm font-medium">by {c.brand}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.description}</p>
                </div>

                <div className="flex gap-8 md:flex-col md:gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><DollarSign className="h-3 w-3" /> Prize Value</p>
                    <p className="font-bold text-xl text-primary">{c.price}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><Trophy className="h-3 w-3" /> Winners</p>
                    <p className="font-medium text-sm">{c.winners}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 md:w-1/3 md:justify-end border-t md:border-0 pt-4 md:pt-0 mt-2 md:mt-0">
                  <Button
                    variant="outline"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 gap-2"
                    onClick={() => act(c.id, "reject")}
                    disabled={!!acting[c.id]}
                  >
                    {acting[c.id] === "rejecting" ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                    Reject
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white border-0 gap-2 shadow-sm shadow-green-500/20"
                    onClick={() => act(c.id, "approve")}
                    disabled={!!acting[c.id]}
                  >
                    {acting[c.id] === "approving" ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Approve
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

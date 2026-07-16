"use client"

import { useEffect, useState } from "react"
import { Trophy, Loader2, CheckCircle2, Shuffle, Mail, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Campaign {
  id: string
  title: string
  brand: string
  participants: number
  winners: number
  winner_drawn?: boolean
  status: string
}

interface Winner {
  entry_id: string
  name: string
  email: string
  city: string
  campaign_title: string
}

export default function DrawPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [drawing, setDrawing] = useState<string | null>(null)
  const [drawn, setDrawn] = useState<Record<string, Winner[]>>({})

  useEffect(() => {
    fetch("/api/campaigns?status=active")
      .then((r) => r.json())
      .then((data) => { setCampaigns(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function triggerDraw(campaignId: string) {
    setDrawing(campaignId)
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/draw`, { method: "POST" })
      if (res.ok) {
        const winners: Winner[] = await res.json()
        setDrawn((d) => ({ ...d, [campaignId]: winners }))
        setCampaigns((cs) => cs.map((c) => c.id === campaignId ? { ...c, winner_drawn: true, status: "ended" } : c))
      }
    } finally {
      setDrawing(null)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Winner Draw</h1>
        <p className="text-muted-foreground mt-1">Trigger random winner selection for active campaigns. This action is irreversible.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-border/50 rounded-2xl bg-card/30">
          <Trophy className="h-10 w-10 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-semibold">No active campaigns</h3>
          <p className="text-muted-foreground mt-1 text-sm">Active campaigns will appear here when ready for a draw.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((c) => {
            const winners = drawn[c.id]
            const isDrawn = !!winners || c.winner_drawn
            return (
              <Card key={c.id} className="border border-border/50 bg-card">
                <CardHeader className="border-b border-border/50 pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={isDrawn ? "bg-muted/60 text-muted-foreground border-border/40" : "bg-green-500/10 text-green-400 border-green-500/20"}>
                          {isDrawn ? "Ended" : "Active"}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{c.participants.toLocaleString()} entries · {c.winners} winner{c.winners !== 1 ? "s" : ""}</span>
                      </div>
                      <CardTitle className="text-lg">{c.title}</CardTitle>
                      <CardDescription>by {c.brand}</CardDescription>
                    </div>
                    <Button
                      onClick={() => triggerDraw(c.id)}
                      disabled={isDrawn || drawing === c.id}
                      className={isDrawn ? "opacity-50 cursor-not-allowed" : "shadow-sm shadow-primary/20 gap-2"}
                      variant={isDrawn ? "outline" : "default"}
                    >
                      {drawing === c.id ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Drawing...</>
                      ) : isDrawn ? (
                        <><CheckCircle2 className="h-4 w-4" /> Already Drawn</>
                      ) : (
                        <><Shuffle className="h-4 w-4" /> Draw Winners</>
                      )}
                    </Button>
                  </div>
                </CardHeader>

                {winners && winners.length > 0 && (
                  <CardContent className="p-5">
                    <p className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-1.5">
                      <Trophy className="h-4 w-4" /> {winners.length} winner{winners.length !== 1 ? "s" : ""} selected
                    </p>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {winners.map((w) => (
                        <div key={w.entry_id} className="rounded-xl border border-green-500/20 bg-green-500/5 p-4 space-y-1">
                          <p className="font-semibold">{w.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" /> {w.email}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> {w.city}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

"use client"

import { useEffect, useState, useRef } from "react"
import { Trophy, MapPin, Loader2, Gift } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface Winner {
  name: string
  campaign_title: string
  prize: string
  image: string
  city: string
  won_at: string
}

async function launchConfetti() {
  try {
    const confetti = (await import("canvas-confetti")).default
    confetti({
      particleCount: 180,
      spread: 100,
      origin: { y: 0.5 },
      colors: ["#7c3aed", "#a78bfa", "#fbbf24", "#34d399", "#f472b6"],
    })
  } catch {}
}

export default function WinnersPage() {
  const [winners, setWinners] = useState<Winner[]>([])
  const [loading, setLoading] = useState(true)
  const fired = useRef(false)

  useEffect(() => {
    fetch("/api/entries/winners?limit=30")
      .then((r) => r.json())
      .then((data) => {
        setWinners(Array.isArray(data) ? data : [])
        setLoading(false)
        if (!fired.current && Array.isArray(data) && data.length > 0) {
          fired.current = true
          launchConfetti()
        }
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-16 md:py-24 text-center overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/10 via-background to-background" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] -z-10 rounded-full bg-primary/5 blur-3xl" />
        <div className="container px-4 md:px-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mx-auto mb-6">
            <Trophy className="h-8 w-8 text-amber-400" />
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Hall of Winners
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto">
            Real people, real prizes. These are the lucky winners from our giveaway campaigns.
          </p>
        </div>
      </section>

      {/* Winners grid */}
      <section className="container px-4 md:px-6 pb-20">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : winners.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-border/50 rounded-2xl bg-card/30">
            <Gift className="h-10 w-10 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold">No winners yet</h3>
            <p className="text-muted-foreground mt-1 text-sm">
              Winners will appear here after draws are complete.{" "}
              <Link href="/campaigns" className="text-primary hover:underline">Enter a giveaway now!</Link>
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {winners.map((w, i) => (
              <div
                key={i}
                className="group rounded-2xl border border-border/50 bg-card overflow-hidden hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200"
              >
                <div className="relative h-36 bg-muted overflow-hidden">
                  {w.image ? (
                    <img src={w.image} alt={w.campaign_title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-purple-600/10">
                      <Gift className="h-10 w-10 text-primary/50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs backdrop-blur-sm">
                      Winner
                    </Badge>
                  </div>
                </div>

                <div className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-base leading-tight truncate">
                        {w.name.split(" ")[0]}{" "}
                        <span className="text-muted-foreground">{w.name.split(" ").slice(1).map((n) => n[0] + ".").join(" ")}</span>
                      </p>
                      {w.city && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" /> {w.city}
                        </p>
                      )}
                    </div>
                    <Trophy className={`h-5 w-5 flex-shrink-0 mt-0.5 ${i % 3 === 0 ? "text-amber-400" : i % 3 === 1 ? "text-slate-300" : "text-amber-600"}`} />
                  </div>

                  <div className="border-t border-border/40 pt-2.5 space-y-1">
                    <p className="text-xs text-muted-foreground">Campaign</p>
                    <p className="text-sm font-medium leading-snug line-clamp-2">{w.campaign_title}</p>
                    {w.prize && (
                      <p className="text-sm font-bold text-primary">{w.prize}</p>
                    )}
                  </div>

                  {w.won_at && (
                    <p className="text-xs text-muted-foreground">
                      Won {new Date(w.won_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <p className="text-muted-foreground text-sm mb-4">Want to be the next winner?</p>
          <Link
            href="/campaigns"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Gift className="h-4 w-4" /> Browse Giveaways
          </Link>
        </div>
      </section>
    </div>
  )
}

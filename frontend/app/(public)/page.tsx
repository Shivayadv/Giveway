import Link from "next/link"
import { ChevronRight, Trophy, Users, Zap, Ticket, User, ArrowRight, ShieldCheck, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { apiFetch, type Campaign } from "@/lib/api"

const HOW_IT_WORKS = [
  { step: "01", icon: Ticket, title: "Browse Campaigns", desc: "Explore curated premium giveaways from top verified brands — electronics, fashion, gadgets & more.", color: "text-primary", bg: "bg-primary/10", ring: "ring-primary/20" },
  { step: "02", icon: User,   title: "Enter in 30 Seconds", desc: "Fill in your basic details to lock in your slot. No fees, no subscriptions. Just your name and email.", color: "text-amber-400", bg: "bg-amber-400/10", ring: "ring-amber-400/20" },
  { step: "03", icon: Trophy, title: "Win & Collect", desc: "After the draw, winners are announced publicly. If you win, the product ships directly to your door.", color: "text-green-400", bg: "bg-green-400/10", ring: "ring-green-400/20" },
]

interface PublicStats {
  total_users: number
  total_campaigns: number
  active_giveaways: number
  total_entries: number
}

function fmtNum(n: number): string {
  if (n >= 10_00_000) return `${(n / 10_00_000).toFixed(1).replace(/\.0$/, "")}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`
  return String(n)
}

export default async function LandingPage() {
  let featured: Campaign[] = []
  let stats: PublicStats = { total_users: 0, total_campaigns: 0, active_giveaways: 0, total_entries: 0 }

  try {
    [featured, stats] = await Promise.all([
      apiFetch<Campaign[]>("/api/campaigns?featured=true"),
      apiFetch<PublicStats>("/api/stats/public"),
    ])
  } catch {
    // backend not running — show empty state gracefully
  }

  const statCards = [
    { value: fmtNum(stats.total_users),      label: "Registered Users" },
    { value: fmtNum(stats.total_entries),    label: "Total Entries" },
    { value: fmtNum(stats.total_campaigns),  label: "Campaigns Run" },
    { value: fmtNum(stats.active_giveaways), label: "Live Giveaways" },
  ]

  return (
    <div className="flex flex-col min-h-screen">

      {/* ── Hero ─────────────────────────────────── */}
      <section className="relative overflow-hidden pt-20 pb-28 lg:pt-32 lg:pb-36">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-orange-500/12 blur-[100px]" />
          <div className="absolute -left-20 top-20 h-[400px] w-[400px] rounded-full bg-amber-500/8 blur-[80px]" />
          <div className="absolute right-0 bottom-0 h-[300px] w-[500px] rounded-full bg-orange-600/6 blur-[80px]" />
        </div>

        <div className="container relative px-4 md:px-6 flex flex-col items-center text-center space-y-7">
          <Badge className="px-4 py-1.5 rounded-full bg-primary/15 text-primary border border-primary/25 text-sm font-semibold hover:bg-primary/20 transition-colors">
            🎉 India&apos;s #1 Verified Giveaway Platform
          </Badge>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] max-w-5xl">
            Win Premium Products.{" "}
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-orange-400 via-primary to-amber-400 bg-clip-text text-transparent">
              Zero Cost, Maximum Joy.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            Join thousands of Indians winning iPhones, MacBooks, and premium gear every day from top verified brands. 100% free. 100% transparent.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link href="/campaigns">
              <Button size="lg" className="h-13 px-8 text-base font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-200">
                Join a Giveaway Now
                <ChevronRight className="ml-1 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/register?role=seller">
              <Button size="lg" variant="outline" className="h-13 px-8 text-base font-semibold border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200">
                I&apos;m a Brand
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-green-500" /> Verified Brands</span>
            <span className="flex items-center gap-1.5"><Trophy className="h-4 w-4 text-primary" /> Transparent Draws</span>
            <span className="flex items-center gap-1.5"><Gift className="h-4 w-4 text-amber-400" /> Free to Enter</span>
          </div>
        </div>
      </section>

      {/* ── Live Stats Bar ───────────────────────── */}
      <section className="border-y border-border/50 bg-card/40 py-8">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {statCards.map((stat) => (
              <div key={stat.label} className="space-y-1">
                <div className="text-3xl md:text-4xl font-extrabold text-primary">
                  {stat.value || "—"}
                </div>
                <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Campaigns ──────────────────── */}
      <section className="py-20 md:py-24">
        <div className="container px-4 md:px-6 space-y-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-primary text-sm font-semibold">
                <Zap className="h-4 w-4" />
                ENDING SOON
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Don&apos;t Miss These</h2>
              <p className="text-muted-foreground text-lg">Premium giveaways closing in the next 48 hours.</p>
            </div>
            <Link href="/campaigns">
              <Button variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10 font-semibold">
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {featured.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">No active campaigns yet. Check back soon!</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((c) => (
                <Card key={c.id} className="group overflow-hidden border border-border/50 bg-card hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300">
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <img src={c.image} alt={c.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-primary text-primary-foreground shadow-md">{c.offer}</span>
                    </div>
                    {c.urgent && (
                      <div className="absolute top-3 right-3">
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/90 text-white">
                          <Zap className="h-3 w-3" /> {c.time_left}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-card to-transparent" />
                  </div>

                  <CardContent className="p-5 space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-primary mb-1">{c.brand}</p>
                      <h3 className="font-bold text-base leading-snug group-hover:text-primary transition-colors line-clamp-2">{c.title}</h3>
                      <p className="text-muted-foreground text-sm mt-1 line-through">{c.price}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs font-medium text-muted-foreground border-t border-border/50 pt-3">
                      <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-primary" />{c.participants.toLocaleString("en-IN")} joined</span>
                      <span className="flex items-center gap-1.5 text-amber-400"><Trophy className="h-3.5 w-3.5" />{c.winners} winner{c.winners !== 1 ? "s" : ""}</span>
                    </div>
                    <Link href={`/campaigns/${c.id}`} className="block">
                      <Button className="w-full font-semibold shadow-sm hover:shadow-primary/20 transition-all">Enter Now — Free</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── How it Works ─────────────────────────── */}
      <section className="py-20 md:py-24 bg-card/30 border-y border-border/50" id="how-it-works">
        <div className="container px-4 md:px-6">
          <div className="text-center space-y-3 mb-14">
            <div className="text-sm font-semibold text-primary uppercase tracking-wider">Simple Process</div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">How it Works</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">From browsing to winning — it takes less than 2 minutes.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step} className="relative flex flex-col items-center text-center group">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-5xl font-black text-muted/30 select-none pointer-events-none">{step.step}</div>
                <div className={`relative z-10 w-20 h-20 rounded-2xl ${step.bg} flex items-center justify-center mb-5 ring-1 ${step.ring} group-hover:scale-110 transition-transform duration-300`}>
                  <step.icon className={`h-9 w-9 ${step.color}`} />
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────── */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/90 via-primary/90 to-amber-500/90" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDM0di0yaC0ydi0yaDJ2LTJoMnYyaDJ2MmgtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40" />
        <div className="relative container px-4 md:px-6 text-center space-y-6">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">Ready to Start Winning?</h2>
          <p className="text-white/80 text-lg max-w-xl mx-auto">
            Join our growing community of winners across India. It&apos;s completely free.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link href="/register">
              <Button size="lg" className="h-13 px-8 text-base font-bold bg-white text-orange-600 hover:bg-orange-50 shadow-xl hover:shadow-2xl transition-all">
                Create Free Account <ChevronRight className="ml-1 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/campaigns">
              <Button size="lg" variant="outline" className="h-13 px-8 text-base font-semibold border-white/40 text-white hover:bg-white/10 hover:border-white/60 transition-all">
                Browse Campaigns
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}

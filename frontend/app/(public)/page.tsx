import Link from "next/link"
import { ChevronRight, Trophy, Users, Zap, Ticket, User, Star, ArrowRight, ShieldCheck, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { apiFetch, type Campaign } from "@/lib/api"

const TESTIMONIALS = [
  { name: "Rahul Sharma",  city: "Mumbai",    won: "MacBook Pro",   initials: "RS", stars: 5, quote: "Maine ek baar try kiya aur do din baad MacBook mere ghar pahunch gaya. Yeh platform bilkul asli hai!" },
  { name: "Priya Patel",   city: "Bengaluru", won: "iPhone 16 Pro", initials: "PP", stars: 5, quote: "Finally a giveaway platform I can trust. The draw was transparent and I got my phone within a week. Incredible!" },
  { name: "Arjun Singh",   city: "Delhi",     won: "Sony PS5",      initials: "AS", stars: 5, quote: "PS5 jeeta pichle mahine. Mere doston ko yakeen nahi hua jab tak maine unhe dikhaya! Best platform ever." },
]

const HOW_IT_WORKS = [
  { step: "01", icon: Ticket, title: "Browse Campaigns", desc: "Explore curated premium giveaways from top verified brands — electronics, fashion, gadgets & more.", color: "text-primary", bg: "bg-primary/10", ring: "ring-primary/20" },
  { step: "02", icon: User,   title: "Enter in 30 Seconds", desc: "Fill in your basic details to lock in your slot. No fees, no subscriptions. Just your name and email.", color: "text-amber-400", bg: "bg-amber-400/10", ring: "ring-amber-400/20" },
  { step: "03", icon: Trophy, title: "Win & Collect", desc: "After the draw, winners are announced publicly. If you win, the product ships directly to your door.", color: "text-green-400", bg: "bg-green-400/10", ring: "ring-green-400/20" },
]

export default async function LandingPage() {
  let featured: Campaign[] = []
  try {
    featured = await apiFetch<Campaign[]>("/api/campaigns?featured=true")
  } catch {
    // backend not running — show empty state gracefully
  }

  return (
    <div className="flex flex-col min-h-screen">

      {/* ── Hero ─────────────────────────────────── */}
      <section className="relative overflow-hidden pt-20 pb-28 lg:pt-32 lg:pb-36">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-orange-500/12 blur-[100px]" />
          <div className="absolute -left-20 top-20 h-[400px] w-[400px] rounded-full bg-amber-500/8 blur-[80px]" />
          <div className="absolute -right-20 bottom-0 h-[300px] w-[500px] rounded-full bg-orange-600/6 blur-[80px]" />
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
            Join 500,000+ Indians winning iPhones, MacBooks, and premium gear every day from top verified brands. 100% free. 100% transparent.
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

      {/* ── Stats Bar ───────────────────────────── */}
      <section className="border-y border-border/50 bg-card/40 py-8">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "500K+",  label: "Active Users" },
              { value: "₹20Cr+", label: "Prizes Given Away" },
              { value: "8,400+", label: "Campaigns Run" },
              { value: "100%",   label: "Verified Brands" },
            ].map((stat) => (
              <div key={stat.label} className="space-y-1">
                <div className="text-3xl md:text-4xl font-extrabold text-primary">{stat.value}</div>
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
                      <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-primary" />{c.participants.toLocaleString()} joined</span>
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
          <p className="text-white/80 text-lg max-w-xl mx-auto">Join 500,000+ Indians already winning premium products every day. It&apos;s completely free.</p>
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

      {/* ── Testimonials ─────────────────────────── */}
      <section className="py-20 md:py-24" id="testimonials">
        <div className="container px-4 md:px-6">
          <div className="text-center space-y-3 mb-14">
            <div className="text-sm font-semibold text-primary uppercase tracking-wider">Winners Say</div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Real Winners. Real Joy.</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Hear from people who won premium products through our platform.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <Card key={t.name} className="border border-border/50 bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 p-6">
                <CardContent className="p-0 space-y-4">
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-2 border-t border-border/50">
                    <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center font-bold text-sm text-primary ring-1 ring-primary/20">{t.initials}</div>
                    <div>
                      <p className="font-semibold text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.city} · Won <span className="text-primary font-medium">{t.won}</span></p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}

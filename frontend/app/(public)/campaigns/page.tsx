import Link from "next/link"
import { Search, Users, Zap, Trophy, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { apiFetch, type Campaign } from "@/lib/api"

const CATEGORIES = ["All", "Electronics", "Gaming", "Fashion", "Beauty", "Home"]

export default async function CampaignsPage() {
  let campaigns: Campaign[] = []
  try {
    campaigns = await apiFetch<Campaign[]>("/api/campaigns")
  } catch {
    // backend offline — render empty grid
  }

  return (
    <div className="min-h-screen">
      {/* Page header */}
      <div className="border-b border-border/50 bg-card/30">
        <div className="container px-4 md:px-6 py-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Active Campaigns</h1>
          <p className="text-muted-foreground mt-2 text-lg">Discover and join verified premium giveaways.</p>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search campaigns..." className="pl-9 h-11 bg-background border-border/60 rounded-xl focus:border-primary/50" />
            </div>
            <Button variant="outline" className="h-11 gap-2 border-border/60 hover:border-primary/40 hover:bg-primary/5">
              <Filter className="h-4 w-4" /> Filter
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {CATEGORIES.map((cat, i) => (
              <button key={cat} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground"}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container px-4 md:px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">{campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""} found</p>
          <select className="text-sm bg-card border border-border/50 rounded-lg px-3 py-1.5 text-muted-foreground focus:outline-none focus:border-primary/50">
            <option>Most Popular</option>
            <option>Ending Soon</option>
            <option>Newest First</option>
          </select>
        </div>

        {campaigns.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">No campaigns available right now. Check back soon!</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((c) => (
              <Card key={c.id} className="group overflow-hidden border border-border/50 bg-card hover:border-primary/40 hover:shadow-xl hover:shadow-primary/8 transition-all duration-300">
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  <img src={c.image} alt={c.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-primary text-primary-foreground">{c.offer}</span>
                  </div>
                  {c.urgent && (
                    <div className="absolute top-3 right-3">
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/90 text-white">
                        <Zap className="h-3 w-3" /> {c.time_left}
                      </span>
                    </div>
                  )}
                </div>
                <CardContent className="p-5 space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-primary">{c.brand}</p>
                      <Badge variant="outline" className="text-xs border-border/50 text-muted-foreground">{c.category}</Badge>
                    </div>
                    <h3 className="font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2">{c.title}</h3>
                    <p className="text-muted-foreground text-sm mt-1 line-through">{c.price}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs font-medium text-muted-foreground py-3 border-y border-border/40">
                    <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-primary" />{c.participants.toLocaleString()} joined</span>
                    <span className="flex items-center gap-1.5 text-amber-400"><Trophy className="h-3.5 w-3.5" />{c.winners} winner{c.winners !== 1 ? "s" : ""}</span>
                    {!c.urgent && <span className="flex items-center gap-1 text-muted-foreground"><Zap className="h-3 w-3" /> {c.time_left}</span>}
                  </div>
                  <Link href={`/campaigns/${c.id}`} className="block">
                    <Button className="w-full font-semibold hover:shadow-primary/20 hover:shadow-md transition-all">Join Now — Free</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {campaigns.length > 0 && (
          <div className="mt-12 text-center">
            <Button variant="outline" size="lg" className="border-border/60 hover:border-primary/40 hover:bg-primary/5 px-10">
              Load More Campaigns
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

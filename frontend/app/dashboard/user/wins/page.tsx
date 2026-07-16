import { cookies } from "next/headers"
import Link from "next/link"
import { Trophy, Star, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { apiFetch, type EntryOut } from "@/lib/api"

export default async function MyWinsPage() {
  const token = (await cookies()).get("token")?.value ?? ""
  let entries: EntryOut[] = []
  try {
    entries = await apiFetch<EntryOut[]>("/api/entries/me", {}, token)
  } catch {}

  const wins = entries.filter((e) => e.entry_status === "Won")

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">My Wins</h1>
        <p className="text-muted-foreground mt-1">All the prizes you&apos;ve won. Congratulations!</p>
      </div>

      {wins.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-border/50 rounded-2xl bg-card/30 space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-400/10 flex items-center justify-center mx-auto ring-1 ring-amber-400/20">
            <Trophy className="h-8 w-8 text-amber-400" />
          </div>
          <h3 className="text-lg font-semibold">No wins yet</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">Keep entering giveaways — the more you enter, the better your chances!</p>
          <Button asChild variant="outline"><Link href="/campaigns">Browse Campaigns</Link></Button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-400/20 bg-amber-400/5">
            <Star className="h-5 w-5 text-amber-400 fill-amber-400 flex-shrink-0" />
            <p className="text-sm font-medium">You&apos;ve won <span className="text-amber-400 font-bold">{wins.length} prize{wins.length !== 1 ? "s" : ""}</span>! Our team will contact you at your registered email to arrange delivery.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {wins.map((w) => (
              <Card key={w.id} className="border border-green-500/25 bg-green-500/3 relative overflow-hidden hover:border-green-500/40 transition-colors">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />
                <CardHeader className="pb-2 pt-5 px-5">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-bold leading-snug line-clamp-2">{w.campaign_title}</CardTitle>
                    <Badge className="bg-green-500/15 text-green-400 border border-green-500/25 text-xs shrink-0">Won</Badge>
                  </div>
                </CardHeader>
                <CardContent className="px-5 pb-5 space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Prize Value</p>
                    <p className="text-2xl font-black text-primary">{w.prize}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
                    <span>Won on {w.draw_date || "—"}</span>
                    <Link href={`/campaigns/${w.campaign_id}`} className="text-primary hover:underline flex items-center gap-0.5 font-medium">
                      View Campaign <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

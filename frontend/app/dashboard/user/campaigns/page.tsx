import { cookies } from "next/headers"
import Link from "next/link"
import { Ticket, Clock, Trophy, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { apiFetch, type EntryOut } from "@/lib/api"

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  Active: { label: "Active",  cls: "bg-primary/15 text-primary border-primary/25" },
  Won:    { label: "Won",     cls: "bg-green-500/15 text-green-400 border-green-500/25" },
  Lost:   { label: "Ended",   cls: "bg-muted text-muted-foreground border-border" },
}

export default async function UserCampaignsPage() {
  const token = (await cookies()).get("token")?.value ?? ""
  let entries: EntryOut[] = []
  try {
    entries = await apiFetch<EntryOut[]>("/api/entries/me", {}, token)
  } catch {}

  const active = entries.filter((e) => e.entry_status === "Active")
  const past   = entries.filter((e) => e.entry_status !== "Active")

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">My Campaigns</h1>
          <p className="text-muted-foreground mt-1">All the giveaways you&apos;ve entered.</p>
        </div>
        <Button asChild className="gap-2 shadow-sm shadow-primary/20">
          <Link href="/campaigns">Browse More <ArrowRight className="h-4 w-4" /></Link>
        </Button>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-border/50 rounded-2xl bg-card/30 space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto ring-1 ring-primary/20">
            <Ticket className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">No entries yet</h3>
          <p className="text-muted-foreground text-sm">Start entering giveaways to see them here.</p>
          <Button asChild variant="outline"><Link href="/campaigns">Browse Campaigns</Link></Button>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <h2 className="font-semibold">Active Entries <span className="text-muted-foreground font-normal text-sm">({active.length})</span></h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {active.map((e) => (
                  <Card key={e.id} className="border border-primary/20 bg-primary/3 hover:border-primary/40 transition-colors">
                    <CardHeader className="pb-2 pt-4 px-4">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-sm font-semibold leading-snug line-clamp-2">{e.campaign_title}</CardTitle>
                        <Badge variant="outline" className="text-xs shrink-0 bg-primary/15 text-primary border-primary/25">Active</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 space-y-2">
                      <p className="text-primary font-bold">{e.prize}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Draw: <span className="text-foreground font-medium">{e.draw_date || "TBD"}</span></span>
                        <Link href={`/campaigns/${e.campaign_id}`} className="text-primary hover:underline flex items-center gap-0.5">
                          View <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <Card className="border border-border/50 bg-card">
              <CardHeader className="border-b border-border/50">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-400" /> Past Entries
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/50 hover:bg-transparent">
                        <TableHead className="pl-6 text-xs uppercase tracking-wide text-muted-foreground">Campaign</TableHead>
                        <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">Prize</TableHead>
                        <TableHead className="text-xs uppercase tracking-wide text-muted-foreground hidden md:table-cell">Joined</TableHead>
                        <TableHead className="text-right pr-6 text-xs uppercase tracking-wide text-muted-foreground">Result</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {past.map((e) => {
                        const sc = STATUS_CONFIG[e.entry_status] ?? STATUS_CONFIG.Lost
                        return (
                          <TableRow key={e.id} className="border-border/40 hover:bg-muted/30 transition-colors">
                            <TableCell className="font-medium pl-6 py-4">{e.campaign_title}</TableCell>
                            <TableCell className="text-muted-foreground text-sm">{e.prize}</TableCell>
                            <TableCell className="text-muted-foreground text-sm hidden md:table-cell">
                              {e.joined_at ? new Date(e.joined_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                            </TableCell>
                            <TableCell className="text-right pr-6">
                              <Badge variant="outline" className={`text-xs ${sc.cls}`}>{sc.label}</Badge>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

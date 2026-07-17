import { cookies } from "next/headers"
import Link from "next/link"
import { PlusCircle, Clock, CheckCircle2, XCircle, Trophy, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { apiFetch, type Campaign } from "@/lib/api"

const statusConfig: Record<string, { label: string; icon: React.ElementType; cls: string }> = {
  active:   { label: "Active",   icon: CheckCircle2, cls: "bg-green-500/10 text-green-400 border-green-500/20" },
  pending:  { label: "Pending",  icon: Clock,        cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  rejected: { label: "Rejected", icon: XCircle,      cls: "bg-red-500/10 text-red-400 border-red-500/20" },
  ended:    { label: "Ended",    icon: Trophy,       cls: "bg-muted/60 text-muted-foreground border-border/40" },
}

export default async function SellerCampaignsPage() {
  const token = (await cookies()).get("token")?.value ?? ""
  let campaigns: Campaign[] = []
  try {
    campaigns = await apiFetch<Campaign[]>("/api/campaigns/mine", {}, token)
  } catch {}

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">My Campaigns</h1>
          <p className="text-muted-foreground mt-1">Track all your giveaway campaigns and their performance.</p>
        </div>
        <Button asChild className="gap-2 shadow-sm shadow-primary/20">
          <Link href="/dashboard/seller/campaigns/new"><PlusCircle className="h-4 w-4" /> New Campaign</Link>
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-border/50 rounded-2xl bg-card/30 space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto ring-1 ring-primary/20">
            <PlusCircle className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">No campaigns yet</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">Create your first giveaway campaign and start capturing high-quality Indian leads.</p>
          <Button asChild variant="outline" className="mt-2">
            <Link href="/dashboard/seller/campaigns/new">Create Campaign</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((c) => {
            const sc = statusConfig[c.status] ?? statusConfig.pending
            const Icon = sc.icon
            return (
              <Card key={c.id} className="border border-border/50 bg-card hover:border-border/80 transition-colors">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    <div className="h-32 sm:h-auto sm:w-40 flex-shrink-0">
                      <img
                        src={c.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80"}
                        alt={c.title}
                        className="object-cover w-full h-full rounded-t-xl sm:rounded-l-xl sm:rounded-tr-none"
                      />
                    </div>
                    <div className="flex-1 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className={`text-xs border ${sc.cls} gap-1`}>
                            <Icon className="w-3 h-3" /> {sc.label}
                          </Badge>
                          <Badge variant="outline" className="text-xs border-border/50 text-muted-foreground">{c.category}</Badge>
                        </div>
                        <h3 className="font-bold text-lg mt-1">{c.title}</h3>
                        <p className="text-primary font-bold">{c.price}</p>
                      </div>

                      <div className="flex gap-6 sm:flex-col sm:gap-1 sm:text-right">
                        <div className="flex items-center gap-1.5">
                          <Users className="h-4 w-4 text-amber-400" />
                          <span className="font-semibold">{c.participants.toLocaleString()}</span>
                          <span className="text-xs text-muted-foreground">leads</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4 text-red-400" />
                          <span className="text-sm text-muted-foreground">{c.time_left}</span>
                        </div>
                      </div>

                      <div className="flex sm:flex-col gap-2 sm:min-w-[120px]">
                        <Button asChild variant="outline" size="sm" className="flex-1 sm:w-full border-border/60 hover:border-primary/40 text-xs">
                          <Link href={`/campaigns/${c.id}`}>View Page</Link>
                        </Button>
                        {(c.status === "active" || c.status === "ended") && (
                          <Button asChild variant="outline" size="sm" className="flex-1 sm:w-full border-border/60 hover:border-primary/40 text-xs">
                            <Link href={`/dashboard/seller/leads?campaign=${c.id}`}>View Leads</Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

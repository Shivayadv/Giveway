import { notFound } from "next/navigation"
import { ChevronLeft, ShieldCheck, Trophy, Users, Zap, Clock, Star } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiFetch, type CampaignDetail } from "@/lib/api"

export default async function CampaignDetailsPage({ params }: { params: { id: string } }) {
  let campaign: CampaignDetail | null = null
  try {
    campaign = await apiFetch<CampaignDetail>(`/api/campaigns/${params.id}`)
  } catch {
    notFound()
  }

  if (!campaign) notFound()

  return (
    <div className="min-h-screen">
      <div className="border-b border-border/50 bg-card/30">
        <div className="container px-4 md:px-6 py-3">
          <Link href="/campaigns" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ChevronLeft className="h-4 w-4" /> Back to Campaigns
          </Link>
        </div>
      </div>

      <div className="container px-4 md:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-14">

          {/* Left */}
          <div className="space-y-7">
            <div className="relative rounded-2xl overflow-hidden bg-muted aspect-[4/3] shadow-2xl shadow-black/20">
              <img src={campaign.image} alt={campaign.title} className="object-cover w-full h-full" />
              {campaign.urgent && (
                <div className="absolute top-4 left-4">
                  <Badge className="bg-red-500/90 text-white border-0 shadow-lg px-3 py-1 text-sm font-semibold flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5" /> Ending Soon
                  </Badge>
                </div>
              )}
              <div className="absolute top-4 right-4">
                <Badge variant="outline" className="bg-background/80 backdrop-blur-sm border-border/50 text-foreground text-xs">{campaign.category}</Badge>
              </div>
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/60 to-transparent" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Trophy, value: campaign.winners,                              label: "Winners",    color: "text-primary",   bg: "bg-primary/10" },
                { icon: Users,  value: campaign.participants.toLocaleString(),         label: "Joined",     color: "text-amber-400", bg: "bg-amber-400/10" },
                { icon: Clock,  value: campaign.time_left,                            label: "Left",       color: "text-red-400",   bg: "bg-red-400/10" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-card border border-border/50 p-4 text-center">
                  <s.icon className={`h-5 w-5 ${s.color} mx-auto mb-1.5`} />
                  <div className="text-lg font-bold">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/8 border border-primary/15">
              <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm ring-1 ring-primary/25">{campaign.brand[0]}</div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{campaign.brand}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="h-3 w-3 fill-primary text-primary" />
                  <span className="text-xs text-muted-foreground">{campaign.rating} · {campaign.total_ratings.toLocaleString()} reviews</span>
                </div>
              </div>
              <ShieldCheck className="h-5 w-5 text-green-500" />
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-bold">About the Prize</h3>
              <p className="text-muted-foreground leading-relaxed">{campaign.description}</p>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" /> Terms & Conditions
              </h3>
              <ul className="space-y-2">
                {campaign.terms.map((term, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-muted-foreground">
                    <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
                    {term}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right */}
          <div>
            <div className="sticky top-20 space-y-5">
              <div>
                <p className="text-sm font-semibold text-primary mb-1">{campaign.brand}</p>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">{campaign.title}</h1>
                <div className="flex items-baseline gap-3 mt-3">
                  <span className="text-4xl font-black text-primary">FREE</span>
                  <span className="text-lg text-muted-foreground line-through">{campaign.price}</span>
                  <Badge className="bg-green-500/15 text-green-400 border border-green-500/20 text-xs">100% Free Entry</Badge>
                </div>
              </div>

              <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 flex items-center gap-3">
                <Zap className="h-5 w-5 text-red-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-red-400">Hurry! Closes in {campaign.time_left}</p>
                  <p className="text-xs text-muted-foreground">{campaign.participants.toLocaleString()} people have already entered</p>
                </div>
              </div>

              <Card className="border border-border/50 bg-card shadow-2xl">
                <CardHeader className="border-b border-border/50 pb-5">
                  <CardTitle className="text-xl">Secure Your Entry</CardTitle>
                  <CardDescription>Fill in your details — takes less than 30 seconds.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {[
                    { id: "name",  label: "Full Name",     type: "text",  ph: "John Smith" },
                    { id: "phone", label: "Phone Number",  type: "tel",   ph: "+1 (555) 000-0000" },
                    { id: "email", label: "Email Address", type: "email", ph: "you@example.com" },
                    { id: "city",  label: "City",          type: "text",  ph: "e.g. New York" },
                  ].map((f) => (
                    <div key={f.id} className="space-y-1.5">
                      <Label htmlFor={f.id} className="text-sm font-medium">{f.label}</Label>
                      <Input id={f.id} type={f.type} placeholder={f.ph} className="h-11 bg-muted/40 border-border/60 rounded-xl focus:border-primary/50" />
                    </div>
                  ))}
                  <div className="pt-2 space-y-3">
                    <Button size="lg" className="w-full h-13 text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/35 hover:-translate-y-0.5 transition-all">
                      Participate Now — It&apos;s Free!
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      By entering, you agree to our <a href="#" className="text-primary hover:underline">terms</a> & <a href="#" className="text-primary hover:underline">privacy policy</a>. We never sell your data.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { icon: ShieldCheck, text: "Verified Brand", color: "text-green-500" },
                  { icon: Trophy,      text: "Fair Draw",       color: "text-primary" },
                  { icon: Users,       text: "Real Winners",    color: "text-amber-400" },
                ].map((t) => (
                  <div key={t.text} className="rounded-xl border border-border/40 bg-card/50 p-3">
                    <t.icon className={`h-4 w-4 ${t.color} mx-auto mb-1`} />
                    <p className="text-xs text-muted-foreground font-medium">{t.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

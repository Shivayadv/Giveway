"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ImageIcon, PlusCircle, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function CreateCampaignPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    title: "", price: "", description: "", image: "",
    category: "Electronics", duration_days: "7", winners: "1", offer_type: "free",
  })
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title || !form.price || !form.description) {
      setErrorMsg("Title, price, and description are required.")
      setState("error")
      return
    }
    setState("loading")
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          duration_days: Number(form.duration_days),
          winners: Number(form.winners),
        }),
      })
      if (res.status === 201) {
        setState("success")
        setTimeout(() => router.push("/dashboard/seller/campaigns"), 2000)
      } else {
        const data = await res.json().catch(() => ({}))
        setErrorMsg(data.detail ?? "Failed to create campaign. Please try again.")
        setState("error")
      }
    } catch {
      setErrorMsg("Network error. Please try again.")
      setState("error")
    }
  }

  if (state === "success") {
    return (
      <div className="max-w-3xl mx-auto flex flex-col items-center text-center py-24 space-y-4">
        <div className="w-20 h-20 rounded-full bg-green-500/15 flex items-center justify-center ring-2 ring-green-500/30">
          <CheckCircle2 className="h-10 w-10 text-green-400" />
        </div>
        <h2 className="text-2xl font-bold">Campaign Submitted!</h2>
        <p className="text-muted-foreground max-w-sm">Your campaign is now pending admin review. Once approved it will go live on the platform. Redirecting to your campaigns...</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Create New Campaign</h1>
        <p className="text-muted-foreground mt-1">Launch a premium giveaway to capture high-quality Indian leads.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border border-border/50 bg-card">
          <CardHeader className="border-b border-border/50">
            <CardTitle>Campaign Details</CardTitle>
            <CardDescription>Fill in the required product and promotional details.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-8">

            <div className="space-y-4">
              <h3 className="font-semibold text-sm uppercase tracking-wide text-primary">1. Product Information</h3>
              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label htmlFor="title">Product Name</Label>
                  <Input id="title" placeholder="e.g. iPhone 16 Pro Max" value={form.title} onChange={(e) => set("title", e.target.value)} className="bg-muted/40 h-11 border-border/60 rounded-xl" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="price">Original Price ($)</Label>
                  <Input id="price" type="number" placeholder="1699" value={form.price} onChange={(e) => set("price", e.target.value)} className="bg-muted/40 h-11 border-border/60 rounded-xl" required />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">Prize Description</Label>
                <textarea
                  id="description"
                  rows={3}
                  placeholder="Describe the prize in detail..."
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  className="flex w-full rounded-xl border border-border/60 bg-muted/40 px-3 py-2.5 text-sm focus:outline-none focus:border-primary/50 resize-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="image">Product Image URL <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Input id="image" type="url" placeholder="https://..." value={form.image} onChange={(e) => set("image", e.target.value)} className="bg-muted/40 h-11 border-border/60 rounded-xl" />
                {!form.image && (
                  <div className="border-2 border-dashed border-border/50 rounded-xl p-8 flex flex-col items-center text-center hover:bg-muted/20 hover:border-primary/30 transition-all cursor-default">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 ring-1 ring-primary/20">
                      <ImageIcon className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">Paste an image URL above, or a default image will be used</p>
                  </div>
                )}
                {form.image && (
                  <div className="rounded-xl overflow-hidden h-40 bg-muted">
                    <img src={form.image} alt="preview" className="object-cover w-full h-full" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-border/50 pt-6 space-y-4">
              <h3 className="font-semibold text-sm uppercase tracking-wide text-primary">2. Campaign Settings</h3>
              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label htmlFor="category">Category</Label>
                  <select id="category" value={form.category} onChange={(e) => set("category", e.target.value)} className="flex h-11 w-full rounded-xl border border-border/60 bg-muted/40 px-3 text-sm focus:outline-none focus:border-primary/50">
                    {["Electronics", "Gaming", "Fashion", "Beauty", "Home", "Sports", "Other"].map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="offer_type">Offer Type</Label>
                  <select id="offer_type" value={form.offer_type} onChange={(e) => set("offer_type", e.target.value)} className="flex h-11 w-full rounded-xl border border-border/60 bg-muted/40 px-3 text-sm focus:outline-none focus:border-primary/50">
                    <option value="free">100% Free Giveaway</option>
                    <option value="discount">Massive Discount</option>
                    <option value="bogo">Buy One Get One</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="duration_days">Duration (Days)</Label>
                  <Input id="duration_days" type="number" min="1" max="90" value={form.duration_days} onChange={(e) => set("duration_days", e.target.value)} className="bg-muted/40 h-11 border-border/60 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="winners">Number of Winners</Label>
                  <Input id="winners" type="number" min="1" max="100" value={form.winners} onChange={(e) => set("winners", e.target.value)} className="bg-muted/40 h-11 border-border/60 rounded-xl" />
                </div>
              </div>
            </div>

            {state === "error" && (
              <p className="text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-xl">{errorMsg}</p>
            )}

            <div className="pt-2">
              <Button type="submit" size="lg" className="w-full h-12 text-base font-bold shadow-md shadow-primary/20 gap-2" disabled={state === "loading"}>
                {state === "loading" ? <><Loader2 className="h-5 w-5 animate-spin" /> Submitting...</> : <><PlusCircle className="h-5 w-5" /> Launch Campaign</>}
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-3">Your campaign will be reviewed by our team before going live (usually within 24h).</p>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

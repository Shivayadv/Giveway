"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Zap, CheckCircle2, Loader2, Copy, Check, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Props {
  campaignId: string
  campaignTitle: string
  timeLeft: string
  participants: number
  isLoggedIn: boolean
  defaultName?: string
  defaultEmail?: string
}

function SharePanel({ campaignId, campaignTitle }: { campaignId: string; campaignTitle: string }) {
  const [refCode, setRefCode] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => { if (d.referral_code) setRefCode(d.referral_code) })
      .catch(() => {})
  }, [])

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/campaigns/${campaignId}?ref=${refCode}`
    : ""

  function copyLink() {
    if (!shareUrl) return
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Win ${campaignTitle} for FREE! Enter here: ${shareUrl}`)}`
  const twitterUrl  = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Just entered to win ${campaignTitle}! Enter for free: ${shareUrl}`)}`

  if (!refCode) return null

  return (
    <div className="mt-5 rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Share2 className="h-4 w-4 text-primary" />
        <p className="text-sm font-semibold">Share & climb the leaderboard!</p>
      </div>
      <p className="text-xs text-muted-foreground">Every friend who enters through your link adds to your referral count.</p>
      <div className="flex gap-2">
        <Input value={shareUrl} readOnly className="text-xs h-9 bg-muted/40 border-border/60 rounded-lg font-mono" />
        <Button size="sm" variant="outline" className="shrink-0 h-9 border-border/60" onClick={copyLink}>
          {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
        </Button>
      </div>
      <div className="flex gap-2">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center py-2 rounded-lg text-xs font-semibold bg-[#25d366]/10 text-[#25d366] border border-[#25d366]/20 hover:bg-[#25d366]/20 transition-colors"
        >
          WhatsApp
        </a>
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center py-2 rounded-lg text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500/20 transition-colors"
        >
          Twitter / X
        </a>
      </div>
    </div>
  )
}

export function EntryForm({ campaignId, campaignTitle, timeLeft, participants, isLoggedIn, defaultName = "", defaultEmail = "" }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const refCode = searchParams.get("ref") ?? ""

  const [form, setForm] = useState({ name: defaultName, phone: "", email: defaultEmail, city: "" })
  const [state, setState] = useState<"idle" | "loading" | "success" | "duplicate" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isLoggedIn) {
      router.push(`/login?next=/campaigns/${campaignId}${refCode ? `?ref=${refCode}` : ""}`)
      return
    }
    if (!form.name || !form.email || !form.phone || !form.city) {
      setErrorMsg("All fields are required.")
      setState("error")
      return
    }
    setState("loading")
    try {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaign_id: campaignId, ...form, ref_code: refCode }),
      })
      if (res.status === 201) {
        setState("success")
      } else if (res.status === 409) {
        setState("duplicate")
      } else if (res.status === 401) {
        router.push(`/login?next=/campaigns/${campaignId}`)
      } else {
        const data = await res.json().catch(() => ({}))
        setErrorMsg(data.detail ?? "Something went wrong. Please try again.")
        setState("error")
      }
    } catch {
      setErrorMsg("Network error. Please try again.")
      setState("error")
    }
  }

  if (state === "success") {
    return (
      <Card className="border border-green-500/30 bg-green-500/5 shadow-2xl">
        <CardContent className="p-8 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center ring-2 ring-green-500/30">
            <CheckCircle2 className="h-8 w-8 text-green-400" />
          </div>
          <h3 className="text-2xl font-bold">You&apos;re Entered!</h3>
          <p className="text-muted-foreground text-sm">Winners for <span className="text-foreground font-medium">{campaignTitle}</span> will be announced on the draw date. Check your email for confirmation.</p>
          <SharePanel campaignId={campaignId} campaignTitle={campaignTitle} />
          <Button variant="outline" className="mt-1 w-full" onClick={() => router.push("/campaigns")}>
            Browse More Campaigns
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (state === "duplicate") {
    return (
      <Card className="border border-primary/30 bg-primary/5 shadow-2xl">
        <CardContent className="p-8 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center ring-2 ring-primary/30">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-2xl font-bold">Already Entered</h3>
          <p className="text-muted-foreground text-sm">You&apos;ve already submitted an entry for this campaign. Good luck!</p>
          <SharePanel campaignId={campaignId} campaignTitle={campaignTitle} />
          <Button variant="outline" className="mt-1 w-full" onClick={() => router.push("/campaigns")}>
            Browse More Campaigns
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 flex items-center gap-3">
        <Zap className="h-5 w-5 text-red-400 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-red-400">Hurry! Closes in {timeLeft}</p>
          <p className="text-xs text-muted-foreground">{participants.toLocaleString()} people have already entered</p>
        </div>
      </div>

      {refCode && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-2.5 text-xs text-amber-400 font-medium">
          Referred by a friend — entering will count towards their leaderboard score!
        </div>
      )}

      <Card className="border border-border/50 bg-card shadow-2xl">
        <CardHeader className="border-b border-border/50 pb-5">
          <CardTitle className="text-xl">Secure Your Entry</CardTitle>
          <CardDescription>
            {isLoggedIn ? "Fill in your details — takes less than 30 seconds." : "Sign in first, then fill your details to enter."}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { id: "name",  label: "Full Name",    type: "text",  ph: "Rahul Sharma",      field: "name" },
              { id: "phone", label: "Phone Number", type: "tel",   ph: "+91 98765 43210",   field: "phone" },
              { id: "email", label: "Email Address",type: "email", ph: "you@example.com",   field: "email" },
              { id: "city",  label: "City",         type: "text",  ph: "e.g. Mumbai",       field: "city" },
            ].map((f) => (
              <div key={f.id} className="space-y-1.5">
                <Label htmlFor={f.id} className="text-sm font-medium">{f.label}</Label>
                <Input
                  id={f.id}
                  type={f.type}
                  placeholder={f.ph}
                  value={form[f.field as keyof typeof form]}
                  onChange={(e) => set(f.field, e.target.value)}
                  className="h-11 bg-muted/40 border-border/60 rounded-xl focus:border-primary/50"
                  disabled={state === "loading"}
                  required
                />
              </div>
            ))}

            {state === "error" && (
              <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{errorMsg}</p>
            )}

            <div className="pt-2 space-y-3">
              <Button
                type="submit"
                size="lg"
                className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/35 hover:-translate-y-0.5 transition-all"
                disabled={state === "loading"}
              >
                {state === "loading" ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Submitting...</>
                ) : isLoggedIn ? (
                  "Participate Now — It's Free!"
                ) : (
                  "Sign In to Enter"
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                By entering, you agree to our <a href="#" className="text-primary hover:underline">terms</a> & <a href="#" className="text-primary hover:underline">privacy policy</a>. We never sell your data.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  )
}

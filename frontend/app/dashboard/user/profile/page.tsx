"use client"

import { useEffect, useState } from "react"
import { User, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

interface Profile {
  id: string
  name: string
  email: string
  phone: string
  role: string
  referral_code: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [form, setForm]     = useState({ name: "", phone: "", city: "" })
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)
  const [error, setError]       = useState("")

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data: Profile) => {
        setProfile(data)
        setForm({ name: data.name, phone: data.phone, city: "" })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSaved(false)
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        const d = await res.json().catch(() => ({}))
        setError(d.detail ?? "Failed to save. Please try again.")
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const roleColors: Record<string, string> = {
    admin:  "bg-red-500/10 text-red-400 border-red-500/20",
    seller: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    user:   "bg-primary/10 text-primary border-primary/20",
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your personal information.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <>
          <Card className="border border-border/50 bg-card">
            <CardContent className="p-6 flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center ring-2 ring-primary/25 flex-shrink-0">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-1 min-w-0">
                <p className="text-xl font-bold truncate">{profile?.name}</p>
                <p className="text-muted-foreground text-sm truncate">{profile?.email}</p>
                <div className="flex items-center gap-2 flex-wrap mt-1">
                  <Badge variant="outline" className={`text-xs capitalize ${roleColors[profile?.role ?? "user"]}`}>
                    {profile?.role}
                  </Badge>
                  {profile?.referral_code && (
                    <Badge variant="outline" className="text-xs border-border/50 text-muted-foreground font-mono">
                      REF: {profile.referral_code}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/50 bg-card">
            <CardHeader className="border-b border-border/50">
              <CardTitle>Edit Information</CardTitle>
              <CardDescription>Update your name, phone number, and city.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSave} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="h-11 bg-muted/40 border-border/60 rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email">Email <span className="text-muted-foreground font-normal text-xs">(cannot be changed)</span></Label>
                  <Input id="email" value={profile?.email ?? ""} disabled className="h-11 bg-muted/20 border-border/40 rounded-xl opacity-60" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className="h-11 bg-muted/40 border-border/60 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="e.g. Mumbai"
                    value={form.city}
                    onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                    className="h-11 bg-muted/40 border-border/60 rounded-xl"
                  />
                </div>

                {error && <p className="text-sm text-destructive bg-destructive/10 px-4 py-2.5 rounded-xl">{error}</p>}

                {saved && (
                  <div className="flex items-center gap-2 text-sm text-green-400 bg-green-500/10 px-4 py-2.5 rounded-xl">
                    <CheckCircle2 className="h-4 w-4" /> Profile updated successfully!
                  </div>
                )}

                <Button type="submit" className="w-full h-11 gap-2" disabled={saving}>
                  {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

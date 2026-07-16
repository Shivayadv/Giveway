"use client"

import { useEffect, useState } from "react"
import { ShieldOff, Loader2, AlertTriangle, Phone, Mail, Ban } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface SuspiciousEntry {
  id: string; name: string; email?: string; phone?: string; campaign: string; joined_at: string
}
interface FraudGroup {
  type: "duplicate_phone" | "duplicate_email"
  value: string
  count: number
  entries: SuspiciousEntry[]
}
interface FraudData {
  duplicate_phones: FraudGroup[]
  duplicate_emails: FraudGroup[]
  total_suspicious: number
}

export default function FraudPage() {
  const [data, setData]       = useState<FraudData | null>(null)
  const [loading, setLoading] = useState(true)
  const [acting, setActing]   = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetch("/api/admin/fraud/suspicious")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function disqualify(entryId: string) {
    setActing((a) => ({ ...a, [entryId]: true }))
    await fetch(`/api/admin/fraud/disqualify/${entryId}`, { method: "PATCH" })
    // Remove from view
    setData((d) => {
      if (!d) return d
      const filter = (groups: FraudGroup[]) =>
        groups.map((g) => ({ ...g, entries: g.entries.filter((e) => e.id !== entryId) }))
                .filter((g) => g.entries.length > 0)
      return { ...d, duplicate_phones: filter(d.duplicate_phones), duplicate_emails: filter(d.duplicate_emails) }
    })
    setActing((a) => { const n = { ...a }; delete n[entryId]; return n })
  }

  const allGroups = data ? [...data.duplicate_phones, ...data.duplicate_emails] : []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Fraud Detection</h1>
        <p className="text-muted-foreground mt-1">Identify and disqualify suspicious entries across campaigns.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : allGroups.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-border/50 rounded-2xl bg-card/30">
          <ShieldOff className="h-10 w-10 text-green-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">No suspicious activity detected</h3>
          <p className="text-muted-foreground mt-1 text-sm">All entries look clean across all campaigns.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/5">
            <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <p className="text-sm font-medium text-red-400">
              {data?.total_suspicious} suspicious pattern{data?.total_suspicious !== 1 ? "s" : ""} found — same contact info used across multiple accounts
            </p>
          </div>

          <div className="space-y-4">
            {allGroups.map((group, gi) => (
              <Card key={gi} className="border border-red-500/15 bg-card">
                <CardHeader className="border-b border-border/50 pb-4">
                  <div className="flex items-center gap-3">
                    {group.type === "duplicate_phone"
                      ? <Phone className="h-4 w-4 text-red-400" />
                      : <Mail className="h-4 w-4 text-orange-400" />}
                    <div>
                      <CardTitle className="text-base font-mono">{group.value}</CardTitle>
                      <CardDescription>
                        {group.type === "duplicate_phone" ? "Phone number" : "Email"} used by {group.count} entries across different accounts
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="ml-auto bg-red-500/10 text-red-400 border-red-500/20">
                      {group.count} entries
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border/40">
                    {group.entries.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between px-5 py-3.5 gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm">{entry.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{entry.campaign}</p>
                        </div>
                        <span className="text-xs text-muted-foreground hidden sm:block shrink-0">
                          {entry.joined_at ? new Date(entry.joined_at).toLocaleDateString() : "—"}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => disqualify(entry.id)}
                          disabled={acting[entry.id]}
                          className="shrink-0 text-xs border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40 gap-1.5"
                        >
                          {acting[entry.id] ? <Loader2 className="h-3 w-3 animate-spin" /> : <Ban className="h-3 w-3" />}
                          Disqualify
                        </Button>
                      </div>
                    ))}
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

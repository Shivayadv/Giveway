"use client"

import { useEffect, useState } from "react"
import { Users, Search, Loader2, ShieldOff, ShieldCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface User {
  id: string
  name: string
  email: string
  phone: string
  role: string
  is_banned: boolean
  created_at: string
  entries: number
}

const ROLE_COLORS: Record<string, string> = {
  admin:  "bg-red-500/10 text-red-400 border-red-500/20",
  seller: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  user:   "bg-primary/10 text-primary border-primary/20",
}

const FILTERS = ["all", "user", "seller", "admin"] as const

export default function AdminUsersPage() {
  const [users, setUsers]     = useState<User[]>([])
  const [total, setTotal]     = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState("")
  const [filter, setFilter]   = useState("all")
  const [acting, setActing]   = useState<Record<string, boolean>>({})

  function load(q = search) {
    setLoading(true)
    const params = new URLSearchParams()
    if (q) params.set("search", q)
    fetch(`/api/admin/users?${params}`)
      .then((r) => r.json())
      .then((d) => { setUsers(d.users ?? []); setTotal(d.total ?? 0); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function toggleBan(user: User) {
    setActing((a) => ({ ...a, [user.id]: true }))
    const action = user.is_banned ? "unban" : "ban"
    await fetch(`/api/admin/users/${user.id}/${action}`, { method: "PATCH" })
    setUsers((us) => us.map((u) => u.id === user.id ? { ...u, is_banned: !u.is_banned } : u))
    setActing((a) => { const n = { ...a }; delete n[user.id]; return n })
  }

  const filtered = users.filter((u) => filter === "all" || u.role === filter)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground mt-1">Manage all platform users — ban, unban, and review activity.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors capitalize ${
                filter === f
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border/50 text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search name or email..."
              className="pl-9 h-10 bg-background border-border/60 rounded-lg"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load(search)}
            />
          </div>
          <Button variant="outline" className="border-border/60 h-10" onClick={() => load(search)}>Search</Button>
        </div>
      </div>

      <Card className="border border-border/50 bg-card">
        <CardHeader className="border-b border-border/50 py-4">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Users className="h-4 w-4" />
            {loading ? "Loading..." : `${filtered.length} of ${total} users`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">No users found.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead className="pl-6 text-xs uppercase tracking-wide text-muted-foreground">User</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide text-muted-foreground hidden md:table-cell">Phone</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">Role</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide text-muted-foreground hidden lg:table-cell">Entries</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide text-muted-foreground hidden md:table-cell">Joined</TableHead>
                    <TableHead className="text-right pr-6 text-xs uppercase tracking-wide text-muted-foreground">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((u) => (
                    <TableRow key={u.id} className={`border-border/40 hover:bg-muted/30 transition-colors ${u.is_banned ? "opacity-60" : ""}`}>
                      <TableCell className="pl-6 py-4">
                        <p className="font-medium flex items-center gap-2">
                          {u.name}
                          {u.is_banned && <Badge variant="outline" className="text-[10px] bg-red-500/10 text-red-400 border-red-500/20">Banned</Badge>}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{u.email}</p>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm hidden md:table-cell">{u.phone || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs capitalize ${ROLE_COLORS[u.role] ?? ROLE_COLORS.user}`}>{u.role}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm hidden lg:table-cell">{u.entries}</TableCell>
                      <TableCell className="text-muted-foreground text-xs hidden md:table-cell">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        {u.role !== "admin" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleBan(u)}
                            disabled={acting[u.id]}
                            className={`gap-1.5 text-xs border-border/60 ${u.is_banned ? "hover:border-green-500/40 hover:text-green-400" : "hover:border-red-500/40 hover:text-red-400"}`}
                          >
                            {acting[u.id] ? <Loader2 className="h-3 w-3 animate-spin" /> : u.is_banned ? <ShieldCheck className="h-3 w-3" /> : <ShieldOff className="h-3 w-3" />}
                            {u.is_banned ? "Unban" : "Ban"}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

import { Download, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const DUMMY_LEADS = [
  { id: 1, name: "Jake Morrison",    phone: "+1 (555) 201-4832", email: "jake@example.com",    city: "New York, NY",    interest: "iPhone 14 Giveaway",           status: "Verified" },
  { id: 2, name: "Emily Rodriguez",  phone: "+1 (555) 347-9021", email: "emily@example.com",   city: "Los Angeles, CA", interest: "Sony Headphones Promo",         status: "Verified" },
  { id: 3, name: "Marcus Thompson",  phone: "+1 (555) 488-7654", email: "marcus@example.com",  city: "Chicago, IL",     interest: "MacBook Air Back-to-School",    status: "Pending"  },
  { id: 4, name: "Sophia Lee",       phone: "+1 (555) 563-3310", email: "sophia@example.com",  city: "Houston, TX",     interest: "iPhone 14 Giveaway",           status: "Verified" },
  { id: 5, name: "Chris Nelson",     phone: "+1 (555) 621-8847", email: "chris@example.com",   city: "Phoenix, AZ",     interest: "MacBook Air Back-to-School",   status: "Verified" },
  { id: 6, name: "Ashley Carter",    phone: "+1 (555) 754-2209", email: "ashley@example.com",  city: "Philadelphia, PA",interest: "Sony Headphones Promo",         status: "Pending"  },
  { id: 7, name: "Ryan Walker",      phone: "+1 (555) 832-6601", email: "ryan@example.com",    city: "San Antonio, TX", interest: "iPhone 14 Giveaway",           status: "Verified" },
]

export default function LeadsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Campaign Leads</h1>
          <p className="text-muted-foreground mt-1">View and export the leads generated from your campaigns.</p>
        </div>
        <Button variant="outline" className="gap-2 border-border/60 hover:border-primary/40">
          <Download className="h-4 w-4" /> Download CSV
        </Button>
      </div>

      <Card className="border border-border/50 bg-card">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50">
          <CardTitle className="text-base font-semibold">All Leads</CardTitle>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name, email or city..." className="pl-9 bg-background h-10 rounded-lg border-border/60" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="pl-6 text-xs uppercase tracking-wide text-muted-foreground">Name</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">Contact</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide text-muted-foreground hidden md:table-cell">City</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide text-muted-foreground hidden lg:table-cell">Campaign</TableHead>
                  <TableHead className="text-right pr-6 text-xs uppercase tracking-wide text-muted-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {DUMMY_LEADS.map((lead) => (
                  <TableRow key={lead.id} className="border-border/40 hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium pl-6 py-4">{lead.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">{lead.phone}</span>
                        <span className="text-xs text-muted-foreground">{lead.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm hidden md:table-cell">{lead.city}</TableCell>
                    <TableCell className="text-muted-foreground text-sm hidden lg:table-cell">
                      <span className="truncate block max-w-[200px]">{lead.interest}</span>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Badge variant="outline" className={lead.status === "Verified" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}>
                        {lead.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
        <span>Showing 1–7 of 62,649 leads</span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled className="border-border/50">Previous</Button>
          <Button variant="outline" size="sm" className="border-border/50 hover:border-primary/40">Next</Button>
        </div>
      </div>
    </div>
  )
}

import { Download, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const DUMMY_LEADS = [
  { id: 1, name: "Rahul Sharma", phone: "+91 98765 43210", email: "rahul@example.com", city: "Delhi", interest: "iPhone 14 Giveaway", status: "Verified" },
  { id: 2, name: "Priya Patel", phone: "+91 91234 56789", email: "priya.p@example.com", city: "Mumbai", interest: "Sony Headphones Promo", status: "Verified" },
  { id: 3, name: "Amit Kumar", phone: "+91 99887 76655", email: "amit.k@example.com", city: "Bangalore", interest: "MacBook Air Back-to-School", status: "Pending" },
  { id: 4, name: "Neha Singh", phone: "+91 98765 12345", email: "neha.s@example.com", city: "Pune", interest: "iPhone 14 Giveaway", status: "Verified" },
  { id: 5, name: "Vikram Reddy", phone: "+91 97777 88888", email: "vikram@example.com", city: "Hyderabad", interest: "MacBook Air Back-to-School", status: "Verified" },
  { id: 6, name: "Anjali Desai", phone: "+91 95555 44444", email: "anjali@example.com", city: "Ahmedabad", interest: "Sony Headphones Promo", status: "Pending" },
  { id: 7, name: "Suresh Menon", phone: "+91 93333 22222", email: "suresh@example.com", city: "Chennai", interest: "iPhone 14 Giveaway", status: "Verified" },
]

export default function LeadsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaign Leads</h1>
          <p className="text-muted-foreground mt-2">View and export the leads generated from your campaigns.</p>
        </div>
        <Button variant="outline" className="shadow-sm font-semibold">
          <Download className="mr-2 h-4 w-4" />
          Download CSV
        </Button>
      </div>

      <Card className="shadow-sm border-0 ring-1 ring-border/50">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/20 border-b pb-4">
          <CardTitle>All Leads</CardTitle>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name, email or city..." 
              className="pl-9 bg-background h-9 rounded-lg"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[200px] pl-6">Name</TableHead>
                <TableHead>Contact (Phone / Email)</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Interest</TableHead>
                <TableHead className="text-right pr-6">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {DUMMY_LEADS.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium pl-6">{lead.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm">{lead.phone}</span>
                      <span className="text-xs text-muted-foreground">{lead.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>{lead.city}</TableCell>
                  <TableCell className="text-muted-foreground">
                    <span className="truncate block max-w-[200px]">{lead.interest}</span>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Badge 
                      variant="outline" 
                      className={
                        lead.status === "Verified" ? "bg-green-500/10 text-green-600 border-green-500/20" : 
                        "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                      }
                    >
                      {lead.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
        <div>Showing 1-7 of 62,649 leads</div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>Previous</Button>
          <Button variant="outline" size="sm">Next</Button>
        </div>
      </div>
    </div>
  )
}

import { Ticket, Trophy, Target } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const JOINED_CAMPAIGNS = [
  {
    id: "CAM-001",
    name: "iPhone 14 Pro Max 256GB Giveaway",
    joinedAt: "12 Oct 2023",
    status: "Active",
    drawDate: "20 Oct 2023"
  },
  {
    id: "CAM-002",
    name: "Sony WH-1000XM5 Headphones",
    joinedAt: "05 Oct 2023",
    status: "Lost",
    drawDate: "10 Oct 2023"
  },
  {
    id: "CAM-003",
    name: "MacBook Air M2 Chip",
    joinedAt: "28 Sep 2023",
    status: "Won",
    drawDate: "02 Oct 2023"
  },
  {
    id: "CAM-004",
    name: "Samsung 4K Smart TV 55\"",
    joinedAt: "15 Sep 2023",
    status: "Lost",
    drawDate: "20 Sep 2023"
  }
]

export default function UserDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, Rahul 👋</h1>
        <p className="text-muted-foreground mt-2">Track your active entries and previous wins.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-sm border-0 ring-1 ring-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Participations</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-0 ring-1 ring-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Campaigns</CardTitle>
            <Ticket className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">4</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-0 ring-1 ring-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Wins</CardTitle>
            <Trophy className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-0 ring-1 ring-border/50">
        <CardHeader>
          <CardTitle>Joined Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Campaign Name</TableHead>
                <TableHead>Joined Date</TableHead>
                <TableHead>Draw Date</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {JOINED_CAMPAIGNS.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium text-foreground">{campaign.name}</TableCell>
                  <TableCell className="text-muted-foreground">{campaign.joinedAt}</TableCell>
                  <TableCell className="text-muted-foreground">{campaign.drawDate}</TableCell>
                  <TableCell className="text-right">
                    <Badge 
                      variant="outline" 
                      className={
                        campaign.status === "Active" ? "bg-primary/10 text-primary border-primary/20" : 
                        campaign.status === "Won" ? "bg-green-500/10 text-green-600 border-green-500/20" : 
                        "bg-muted text-muted-foreground border-border"
                      }
                    >
                      {campaign.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

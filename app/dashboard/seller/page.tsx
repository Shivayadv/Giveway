import { BarChart3, Ticket, Users, TrendingUp } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const RECENT_CAMPAIGNS = [
  { id: "1", name: "iPhone 14 Giveaway", leads: 12543, status: "Active", conversion: "18.5%" },
  { id: "2", name: "Sony Headphones Promo", leads: 8204, status: "Ended", conversion: "12.1%" },
  { id: "3", name: "MacBook Air Back-to-School", leads: 41902, status: "Active", conversion: "24.3%" },
]

export default function SellerDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Seller Dashboard</h1>
        <p className="text-muted-foreground mt-2">Overview of your campaign performance and lead generation.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-sm border-0 ring-1 ring-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Campaigns</CardTitle>
            <Ticket className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
            <p className="text-xs text-muted-foreground mt-1 text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" /> +2 this month
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-0 ring-1 ring-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Leads Generated</CardTitle>
            <Users className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">62,649</div>
            <p className="text-xs text-muted-foreground mt-1 text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" /> +15.2% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-0 ring-1 ring-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Conversion Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">18.3%</div>
            <p className="text-xs text-muted-foreground mt-1 text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" /> +2.4% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm border-0 ring-1 ring-border/50">
          <CardHeader>
            <CardTitle>Top Performing Campaigns</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {RECENT_CAMPAIGNS.map((campaign) => (
              <div key={campaign.id} className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">{campaign.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-muted-foreground">{campaign.leads.toLocaleString()} leads</span>
                    <Badge variant="outline" className={campaign.status === 'Active' ? 'text-green-600 bg-green-500/10 border-0' : 'text-muted-foreground border-0'}>
                      {campaign.status}
                    </Badge>
                  </div>
                </div>
                <div className="font-bold text-lg text-primary">{campaign.conversion}</div>
              </div>
            ))}
          </CardContent>
        </Card>
        
        {/* Placeholder for Analytics Chart */}
        <Card className="shadow-sm border-0 ring-1 ring-border/50 flex flex-col">
          <CardHeader>
            <CardTitle>Lead Generation Trend</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center min-h-[250px] bg-muted/20 rounded-xl m-6 mt-0 border border-dashed border-border">
            <div className="text-center">
              <BarChart3 className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">Interactive Chart Placeholder</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

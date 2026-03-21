import { Users, Ticket, IndianRupee, Activity, TrendingUp } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Overview</h1>
        <p className="text-muted-foreground mt-2">Platform-wide statistics and metrics.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-0 ring-1 ring-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">542,890</div>
            <p className="text-xs text-muted-foreground mt-1 text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" /> +12% this month
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-0 ring-1 ring-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Campaigns</CardTitle>
            <Ticket className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">8,439</div>
            <p className="text-xs text-muted-foreground mt-1 text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" /> +5.4% this month
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-0 ring-1 ring-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹2.4Cr</div>
            <p className="text-xs text-muted-foreground mt-1 text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" /> +18.2% this year
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-0 ring-1 ring-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Giveaways</CardTitle>
            <Activity className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">342</div>
            <p className="text-xs text-muted-foreground mt-1 text-red-500 flex items-center">
              -12 from yesterday
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="shadow-sm border-0 ring-1 ring-border/50 col-span-4 flex flex-col">
          <CardHeader>
            <CardTitle>Platform Growth</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center min-h-[300px] bg-muted/20 rounded-xl m-6 mt-0 border border-dashed border-border">
            <div className="text-center">
              <Activity className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">Interactive Growth Chart Placeholder</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-0 ring-1 ring-border/50 col-span-3">
          <CardHeader>
            <CardTitle>Recent Signups</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-sm text-primary">
                    U{i}
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">New User {i}</h4>
                    <p className="text-xs text-muted-foreground">user{i}@example.com</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{10 * i} mins ago</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

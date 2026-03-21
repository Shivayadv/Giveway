import { CheckCircle2, XCircle, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const PENDING_APPROVALS = [
  {
    id: "APR-881",
    brand: "TechCorp India",
    campaign: "MacBook Pro M3 Max Giveaway",
    value: "₹3,19,900",
    submittedAt: "2 hours ago",
    status: "Pending Review"
  },
  {
    id: "APR-882",
    brand: "ElectroWorld",
    campaign: "PlayStation 5 + 3 Games",
    value: "₹64,990",
    submittedAt: "5 hours ago",
    status: "Pending Review"
  },
  {
    id: "APR-883",
    brand: "StyleIcon",
    campaign: "Nike Air Jordan 1 Retro",
    value: "₹18,500",
    submittedAt: "1 day ago",
    status: "Flagged"
  }
]

export default function ApprovalsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Campaign Approvals</h1>
        <p className="text-muted-foreground mt-2">Review and moderate pending giveaway campaigns before they go live on the platform.</p>
      </div>

      <div className="grid gap-6">
        {PENDING_APPROVALS.map((req) => (
          <Card key={req.id} className="shadow-sm border-0 ring-1 ring-border/50 overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-6">
              
              <div className="space-y-1 md:w-1/3">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className={req.status === 'Flagged' ? 'bg-orange-500/10 text-orange-600 border-orange-500/20' : 'bg-muted text-muted-foreground'}>
                    <Clock className="w-3 h-3 mr-1" /> {req.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{req.id}</span>
                </div>
                <h3 className="text-xl font-bold">{req.campaign}</h3>
                <p className="text-muted-foreground font-medium">by {req.brand}</p>
              </div>

              <div className="flex md:flex-col gap-8 md:gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">Prize Value</p>
                  <p className="font-bold text-lg text-foreground">{req.value}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Submitted</p>
                  <p className="font-medium text-foreground">{req.submittedAt}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 md:w-1/3 md:justify-end border-t md:border-0 pt-4 md:pt-0 mt-4 md:mt-0">
                <Button variant="outline" className="text-destructive hover:text-destructive hover:bg-destructive/10 bg-background shadow-sm border-destructive/20 w-full sm:w-auto">
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button className="bg-green-600 hover:bg-green-700 text-white shadow-md border-0 w-full sm:w-auto">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Approve Live
                </Button>
              </div>
              
            </div>
          </Card>
        ))}
      </div>
      
      {PENDING_APPROVALS.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-xl bg-muted/10">
          <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium">All caught up!</h3>
          <p className="text-muted-foreground mt-1">There are no pending campaigns to review at the moment.</p>
        </div>
      )}
    </div>
  )
}

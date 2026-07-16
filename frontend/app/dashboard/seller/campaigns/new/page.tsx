import { ImageIcon, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function CreateCampaignPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Create New Campaign</h1>
        <p className="text-muted-foreground mt-1">Launch a premium giveaway to capture high-quality US leads.</p>
      </div>

      <Card className="border border-border/50 bg-card">
        <CardHeader className="border-b border-border/50">
          <CardTitle>Campaign Details</CardTitle>
          <CardDescription>Fill in the required product and promotional details.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-8">

          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2 text-sm uppercase tracking-wide text-primary">1. Product Information</h3>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label htmlFor="productName">Product Name</Label>
                <Input id="productName" placeholder="e.g. iPhone 14 Pro Max" className="bg-muted/40 h-11 border-border/60 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="price">Original Price ($)</Label>
                <Input id="price" type="number" placeholder="1699" className="bg-muted/40 h-11 border-border/60 rounded-xl" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Product Image</Label>
              <div className="border-2 border-dashed border-border/50 rounded-xl p-10 flex flex-col items-center justify-center text-center hover:bg-muted/20 hover:border-primary/30 transition-all cursor-pointer group">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors ring-1 ring-primary/20">
                  <ImageIcon className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-medium text-sm">Click to upload image</h4>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG or WEBP (max. 5 MB)</p>
              </div>
            </div>
          </div>

          <div className="border-t border-border/50 pt-6 space-y-4">
            <h3 className="font-semibold flex items-center gap-2 text-sm uppercase tracking-wide text-primary">2. Campaign Settings</h3>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label htmlFor="duration">Duration (Days)</Label>
                <Input id="duration" type="number" placeholder="7" className="bg-muted/40 h-11 border-border/60 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="winners">Number of Winners</Label>
                <Input id="winners" type="number" placeholder="1" className="bg-muted/40 h-11 border-border/60 rounded-xl" />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="offerType">Offer Type</Label>
                <select id="offerType" className="flex h-11 w-full rounded-xl border border-border/60 bg-muted/40 px-3 text-sm focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30">
                  <option value="free">100% Free Giveaway</option>
                  <option value="discount">Massive Discount (e.g. 90% Off)</option>
                  <option value="bogo">Buy One Get One</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button size="lg" className="w-full h-12 text-base font-bold shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all gap-2">
              <PlusCircle className="h-5 w-5" /> Launch Campaign
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}

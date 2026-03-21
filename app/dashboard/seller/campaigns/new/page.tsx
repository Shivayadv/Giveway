import { ImageIcon, PlusCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function CreateCampaignPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Campaign</h1>
        <p className="text-muted-foreground mt-2">Launch a new premium giveaway to capture high-quality leads.</p>
      </div>

      <Card className="shadow-lg border-0 ring-1 ring-border/50 rounded-2xl">
        <CardHeader className="bg-muted/30 border-b pb-8">
          <CardTitle>Campaign Details</CardTitle>
          <CardDescription>Fill in the required product and promotional details.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">1. Product Information</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="productName">Product Name</Label>
                <Input id="productName" placeholder="e.g. iPhone 14 Pro Max" className="bg-muted/50 h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Original Price (₹)</Label>
                <Input id="price" type="number" placeholder="139900" className="bg-muted/50 h-11" />
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Label>Product Image</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-10 flex flex-col items-center justify-center text-center hover:bg-muted/30 transition-colors cursor-pointer group">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <ImageIcon className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-medium">Click to upload image</h4>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG or WEBP (max. 5MB)</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-8 space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">2. Campaign Settings</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="duration">Campaign Duration (Days)</Label>
                <Input id="duration" type="number" placeholder="7" className="bg-muted/50 h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="winners">Number of Winners</Label>
                <Input id="winners" type="number" placeholder="1" className="bg-muted/50 h-11" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="offerType">Offer Type</Label>
                <select 
                  id="offerType" 
                  className="flex h-11 w-full rounded-md border border-input bg-muted/50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="free">100% Free Giveaway</option>
                  <option value="discount">Massive Discount (e.g. 90% Off)</option>
                  <option value="bogo">Buy One Get One</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <Button size="lg" className="w-full h-14 text-base font-bold shadow-md hover:shadow-primary/20 rounded-xl">
              <PlusCircle className="mr-2 h-5 w-5" />
              Launch Campaign
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}

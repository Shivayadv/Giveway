import { ChevronRight, ShieldCheck, Trophy, Users, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function CampaignDetailsPage({ params }: { params: { id: string } }) {
  // Dummy data based on params.id
  const campaign = {
    id: params.id,
    title: "iPhone 14 Pro Max 256GB Giveaway",
    description: "Experience the ultimate smartphone with the iPhone 14 Pro Max. Featuring the Dynamic Island, a 48MP Main camera for mind-blowing detail, and the A16 Bionic chip. Enter now for a chance to win this premium device absolutely free!",
    image: "https://images.unsplash.com/photo-1663465374413-83c103e2303c?w=1000&q=80",
    price: "₹1,39,900",
    offer: "Free",
    participants: "24,531",
    winners: 10,
    timeLeft: "2 Days Left",
    terms: [
      "Must be 18 years or older to participate.",
      "Valid for residents of India only.",
      "One entry per person. Multiple entries will lead to disqualification.",
      "Winners will be announced on our official social media handles."
    ]
  }

  return (
    <div className="container px-4 md:px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Col: Graphics & Info */}
        <div className="space-y-8">
          <div className="rounded-3xl overflow-hidden bg-muted aspect-[4/3] relative shadow-2xl">
            <div className="absolute top-4 left-4 z-10">
              <Badge className="bg-destructive text-destructive-foreground shadow-lg px-4 py-1.5 text-sm font-bold border-0 flex items-center gap-2">
                <Zap className="h-4 w-4" /> Ending Soon
              </Badge>
            </div>
            <img 
              src={campaign.image} 
              alt={campaign.title}
              className="object-cover w-full h-full"
            />
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground border-b pb-6">
              <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-lg">
                <Trophy className="h-4 w-4" />
                {campaign.winners} Winners
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {campaign.participants} Joined
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-bold">About the Prize</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {campaign.description}
              </p>
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Terms & Conditions
              </h3>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                {campaign.terms.map((term, i) => (
                  <li key={i}>{term}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Col: Entry Form */}
        <div>
          <div className="sticky top-24">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight mb-4">
              {campaign.title}
            </h1>
            <div className="flex items-baseline gap-4 mb-8">
              <span className="text-4xl font-black text-primary">Free</span>
              <span className="text-xl text-muted-foreground line-through font-medium">{campaign.price}</span>
            </div>

            <Card className="border-0 shadow-2xl bg-card rounded-3xl overflow-hidden ring-1 ring-border/50">
              <CardHeader className="bg-muted/50 border-b pb-8 pt-8">
                <CardTitle className="text-2xl">Secure Your Entry</CardTitle>
                <CardDescription className="text-base mt-2">
                  Fill out the form below to participate. It only takes 30 seconds.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-base">Full Name</Label>
                    <Input id="name" placeholder="Rahul Sharma" className="h-12 bg-muted/50 text-base rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-base">Phone Number</Label>
                    <Input id="phone" type="tel" placeholder="+91 98765 43210" className="h-12 bg-muted/50 text-base rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-base">Email Address</Label>
                    <Input id="email" type="email" placeholder="rahul@example.com" className="h-12 bg-muted/50 text-base rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-base">City</Label>
                    <Input id="city" placeholder="e.g. Delhi" className="h-12 bg-muted/50 text-base rounded-xl" />
                  </div>
                </div>

                <Button size="lg" className="w-full h-14 text-lg font-bold rounded-xl shadow-lg hover:shadow-primary/25 transition-all">
                  Participate Now
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  By participating, you agree to our terms of service and privacy policy. We never sell your data.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

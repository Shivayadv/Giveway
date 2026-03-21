import Link from "next/link"
import { ChevronRight, Search, Users, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

const CAMPAIGNS = [
  {
    id: 1,
    title: "iPhone 14 Pro Max 256GB Giveaway",
    image: "https://images.unsplash.com/photo-1663465374413-83c103e2303c?w=800&q=80",
    price: "₹1,39,900",
    offer: "Free",
    participants: "24,531",
    timeLeft: "2 Days Left"
  },
  {
    id: 2,
    title: "Sony WH-1000XM5 Headphones",
    image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&q=80",
    price: "₹29,990",
    offer: "90% Off",
    participants: "8,204",
    timeLeft: "5 Hours Left"
  },
  {
    id: 3,
    title: "MacBook Air M2 Chip",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
    price: "₹1,14,900",
    offer: "Free",
    participants: "41,902",
    timeLeft: "Ends Today"
  },
  {
    id: 4,
    title: "Samsung Galaxy S23 Ultra",
    image: "https://images.unsplash.com/photo-1678911820864-e2c567c655d7?w=800&q=80",
    price: "₹1,24,999",
    offer: "Free",
    participants: "15,820",
    timeLeft: "3 Days Left"
  },
  {
    id: 5,
    title: "PlayStation 5 Console",
    image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&q=80",
    price: "₹54,990",
    offer: "50% Off",
    participants: "32,100",
    timeLeft: "1 Week Left"
  },
  {
    id: 6,
    title: "Dyson Airwrap Multi-styler",
    image: "https://images.unsplash.com/photo-1620060935105-4c070c797444?w=800&q=80",
    price: "₹45,900",
    offer: "Free",
    participants: "9,602",
    timeLeft: "4 Days Left"
  }
]

export default function CampaignsPage() {
  return (
    <div className="container px-4 md:px-6 py-12 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Active Campaigns</h1>
          <p className="text-muted-foreground mt-2">Discover and join verified premium giveaways.</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search campaigns..." 
            className="pl-9 bg-background shadow-sm border-muted-foreground/20 rounded-xl"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {CAMPAIGNS.map((campaign) => (
          <Card key={campaign.id} className="overflow-hidden border-0 shadow-lg hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 group rounded-2xl bg-card">
            <div className="absolute top-4 right-4 z-10">
              <Badge className="bg-white/90 text-black shadow-sm font-bold backdrop-blur-md px-3 py-1 text-sm border-0">
                {campaign.offer}
              </Badge>
            </div>
            <div className="aspect-[4/3] w-full overflow-hidden relative bg-muted">
              <img 
                src={campaign.image} 
                alt={campaign.title}
                className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500 ease-in-out"
              />
            </div>
            <CardContent className="p-6 space-y-5">
              <div>
                <h3 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                  {campaign.title}
                </h3>
                <p className="text-muted-foreground mt-2 line-through text-lg font-medium">
                  {campaign.price}
                </p>
              </div>
              
              <div className="flex items-center justify-between text-sm font-medium py-3 border-y border-border/50">
                <div className="flex items-center text-muted-foreground">
                  <Users className="h-4 w-4 mr-2 text-primary" />
                  {campaign.participants}
                </div>
                <div className="flex items-center text-destructive">
                  <Zap className="h-4 w-4 mr-2" />
                  {campaign.timeLeft}
                </div>
              </div>

              <Link href={`/campaigns/${campaign.id}`} className="block w-full">
                <Button className="w-full h-12 text-base font-semibold shadow-md active:scale-[0.98] transition-all rounded-xl">
                  Join Now
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

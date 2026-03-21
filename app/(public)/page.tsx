import Link from "next/link"
import { Gift, ChevronRight, Trophy, Users, Zap, Ticket, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const FEATURED_CAMPAIGNS = [
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
  }
]

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background pt-24 pb-32 lg:pt-36 lg:pb-40">
        <div className="absolute inset-0 bg-primary/5 [mask-image:linear-gradient(to_bottom,white,transparent)]" />
        <div className="container relative px-4 md:px-6 flex flex-col items-center text-center space-y-8">
          <Badge variant="secondary" className="px-4 py-1.5 rounded-full border-primary/20 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
            🎉 The #1 Platform for Premium Giveaways
          </Badge>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl">
            Win Premium Products. <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              Zero Cost, Maximum Joy.
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Join thousands of users winning iPhones, MacBooks, and premium gear every single day. 100% verified brands and transparent winners.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link href="/campaigns">
              <Button size="lg" className="rounded-full h-14 px-8 text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all font-semibold">
                Join a Giveaway Now
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/dashboard/seller">
              <Button size="lg" variant="outline" className="rounded-full h-14 px-8 text-base font-semibold border-2 bg-background hover:bg-muted">
                I'm a Brand
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 pt-12 text-muted-foreground border-t max-w-3xl w-full mt-12">
            <div className="flex flex-col items-center gap-2">
              <h4 className="text-3xl font-bold text-foreground">500K+</h4>
              <p className="text-sm font-medium">Active Users</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <h4 className="text-3xl font-bold text-foreground">₹2Cr+</h4>
              <p className="text-sm font-medium">Prizes Distributed</p>
            </div>
            <div className="flex flex-col items-center gap-2 col-span-2 md:col-span-1">
              <h4 className="text-3xl font-bold text-foreground">100%</h4>
              <p className="text-sm font-medium">Verified Brands</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Campaigns */}
      <section className="py-24 bg-muted/30">
        <div className="container px-4 md:px-6 space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-end gap-4">
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Ending Soon ⏳</h2>
              <p className="text-muted-foreground text-lg">Don't miss out on these premium giveaways.</p>
            </div>
            <Link href="/campaigns">
              <Button variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10">
                View All Campaigns <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURED_CAMPAIGNS.map((campaign) => (
              <Card key={campaign.id} className="overflow-hidden border-0 shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 group rounded-2xl bg-background/50 backdrop-blur-sm relative">
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
                <CardContent className="p-6 space-y-5 relative">
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
      </section>

      {/* How it works */}
      <section className="py-24" id="how-it-works">
        <div className="container px-4 md:px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">How it Works</h2>
            <p className="text-xl text-muted-foreground">Three simple steps to claim your prize.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-2 shadow-inner ring-1 ring-primary/20">
                <Ticket className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">1. Find a Campaign</h3>
              <p className="text-muted-foreground text-lg">Browse our curated selection of premium giveaways and select the one you love.</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center mb-2 shadow-inner ring-1 ring-accent/20">
                <User className="h-10 w-10 text-accent" />
              </div>
              <h3 className="text-2xl font-bold">2. Enter Details</h3>
              <p className="text-muted-foreground text-lg">Fill in your basic information quickly to secure your participation slot.</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 rounded-2xl bg-green-500/10 flex items-center justify-center mb-2 shadow-inner ring-1 ring-green-500/20">
                <Trophy className="h-10 w-10 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold">3. Win & Enjoy</h3>
              <p className="text-muted-foreground text-lg">Wait for the transparent draw. If you win, the product ships directly to you.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden" id="testimonials">
        <div className="absolute inset-0 bg-black/10 mix-blend-multiply" />
        <div className="container relative px-4 md:px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Real Winners. Real Joy.</h2>
            <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">Hear from people who transformed their lives with our premium giveaways.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-primary-foreground/10 border-0 text-primary-foreground backdrop-blur-md rounded-2xl p-8 hover:bg-primary-foreground/15 transition-colors">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-full bg-primary-foreground/20 flex items-center justify-center font-bold text-xl uppercase border-2 border-primary-foreground/30">
                    JD
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">John Doe</h4>
                    <p className="text-sm text-primary-foreground/70">Won an iPhone 14</p>
                  </div>
                </div>
                <p className="text-lg italic leading-relaxed text-primary-foreground/90">
                  "I couldn't believe it when I got the email. It felt so surreal, but a week later the phone was in my hands! Best platform ever."
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

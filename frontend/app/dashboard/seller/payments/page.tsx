"use client"

import { useEffect, useState } from "react"
import { CreditCard, Loader2, CheckCircle, Package } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Plan { id: string; name: string; amount: number; amount_display: string; description: string }
interface Payment { id: string; plan: string; amount_display: string; paid_at: string; campaign_id: string }

declare global {
  interface Window {
    Razorpay: new (opts: object) => { open(): void }
  }
}

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) { resolve(true); return }
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function SellerPaymentsPage() {
  const [plans, setPlans]       = useState<Plan[]>([])
  const [history, setHistory]   = useState<Payment[]>([])
  const [loading, setLoading]   = useState(true)
  const [paying, setPaying]     = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch("/api/payments/plans").then((r) => r.json()),
      fetch("/api/payments/history").then((r) => r.json()),
    ]).then(([p, h]) => {
      setPlans(Array.isArray(p) ? p : [])
      setHistory(Array.isArray(h) ? h : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  async function handlePay(plan: Plan) {
    setPaying(plan.id)
    try {
      const loaded = await loadRazorpay()
      if (!loaded) { alert("Failed to load payment gateway. Please try again."); return }

      const order = await fetch("/api/payments/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: plan.id }),
      }).then((r) => r.json())

      if (order.detail) { alert(order.detail); return }

      const rzp = new window.Razorpay({
        key:         order.key_id,
        amount:      order.amount,
        currency:    order.currency,
        name:        "GiveAwayLead",
        description: `${order.plan_name} Plan`,
        order_id:    order.order_id,
        handler: async (response: Record<string, string>) => {
          const verify = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...response, plan: plan.id }),
          }).then((r) => r.json())

          if (verify.status === "verified") {
            setHistory((h) => [{
              id: verify.payment_id,
              plan: plan.id,
              amount_display: plan.amount_display,
              paid_at: new Date().toISOString(),
              campaign_id: "",
            }, ...h])
            alert(`Payment successful! Your ${plan.name} plan is now active.`)
          } else {
            alert("Payment verification failed. Please contact support.")
          }
        },
        prefill: {},
        theme: { color: "#6d28d9" },
      })
      rzp.open()
    } finally {
      setPaying(null)
    }
  }

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Payments</h1>
        <p className="text-muted-foreground mt-1">Choose a plan to publish your campaigns.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 max-w-2xl">
        {plans.map((plan) => (
          <Card key={plan.id} className={`relative border bg-card overflow-hidden ${plan.id === "pro" ? "border-primary/40 shadow-lg shadow-primary/10" : "border-border/50"}`}>
            {plan.id === "pro" && (
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-purple-400 to-primary" />
            )}
            <CardHeader className="pb-3 pt-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold capitalize">{plan.name}</CardTitle>
                {plan.id === "pro" && (
                  <Badge className="bg-primary/10 text-primary border border-primary/20 text-xs">Popular</Badge>
                )}
              </div>
              <CardDescription className="text-xs">{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-0">
              <div>
                <span className="text-3xl font-extrabold">{plan.amount_display}</span>
                <span className="text-muted-foreground text-sm ml-1">/ campaign</span>
              </div>
              <Button
                onClick={() => handlePay(plan)}
                disabled={paying === plan.id}
                className={`w-full gap-2 ${plan.id === "pro" ? "" : "variant-outline border border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground"}`}
                variant={plan.id === "pro" ? "default" : "outline"}
              >
                {paying === plan.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                Pay {plan.amount_display}
              </Button>
            </CardContent>
          </Card>
        ))}

        {plans.length === 0 && (
          <div className="col-span-2 text-center py-12 text-muted-foreground text-sm border-2 border-dashed border-border/50 rounded-2xl">
            Payment plans unavailable. Check backend configuration.
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div className="space-y-3 max-w-2xl">
          <h2 className="text-base font-semibold">Payment History</h2>
          <div className="space-y-2">
            {history.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-5 py-3.5 rounded-xl border border-border/40 bg-card">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium capitalize">{p.plan} Plan</p>
                    <p className="text-xs text-muted-foreground">
                      {p.paid_at ? new Date(p.paid_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}
                    </p>
                  </div>
                </div>
                <span className="font-semibold text-green-400 text-sm">{p.amount_display}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

import { notFound } from "next/navigation"
import { Gift, Users, Clock, Trophy } from "lucide-react"
import { apiFetch, type CampaignDetail } from "@/lib/api"
import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  try {
    const c = await apiFetch<CampaignDetail>(`/api/campaigns/${id}`)
    return { title: `Win ${c.title} — GiveAwayLead`, description: c.description }
  } catch {
    return { title: "GiveAwayLead Embed" }
  }
}

export default async function EmbedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let campaign: CampaignDetail | null = null

  try {
    campaign = await apiFetch<CampaignDetail>(`/api/campaigns/${id}`)
  } catch {
    notFound()
  }

  if (!campaign) notFound()

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

  return (
    <html lang="en">
      <body className="m-0 p-0 bg-transparent">
        <div
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "16px",
            overflow: "hidden",
            background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)",
            color: "#f8fafc",
            maxWidth: "360px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          }}
        >
          {/* Image */}
          <div style={{ position: "relative", height: "180px", overflow: "hidden" }}>
            <img
              src={campaign.image}
              alt={campaign.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)" }} />
            <div style={{ position: "absolute", top: "10px", left: "10px", background: "rgba(109,40,217,0.9)", borderRadius: "6px", padding: "3px 8px", fontSize: "11px", fontWeight: 600, color: "#fff" }}>
              FREE GIVEAWAY
            </div>
          </div>

          {/* Content */}
          <div style={{ padding: "16px" }}>
            <p style={{ fontSize: "11px", color: "#a78bfa", fontWeight: 600, marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {campaign.brand}
            </p>
            <h2 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "12px", lineHeight: 1.3 }}>
              {campaign.title}
            </h2>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "14px" }}>
              {[
                { Icon: "👥", label: "Entries",  value: campaign.participants.toLocaleString() },
                { Icon: "🏆", label: "Winners",  value: String(campaign.winners) },
                { Icon: "⏰", label: "Time Left", value: campaign.time_left },
              ].map((s) => (
                <div key={s.label} style={{ background: "rgba(255,255,255,0.06)", borderRadius: "8px", padding: "8px", textAlign: "center" }}>
                  <div style={{ fontSize: "16px" }}>{s.Icon}</div>
                  <div style={{ fontSize: "14px", fontWeight: 700 }}>{s.value}</div>
                  <div style={{ fontSize: "10px", color: "#94a3b8" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <a
              href={`${APP_URL}/campaigns/${id}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "block",
                background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                color: "#fff",
                textAlign: "center",
                padding: "11px",
                borderRadius: "10px",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "14px",
                letterSpacing: "0.01em",
              }}
            >
              🎁 Enter to Win — Free!
            </a>

            <p style={{ fontSize: "10px", color: "#64748b", textAlign: "center", marginTop: "8px" }}>
              Powered by <a href={APP_URL} target="_blank" rel="noopener noreferrer" style={{ color: "#7c3aed" }}>GiveAwayLead</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}

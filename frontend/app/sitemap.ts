import type { MetadataRoute } from "next"
import { apiFetch } from "@/lib/api"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

interface CampaignStub { id: string }

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: APP_URL,                        lastModified: new Date(), changeFrequency: "daily",   priority: 1 },
    { url: `${APP_URL}/campaigns`,         lastModified: new Date(), changeFrequency: "hourly",  priority: 0.9 },
    { url: `${APP_URL}/winners`,           lastModified: new Date(), changeFrequency: "daily",   priority: 0.8 },
    { url: `${APP_URL}/login`,             lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${APP_URL}/register`,          lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ]

  let campaignRoutes: MetadataRoute.Sitemap = []
  try {
    const campaigns = await apiFetch<CampaignStub[]>("/api/campaigns?status=active")
    campaignRoutes = campaigns.map((c) => ({
      url: `${APP_URL}/campaigns/${c.id}`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.7,
    }))
  } catch {}

  return [...staticRoutes, ...campaignRoutes]
}

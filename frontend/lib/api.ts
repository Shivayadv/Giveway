const BASE = process.env.FASTAPI_URL ?? "http://localhost:8000"

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    cache: "no-store",
  })
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`API ${path} failed ${res.status}: ${text}`)
  }
  return res.json() as Promise<T>
}

export interface Campaign {
  id: string
  title: string
  image: string
  price: string
  offer: string
  participants: number
  time_left: string
  brand: string
  category: string
  urgent: boolean
  winners: number
  status: string
}

export interface CampaignDetail extends Campaign {
  description: string
  terms: string[]
  rating: number
  total_ratings: number
  draw_date?: string
}

export interface EntryOut {
  id: string
  campaign_id: string
  campaign_title: string
  prize: string
  joined_at: string
  draw_date: string
  entry_status: string
}

export interface UserStats {
  total_participations: number
  active_campaigns: number
  total_wins: number
  entries: EntryOut[]
}

export interface PlatformStats {
  total_users: number
  total_campaigns: number
  active_giveaways: number
  total_entries: number
  total_revenue: string
  recent_signups: { name: string; email: string; role: string }[]
}

export interface SellerStats {
  total_campaigns: number
  total_leads: number
  avg_conversion: string
  campaigns: {
    id: string
    name: string
    leads: number
    status: string
    conversion: string
  }[]
}

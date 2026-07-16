"use server"

import { redirect } from "next/navigation"
import { createSession, dashboardForRole, deleteSession } from "@/lib/session"

type ActionState = {
  errors?: { general?: string; email?: string; password?: string; name?: string }
  message?: string
} | undefined

const API = process.env.FASTAPI_URL ?? "http://localhost:8000"

export async function loginAction(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { errors: { general: "Email and password are required" } }
  }

  let res: Response
  try {
    res = await fetch(`${API}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    })
  } catch {
    return { errors: { general: "Cannot reach server. Is the backend running?" } }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    return { errors: { general: body.detail ?? "Invalid email or password" } }
  }

  const data = await res.json()
  await createSession(data.access_token)
  redirect(dashboardForRole(data.user.role))
}

export async function registerAction(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const phone = formData.get("phone") as string
  const password = formData.get("password") as string
  const role = (formData.get("role") as string) || "user"
  const brand_name = formData.get("brand_name") as string | null
  const brand_category = formData.get("brand_category") as string | null
  const brand_website = formData.get("brand_website") as string | null

  if (!name || !email || !phone || !password) {
    return { errors: { general: "All fields are required" } }
  }

  if (role === "seller" && !brand_name) {
    return { errors: { general: "Brand name is required for brand partners" } }
  }

  let res: Response
  try {
    res = await fetch(`${API}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, password, role, brand_name, brand_category, brand_website }),
      cache: "no-store",
    })
  } catch {
    return { errors: { general: "Cannot reach server. Is the backend running?" } }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    return { errors: { general: body.detail ?? "Registration failed. Try again." } }
  }

  const data = await res.json()
  await createSession(data.access_token)
  redirect(dashboardForRole(data.user.role))
}

export async function logoutAction() {
  await deleteSession()
  redirect("/login")
}

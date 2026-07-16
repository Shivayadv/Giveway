import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

const BACKEND = process.env.FASTAPI_URL ?? "http://localhost:8000"

async function handler(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  const token = (await cookies()).get("token")?.value

  const url = `${BACKEND}/api/${path.join("/")}${req.nextUrl.search}`

  const headers: Record<string, string> = {}
  const ct = req.headers.get("content-type")
  if (ct) headers["content-type"] = ct
  if (token) headers["authorization"] = `Bearer ${token}`

  const body = req.method !== "GET" && req.method !== "HEAD"
    ? await req.arrayBuffer()
    : undefined

  const upstream = await fetch(url, {
    method: req.method,
    headers,
    body: body as BodyInit | undefined,
  })

  const resHeaders = new Headers()
  const resCT = upstream.headers.get("content-type")
  if (resCT) resHeaders.set("content-type", resCT)
  const resCD = upstream.headers.get("content-disposition")
  if (resCD) resHeaders.set("content-disposition", resCD)

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: resHeaders,
  })
}

export const GET    = handler
export const POST   = handler
export const PATCH  = handler
export const PUT    = handler
export const DELETE = handler

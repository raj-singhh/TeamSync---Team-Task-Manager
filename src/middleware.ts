import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { COOKIE_NAME } from "@/lib/jwt"
import { verifySessionToken } from "@/lib/jwt"

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }
  const userId = await verifySessionToken(token)
  if (!userId) {
    const res = NextResponse.redirect(new URL("/login", request.url))
    res.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" })
    return res
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/projects/:path*", "/team/:path*", "/settings/:path*"],
}

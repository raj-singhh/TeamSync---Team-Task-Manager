import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { COOKIE_NAME, createSessionToken } from "@/lib/jwt"
import { userToApi } from "@/lib/mappers"

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { email, password } = parsed.data
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true, email: true, name: true, avatarUrl: true, passwordHash: true },
  })

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
  }

  const token = await createSessionToken(user.id)
  const { passwordHash: _, ...safe } = user
  const res = NextResponse.json({ user: userToApi(safe) })
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })
  return res
}

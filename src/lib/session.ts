import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { COOKIE_NAME, verifySessionToken } from "@/lib/jwt"

export async function getSessionUserId(): Promise<string | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value
  if (!token) return null
  return verifySessionToken(token)
}

export async function getSessionUser() {
  const id = await getSessionUserId()
  if (!id) return null
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, avatarUrl: true, createdAt: true },
  })
}

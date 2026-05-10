import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function getSessionUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions)
  return session?.user?.id || null
}

export async function getSessionUser() {
  const id = await getSessionUserId()
  if (!id) return null
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, image: true, createdAt: true },
  })
}

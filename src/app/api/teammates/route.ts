import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUserId } from "@/lib/session"
import { userToApi } from "@/lib/mappers"

/** Distinct users that share at least one project with the current user */
export async function GET() {
  const userId = await getSessionUserId()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const myProjects = await prisma.projectMember.findMany({
    where: { userId },
    select: { projectId: true },
  })
  const projectIds = myProjects.map((m) => m.projectId)
  if (projectIds.length === 0) {
    return NextResponse.json({ teammates: [] })
  }

  const others = await prisma.projectMember.findMany({
    where: {
      projectId: { in: projectIds },
      userId: { not: userId },
    },
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
  })

  const seen = new Set<string>()
  const teammates = []
  for (const row of others) {
    if (seen.has(row.userId)) continue
    seen.add(row.userId)
    teammates.push(userToApi(row.user))
  }

  teammates.sort((a, b) => a.name.localeCompare(b.name))

  return NextResponse.json({ teammates })
}

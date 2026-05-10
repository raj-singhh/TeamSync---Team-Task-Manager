import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { DbRole } from "@/lib/db-enums"
import { getSessionUserId } from "@/lib/session"
import { roleToApi } from "@/lib/mappers"

const createSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional().default(""),
})

export async function GET() {
  const userId = await getSessionUserId()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const memberships = await prisma.projectMember.findMany({
    where: { userId },
    include: {
      project: {
        include: {
          _count: { select: { members: true } },
        },
      },
    },
    orderBy: { project: { createdAt: "desc" } },
  })

  const projects = memberships.map((m) => ({
    id: m.project.id,
    title: m.project.title,
    description: m.project.description,
    ownerId: m.project.ownerId,
    createdAt: m.project.createdAt.toISOString(),
    memberCount: m.project._count.members,
    myRole: roleToApi(m.role),
  }))

  return NextResponse.json({ projects })
}

export async function POST(req: Request) {
  const userId = await getSessionUserId()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { title, description } = parsed.data

  const project = await prisma.project.create({
    data: {
      title: title.trim(),
      description: description.trim(),
      ownerId: userId,
      members: {
        create: { userId, role: DbRole.ADMIN },
      },
    },
    include: {
      _count: { select: { members: true } },
    },
  })

  return NextResponse.json({
    project: {
      id: project.id,
      title: project.title,
      description: project.description,
      ownerId: project.ownerId,
      createdAt: project.createdAt.toISOString(),
      memberCount: project._count.members,
      myRole: "Admin" as const,
    },
  })
}

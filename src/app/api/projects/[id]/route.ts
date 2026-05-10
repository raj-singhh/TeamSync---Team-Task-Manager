import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getSessionUserId } from "@/lib/session"
import { getProjectMembership, isProjectAdmin } from "@/lib/project-access"
import { roleToApi, taskToApi, userToApi } from "@/lib/mappers"

const patchSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
})

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await ctx.params

  const membership = await getProjectMembership(id, userId)
  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true, email: true, avatarUrl: true } },
        },
      },
      tasks: {
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const assigneeIds = [...new Set(project.tasks.map((t) => t.assignedToId).filter(Boolean))] as string[]
  const assignees =
    assigneeIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: assigneeIds } },
          select: { id: true, name: true, email: true, avatarUrl: true },
        })
      : []
  const assigneeMap = Object.fromEntries(assignees.map((u) => [u.id, userToApi(u)]))

  return NextResponse.json({
    project: {
      id: project.id,
      title: project.title,
      description: project.description,
      ownerId: project.ownerId,
      createdAt: project.createdAt.toISOString(),
      currentUserId: userId,
      myRole: roleToApi(membership.role),
      canAdmin: isProjectAdmin(project, membership, userId),
      members: project.members.map((m) => ({
        userId: m.userId,
        role: roleToApi(m.role),
        user: userToApi(m.user),
      })),
      tasks: project.tasks.map((t) => ({
        ...taskToApi(t),
        assignee: t.assignedToId ? assigneeMap[t.assignedToId] ?? null : null,
      })),
    },
  })
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await ctx.params
  const membership = await getProjectMembership(id, userId)
  const project = await prisma.project.findUnique({ where: { id } })
  if (!project || !membership) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (!isProjectAdmin(project, membership, userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const data: { title?: string; description?: string } = {}
  if (parsed.data.title !== undefined) data.title = parsed.data.title.trim()
  if (parsed.data.description !== undefined) data.description = parsed.data.description.trim()

  const updated = await prisma.project.update({
    where: { id },
    data,
  })

  return NextResponse.json({
    project: {
      id: updated.id,
      title: updated.title,
      description: updated.description,
      ownerId: updated.ownerId,
      createdAt: updated.createdAt.toISOString(),
    },
  })
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await ctx.params
  const membership = await getProjectMembership(id, userId)
  const project = await prisma.project.findUnique({ where: { id } })
  if (!project || !membership) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (!isProjectAdmin(project, membership, userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await prisma.project.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

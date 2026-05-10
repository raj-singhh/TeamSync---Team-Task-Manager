import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getSessionUserId } from "@/lib/session"
import { getProjectMembership, canAssignTasks, isProjectAdmin } from "@/lib/project-access"
import { parseTaskStatusApi, taskToApi, userToApi } from "@/lib/mappers"

const patchSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  dueDate: z.string().optional(),
  status: z.enum(["To Do", "In Progress", "Done"]).optional(),
  assignedToId: z.string().optional().nullable(),
})

export async function PATCH(req: Request, ctx: { params: Promise<{ taskId: string }> }) {
  const userId = await getSessionUserId()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { taskId } = await ctx.params
  const task = await prisma.task.findUnique({ where: { id: taskId } })
  if (!task) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const membership = await getProjectMembership(task.projectId, userId)
  const project = await prisma.project.findUnique({ where: { id: task.projectId } })
  if (!project || !membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const admin = isProjectAdmin(project, membership, userId)
  const isAssignee = task.assignedToId === userId

  if (!admin && !isAssignee) {
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

  if (parsed.data.assignedToId !== undefined && !canAssignTasks(project, membership, userId)) {
    return NextResponse.json({ error: "Only admins can reassign tasks" }, { status: 403 })
  }

  const data: Record<string, unknown> = {}

  if (parsed.data.title !== undefined) data.title = parsed.data.title.trim()
  if (parsed.data.description !== undefined) data.description = parsed.data.description.trim()
  if (parsed.data.dueDate !== undefined) {
    const d = new Date(parsed.data.dueDate)
    if (Number.isNaN(d.getTime())) {
      return NextResponse.json({ error: "Invalid dueDate" }, { status: 400 })
    }
    data.dueDate = d
  }
  if (parsed.data.status !== undefined) {
    const s = parseTaskStatusApi(parsed.data.status)
    if (!s) return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    data.status = s
  }
  if (parsed.data.assignedToId !== undefined) {
    const aid = parsed.data.assignedToId
    if (aid) {
      const member = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId: task.projectId, userId: aid } },
      })
      if (!member) {
        return NextResponse.json({ error: "Assignee must be a project member" }, { status: 400 })
      }
    }
    data.assignedToId = aid
  }

  const updated = await prisma.task.update({
    where: { id: taskId },
    data,
  })

  const assigneeUser = updated.assignedToId
    ? await prisma.user.findUnique({
        where: { id: updated.assignedToId },
        select: { id: true, name: true, email: true, avatarUrl: true },
      })
    : null

  return NextResponse.json({
    task: {
      ...taskToApi(updated),
      assignee: assigneeUser ? userToApi(assigneeUser) : null,
    },
  })
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ taskId: string }> }) {
  const userId = await getSessionUserId()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { taskId } = await ctx.params
  const task = await prisma.task.findUnique({ where: { id: taskId } })
  if (!task) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const membership = await getProjectMembership(task.projectId, userId)
  const project = await prisma.project.findUnique({ where: { id: task.projectId } })
  if (!project || !membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  if (!isProjectAdmin(project, membership, userId)) {
    return NextResponse.json({ error: "Only admins can delete tasks" }, { status: 403 })
  }

  await prisma.task.delete({ where: { id: taskId } })
  return NextResponse.json({ ok: true })
}

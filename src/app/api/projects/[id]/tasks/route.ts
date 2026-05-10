import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { DbTaskStatus } from "@/lib/db-enums"
import { getSessionUserId } from "@/lib/session"
import { getProjectMembership, isProjectAdmin } from "@/lib/project-access"
import { parseTaskStatusApi, taskToApi, userToApi } from "@/lib/mappers"

const createSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional().default(""),
  dueDate: z.string().min(1),
  status: z.enum(["To Do", "In Progress", "Done"]).optional(),
  assignedToId: z.string().optional().nullable(),
})

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id: projectId } = await ctx.params
  const membership = await getProjectMembership(projectId, userId)
  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project || !membership) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (!isProjectAdmin(project, membership, userId)) {
    return NextResponse.json({ error: "Only project admins can create tasks" }, { status: 403 })
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

  const due = new Date(parsed.data.dueDate)
  if (Number.isNaN(due.getTime())) {
    return NextResponse.json({ error: "Invalid dueDate" }, { status: 400 })
  }

  let assignedToId: string | null = parsed.data.assignedToId ?? null

  if (assignedToId) {
    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: assignedToId } },
    })
    if (!member) {
      return NextResponse.json({ error: "Assignee must be a project member" }, { status: 400 })
    }
  }

  let statusDb: string = DbTaskStatus.TODO
  if (parsed.data.status) {
    const s = parseTaskStatusApi(parsed.data.status)
    if (s) statusDb = s
  }

  const task = await prisma.task.create({
    data: {
      projectId,
      title: parsed.data.title.trim(),
      description: parsed.data.description.trim(),
      dueDate: due,
      status: statusDb,
      assignedToId,
    },
  })

  const assignee = assignedToId
    ? await prisma.user.findUnique({
        where: { id: assignedToId },
        select: { id: true, name: true, email: true, avatarUrl: true },
      })
    : null

  return NextResponse.json({
    task: {
      ...taskToApi(task),
      assignee: assignee ? userToApi(assignee) : null,
    },
  })
}

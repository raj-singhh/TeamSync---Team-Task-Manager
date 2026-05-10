import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUserId } from "@/lib/session"
import { DbTaskStatus } from "@/lib/db-enums"
import { taskToApi, userToApi } from "@/lib/mappers"

export async function GET() {
  const userId = await getSessionUserId()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const tasks = await prisma.task.findMany({
    where: { assignedToId: userId },
    include: {
      project: { select: { id: true, title: true } },
    },
    orderBy: { dueDate: "asc" },
  })

  const stats = {
    todo: tasks.filter((t) => t.status === DbTaskStatus.TODO).length,
    inProgress: tasks.filter((t) => t.status === DbTaskStatus.IN_PROGRESS).length,
    done: tasks.filter((t) => t.status === DbTaskStatus.DONE).length,
    overdue: tasks.filter((t) => {
      if (t.status === DbTaskStatus.DONE) return false
      return t.dueDate < new Date()
    }).length,
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, avatarUrl: true },
  })

  return NextResponse.json({
    user: user ? userToApi(user) : null,
    stats,
    tasks: tasks.map((t) => ({
      ...taskToApi(t),
      projectTitle: t.project.title,
      assignee: user ? userToApi(user) : null,
    })),
  })
}

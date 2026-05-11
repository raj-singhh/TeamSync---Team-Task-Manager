import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getSessionUserId } from "@/lib/session"
import { commentToApi } from "@/lib/mappers"

const postSchema = z.object({
  content: z.string().min(1).max(2000),
})

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await ctx.params

  // Verify task and project membership
  const task = await prisma.task.findUnique({
    where: { id },
    include: { project: { include: { members: true } } },
  })

  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const isMember = task.project.members.some((m) => m.userId === userId)
  if (!isMember) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const comments = await prisma.comment.findMany({
    where: { taskId: id },
    orderBy: { createdAt: "asc" },
    include: {
      author: { select: { id: true, name: true, email: true, avatarUrl: true, image: true } },
    },
  })

  return NextResponse.json({ comments: comments.map(commentToApi) })
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await ctx.params

  const task = await prisma.task.findUnique({
    where: { id },
    include: { project: { include: { members: true } } },
  })

  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const isMember = task.project.members.some((m) => m.userId === userId)
  if (!isMember) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = postSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const comment = await prisma.comment.create({
    data: {
      taskId: id,
      userId,
      content: parsed.data.content.trim(),
    },
    include: {
      author: { select: { id: true, name: true, email: true, avatarUrl: true, image: true } },
    },
  })

  return NextResponse.json({ comment: commentToApi(comment) })
}

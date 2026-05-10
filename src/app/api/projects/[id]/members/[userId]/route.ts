import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { DbRole } from "@/lib/db-enums"
import { getSessionUserId } from "@/lib/session"
import { getProjectMembership, isProjectAdmin } from "@/lib/project-access"
import { parseRoleApi, roleToApi } from "@/lib/mappers"

const patchSchema = z.object({
  role: z.enum(["Admin", "Member"]),
})

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string; userId: string }> }) {
  const sessionUserId = await getSessionUserId()
  if (!sessionUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id: projectId, userId: targetUserId } = await ctx.params
  const membership = await getProjectMembership(projectId, sessionUserId)
  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project || !membership) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (!isProjectAdmin(project, membership, sessionUserId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  if (targetUserId === project.ownerId) {
    return NextResponse.json({ error: "Cannot change the project owner's role" }, { status: 403 })
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

  const roleDb = parseRoleApi(parsed.data.role)
  if (!roleDb) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 })
  }

  const row = await prisma.projectMember.update({
    where: { projectId_userId: { projectId, userId: targetUserId } },
    data: { role: roleDb },
  })

  return NextResponse.json({ member: { userId: row.userId, role: roleToApi(row.role) } })
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string; userId: string }> }) {
  const sessionUserId = await getSessionUserId()
  if (!sessionUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id: projectId, userId: targetUserId } = await ctx.params
  const membership = await getProjectMembership(projectId, sessionUserId)
  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project || !membership) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (!isProjectAdmin(project, membership, sessionUserId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  if (targetUserId === project.ownerId) {
    return NextResponse.json({ error: "Cannot remove the project owner" }, { status: 403 })
  }

  await prisma.projectMember.delete({
    where: { projectId_userId: { projectId, userId: targetUserId } },
  })

  return NextResponse.json({ ok: true })
}

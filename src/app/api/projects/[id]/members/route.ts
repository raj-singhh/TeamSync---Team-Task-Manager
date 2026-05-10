import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { DbRole } from "@/lib/db-enums"
import { getSessionUserId } from "@/lib/session"
import { getProjectMembership, isProjectAdmin } from "@/lib/project-access"
import { parseRoleApi, roleToApi, userToApi } from "@/lib/mappers"

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["Admin", "Member"]),
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
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = inviteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const email = parsed.data.email.toLowerCase()
  const roleDb = parseRoleApi(parsed.data.role)
  if (!roleDb) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 })
  }

  const invitee = await prisma.user.findUnique({ where: { email } })
  if (!invitee) {
    return NextResponse.json({ error: "No user with that email. They must sign up first." }, { status: 404 })
  }

  if (invitee.id === project.ownerId) {
    return NextResponse.json({ error: "Owner is already on this project" }, { status: 409 })
  }

  try {
    const row = await prisma.projectMember.create({
      data: {
        projectId,
        userId: invitee.id,
        role: roleDb,
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
    })

    return NextResponse.json({
      member: {
        userId: row.userId,
        role: roleToApi(row.role),
        user: userToApi(row.user),
      },
    })
  } catch {
    return NextResponse.json({ error: "User is already a member" }, { status: 409 })
  }
}

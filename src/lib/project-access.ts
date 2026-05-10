import { prisma } from "@/lib/prisma"
import { DbRole } from "@/lib/db-enums"

export async function getProjectMembership(projectId: string, userId: string) {
  return prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
    include: { project: true },
  })
}

export function isProjectAdmin(
  project: { ownerId: string },
  membership: { role: string } | null,
  userId: string
): boolean {
  if (project.ownerId === userId) return true
  return membership?.role === DbRole.ADMIN
}

export function canAssignTasks(
  project: { ownerId: string },
  membership: { role: string } | null,
  userId: string
): boolean {
  return isProjectAdmin(project, membership, userId)
}

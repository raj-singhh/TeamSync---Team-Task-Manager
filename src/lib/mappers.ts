import type { User as PrismaUser, Task as PrismaTask } from "@prisma/client"
import type { Role, Task, TaskStatus, User } from "@/lib/types"
import { DbRole, DbTaskStatus, type DbRoleValue, type DbTaskStatusValue } from "@/lib/db-enums"

export function roleToApi(role: string): Role {
  return role === DbRole.ADMIN ? "Admin" : "Member"
}

export function roleToDb(role: Role): DbRoleValue {
  return role === "Admin" ? DbRole.ADMIN : DbRole.MEMBER
}

export function parseRoleApi(role: string): DbRoleValue | null {
  if (role === "Admin") return DbRole.ADMIN
  if (role === "Member") return DbRole.MEMBER
  return null
}

export function taskStatusToApi(status: string): TaskStatus {
  switch (status) {
    case DbTaskStatus.TODO:
      return "To Do"
    case DbTaskStatus.IN_PROGRESS:
      return "In Progress"
    case DbTaskStatus.DONE:
      return "Done"
    default:
      return "To Do"
  }
}

export function taskStatusToDb(status: TaskStatus): DbTaskStatusValue {
  switch (status) {
    case "To Do":
      return DbTaskStatus.TODO
    case "In Progress":
      return DbTaskStatus.IN_PROGRESS
    case "Done":
      return DbTaskStatus.DONE
  }
}

export function parseTaskStatusApi(status: string): DbTaskStatusValue | null {
  switch (status) {
    case "To Do":
      return DbTaskStatus.TODO
    case "In Progress":
      return DbTaskStatus.IN_PROGRESS
    case "Done":
      return DbTaskStatus.DONE
    default:
      return null
  }
}

export function userToApi(u: Pick<PrismaUser, "id" | "name" | "email" | "avatarUrl" | "image">): User {
  return {
    id: u.id,
    name: u.name || "Anonymous User",
    email: u.email,
    avatarUrl: u.image ?? u.avatarUrl ?? undefined,
  }
}

export function taskToApi(t: PrismaTask & { _count?: { comments: number } }): Task {
  return {
    id: t.id,
    projectId: t.projectId,
    title: t.title,
    description: t.description,
    status: taskStatusToApi(t.status),
    assignedTo: t.assignedToId ?? "",
    dueDate: t.dueDate.toISOString().slice(0, 10),
    createdAt: t.createdAt.toISOString(),
    commentCount: t._count?.comments || 0,
  }
}

export function commentToApi(
  c: { id: string; taskId: string; content: string; createdAt: Date; author: Pick<PrismaUser, "id" | "name" | "email" | "avatarUrl" | "image"> }
): import("@/lib/types").Comment {
  return {
    id: c.id,
    taskId: c.taskId,
    content: c.content,
    createdAt: c.createdAt.toISOString(),
    author: userToApi(c.author),
  }
}

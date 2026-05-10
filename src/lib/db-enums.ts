/** Stored in SQLite as strings */
export const DbRole = {
  ADMIN: "ADMIN",
  MEMBER: "MEMBER",
} as const

export type DbRoleValue = (typeof DbRole)[keyof typeof DbRole]

export const DbTaskStatus = {
  TODO: "TODO",
  IN_PROGRESS: "IN_PROGRESS",
  DONE: "DONE",
} as const

export type DbTaskStatusValue = (typeof DbTaskStatus)[keyof typeof DbTaskStatus]

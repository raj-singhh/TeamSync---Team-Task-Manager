"use client"

import { use, useCallback, useEffect, useState } from "react"
import { TaskCard } from "@/components/tasks/task-card"
import { TaskDetailDialog } from "@/components/tasks/task-detail-dialog"
import { TaskEditDialog } from "@/components/tasks/task-edit-dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Users, Layout, Search, Filter, MoreVertical, Pencil, Settings } from "lucide-react"
import { Input } from "@/components/ui/input"
import { AISuggestModal } from "@/components/tasks/ai-suggest-modal"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CreateTaskDialog } from "@/components/projects/create-task-dialog"
import { InviteMemberDialog } from "@/components/projects/invite-member-dialog"
import { ProjectEditDialog } from "@/components/projects/project-edit-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { apiFetch } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import type { Role, Task, TaskStatus, User } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"

type MemberRow = { userId: string; role: Role; user: User }

type TaskRow = Task & { assignee: User | null }

type ProjectPayload = {
  id: string
  title: string
  description: string
  ownerId: string
  createdAt: string
  currentUserId: string
  myRole: Role
  canAdmin: boolean
  members: MemberRow[]
  tasks: TaskRow[]
}

const STATUSES: TaskStatus[] = ["To Do", "In Progress", "Done"]

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { toast } = useToast()
  const [payload, setPayload] = useState<ProjectPayload | null>(null)
  const [query, setQuery] = useState("")
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null)
  const [viewTask, setViewTask] = useState<TaskRow | null>(null)
  const [editTask, setEditTask] = useState<TaskRow | null>(null)
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await apiFetch<{ project: ProjectPayload }>(`/api/projects/${id}`)
      setPayload(res.project)
    } catch {
      toast({ variant: "destructive", title: "Could not load project" })
      setPayload(null)
    }
  }, [id, toast])

  useEffect(() => {
    void load()
  }, [load])

  const patchTask = async (taskId: string, body: Record<string, unknown>) => {
    try {
      await apiFetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      })
      await load()
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: err instanceof Error ? err.message : undefined,
      })
    }
  }

  const confirmDeleteTask = async () => {
    if (!deleteTaskId) return
    try {
      await apiFetch(`/api/tasks/${deleteTaskId}`, { method: "DELETE" })
      setDeleteTaskId(null)
      await load()
      toast({ title: "Task deleted" })
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Could not delete task",
        description: err instanceof Error ? err.message : undefined,
      })
    }
  }

  const patchMemberRole = async (userId: string, role: Role) => {
    try {
      await apiFetch(`/api/projects/${id}/members/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      })
      await load()
      toast({ title: "Role updated" })
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Could not update role",
        description: err instanceof Error ? err.message : undefined,
      })
    }
  }

  const removeMember = async (userId: string) => {
    try {
      await apiFetch(`/api/projects/${id}/members/${userId}`, { method: "DELETE" })
      await load()
      toast({ title: "Removed from project" })
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Could not remove member",
        description: err instanceof Error ? err.message : undefined,
      })
    }
  }

  if (!payload) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-12 w-full max-w-xl" />
        <Skeleton className="h-[500px]" />
      </div>
    )
  }

  const project = payload
  const tasks = project.tasks.filter((t) => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
  })

  const columns = STATUSES

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-3xl font-bold tracking-tight text-primary">{project.title}</h1>
            <Badge variant="outline" className="bg-primary/5 text-primary">
              Project
            </Badge>
            <Badge variant="secondary" className="text-[10px] uppercase">
              You: {project.myRole}
            </Badge>
          </div>
          <p className="text-muted-foreground max-w-2xl">{project.description}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {project.canAdmin && (
            <>
              <Button variant="outline" size="icon" onClick={() => setIsEditProjectOpen(true)} title="Project Settings">
                <Settings className="size-4" />
              </Button>
              <AISuggestModal
                projectId={id}
                projectDescription={project.description}
                members={project.members}
                canAssign
                currentUserId={project.currentUserId}
                onTasksAdded={() => void load()}
              />
              <CreateTaskDialog
                projectId={id}
                members={project.members}
                canAssign
                onCreated={() => void load()}
              />
              <ProjectEditDialog
                projectId={id}
                initialTitle={project.title}
                initialDescription={project.description}
                open={isEditProjectOpen}
                onOpenChange={setIsEditProjectOpen}
                onSaved={() => void load()}
              />
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  className="pl-9 bg-card"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" type="button" disabled aria-label="Filters coming soon">
                <Filter className="size-4" />
              </Button>
            </div>
          </div>

          <Tabs defaultValue="board" className="w-full">
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="board" className="flex items-center gap-2">
                <Layout className="size-4" />
                Board
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <Users className="size-4" />
                Team
              </TabsTrigger>
            </TabsList>

            <TabsContent value="board" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {columns.map((status) => (
                  <div key={status} className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                      <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        {status}
                        <Badge variant="secondary" className="text-[10px] font-bold">
                          {tasks.filter((t) => t.status === status).length}
                        </Badge>
                      </h3>
                    </div>
                    <div className="space-y-4 min-h-[500px] p-2 rounded-xl bg-muted/30 border-2 border-dashed border-transparent hover:border-muted-foreground/10 transition-colors">
                      {tasks
                        .filter((t) => t.status === status)
                        .map((task) => {
                          const assigneeUser =
                            task.assignee ??
                            project.members.find((m) => m.userId === task.assignedTo)?.user
                          const canEdit =
                            project.canAdmin ||
                            (task.assignedTo !== "" && task.assignedTo === project.currentUserId)

                          return (
                            <TaskCard
                              key={task.id}
                              task={task}
                              assignee={assigneeUser}
                              onOpenDetails={() => setViewTask(task)}
                              actions={
                                canEdit || project.canAdmin ? (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="size-8 shrink-0">
                                        <MoreVertical className="size-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56">
                                      <DropdownMenuLabel>Status</DropdownMenuLabel>
                                      {STATUSES.map((s) => (
                                        <DropdownMenuItem key={s} onClick={() => void patchTask(task.id, { status: s })}>
                                          {s}
                                        </DropdownMenuItem>
                                      ))}
                                      {canEdit && (
                                        <>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem
                                            onSelect={() => {
                                              setTimeout(() => setEditTask(task), 100)
                                            }}
                                          >
                                            <Pencil className="mr-2 size-4" />
                                            Edit task
                                          </DropdownMenuItem>
                                        </>
                                      )}
                                      {project.canAdmin && (
                                        <>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuLabel>Assign</DropdownMenuLabel>
                                          <DropdownMenuItem
                                            onClick={() => void patchTask(task.id, { assignedToId: null })}
                                          >
                                            Unassigned
                                          </DropdownMenuItem>
                                          {project.members.map((m) => (
                                            <DropdownMenuItem
                                              key={m.userId}
                                              onClick={() => void patchTask(task.id, { assignedToId: m.userId })}
                                            >
                                              {m.user.name}
                                            </DropdownMenuItem>
                                          ))}
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem
                                            className="text-destructive focus:text-destructive"
                                            onSelect={() => setTimeout(() => setDeleteTaskId(task.id), 100)}
                                          >
                                            Delete task
                                          </DropdownMenuItem>
                                        </>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                ) : undefined
                              }
                            />
                          )
                        })}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="list" className="mt-6">
              <div className="bg-card rounded-xl border p-6">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                  <h3 className="text-lg font-semibold">Team Members</h3>
                  {project.canAdmin && <InviteMemberDialog projectId={id} onInvited={() => void load()} />}
                </div>
                <div className="space-y-4">
                  {project.members.map((member) => {
                    const isOwner = member.userId === project.ownerId
                    return (
                      <div
                        key={member.userId}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={member.user.avatarUrl} />
                            <AvatarFallback>{member.user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium flex items-center gap-2 flex-wrap">
                              {member.user.name}
                              {isOwner && (
                                <Badge variant="outline" className="text-[10px]">
                                  Owner
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{member.user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {project.canAdmin && !isOwner ? (
                            <>
                              <Select
                                value={member.role}
                                onValueChange={(v) => void patchMemberRole(member.userId, v as Role)}
                              >
                                <SelectTrigger className="w-[130px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Admin">Admin</SelectItem>
                                  <SelectItem value="Member">Member</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button variant="outline" size="sm" onClick={() => void removeMember(member.userId)}>
                                Remove
                              </Button>
                            </>
                          ) : (
                            <Badge variant={member.role === "Admin" ? "default" : "secondary"}>{member.role}</Badge>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <TaskDetailDialog
        task={viewTask}
        projectTitle={project.title}
        assignee={
          viewTask
            ? (viewTask.assignee ??
              project.members.find((m) => m.userId === viewTask.assignedTo)?.user ??
              null)
            : null
        }
        open={!!viewTask}
        onOpenChange={(open) => !open && setViewTask(null)}
      />

      <TaskEditDialog
        task={editTask}
        open={!!editTask}
        onOpenChange={(open) => !open && setEditTask(null)}
        members={project.members}
        canAssign={project.canAdmin}
        onSaved={() => void load()}
      />

      <AlertDialog open={!!deleteTaskId} onOpenChange={(open) => !open && setDeleteTaskId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this task?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void confirmDeleteTask()}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

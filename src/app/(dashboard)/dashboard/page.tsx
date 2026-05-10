"use client"

import { useCallback, useEffect, useState } from "react"
import { TaskCard } from "@/components/tasks/task-card"
import { TaskDetailDialog } from "@/components/tasks/task-detail-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, ListTodo, Timer, AlertCircle } from "lucide-react"
import { apiFetch } from "@/lib/api-client"
import type { Task, User } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"

type DashboardPayload = {
  user: User | null
  stats: { todo: number; inProgress: number; done: number; overdue: number }
  tasks: (Task & { projectTitle: string; assignee: User | null })[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardPayload | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [viewTask, setViewTask] = useState<DashboardPayload["tasks"][number] | null>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      const res = await apiFetch<DashboardPayload>("/api/dashboard")
      setData(res)
    } catch {
      setError("Could not load dashboard")
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-destructive">
        {error}
      </div>
    )
  }

  if (!data) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    )
  }

  const { user, stats, tasks } = data

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          Welcome back{user ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your projects today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-muted">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">To Do</CardTitle>
            <ListTodo className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todo}</div>
            <p className="text-xs text-muted-foreground">Tasks pending start</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Timer className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">Currently working on</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-accent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="size-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.done}</div>
            <p className="text-xs text-muted-foreground">Tasks finished</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-destructive">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="size-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">Needs immediate attention</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          Your tasks
          <span className="text-sm font-normal text-muted-foreground">({tasks.length})</span>
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              assignee={task.assignee ?? undefined}
              projectTitle={task.projectTitle}
              onOpenDetails={() => setViewTask(task)}
            />
          ))}
          {tasks.length === 0 && (
            <div className="col-span-full h-48 border-2 border-dashed rounded-xl flex items-center justify-center text-muted-foreground">
              No tasks assigned to you yet.
            </div>
          )}
        </div>
      </div>

      <TaskDetailDialog
        task={viewTask}
        assignee={viewTask?.assignee ?? null}
        projectTitle={viewTask?.projectTitle}
        open={!!viewTask}
        onOpenChange={(open) => !open && setViewTask(null)}
      />
    </div>
  )
}

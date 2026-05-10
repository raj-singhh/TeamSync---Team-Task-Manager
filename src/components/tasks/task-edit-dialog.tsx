"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { apiFetch } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import type { Task, TaskStatus, User } from "@/lib/types"

type Member = { userId: string; user: User }

const STATUSES: TaskStatus[] = ["To Do", "In Progress", "Done"]

function dueDateToInputValue(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  return format(d, "yyyy-MM-dd")
}

export function TaskEditDialog({
  task,
  open,
  onOpenChange,
  members,
  canAssign,
  onSaved,
}: {
  task: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
  members: Member[]
  canAssign: boolean
  onSaved?: () => void
}) {
  const { toast } = useToast()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [status, setStatus] = useState<TaskStatus>("To Do")
  const [assignTo, setAssignTo] = useState<string>("unassigned")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!task || !open) return
    setTitle(task.title)
    setDescription(task.description)
    setDueDate(dueDateToInputValue(task.dueDate))
    setStatus(task.status)
    const aid = task.assignedTo
    setAssignTo(aid && aid !== "" ? aid : "unassigned")
  }, [task, open])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!task) return
    if (!title.trim() || !dueDate) {
      toast({ variant: "destructive", title: "Title and due date are required" })
      return
    }
    setSubmitting(true)
    try {
      const body: Record<string, unknown> = {
        title: title.trim(),
        description: description.trim(),
        dueDate: new Date(dueDate).toISOString(),
        status,
      }
      if (canAssign) {
        body.assignedToId =
          assignTo && assignTo !== "unassigned" ? assignTo : null
      }
      await apiFetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      })
      onOpenChange(false)
      onSaved?.()
      toast({ title: "Task updated" })
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Could not update task",
        description: err instanceof Error ? err.message : "Unknown error",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Edit task</DialogTitle>
            <DialogDescription>Update title, description, due date, and status.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-task-title">Title</Label>
              <Input
                id="edit-task-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-task-desc">Description</Label>
              <Textarea
                id="edit-task-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-task-due">Due date</Label>
                <Input
                  id="edit-task-due"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {canAssign && (
              <div className="space-y-2">
                <Label>Assign to</Label>
                <Select value={assignTo} onValueChange={setAssignTo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {members.map((m) => (
                      <SelectItem key={m.userId} value={m.userId}>
                        {m.user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import type { User } from "@/lib/types"
import { Plus } from "lucide-react"

type Member = { userId: string; user: User }

export function CreateTaskDialog({
  projectId,
  members,
  canAssign,
  onCreated,
  children,
}: {
  projectId: string
  members: Member[]
  canAssign: boolean
  onCreated?: () => void
  children?: React.ReactNode
}) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [status, setStatus] = useState<"To Do" | "In Progress" | "Done">("To Do")
  const [assignTo, setAssignTo] = useState<string>("unassigned")
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !dueDate) {
      toast({ variant: "destructive", title: "Title and due date are required" })
      return
    }
    setSubmitting(true)
    try {
      await apiFetch<{ task: unknown }>(`/api/projects/${projectId}/tasks`, {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          dueDate: new Date(dueDate).toISOString(),
          status,
          assignedToId:
            canAssign && assignTo && assignTo !== "unassigned"
              ? assignTo
              : undefined,
        }),
      })
      setOpen(false)
      setTitle("")
      setDescription("")
      setDueDate("")
      setStatus("To Do")
      setAssignTo("unassigned")
      onCreated?.()
      toast({ title: "Task created" })
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Could not create task",
        description: err instanceof Error ? err.message : "Unknown error",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? (
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 size-4" />
            Create Task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>New task</DialogTitle>
            <DialogDescription>Add a task to this project.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="task-title">Title</Label>
              <Input
                id="task-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-desc">Description</Label>
              <Textarea
                id="task-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="task-due">Due date</Label>
                <Input
                  id="task-due"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="To Do">To Do</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Done">Done</SelectItem>
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
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

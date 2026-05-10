"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, CheckCircle2, Circle, Timer } from "lucide-react"
import { format, isPast } from "date-fns"
import { cn } from "@/lib/utils"
import type { Task, User } from "@/lib/types"

const statusIcons = {
  "To Do": Circle,
  "In Progress": Timer,
  Done: CheckCircle2,
}

const statusColors = {
  "To Do": "bg-secondary text-secondary-foreground",
  "In Progress": "bg-primary/10 text-primary border-primary/20",
  Done: "bg-accent/20 text-accent-foreground border-accent/20",
}

export function TaskDetailDialog({
  task,
  assignee,
  projectTitle,
  open,
  onOpenChange,
}: {
  task: Task | null
  assignee?: User | null
  projectTitle?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!task) return null

  const Icon = statusIcons[task.status]
  const isOverdue = isPast(new Date(task.dueDate)) && task.status !== "Done"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={cn("text-[10px] uppercase tracking-wider font-bold", statusColors[task.status])}
            >
              <Icon className="size-3 mr-1" />
              {task.status}
            </Badge>
            {isOverdue && (
              <Badge variant="destructive" className="text-[10px]">
                Overdue
              </Badge>
            )}
          </div>
          {projectTitle && (
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide pt-1">
              {projectTitle}
            </p>
          )}
          <DialogTitle className="text-xl leading-snug pr-8">{task.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Description</p>
            <p className="text-foreground whitespace-pre-wrap break-words">
              {task.description.trim() || "No description"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="size-4 shrink-0" />
              <span>Due {format(new Date(task.dueDate), "PPP")}</span>
            </div>
            {assignee && (
              <div className="flex items-center gap-2">
                <Avatar className="size-7 border-2 border-background">
                  <AvatarImage src={assignee.avatarUrl} alt={assignee.name} />
                  <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-foreground">{assignee.name}</span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

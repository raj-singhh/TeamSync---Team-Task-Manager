"use client"

import type { ReactNode } from "react"
import { Task, User } from "@/lib/types"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, CheckCircle2, Circle, Timer, MessageSquare } from "lucide-react"
import { format, isPast } from "date-fns"
import { cn, truncateToWords } from "@/lib/utils"

interface TaskCardProps {
  task: Task
  assignee?: User | null
  projectTitle?: string
  actions?: ReactNode
  /** Opens full task details; card body becomes clickable when set. */
  onOpenDetails?: () => void
}

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

const PREVIEW_WORDS = 5

export function TaskCard({ task, assignee, projectTitle, actions, onOpenDetails }: TaskCardProps) {
  const Icon = statusIcons[task.status]
  const isOverdue = isPast(new Date(task.dueDate)) && task.status !== "Done"
  const preview = truncateToWords(task.description, PREVIEW_WORDS)

  function openDetails() {
    onOpenDetails?.()
  }

  return (
    <Card
      className={cn(
        "group relative flex min-h-[188px] flex-col hover:shadow-md transition-shadow",
        onOpenDetails && "cursor-pointer"
      )}
    >
      <div
        role={onOpenDetails ? "button" : undefined}
        tabIndex={onOpenDetails ? 0 : undefined}
        className={cn("flex flex-1 flex-col rounded-t-xl outline-none", onOpenDetails && "focus-visible:ring-2 focus-visible:ring-ring")}
        onClick={onOpenDetails ? openDetails : undefined}
        onKeyDown={
          onOpenDetails
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  openDetails()
                }
              }
            : undefined
        }
      >
        <CardHeader className="space-y-0 p-4 pb-2">
          <div className="flex items-start justify-between gap-2">
            <Badge
              variant="outline"
              className={cn("text-[10px] uppercase tracking-wider font-bold", statusColors[task.status])}
            >
              <Icon className="size-3 mr-1" />
              {task.status}
            </Badge>
            {isOverdue && (
              <Badge variant="destructive" className="text-[10px] animate-pulse">
                Overdue
              </Badge>
            )}
          </div>
          {projectTitle && (
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide pt-1">{projectTitle}</p>
          )}
          <CardTitle className="mt-2 line-clamp-2 text-base font-semibold leading-tight group-hover:text-primary transition-colors">
            {task.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col p-4 pt-0">
          <p className="line-clamp-2 min-h-[2.5rem] text-sm text-muted-foreground">
            {preview || <span className="italic opacity-70">No description</span>}
          </p>
        </CardContent>
      </div>
      <CardFooter className="mt-auto shrink-0 gap-2 border-t p-4 pt-3">
        <div className="flex min-w-0 flex-1 items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center">
            <Calendar className="mr-1 size-3 shrink-0" />
            <span className="truncate">{format(new Date(task.dueDate), "MMM d")}</span>
          </div>
          {(task.commentCount ?? 0) > 0 && (
            <div className="flex items-center text-accent" title={`${task.commentCount} comments`}>
              <MessageSquare className="mr-1 size-3 shrink-0" />
              <span className="font-medium">{task.commentCount}</span>
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {assignee && (
            <Avatar className="size-6 border-2 border-background">
              <AvatarImage src={assignee.avatarUrl} alt={assignee.name} />
              <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
            </Avatar>
          )}
          {actions}
        </div>
      </CardFooter>
    </Card>
  )
}

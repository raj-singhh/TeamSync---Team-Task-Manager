"use client"

import { Task, User } from "@/lib/types"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Clock, CheckCircle2, Circle, Timer } from "lucide-react"
import { format, isPast } from "date-fns"
import { cn } from "@/lib/utils"

interface TaskCardProps {
  task: Task
  assignee?: User
}

const statusIcons = {
  "To Do": Circle,
  "In Progress": Timer,
  "Done": CheckCircle2,
}

const statusColors = {
  "To Do": "bg-secondary text-secondary-foreground",
  "In Progress": "bg-primary/10 text-primary border-primary/20",
  "Done": "bg-accent/20 text-accent-foreground border-accent/20",
}

export function TaskCard({ task, assignee }: TaskCardProps) {
  const Icon = statusIcons[task.status]
  const isOverdue = isPast(new Date(task.dueDate)) && task.status !== "Done"

  return (
    <Card className="group relative hover:shadow-md transition-shadow">
      <CardHeader className="p-4 pb-2 space-y-0">
        <div className="flex items-start justify-between gap-2">
          <Badge variant="outline" className={cn("text-[10px] uppercase tracking-wider font-bold", statusColors[task.status])}>
            <Icon className="size-3 mr-1" />
            {task.status}
          </Badge>
          {isOverdue && (
            <Badge variant="destructive" className="text-[10px] animate-pulse">
              Overdue
            </Badge>
          )}
        </div>
        <CardTitle className="text-base font-semibold mt-2 leading-tight group-hover:text-primary transition-colors">
          {task.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {task.description}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between border-t mt-2">
        <div className="flex items-center text-xs text-muted-foreground mt-2">
          <Calendar className="size-3 mr-1" />
          {format(new Date(task.dueDate), "MMM d")}
        </div>
        <div className="flex -space-x-2 mt-2">
          {assignee && (
            <Avatar className="size-6 border-2 border-background">
              <AvatarImage src={assignee.avatarUrl} alt={assignee.name} />
              <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
            </Avatar>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
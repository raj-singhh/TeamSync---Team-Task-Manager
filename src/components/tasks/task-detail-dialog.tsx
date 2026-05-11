"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, CheckCircle2, Circle, Timer, MessageSquare } from "lucide-react"
import { format, isPast, formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import type { Task, User, Comment } from "@/lib/types"
import { apiFetch } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"

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
  onCommentAdded,
}: {
  task: Task | null
  assignee?: User | null
  projectTitle?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onCommentAdded?: () => void
}) {
  const { toast } = useToast()
  const [comments, setComments] = useState<Comment[]>([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    if (open && task) {
      setLoadingComments(true)
      apiFetch<{ comments: Comment[] }>(`/api/tasks/${task.id}/comments`)
        .then((res) => setComments(res.comments))
        .catch(() => toast({ variant: "destructive", title: "Failed to load comments" }))
        .finally(() => setLoadingComments(false))
    } else {
      setComments([])
      setNewComment("")
    }
  }, [open, task, toast])

  if (!task) return null

  const Icon = statusIcons[task.status]
  const isOverdue = isPast(new Date(task.dueDate)) && task.status !== "Done"

  async function postComment() {
    if (!newComment.trim() || !task) return
    setPosting(true)
    try {
      const res = await apiFetch<{ comment: Comment }>(`/api/tasks/${task.id}/comments`, {
        method: "POST",
        body: JSON.stringify({ content: newComment }),
      })
      setComments((prev) => [...prev, res.comment])
      setNewComment("")
      onCommentAdded?.()
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Could not post comment",
        description: err instanceof Error ? err.message : undefined,
      })
    } finally {
      setPosting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col p-0 gap-0">
        <div className="p-6 pb-4 border-b shrink-0">
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
            <DialogTitle className="text-xl leading-snug pr-8 pt-1">{task.title}</DialogTitle>
          </DialogHeader>
        </div>

        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Description</p>
                <p className="text-foreground whitespace-pre-wrap break-words leading-relaxed">
                  {task.description.trim() || <span className="italic opacity-70">No description provided.</span>}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground pt-2">
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
                    <span className="text-foreground font-medium">{assignee.name}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t">
              <div className="flex items-center gap-2 text-primary font-semibold">
                <MessageSquare className="size-4" />
                <h3>Comments ({comments.length})</h3>
              </div>
              
              {loadingComments ? (
                <p className="text-sm text-muted-foreground animate-pulse">Loading comments...</p>
              ) : comments.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No comments yet. Start the discussion!</p>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="size-8 border shrink-0">
                        <AvatarImage src={comment.author.avatarUrl} alt={comment.author.name} />
                        <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold truncate">{comment.author.name}</span>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words bg-muted/50 p-3 rounded-xl rounded-tl-none border">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-muted/20 shrink-0">
          <div className="flex flex-col gap-2">
            <Textarea
              placeholder="Write a comment..."
              className="resize-none min-h-[80px]"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={posting}
            />
            <div className="flex justify-end">
              <Button size="sm" onClick={postComment} disabled={posting || !newComment.trim()}>
                {posting ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

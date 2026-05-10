"use client"

import { useState } from "react"
import { aiTaskSuggester } from "@/ai/flows/ai-task-suggester-flow"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Sparkles, Loader2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api-client"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { User } from "@/lib/types"

type Member = { userId: string; user: User }

type SelectableRow = { id: string; label: string }

function parseSuggestionText(text: string): { title: string; description: string } {
  const trimmed = text.trim()
  const nl = trimmed.indexOf("\n")
  if (nl === -1) {
    return { title: trimmed.slice(0, 200) || "Untitled task", description: "" }
  }
  const title = trimmed.slice(0, nl).trim().slice(0, 200) || "Untitled task"
  const description = trimmed.slice(nl + 1).trim().slice(0, 5000)
  return { title, description }
}

function defaultDueIso(): string {
  const d = new Date()
  d.setDate(d.getDate() + 7)
  d.setHours(12, 0, 0, 0)
  return d.toISOString()
}

interface AISuggestModalProps {
  projectId: string
  projectDescription: string
  members: Member[]
  /** Project admins can assign to anyone; members only see “Unassigned” or “Assign to me”. */
  canAssign: boolean
  currentUserId: string
  onTasksAdded?: () => void
}

export function AISuggestModal({
  projectId,
  projectDescription,
  members,
  canAssign,
  currentUserId,
  onTasksAdded,
}: AISuggestModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState(false)
  const [suggestions, setSuggestions] = useState<{ subTasks: string[]; actionItems: string[] } | null>(
    null
  )
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const [assignTo, setAssignTo] = useState<string>("unassigned")

  const resetDialog = () => {
    setSuggestions(null)
    setSelectedIds([])
    setAssignTo("unassigned")
  }

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) resetDialog()
  }

  const handleSuggest = async () => {
    setLoading(true)
    try {
      const result = await aiTaskSuggester({ projectDescription })
      setSuggestions(result)
    } catch {
      toast({
        title: "Error",
        description: "Failed to generate suggestions. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const rowsFromSuggestions = (): SelectableRow[] => {
    if (!suggestions) return []
    const sub = suggestions.subTasks.map((label, idx) => ({
      id: `sub-${idx}`,
      label,
    }))
    const act = suggestions.actionItems.map((label, idx) => ({
      id: `act-${idx}`,
      label,
    }))
    return [...sub, ...act]
  }

  const toggleId = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const handleAddTasks = async () => {
    if (selectedIds.length === 0) return

    const rows = rowsFromSuggestions()
    const selectedRows = rows.filter((r) => selectedIds.includes(r.id))
    if (selectedRows.length === 0) return

    let assignedToId: string | undefined
    if (canAssign) {
      assignedToId = assignTo !== "unassigned" ? assignTo : undefined
    } else {
      assignedToId = assignTo === currentUserId ? currentUserId : undefined
    }

    setAdding(true)
    try {
      const dueDate = defaultDueIso()
      for (const row of selectedRows) {
        const { title, description } = parseSuggestionText(row.label)
        await apiFetch(`/api/projects/${projectId}/tasks`, {
          method: "POST",
          body: JSON.stringify({
            title,
            description,
            dueDate,
            status: "To Do",
            assignedToId,
          }),
        })
      }
      toast({
        title: "Tasks added",
        description: `${selectedRows.length} task(s) were added to this project (To Do). Default due date is one week from today—you can edit each task on the board.`,
      })
      handleOpenChange(false)
      onTasksAdded?.()
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Could not add tasks",
        description: err instanceof Error ? err.message : "Unknown error",
      })
    } finally {
      setAdding(false)
    }
  }

  const preview = projectDescription.length > 50 ? `${projectDescription.substring(0, 50)}…` : projectDescription

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-accent border-accent hover:bg-accent hover:text-white">
          <Sparkles className="mr-2 size-4" />
          AI Task Suggest
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-accent" />
            AI Task Suggester
          </DialogTitle>
          <DialogDescription>
            Suggestions are created as real tasks in <strong>this project</strong> when you click &quot;Add selected
            tasks&quot;. Use Create Task for full control (dates, status). Assignment below applies to every selected
            task in one batch.
          </DialogDescription>
        </DialogHeader>

        {!suggestions ? (
          <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
            <div className="size-16 rounded-full bg-accent/10 flex items-center justify-center">
              <Sparkles className="size-8 text-accent" />
            </div>
            <div>
              <p className="font-medium">Ready to brainstorm?</p>
              <p className="text-sm text-muted-foreground max-w-sm">
                We&apos;ll analyze &quot;{preview}&quot; to suggest logical steps.
              </p>
            </div>
            <Button onClick={handleSuggest} disabled={loading} className="bg-accent hover:bg-accent/90">
              {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
              Generate Suggestions
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <ScrollArea className="h-[320px] pr-4">
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">
                    Suggested Tasks
                  </h4>
                  <div className="space-y-2">
                    {suggestions.subTasks.map((task, idx) => {
                      const id = `sub-${idx}`
                      return (
                        <div key={id} className="flex items-start space-x-3 p-3 rounded-lg border bg-accent/5">
                          <Checkbox
                            id={id}
                            checked={selectedIds.includes(id)}
                            onCheckedChange={() => toggleId(id)}
                          />
                          <label htmlFor={id} className="text-sm leading-snug cursor-pointer">
                            {task}
                          </label>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">
                    Action Items
                  </h4>
                  <div className="space-y-2">
                    {suggestions.actionItems.map((item, idx) => {
                      const id = `act-${idx}`
                      return (
                        <div key={id} className="flex items-start space-x-3 p-3 rounded-lg border">
                          <Checkbox
                            id={id}
                            checked={selectedIds.includes(id)}
                            onCheckedChange={() => toggleId(id)}
                          />
                          <label htmlFor={id} className="text-sm leading-snug cursor-pointer">
                            {item}
                          </label>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </ScrollArea>

            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <div className="space-y-2">
                <Label>Assign selected tasks</Label>
                {canAssign ? (
                  <Select value={assignTo} onValueChange={setAssignTo}>
                    <SelectTrigger>
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned (assign later)</SelectItem>
                      {members.map((m) => (
                        <SelectItem key={m.userId} value={m.userId}>
                          {m.user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Select value={assignTo} onValueChange={setAssignTo}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned (assign later)</SelectItem>
                      <SelectItem value={currentUserId}>Assign to me</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                <p className="text-xs text-muted-foreground">
                  New tasks default to <strong>To Do</strong> with due date one week from today. You can change these on
                  the board.
                </p>
              </div>
            </div>

            <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between w-full">
              <p className="text-xs text-muted-foreground">{selectedIds.length} selected</p>
              <div className="flex gap-2">
                <Button variant="ghost" type="button" onClick={() => setSuggestions(null)}>
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={() => void handleAddTasks()}
                  disabled={selectedIds.length === 0 || adding}
                  className="bg-accent hover:bg-accent/90"
                >
                  {adding ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                  Add selected tasks
                </Button>
              </div>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

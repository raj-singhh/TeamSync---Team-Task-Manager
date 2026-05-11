"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { apiFetch } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

export function ProjectEditDialog({
  projectId,
  initialTitle,
  initialDescription,
  open,
  onOpenChange,
  onSaved,
}: {
  projectId: string
  initialTitle: string
  initialDescription: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [pending, setPending] = useState(false)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const title = String(fd.get("title") ?? "").trim()
    const description = String(fd.get("description") ?? "").trim()

    if (!title) {
      toast({ variant: "destructive", title: "Title is required" })
      return
    }

    setPending(true)
    try {
      await apiFetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        body: JSON.stringify({ title, description }),
      })
      toast({ title: "Project updated" })
      onOpenChange(false)
      setTimeout(() => onSaved(), 300)
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Could not update project",
        description: err instanceof Error ? err.message : undefined,
      })
    } finally {
      setPending(false)
    }
  }

  async function handleDelete() {
    setPending(true)
    try {
      await apiFetch(`/api/projects/${projectId}`, { method: "DELETE" })
      toast({ title: "Project deleted" })
      setShowDeleteAlert(false)
      onOpenChange(false)
      
      // Delay navigation so Radix UI has time to cleanly remove pointer-events lock
      setTimeout(() => {
        router.push("/projects")
        router.refresh()
      }, 300)
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Could not delete project",
        description: err instanceof Error ? err.message : undefined,
      })
      setPending(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>Update project details or delete the project entirely.</DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Project Title</Label>
              <Input id="title" name="title" defaultValue={initialTitle} required disabled={pending} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={initialDescription}
                rows={3}
                disabled={pending}
              />
            </div>
            <div className="flex flex-col-reverse sm:flex-row justify-between gap-2 pt-4">
              <Button
                type="button"
                variant="destructive"
                disabled={pending}
                onClick={(e) => {
                  e.preventDefault()
                  onOpenChange(false)
                  setTimeout(() => setShowDeleteAlert(true), 200)
                }}
              >
                Delete Project
              </Button>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
                  Cancel
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project
              <strong> {initialTitle}</strong> and remove all its tasks and member associations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault()
                void handleDelete()
              }}
              disabled={pending}
            >
              {pending ? "Deleting..." : "Yes, delete project"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Users, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
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
import { apiFetch } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import type { Role } from "@/lib/types"

type ProjectRow = {
  id: string
  title: string
  description: string
  ownerId: string
  createdAt: string
  memberCount: number
  myRole: Role
}

export default function ProjectsPage() {
  const { toast } = useToast()
  const [projects, setProjects] = useState<ProjectRow[] | null>(null)
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await apiFetch<{ projects: ProjectRow[] }>("/api/projects")
      setProjects(res.projects)
    } catch {
      toast({ variant: "destructive", title: "Could not load projects" })
      setProjects([])
    }
  }, [toast])

  useEffect(() => {
    void load()
  }, [load])

  async function createProject(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSubmitting(true)
    try {
      await apiFetch("/api/projects", {
        method: "POST",
        body: JSON.stringify({ title: title.trim(), description: description.trim() }),
      })
      setOpen(false)
      setTitle("")
      setDescription("")
      await load()
      toast({ title: "Project created" })
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Could not create project",
        description: err instanceof Error ? err.message : undefined,
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (!projects) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Projects</h1>
          <p className="text-muted-foreground max-w-2xl">
            Pick a project below to open its board and team. Use Create task or AI Task Suggest on that page—tasks are
            always created for the project you have open.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 size-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={createProject}>
              <DialogHeader>
                <DialogTitle>New project</DialogTitle>
                <DialogDescription>Create a container for tasks and team members.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="p-title">Title</Label>
                  <Input id="p-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p-desc">Description</Label>
                  <Textarea id="p-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Creating…" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className="flex flex-col hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="size-10 rounded-lg bg-primary/5 flex items-center justify-center mb-4">
                  <span className="text-primary font-bold text-lg">{project.title.charAt(0)}</span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant="secondary" className="text-[10px] uppercase">
                    {project.memberCount} Members
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    You: {project.myRole}
                  </Badge>
                </div>
              </div>
              <CardTitle className="text-xl">{project.title}</CardTitle>
              <CardDescription className="line-clamp-2 mt-2">{project.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="flex items-center gap-2 mt-auto text-sm text-muted-foreground">
                <Users className="size-4 shrink-0" />
                <span>{project.memberCount} people</span>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="ghost" className="w-full text-primary hover:text-primary hover:bg-primary/5 group" asChild>
                <Link href={`/projects/${project.id}`}>
                  View Project
                  <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      {projects.length === 0 && (
        <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          No projects yet. Create one to get started.
        </div>
      )}
    </div>
  )
}

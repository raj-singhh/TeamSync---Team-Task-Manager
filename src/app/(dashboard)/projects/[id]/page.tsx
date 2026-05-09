"use client"

import { use, useState } from "react"
import { mockProjects, mockTasks, mockUsers } from "@/lib/mock-data"
import { TaskCard } from "@/components/tasks/task-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Plus, Users, Layout, Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { AISuggestModal } from "@/components/tasks/ai-suggest-modal"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const project = mockProjects.find(p => p.id === id)
  const tasks = mockTasks.filter(t => t.projectId === id)
  const members = project?.members.map(m => ({
    ...m,
    user: mockUsers.find(u => u.id === m.userId)
  }))

  if (!project) return <div>Project not found</div>

  const columns = ["To Do", "In Progress", "Done"]

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-primary">{project.title}</h1>
            <Badge variant="outline" className="bg-primary/5 text-primary">Project</Badge>
          </div>
          <p className="text-muted-foreground max-w-2xl">{project.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <AISuggestModal projectDescription={project.description} />
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 size-4" />
            Create Task
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input placeholder="Search tasks..." className="pl-9 bg-card" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="size-4" />
              </Button>
            </div>
          </div>

          <Tabs defaultValue="board" className="w-full">
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="board" className="flex items-center gap-2">
                <Layout className="size-4" />
                Board
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <Users className="size-4" />
                Team
              </TabsTrigger>
            </TabsList>

            <TabsContent value="board" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {columns.map(status => (
                  <div key={status} className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                      <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        {status}
                        <Badge variant="secondary" className="text-[10px] font-bold">
                          {tasks.filter(t => t.status === status).length}
                        </Badge>
                      </h3>
                    </div>
                    <div className="space-y-4 min-h-[500px] p-2 rounded-xl bg-muted/30 border-2 border-dashed border-transparent hover:border-muted-foreground/10 transition-colors">
                      {tasks.filter(t => t.status === status).map(task => (
                        <TaskCard 
                          key={task.id} 
                          task={task} 
                          assignee={mockUsers.find(u => u.id === task.assignedTo)} 
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="list" className="mt-6">
              <div className="bg-card rounded-xl border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Team Members</h3>
                  <Button variant="outline" size="sm">Invite Member</Button>
                </div>
                <div className="space-y-4">
                  {members?.map(member => (
                    <div key={member.userId} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors border">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={member.user?.avatarUrl} />
                          <AvatarFallback>{member.user?.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.user?.name}</p>
                          <p className="text-sm text-muted-foreground">{member.user?.email}</p>
                        </div>
                      </div>
                      <Badge variant={member.role === "Admin" ? "default" : "secondary"}>
                        {member.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
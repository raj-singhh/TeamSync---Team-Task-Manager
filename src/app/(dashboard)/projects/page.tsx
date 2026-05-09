"use client"

import { useState } from "react"
import Link from "next/link"
import { mockProjects, mockUsers } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Users, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function ProjectsPage() {
  const [projects] = useState(mockProjects)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Projects</h1>
          <p className="text-muted-foreground">Manage your team's project containers.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 size-4" />
          New Project
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className="flex flex-col hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="size-10 rounded-lg bg-primary/5 flex items-center justify-center mb-4">
                  <span className="text-primary font-bold text-lg">{project.title.charAt(0)}</span>
                </div>
                <Badge variant="secondary" className="text-[10px] uppercase">
                  {project.members.length} Members
                </Badge>
              </div>
              <CardTitle className="text-xl">{project.title}</CardTitle>
              <CardDescription className="line-clamp-2 mt-2">
                {project.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="flex items-center gap-2 mt-auto">
                <Users className="size-4 text-muted-foreground" />
                <div className="flex -space-x-2">
                  {project.members.slice(0, 3).map((member) => {
                    const user = mockUsers.find(u => u.id === member.userId)
                    return (
                      <div key={member.userId} className="size-6 rounded-full border-2 border-background bg-muted overflow-hidden">
                        {user?.avatarUrl && <img src={user.avatarUrl} alt={user.name} />}
                      </div>
                    )
                  })}
                  {project.members.length > 3 && (
                    <div className="size-6 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-[10px] font-bold">
                      +{project.members.length - 3}
                    </div>
                  )}
                </div>
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
    </div>
  )
}
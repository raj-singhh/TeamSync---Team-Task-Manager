"use client"

import { useState, useEffect } from "react"
import { mockTasks, mockUsers, mockProjects } from "@/lib/mock-data"
import { TaskCard } from "@/components/tasks/task-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, ListTodo, Timer, AlertCircle } from "lucide-react"

export default function DashboardPage() {
  const currentUser = mockUsers[0] // Mock current user as Alex Rivera
  const userTasks = mockTasks.filter(t => t.assignedTo === currentUser.id)
  
  const stats = {
    todo: userTasks.filter(t => t.status === "To Do").length,
    inProgress: userTasks.filter(t => t.status === "In Progress").length,
    done: userTasks.filter(t => t.status === "Done").length,
    overdue: userTasks.filter(t => t.status !== "Done" && new Date(t.dueDate) < new Date()).length
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Welcome back, {currentUser.name}</h1>
        <p className="text-muted-foreground">Here's what's happening with your projects today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-muted">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">To Do</CardTitle>
            <ListTodo className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todo}</div>
            <p className="text-xs text-muted-foreground">Tasks pending start</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Timer className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">Currently working on</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-accent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="size-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.done}</div>
            <p className="text-xs text-muted-foreground">Tasks finished</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-destructive">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="size-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">Needs immediate attention</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          Your Recent Tasks
          <span className="text-sm font-normal text-muted-foreground">({userTasks.length})</span>
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {userTasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              assignee={currentUser} 
            />
          ))}
          {userTasks.length === 0 && (
            <div className="col-span-full h-48 border-2 border-dashed rounded-xl flex items-center justify-center text-muted-foreground">
              No tasks assigned to you yet.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
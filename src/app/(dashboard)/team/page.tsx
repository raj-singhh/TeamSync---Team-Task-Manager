"use client"

import { useCallback, useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { apiFetch } from "@/lib/api-client"
import type { User } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"

export default function TeamPage() {
  const [teammates, setTeammates] = useState<User[] | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await apiFetch<{ teammates: User[] }>("/api/teammates")
      setTeammates(res.teammates)
    } catch {
      setTeammates([])
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  if (!teammates) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Team</h1>
        <p className="text-muted-foreground">People you share projects with.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Teammates</CardTitle>
          <CardDescription>Everyone who appears on at least one project with you.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {teammates.length === 0 ? (
            <p className="text-muted-foreground text-sm">Join or create a project to see teammates here.</p>
          ) : (
            teammates.map((u) => (
              <div key={u.id} className="flex items-center gap-4 py-2 border-b last:border-0">
                <Avatar>
                  <AvatarImage src={u.avatarUrl} />
                  <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-sm text-muted-foreground">{u.email}</p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState } from "react"
import { CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { updateProfile } from "./actions"
import { useToast } from "@/hooks/use-toast"

export function ProfileForm({ user }: { user: { name: string; email: string } }) {
  const { toast } = useToast()
  const [pending, setPending] = useState(false)

  async function action(formData: FormData) {
    setPending(true)
    const res = await updateProfile(formData)
    setPending(false)
    if (res?.error) {
      toast({ variant: "destructive", title: "Update failed", description: res.error })
    } else {
      toast({ title: "Profile updated", description: "Your name has been updated successfully." })
    }
  }

  return (
    <form action={action}>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" defaultValue={user.name} required minLength={2} disabled={pending} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={user.email} disabled className="bg-muted/50" />
          <p className="text-xs text-muted-foreground">Email addresses cannot be changed here.</p>
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save Changes"}
        </Button>
      </CardContent>
    </form>
  )
}

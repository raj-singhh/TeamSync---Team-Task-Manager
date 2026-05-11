"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { updateProfile, updatePassword } from "./actions"
import { useToast } from "@/hooks/use-toast"

export function ProfileForm({ user }: { user: { name: string; email: string } }) {
  const { toast } = useToast()
  const [pendingProfile, setPendingProfile] = useState(false)
  const [pendingPassword, setPendingPassword] = useState(false)

  async function handleProfile(formData: FormData) {
    setPendingProfile(true)
    const res = await updateProfile(formData)
    setPendingProfile(false)
    if (res?.error) {
      toast({ variant: "destructive", title: "Update failed", description: res.error })
    } else {
      toast({ title: "Profile updated", description: "Your name has been updated successfully." })
    }
  }

  async function handlePassword(formData: FormData) {
    setPendingPassword(true)
    const res = await updatePassword(formData)
    setPendingPassword(false)
    if (res?.error) {
      toast({ variant: "destructive", title: "Update failed", description: res.error })
    } else {
      toast({ title: "Password updated", description: "Your password has been set successfully." })
      // Clear the input
      const form = document.getElementById("password-form") as HTMLFormElement
      if (form) form.reset()
    }
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Information from your TeamSync account.</CardDescription>
        </CardHeader>
        <form action={handleProfile}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={user.name} required minLength={2} disabled={pendingProfile} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={user.email} disabled className="bg-muted/50" />
              <p className="text-xs text-muted-foreground">Email addresses cannot be changed here.</p>
            </div>
            <Button type="submit" disabled={pendingProfile}>
              {pendingProfile ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Set or change your password to enable manual login.</CardDescription>
        </CardHeader>
        <form id="password-form" action={handlePassword}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input id="password" name="password" type="password" required minLength={8} disabled={pendingPassword} />
              <p className="text-xs text-muted-foreground">Must be at least 8 characters long.</p>
            </div>
            <Button type="submit" disabled={pendingPassword} variant="secondary">
              {pendingPassword ? "Updating..." : "Update Password"}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  )
}

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getSessionUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { ProfileForm } from "./profile-form"

export default async function SettingsPage() {
  const user = await getSessionUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="space-y-8 max-w-lg">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Settings</h1>
        <p className="text-muted-foreground">Your account details.</p>
      </div>

      <ProfileForm user={user} />
    </div>
  )
}

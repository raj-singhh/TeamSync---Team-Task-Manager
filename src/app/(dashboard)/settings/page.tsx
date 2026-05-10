import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { getSessionUser } from "@/lib/session"
import { redirect } from "next/navigation"

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

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Information from your TeamSync account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={user.name} readOnly className="bg-muted/50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={user.email} readOnly className="bg-muted/50" />
          </div>
          <p className="text-xs text-muted-foreground pt-2">
            Profile editing can be added later; credentials are stored securely in the database.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

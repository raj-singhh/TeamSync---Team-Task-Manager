"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FolderKanban } from "lucide-react"
import { apiFetch, ApiError } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

export default function SignupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [pending, setPending] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const first = String(fd.get("first-name") ?? "").trim()
    const last = String(fd.get("last-name") ?? "").trim()
    const email = String(fd.get("email") ?? "")
    const password = String(fd.get("password") ?? "")
    const name = [first, last].filter(Boolean).join(" ") || first || last
    if (!name) {
      toast({ variant: "destructive", title: "Enter your name" })
      return
    }
    if (password.length < 8) {
      toast({ variant: "destructive", title: "Password must be at least 8 characters" })
      return
    }
    setPending(true)
    try {
      await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, name }),
      })
      router.push("/dashboard")
      router.refresh()
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Could not create account"
      toast({ variant: "destructive", title: "Signup failed", description: msg })
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-accent">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="size-12 rounded-xl bg-accent flex items-center justify-center mb-4 text-white">
            <FolderKanban className="size-7" />
          </div>
          <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
          <CardDescription>
            Join your team and start managing tasks efficiently
          </CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first-name">First Name</Label>
                <Input id="first-name" name="first-name" placeholder="Alex" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">Last Name</Label>
                <Input id="last-name" name="last-name" placeholder="Rivera" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="alex@teamsync.com" required autoComplete="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" />
              <p className="text-xs text-muted-foreground">At least 8 characters</p>
            </div>
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-white font-semibold" disabled={pending}>
              {pending ? "Creating…" : "Create Account"}
            </Button>
          </CardContent>
        </form>
        <CardFooter className="flex flex-col space-y-4 text-center">
          <div className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-accent font-medium hover:underline">
              Sign in here
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

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

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [pending, setPending] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const email = String(fd.get("email") ?? "")
    const password = String(fd.get("password") ?? "")
    setPending(true)
    try {
      await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      })
      router.push("/dashboard")
      router.refresh()
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Sign in failed"
      toast({ variant: "destructive", title: "Sign in failed", description: msg })
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="size-12 rounded-xl bg-primary flex items-center justify-center mb-4">
            <FolderKanban className="size-7 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to TeamSync</CardTitle>
          <CardDescription>
            Enter your credentials to access your workspace
          </CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="alex@example.com" required autoComplete="email" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <span className="text-sm text-muted-foreground">Use the password you chose at signup</span>
              </div>
              <Input id="password" name="password" type="password" required autoComplete="current-password" />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={pending}>
              {pending ? "Signing in…" : "Sign In"}
            </Button>
          </CardContent>
        </form>
        <CardFooter className="flex flex-col space-y-4 text-center">
          <div className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-primary font-medium hover:underline">
              Create one for free
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { apiFetch } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

export function InviteMemberDialog({
  projectId,
  onInvited,
}: {
  projectId: string
  onInvited?: () => void
}) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<"Admin" | "Member">("Member")
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setSubmitting(true)
    try {
      await apiFetch(`/api/projects/${projectId}/members`, {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), role }),
      })
      setOpen(false)
      setEmail("")
      setRole("Member")
      onInvited?.()
      toast({ title: "Member added" })
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Invite failed",
        description: err instanceof Error ? err.message : "Unknown error",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Invite member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Invite teammate</DialogTitle>
            <DialogDescription>
              They must already have a TeamSync account with this email.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@company.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as "Admin" | "Member")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Member">Member</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Adding…" : "Add to project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

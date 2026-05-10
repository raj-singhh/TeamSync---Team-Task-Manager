"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, FolderKanban, Users, Settings, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { apiFetch } from "@/lib/api-client"

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", href: "/projects", icon: FolderKanban },
  { name: "Team", href: "/team", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function MainNav() {
  const pathname = usePathname()
  const router = useRouter()

  async function signOut() {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" })
    } catch {
      /* still navigate away */
    }
    router.push("/login")
    router.refresh()
  }

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r bg-card md:flex">
      <div className="flex h-16 items-center px-6 border-b">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
            <FolderKanban className="size-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight text-primary">TeamSync</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="mr-3 size-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground"
          type="button"
          onClick={() => void signOut()}
        >
          <LogOut className="mr-3 size-5" />
          Sign Out
        </Button>
      </div>
    </aside>
  )
}

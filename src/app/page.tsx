import { redirect } from "next/navigation"

export default function HomePage() {
  // Redirect to login as the entry point
  redirect('/login')
}

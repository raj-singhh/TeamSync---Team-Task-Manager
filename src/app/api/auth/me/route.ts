import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/session"
import { userToApi } from "@/lib/mappers"

export async function GET() {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return NextResponse.json({ user: userToApi(user) })
}

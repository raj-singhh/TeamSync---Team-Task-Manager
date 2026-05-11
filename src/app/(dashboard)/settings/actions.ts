"use server"

import { getSessionUserId } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function updateProfile(formData: FormData) {
  const userId = await getSessionUserId()
  if (!userId) {
    return { error: "Not authenticated" }
  }

  const name = formData.get("name")?.toString().trim()
  if (!name || name.length < 2) {
    return { error: "Name must be at least 2 characters" }
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { name },
    })
    revalidatePath("/settings")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    return { error: "Failed to update profile" }
  }
}

export async function updatePassword(formData: FormData) {
  const userId = await getSessionUserId()
  if (!userId) {
    return { error: "Not authenticated" }
  }

  const password = formData.get("password")?.toString()
  if (!password || password.length < 8) {
    return { error: "Password must be at least 8 characters" }
  }

  try {
    const bcrypt = (await import("bcryptjs")).default
    const passwordHash = await bcrypt.hash(password, 10)

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    })
    
    return { success: true }
  } catch (error) {
    return { error: "Failed to update password" }
  }
}

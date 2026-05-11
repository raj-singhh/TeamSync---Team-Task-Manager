"use server"

import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function registerUser(formData: FormData) {
  const name = formData.get("name")?.toString().trim()
  const email = formData.get("email")?.toString().trim()
  const password = formData.get("password")?.toString()

  if (!name || !email || !password) {
    return { error: "Missing required fields" }
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" }
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existing) {
      return { error: "An account with this email already exists" }
    }

    const passwordHash = await bcrypt.hash(password, 10)

    await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
      },
    })

    return { success: true }
  } catch (err) {
    return { error: "Could not create account. Please try again." }
  }
}

import { SignJWT, jwtVerify } from "jose"

const COOKIE_NAME = "teamsync_session"

function getSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET must be set in production")
    }
    return new TextEncoder().encode("dev-only-secret-change-with-JWT_SECRET")
  }
  return new TextEncoder().encode(secret)
}

export async function createSessionToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret())
}

export async function verifySessionToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    const sub = payload.sub
    return typeof sub === "string" ? sub : null
  } catch {
    return null
  }
}

export { COOKIE_NAME }

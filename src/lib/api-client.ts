export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown
  ) {
    super(message)
    this.name = "ApiError"
  }
}

function messageFromBody(data: unknown): string {
  if (typeof data !== "object" || data === null) return "Something went wrong"
  const err = (data as { error?: unknown }).error
  if (typeof err === "string") return err
  return "Something went wrong"
}

export async function apiFetch<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const headers: HeadersInit = {
    ...(init?.headers || {}),
  }
  if (init?.body && typeof init.body === "string") {
    ;(headers as Record<string, string>)["Content-Type"] = "application/json"
  }

  const res = await fetch(input, {
    ...init,
    credentials: "include",
    headers,
  })

  const text = await res.text()
  let data: unknown = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = { raw: text }
  }

  if (!res.ok) {
    throw new ApiError(res.status, messageFromBody(data), data)
  }

  return data as T
}

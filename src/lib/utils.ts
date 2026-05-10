import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** First `maxWords` words of trimmed text, with an ellipsis if truncated. */
export function truncateToWords(text: string, maxWords: number): string {
  const t = text.trim()
  if (!t) return ""
  const words = t.split(/\s+/)
  if (words.length <= maxWords) return t
  return `${words.slice(0, maxWords).join(" ")}…`
}

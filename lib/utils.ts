import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const MINI_MODELS = {
  OPENAI: "gpt-4o-mini-2024-07-18",
  GOOGLE: "gemini-2.5-flash",
  ANTHROPIC: "claude-3-5-haiku-20241022"
}

export const MODELS = {
  "gemini-2.5-pro":"Gemini 2.5 Pro",
  "claude-opus-4-20250514": "Claude Opus 4",
  "gpt-5.1-2025-11-13": "GPT 5.1"
}


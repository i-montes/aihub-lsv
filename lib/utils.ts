import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const MINI_MODELS = {
  OPENAI: "gpt-4o-mini-2024-07-18",
  GOOGLE: "gemini-3-flash-preview",
  ANTHROPIC: "claude-haiku-4-5-20251001"
}

export const MODELS = {
  "gemini-3.1-pro-preview":"Gemini 3.1 Pro Preview",
  "claude-opus-4-5-20251101": "Claude Opus 4.5",
  "gpt-5.1-2025-11-13": "GPT 5.1"
}


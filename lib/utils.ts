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
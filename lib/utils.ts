import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const DEFAULT_MODELS = {
  OPENAI: "gpt-5.6-terra",
  GOOGLE: "gemini-3.1-pro-preview",
  ANTHROPIC: "claude-opus-4-8"
}

export const MINI_MODELS = {
  OPENAI: "gpt-4o-mini-2024-07-18",
  GOOGLE: "gemini-3-flash-preview",
  ANTHROPIC: "claude-haiku-4-5-20251001"
}

export const MODELS = {
  [DEFAULT_MODELS.GOOGLE]: "Gemini 3.1 Pro Preview",
  [DEFAULT_MODELS.ANTHROPIC]: "Claude Opus 4.8",
  [DEFAULT_MODELS.OPENAI]: "GPT 5.6 Terra"
}

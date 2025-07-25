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

// Debug logging system
export interface DebugLogTypes {
  timestamp: string;
  level: "info" | "error" | "warn";
  message: string;
  data?: any;
}

export class DebugLogger {
  private logs: DebugLogTypes[] = [];

  info(message: string, data?: any) {
    this.logs.push({
      timestamp: new Date().toISOString(),
      level: "info",
      message,
      data,
    });
    console.log(`[INFO] ${message}`, data);
  }

  error(message: string, data?: any) {
    this.logs.push({
      timestamp: new Date().toISOString(),
      level: "error",
      message,
      data,
    });
    console.error(`[ERROR] ${message}`, data);
  }

  warn(message: string, data?: any) {
    this.logs.push({
      timestamp: new Date().toISOString(),
      level: "warn",
      message,
      data,
    });
    console.warn(`[WARN] ${message}`, data);
  }

  getLogs() {
    return this.logs;
  }

  clear() {
    this.logs = [];
  }
}
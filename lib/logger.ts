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
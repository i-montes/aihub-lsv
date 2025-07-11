"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Bug, Copy, Trash2 } from "lucide-react"

interface DebugLog {
  timestamp: string
  level: 'info' | 'error' | 'warn'
  message: string
  data?: any
}

interface DebugModalProps {
  logs: DebugLog[]
  onClearLogs?: () => void
}

export function DebugModal({ logs, onClearLogs }: DebugModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'warn':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    })
  }

  const copyLogsToClipboard = () => {
    const logsText = logs.map(log => 
      `[${formatTimestamp(log.timestamp)}] ${log.level.toUpperCase()}: ${log.message}${
        log.data ? '\nData: ' + JSON.stringify(log.data, null, 2) : ''
      }`
    ).join('\n\n')
    
    navigator.clipboard.writeText(logsText)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Bug className="h-4 w-4" />
          Debug ({logs.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5" />
              Debug Logs ({logs.length})
            </DialogTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyLogsToClipboard}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Copiar
              </Button>
              {onClearLogs && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClearLogs}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Limpiar
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>
        <ScrollArea className="h-[60vh] w-full">
          <div className="space-y-3 p-4">
            {logs.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No hay logs disponibles
              </div>
            ) : (
              logs.map((log, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-3 space-y-2 bg-white"
                >
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className={getLevelColor(log.level)}
                    >
                      {log.level.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-gray-500 font-mono">
                      {formatTimestamp(log.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-900">{log.message}</p>
                  {log.data && (
                    <details className="mt-2">
                      <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-800">
                        Ver datos adicionales
                      </summary>
                      <pre className="mt-2 text-xs bg-gray-50 p-2 rounded border overflow-x-auto">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

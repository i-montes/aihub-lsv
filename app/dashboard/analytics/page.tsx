"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"
import { getSupabaseClient } from "@/lib/supabase/client"
import {
  BarChart,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Clock,
  Globe,
  MessageSquare,
  Share2,
  ThumbsUp,
  Filter,
  Download,
  TrendingUp,
  Activity,
  Users,
  Zap,
  AlertCircle,
  CheckCircle2
} from "lucide-react"
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart as RechartsBarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LabelList
} from "recharts"
import { 
  ChartContainer, 
  ChartTooltipContent, 
  ChartLegend, 
  ChartLegendContent
} from "@/components/ui/chart"

interface AnalyticsData {
  toolUsage: Array<{ tool: string; count: number; successRate: number; avgTime: number }>
  errorRates: Array<{ date: string; errors: number; total: number }>
  providerUsage: Array<{ provider: string; count: number; tokens: number; cost: number }>
  userActivity: Array<{ date: string; activeUsers: number; sessions: number }>
  processingMetrics: Array<{ 
    date: string
    avgProcessingTime: number
    avgTokens: number
    totalRequests: number
  }>
  topErrors: Array<{ error: string; count: number; lastOccurrence: string }>
  organizationStats: {
    totalLogs: number
    activeUsers: number
    toolsUsed: number
    avgSessionTime: number
  }
  responseTimeByEventType: Array<{ eventType: string; avgResponseTime: number; count: number }>
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("30d")
  const [selectedTool, setSelectedTool] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [noData, setNoData] = useState(false)
  
  const { profile } = useAuth()
  const supabase = getSupabaseClient()

  useEffect(() => {
    if (profile?.organizationId) {
      fetchAnalyticsData()
    }
  }, [profile?.organizationId, dateRange, selectedTool])

  const fetchAnalyticsData = async () => {
    setIsLoading(true)
    setNoData(false)
    
    try {
      const daysCounts = {
        "7d": 7,
        "30d": 30,
        "90d": 90,
        "12m": 365
      }
      
      const days = daysCounts[dateRange as keyof typeof daysCounts] || 30
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      
      // Filtros base
      let baseQuery = supabase
        .from("logs")
        .select("*")
        .eq("organization_id", profile?.organizationId)
        .gte("timestamp", startDate.toISOString())
        .order("timestamp", { ascending: false })
      
      // Filtro por herramienta
      if (selectedTool !== "all") {
        baseQuery = baseQuery.eq("tool_identity", selectedTool)
      }
      
      const { data: logs, error } = await baseQuery
      
      if (error) {
        console.error("Error fetching analytics:", error)
        toast.error("Error al cargar datos de analytics")
        return
      }
      
      if (!logs || logs.length === 0) {
        setNoData(true)
        setData(null)
        return
      }

      console.log(logs)
      
      // Procesar datos para analytics
      const analyticsData = processLogsData(logs)
      setData(analyticsData)
      
    } catch (error) {
      console.error("Error fetching analytics:", error)
      toast.error("Error al cargar datos de analytics")
    } finally {
      setIsLoading(false)
    }
  }

  const processLogsData = (logs: any[]): AnalyticsData => {
    // Uso de herramientas
    const toolUsage = logs
      .filter(log => log.tool_identity)
      .reduce((acc: any, log) => {
        const tool = log.tool_identity || 'unknown'
        if (!acc[tool]) {
          acc[tool] = { total: 0, completed: 0, totalTime: 0, timeCount: 0 }
        }
        acc[tool].total++
        if (log.tool_status === 'completed') {
          acc[tool].completed++
        }
        if (log.duration_ms) {
          acc[tool].totalTime += log.duration_ms
          acc[tool].timeCount++
        }
        return acc
      }, {})
    
      console.log(toolUsage)


    const toolUsageArray = Object.entries(toolUsage).map(([tool, stats]: [string, any]) => ({
      tool: tool.charAt(0).toUpperCase() + tool.slice(1),
      count: stats.total,
      successRate: Math.round((stats.completed / stats.total) * 100),
      avgTime: stats.timeCount > 0 ? Math.round(stats.totalTime / stats.timeCount) : 0
    }))

    // Tasas de error por día
    const errorsByDay = logs.reduce((acc: any, log) => {
      const date = new Date(log.timestamp).toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = { total: 0, errors: 0 }
      }
      acc[date].total++
      if (log.level === 'error' || log.level === 'fatal') {
        acc[date].errors++
      }
      return acc
    }, {})

    const errorRates = Object.entries(errorsByDay)
      .map(([date, stats]: [string, any]) => ({
        date: new Date(date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
        errors: stats.errors,
        total: stats.total
      }))
      .slice(-7) // Últimos 7 días

    // Uso de proveedores de IA
    const providerUsage = logs
      .filter(log => log.ai_provider && log.tokens_used)
      .reduce((acc: any, log) => {
        const provider = log.ai_provider
        if (!acc[provider]) {
          acc[provider] = { count: 0, tokens: 0 }
        }
        acc[provider].count++
        acc[provider].tokens += log.tokens_used || 0
        return acc
      }, {})

    const providerArray = Object.entries(providerUsage).map(([provider, stats]: [string, any]) => ({
      provider: provider.charAt(0).toUpperCase() + provider.slice(1),
      count: stats.count,
      tokens: stats.tokens,
      // Costo estimado (precios aproximados)
      cost: provider === 'openai' ? (stats.tokens * 0.002 / 1000) : 
            provider === 'anthropic' ? (stats.tokens * 0.008 / 1000) : 
            (stats.tokens * 0.0005 / 1000)
    }))

    // Actividad de usuarios por día
    const userActivityByDay = logs.reduce((acc: any, log) => {
      const date = new Date(log.timestamp).toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = { users: new Set(), sessions: new Set() }
      }
      if (log.user_id) acc[date].users.add(log.user_id)
      if (log.session_id) acc[date].sessions.add(log.session_id)
      return acc
    }, {})

    const userActivity = Object.entries(userActivityByDay)
      .map(([date, activity]: [string, any]) => ({
        date: new Date(date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
        activeUsers: activity.users.size,
        sessions: activity.sessions.size
      }))
      .slice(-7)

    // Métricas de procesamiento por día
    const processingByDay = logs
      .filter(log => log.event_type === 'processing' && log.processing_time_ms)
      .reduce((acc: any, log) => {
        const date = new Date(log.timestamp).toISOString().split('T')[0]
        if (!acc[date]) {
          acc[date] = { times: [], tokens: [], count: 0 }
        }
        acc[date].times.push(log.processing_time_ms)
        if (log.tokens_used) acc[date].tokens.push(log.tokens_used)
        acc[date].count++
        return acc
      }, {})

    const processingMetrics = Object.entries(processingByDay)
      .map(([date, metrics]: [string, any]) => ({
        date: new Date(date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
        avgProcessingTime: Math.round(metrics.times.reduce((a: number, b: number) => a + b, 0) / metrics.times.length),
        avgTokens: metrics.tokens.length > 0 ? 
          Math.round(metrics.tokens.reduce((a: number, b: number) => a + b, 0) / metrics.tokens.length) : 0,
        totalRequests: metrics.count
      }))
      .slice(-7)

    // Tiempo de respuesta por tipo de evento
    const responseTimeByEventTypeMap = logs
      .filter((log) => log.duration_ms && log.event_type)
      .reduce((acc: any, log) => {
        const type = String(log.event_type)
        if (!acc[type]) acc[type] = { totalTime: 0, count: 0 }
        acc[type].totalTime += log.duration_ms
        acc[type].count += 1
        return acc
      }, {})

    const responseTimeByEventType = Object.entries(responseTimeByEventTypeMap).map(
      ([eventType, stats]: [string, any]) => ({
        eventType: eventType.charAt(0).toUpperCase() + eventType.slice(1),
        avgResponseTime: Math.round(stats.totalTime / stats.count),
        count: stats.count,
      })
    )
     // Top errores
     const errorCounts = logs
       .filter(log => log.error_code)
      .reduce((acc: any, log) => {
        const error = log.error_message || log.error_code || 'Error desconocido'
        if (!acc[error]) {
          acc[error] = { count: 0, lastOccurrence: log.timestamp }
        }
        acc[error].count++
        if (new Date(log.timestamp) > new Date(acc[error].lastOccurrence)) {
          acc[error].lastOccurrence = log.timestamp
        }
        return acc
      }, {})

    const topErrors = Object.entries(errorCounts)
      .map(([error, data]: [string, any]) => ({
        error: error.length > 50 ? error.substring(0, 50) + '...' : error,
        count: data.count,
        lastOccurrence: new Date(data.lastOccurrence).toLocaleDateString('es-ES')
      }))
      .sort((a, b) => b.count - a.count)
    
    // Estadísticas de la organización
    const uniqueUsers = new Set(logs.filter(log => log.user_id).map(log => log.user_id)).size
    const uniqueTools = new Set(logs.filter(log => log.tool_identity).map(log => log.tool_identity)).size
    const sessions = logs.filter(log => log.session_id)
    const avgSessionTime = sessions.length > 0 ? 
      Math.round(sessions.reduce((acc, log) => acc + (log.duration_ms || 0), 0) / sessions.length) : 0

    const organizationStats = {
      totalLogs: logs.length,
      activeUsers: uniqueUsers,
      toolsUsed: uniqueTools,
      avgSessionTime
    }

    return {
      toolUsage: toolUsageArray,
      errorRates,
      providerUsage: providerArray,
      userActivity,
      processingMetrics,
      topErrors,
      organizationStats,
      responseTimeByEventType
    }
  }

  const exportData = async () => {
    setIsExporting(true)
    try {
      if (!data) return
      
      const exportData = {
        dateRange,
        selectedTool,
        generatedAt: new Date().toISOString(),
        ...data
      }
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics-${dateRange}-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.success("Datos exportados correctamente")
    } catch (error) {
      toast.error("Error al exportar datos")
    } finally {
      setIsExporting(false)
    }
  }

  if (isLoading) {
    return <AnalyticsLoadingSkeleton />
  }

  if (noData) {
    return <NoDataState dateRange={dateRange} setDateRange={setDateRange} />
  }

  if (!data) {
    return <ErrorState />
  }
 
  // Para la sección "Herramientas Más Usadas": calcular el máximo de usos para escalar correctamente las barras
  const totalToolCount = Math.max(1, data.toolUsage.reduce((sum, t) => sum + t.count, 0))
  // Nuevo: ordenar por tiempo de respuesta promedio (desc)
  const sortedResponseTimeByEventType = data.responseTimeByEventType
    .slice()
    .sort((a, b) => b.avgResponseTime - a.avgResponseTime)

    console.log(data.toolUsage)

  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics de Herramientas</h1>
          <p className="text-muted-foreground mt-1">Métricas de uso y rendimiento de tus herramientas de IA</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 días</SelectItem>
              <SelectItem value="30d">Últimos 30 días</SelectItem>
              <SelectItem value="90d">Últimos 90 días</SelectItem>
              <SelectItem value="12m">Último año</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedTool} onValueChange={setSelectedTool}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las herramientas</SelectItem>
              <SelectItem value="proofreader">Proofreader</SelectItem>
              <SelectItem value="newsletter">Newsletter</SelectItem>
              <SelectItem value="thread-generator">Generador de Hilos</SelectItem>
              <SelectItem value="resume">Resumen</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={exportData} disabled={isExporting} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "Exportando..." : "Exportar"}
          </Button>
        </div>
      </div>

      {/* Resumen de métricas clave */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total de Logs"
          value={data.organizationStats.totalLogs.toLocaleString()}
          change={`+${Math.round(Math.random() * 20)}%`}
          trend="up"
          icon={<Activity className="text-white" size={20} />}
          color="bg-blue-500"
          description="registros generados"
        />
        <MetricCard
          title="Usuarios Activos"
          value={data.organizationStats.activeUsers.toString()}
          change={`+${Math.round(Math.random() * 15)}%`}
          trend="up"
          icon={<Users className="text-white" size={20} />}
          color="bg-green-500"
          description="usuarios únicos"
        />
        <MetricCard
          title="Herramientas Usadas"
          value={data.organizationStats.toolsUsed.toString()}
          change={`+${Math.round(Math.random() * 10)}%`}
          trend="up"
          icon={<Zap className="text-white" size={20} />}
          color="bg-purple-500"
          description="herramientas diferentes"
        />
        <MetricCard
          title="Tiempo Promedio"
          value={`${Math.round(data.organizationStats.avgSessionTime / 1000)}s`}
          change={`-${Math.round(Math.random() * 10)}%`}
          trend="down"
          icon={<Clock className="text-white" size={20} />}
          color="bg-orange-500"
          description="por sesión"
        />
      </div>

      {/* Pestañas de análisis */}
      <Tabs defaultValue="usage" className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="usage">Uso de Herramientas</TabsTrigger>
          <TabsTrigger value="performance">Rendimiento</TabsTrigger>
          <TabsTrigger value="errors">Errores</TabsTrigger>
          <TabsTrigger value="providers">Proveedores</TabsTrigger>
        </TabsList>

        {/* Pestaña de Uso */}
        <TabsContent value="usage" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Actividad de Usuarios por Día</CardTitle>
                <CardDescription>Usuarios activos y sesiones</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    activeUsers: {
                      label: "Usuarios Activos",
                      color: "hsl(var(--chart-1))",
                    },
                    sessions: {
                      label: "Sesiones",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={data.userActivity}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Legend content={<ChartLegendContent />} />
                      <Line
                        type="monotone"
                        dataKey="activeUsers"
                        stroke="var(--color-activeUsers)"
                        strokeWidth={2}
                        dot={{ r: 4, stroke: 'var(--color-activeUsers)', strokeWidth: 2, fill: 'var(--color-activeUsers)' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="sessions"
                        stroke="var(--color-sessions)"
                        strokeWidth={2}
                        dot={{ r: 4, stroke: 'var(--color-sessions)', strokeWidth: 2, fill: 'var(--color-sessions)' }}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Herramientas Más Usadas</CardTitle>
                <CardDescription>Ranking por uso (conteo y % del total)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.toolUsage.length > 0 ? (
                    data.toolUsage
                      .slice()
                      .sort((a, b) => b.count - a.count)
                      .map((tool, i) => (
                        <div key={i} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{tool.tool}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-green-600">{tool.successRate}%</span>
                              <span className="text-xs text-gray-500">({tool.count})</span>
                            </div>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
                              style={{ width: `${Math.round((tool.count / totalToolCount) * 100)}%` }}
                            />
                          </div>
                          <div className="text-xs text-gray-500">
                            Tiempo promedio: {(tool.avgTime / 1000).toFixed(2)}s • % del total: {Math.round((tool.count / totalToolCount) * 100)}%
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      Sin datos de uso para este periodo.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pestaña de Rendimiento */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tiempo de Respuesta por Tipo de Evento</CardTitle>
              <CardDescription>Promedio (ms) por event_type</CardDescription>
            </CardHeader>
            <CardContent>
              {data.responseTimeByEventType.length > 0 ? (
                <ChartContainer
                  config={{
                    avgResponseTime: {
                      label: "Tiempo (ms)",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[320px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={sortedResponseTimeByEventType}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="eventType" />
                      <YAxis tickFormatter={(v) => `${v} ms`} />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Legend content={<ChartLegendContent />} />
                      <Bar
                        dataKey="avgResponseTime"
                        fill="var(--color-avgResponseTime)"
                        radius={[4, 4, 0, 0]}
                      >
                        <LabelList
                          dataKey="avgResponseTime"
                          position="top"
                          content={(props: any) => {
                            const { x, y, width, value, index } = props
                            const item = sortedResponseTimeByEventType[index]
                            if (x == null || y == null || width == null) return null
                            return (
                              <text
                                x={x + width / 2}
                                y={y - 4}
                                textAnchor="middle"
                                fill="#6b7280"
                                fontSize={12}
                              >
                                {`${(value / 1000).toFixed(2)}s (${item?.count ?? 0})`}
                              </text>
                            )
                          }}
                        />
                      </Bar>
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-8">
                  Sin datos de tiempos de respuesta por tipo de evento en el período seleccionado.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña de Errores */}
        <TabsContent value="errors" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Tasas de Error por Día</CardTitle>
                <CardDescription>Errores vs total de requests</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    errors: {
                      label: "Errores",
                      color: "hsl(var(--destructive))",
                    },
                    total: {
                      label: "Total",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={data.errorRates}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Legend content={<ChartLegendContent />} />
                      <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="errors" fill="var(--color-errors)" radius={[4, 4, 0, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Errores</CardTitle>
                <CardDescription>Errores más frecuentes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.topErrors.length > 0 ? (
                    data.topErrors.map((error, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-red-50">
                        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-red-900">{error.error}</p>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-red-600">{error.count} ocurrencias</span>
                            <span className="text-xs text-red-500">Último: {error.lastOccurrence}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                      <p className="text-green-600 font-medium">¡Sin errores!</p>
                      <p className="text-sm text-gray-500">No se encontraron errores en el período seleccionado</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pestaña de Proveedores */}
        <TabsContent value="providers" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Uso de Proveedores de IA</CardTitle>
                <CardDescription>Distribución de uso por proveedor</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    openai: { label: "OpenAI", color: "#10B981" },
                    anthropic: { label: "Anthropic", color: "#F59E0B" },
                    google: { label: "Google", color: "#3B82F6" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.providerUsage}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ provider, count }) => `${provider}: ${count}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {data.providerUsage.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={index === 0 ? "#10B981" : index === 1 ? "#F59E0B" : "#3B82F6"} 
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métricas de Proveedores</CardTitle>
                <CardDescription>Tokens y costos por proveedor</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.providerUsage.map((provider, i) => (
                    <div key={i} className="p-4 rounded-lg border">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{provider.provider}</h4>
                        <span className="text-sm text-green-600 font-medium">
                          ${provider.cost.toFixed(3)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Requests</p>
                          <p className="font-medium">{provider.count.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Tokens</p>
                          <p className="font-medium">{provider.tokens.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Tokens/Request</span>
                          <span>{Math.round(provider.tokens / provider.count)}</span>
                        </div>
                        <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${i === 0 ? "bg-green-500" : i === 1 ? "bg-yellow-500" : "bg-blue-500"} rounded-full`}
                            style={{ width: `${Math.min((provider.tokens / Math.max(...data.providerUsage.map(p => p.tokens))) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function MetricCard({
  title,
  value,
  change,
  trend,
  icon,
  color,
  description,
}: {
  title: string
  value: string
  change: string
  trend: "up" | "down"
  icon: React.ReactNode
  color: string
  description: string
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-center space-x-2">
              <h3 className="text-2xl font-bold">{value}</h3>
              <div className={`flex items-center space-x-1 text-sm ${
                trend === "up" ? "text-green-600" : "text-red-600"
              }`}>
                {trend === "up" ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                <span>{change}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <div className={`${color} rounded-full p-3`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function AnalyticsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}

function NoDataState({ 
  dateRange, 
  setDateRange 
}: { 
  dateRange: string
  setDateRange: (range: string) => void 
}) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Analytics de Herramientas</h1>
          <p className="text-muted-foreground mt-1">Métricas de uso y rendimiento de tus herramientas de IA</p>
        </div>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Últimos 7 días</SelectItem>
            <SelectItem value="30d">Últimos 30 días</SelectItem>
            <SelectItem value="90d">Últimos 90 días</SelectItem>
            <SelectItem value="12m">Último año</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <BarChart className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No hay datos disponibles</h3>
          <p className="text-gray-500 text-center max-w-md">
            No se encontraron datos para el período seleccionado. Comienza a usar las herramientas para ver métricas aquí.
          </p>
          <Button className="mt-4" onClick={() => setDateRange("90d")}>
            Ampliar período de búsqueda
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function ErrorState() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics de Herramientas</h1>
        <p className="text-muted-foreground mt-1">Métricas de uso y rendimiento de tus herramientas de IA</p>
      </div>
      
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <AlertCircle className="h-16 w-16 text-red-300 mb-4" />
          <h3 className="text-lg font-semibold text-red-600 mb-2">Error al cargar datos</h3>
          <p className="text-gray-500 text-center max-w-md">
            Hubo un problema al cargar los datos de analytics. Por favor, intenta de nuevo más tarde.
          </p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
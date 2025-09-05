"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { getSupabaseClient } from "@/lib/supabase/client";
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
  CheckCircle2,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
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
  LabelList,
} from "recharts";
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

interface AnalyticsData {
  toolUsage: Array<{
    tool: string;
    count: number;
    successRate: number;
    avgTime: number;
  }>;
  errorRates: Array<{ date: string; errors: number; total: number }>;
  providerUsage: Array<{
    provider: string;
    count: number;
    tokens: number;
    cost: number;
  }>;
  userActivity: Array<{ date: string; activeUsers: number; sessions: number }>;
  processingMetrics: Array<{
    date: string;
    avgProcessingTime: number;
    avgTokens: number;
    totalRequests: number;
  }>;
  topErrors: Array<{ error: string; count: number; lastOccurrence: string }>;
  organizationStats: {
    totalLogs: number;
    activeUsers: number;
    toolsUsed: number;
    avgSessionTime: number;
  };

  topUsers: Array<{
    userId: string;
    username: string;
    count: number;
    percentage: number;
  }>;
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("30d");
  const [selectedTool, setSelectedTool] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [noData, setNoData] = useState(false);
  const [customDateRange, setCustomDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [isCustomDateModalOpen, setIsCustomDateModalOpen] = useState(false);

  const { profile } = useAuth();
  const supabase = getSupabaseClient();

  // Función para obtener el texto del selector de fecha
  const getDateRangeText = () => {
    if (dateRange.startsWith("custom:")) {
      const [, startDateStr, endDateStr] = dateRange.split(":");
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);
      return `${startDate.toLocaleDateString("es-ES")} - ${endDate.toLocaleDateString("es-ES")}`;
    }
    return undefined; // Usar el valor por defecto del SelectValue
  };

  useEffect(() => {
    if (profile?.organizationId) {
      fetchAnalyticsData();
    }
  }, [profile?.organizationId, dateRange, selectedTool]);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    setNoData(false);

    try {
      let startDate: Date;
      let endDate: Date = new Date();

      // Manejar rango personalizado
      if (dateRange.startsWith("custom:")) {
        const [, startDateStr, endDateStr] = dateRange.split(":");
        startDate = new Date(startDateStr);
        endDate = new Date(endDateStr);
        // Ajustar la fecha de fin al final del día
        endDate.setHours(23, 59, 59, 999);
      } else {
        const daysCounts = {
          "7d": 7,
          "30d": 30,
          "90d": 90,
          "12m": 365,
        };

        const days = daysCounts[dateRange as keyof typeof daysCounts] || 30;
        startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
      }

      // Filtros base
      let baseQuery = supabase
        .from("logs")
        .select("*")
        .eq("organization_id", profile?.organizationId)
        .gte("timestamp", startDate.toISOString())
        .lte("timestamp", endDate.toISOString())
        .order("timestamp", { ascending: false });

      // Filtro por herramienta
      if (selectedTool !== "all") {
        baseQuery = baseQuery.eq("tool_identity", selectedTool);
      }

      const { data: logs, error } = await baseQuery;

      if (error) {
        console.error("Error fetching analytics:", error);
        toast.error("Error al cargar datos de analytics");
        return;
      }

      if (!logs || logs.length === 0) {
        setNoData(true);
        setData(null);
        return;
      }

      // Obtener datos de usuarios únicos para el join con profiles
      const uniqueUserIds = [
        ...new Set(
          logs.filter((log: any) => log.user_id).map((log: any) => log.user_id)
        ),
      ];

      let userProfiles: any[] = [];
      if (uniqueUserIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, name, lastname")
          .in("id", uniqueUserIds);

        if (!profilesError && profiles) {
          userProfiles = profiles;
        }
      }

      // Procesar datos para analytics
      const analyticsData = processLogsData(logs, userProfiles);
      setData(analyticsData);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Error al cargar datos de analytics");
    } finally {
      setIsLoading(false);
    }
  };

  const processLogsData = (
    logs: any[],
    userProfiles: any[] = []
  ): AnalyticsData => {
    // Uso de herramientas
    const toolUsage = logs
      .filter((log) => log.tool_identity)
      .reduce((acc: any, log) => {
        const tool = log.tool_identity || "unknown";
        if (!acc[tool]) {
          acc[tool] = { total: 0, completed: 0, totalTime: 0, timeCount: 0 };
        }
        acc[tool].total++;
        if (log.tool_status === "completed") {
          acc[tool].completed++;
        }
        if (log.duration_ms) {
          acc[tool].totalTime += log.duration_ms;
          acc[tool].timeCount++;
        }
        return acc;
      }, {});

    const toolUsageArray = Object.entries(toolUsage).map(
      ([tool, stats]: [string, any]) => ({
        tool: tool.charAt(0).toUpperCase() + tool.slice(1),
        count: stats.total,
        successRate: Math.round((stats.completed / stats.total) * 100),
        avgTime:
          stats.timeCount > 0
            ? Math.round(stats.totalTime / stats.timeCount)
            : 0,
      })
    );

    // Tasas de error por día
    const errorsByDay = logs.reduce((acc: any, log) => {
      const date = new Date(log.timestamp).toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = { total: 0, errors: 0 };
      }
      acc[date].total++;
      if (log.level === "error" || log.level === "fatal") {
        acc[date].errors++;
      }
      return acc;
    }, {});

    const errorRates = Object.entries(errorsByDay)
      .map(([date, stats]: [string, any]) => ({
        date: new Date(date).toLocaleDateString("es-ES", {
          month: "short",
          day: "numeric",
        }),
        errors: stats.errors,
        total: stats.total,
      }))
      .slice(-7); // Últimos 7 días

    // Uso de proveedores de IA
    const providerUsage = logs
      .filter((log) => log.ai_provider)
      .reduce((acc: any, log) => {
        const provider = log.ai_provider;
        if (!acc[provider]) {
          acc[provider] = { count: 0, tokens: 0 };
        }
        acc[provider].count++;
        acc[provider].tokens += log.tokens_used || 0;
        return acc;
      }, {});

    let providerArray = Object.entries(providerUsage).map(
      ([provider, stats]: [string, any]) => ({
        provider: provider.charAt(0).toUpperCase() + provider.slice(1).toLowerCase(),
        count: stats.count,
        tokens: stats.tokens,
        // Costo estimado (precios aproximados)
        cost:
          provider.toUpperCase() === "OPENAI"
            ? (stats.tokens * 0.002) / 1000
            : provider.toUpperCase() === "ANTHROPIC"
            ? (stats.tokens * 0.008) / 1000
            : (stats.tokens * 0.0005) / 1000,
      })
    );

    // Si no hay datos de proveedores, agregar datos de ejemplo
    if (providerArray.length === 0) {
      providerArray = [
        {
          provider: "OpenAI",
          count: 0,
          tokens: 0,
          cost: 0
        },
        {
          provider: "Anthropic",
          count: 0,
          tokens: 0,
          cost: 0
        },
        {
          provider: "Google",
          count: 0,
          tokens: 0,
          cost: 0
        }
      ];
    }

    // Actividad de usuarios por día
    const userActivityByDay = logs.reduce((acc: any, log) => {
      const date = new Date(log.timestamp).toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = { users: new Set(), sessions: new Set() };
      }
      if (log.user_id) acc[date].users.add(log.user_id);
      if (log.session_id) acc[date].sessions.add(log.session_id);
      return acc;
    }, {});

    const userActivity = Object.entries(userActivityByDay)
      .map(([date, activity]: [string, any]) => ({
        date: new Date(date).toLocaleDateString("es-ES", {
          month: "short",
          day: "numeric",
        }),
        activeUsers: activity.users.size,
        sessions: activity.sessions.size,
        originalDate: date, // Mantener fecha original para ordenamiento
      }))
      .sort((a, b) => new Date(a.originalDate).getTime() - new Date(b.originalDate).getTime()) // Orden ascendente
      .slice(-7)
      .map(({ originalDate, ...rest }) => rest); // Remover originalDate del resultado final

    // Métricas de procesamiento por día
    const processingByDay = logs
      .filter(
        (log) => log.event_type === "processing" && log.processing_time_ms
      )
      .reduce((acc: any, log) => {
        const date = new Date(log.timestamp).toISOString().split("T")[0];
        if (!acc[date]) {
          acc[date] = { times: [], tokens: [], count: 0 };
        }
        acc[date].times.push(log.processing_time_ms);
        if (log.tokens_used) acc[date].tokens.push(log.tokens_used);
        acc[date].count++;
        return acc;
      }, {});

    const processingMetrics = Object.entries(processingByDay)
      .map(([date, metrics]: [string, any]) => ({
        date: new Date(date).toLocaleDateString("es-ES", {
          month: "short",
          day: "numeric",
        }),
        avgProcessingTime: Math.round(
          metrics.times.reduce((a: number, b: number) => a + b, 0) /
            metrics.times.length
        ),
        avgTokens:
          metrics.tokens.length > 0
            ? Math.round(
                metrics.tokens.reduce((a: number, b: number) => a + b, 0) /
                  metrics.tokens.length
              )
            : 0,
        totalRequests: metrics.count,
      }))
      .slice(-7);

    // Top errores
    const errorCounts = logs
      .filter((log) => log.error_code)
      .reduce((acc: any, log) => {
        const error =
          log.error_message || log.error_code || "Error desconocido";
        if (!acc[error]) {
          acc[error] = { count: 0, lastOccurrence: log.timestamp };
        }
        acc[error].count++;
        if (new Date(log.timestamp) > new Date(acc[error].lastOccurrence)) {
          acc[error].lastOccurrence = log.timestamp;
        }
        return acc;
      }, {});

    const topErrors = Object.entries(errorCounts)
      .map(([error, data]: [string, any]) => ({
        error: error.length > 50 ? error.substring(0, 50) + "..." : error,
        count: data.count,
        lastOccurrence: new Date(data.lastOccurrence).toLocaleDateString(
          "es-ES"
        ),
      }))
      .sort((a, b) => b.count - a.count);

    // Estadísticas de la organización
    // Solo contar usuarios que tienen perfil válido en la tabla profiles
    const uniqueUserIds = new Set(
      logs.filter((log) => log.user_id).map((log) => log.user_id)
    );
    const activeUsersWithProfiles = Array.from(uniqueUserIds).filter((userId) =>
      userProfiles.some((profile) => profile.id === userId)
    ).length;

    const uniqueTools = new Set(
      logs.filter((log) => log.tool_identity).map((log) => log.tool_identity)
    ).size;
    const sessions = logs.filter((log) => log.session_id);
    const avgSessionTime =
      sessions.length > 0
        ? Math.round(
            sessions.reduce((acc, log) => acc + (log.duration_ms || 0), 0) /
              sessions.length
          )
        : 0;

    // Contar generaciones únicas agrupadas por session_id
    const uniqueGenerations = new Set(
      logs.filter((log) => log.session_id).map((log) => log.session_id)
    ).size;

    const organizationStats = {
      totalLogs: uniqueGenerations,
      activeUsers: activeUsersWithProfiles,
      toolsUsed: uniqueTools,
      avgSessionTime,
    };

    // Usuarios más activos por sesiones únicas
    const userSessionCounts = logs
      .filter((log) => log.user_id && log.session_id)
      .reduce((acc: any, log) => {
        const userId = log.user_id;
        if (!acc[userId]) {
          acc[userId] = new Set();
        }
        // Agregar session_id al Set para garantizar unicidad
        acc[userId].add(log.session_id);
        return acc;
      }, {});

    // Convertir Sets a conteos y calcular estadísticas
    const userUsageCounts = Object.entries(userSessionCounts).reduce(
      (acc: any, [userId, sessionSet]: [string, any]) => {
        acc[userId] = sessionSet.size; // Número de sesiones únicas
        return acc;
      },
      {}
    );

    const totalUsageCount = Object.values(userUsageCounts).reduce(
      (sum: number, count: any) => sum + count,
      0
    );

    const topUsers = Object.entries(userUsageCounts)
      .map(([userId, count]: [string, any]) => {
        const userProfile = userProfiles.find(
          (profile) => profile?.id === userId
        );
        const username = `${userProfile?.name} ${userProfile?.lastname}`;
        return {
          userId,
          username,
          count, // Ahora representa sesiones únicas
          percentage: Math.round((count / Math.max(totalUsageCount, 1)) * 100),
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 usuarios

    return {
      toolUsage: toolUsageArray,
      errorRates,
      providerUsage: providerArray,
      userActivity,
      processingMetrics,
      topErrors,
      organizationStats,

      topUsers,
    };
  };

  const exportData = async () => {
    setIsExporting(true);
    try {
      if (!data) return;

      const exportData = {
        dateRange,
        selectedTool,
        generatedAt: new Date().toISOString(),
        ...data,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analytics-${dateRange}-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Datos exportados correctamente");
    } catch (error) {
      toast.error("Error al exportar datos");
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return <AnalyticsLoadingSkeleton />;
  }

  if (noData) {
    return (
      <NoDataState 
        dateRange={dateRange} 
        setDateRange={setDateRange}
        setIsCustomDateModalOpen={setIsCustomDateModalOpen}
        getDateRangeText={getDateRangeText}
      />
    );
  }

  if (!data) {
    return <ErrorState />;
  }

  // Para la sección "Herramientas Más Usadas": calcular el máximo de usos para escalar correctamente las barras
  const totalToolCount = Math.max(
    1,
    data.toolUsage.reduce((sum, t) => sum + t.count, 0)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics de herramientas</h1>
          <p className="text-muted-foreground mt-1">
            Métricas de uso y rendimiento de tus herramientas de IA
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select value={dateRange} onValueChange={(value) => {
            if (value === "custom") {
              setIsCustomDateModalOpen(true);
            } else {
              setDateRange(value);
            }
          }}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4" />
              <SelectValue>
                {getDateRangeText() || undefined}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 días</SelectItem>
              <SelectItem value="30d">Últimos 30 días</SelectItem>
              <SelectItem value="90d">Últimos 90 días</SelectItem>
              <SelectItem value="12m">Último año</SelectItem>
              <SelectItem value="custom">Rango personalizado</SelectItem>
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
              <SelectItem value="thread-generator">
                Generador de Hilos
              </SelectItem>
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
          title="Generaciones de texto"
          value={data.organizationStats.totalLogs.toLocaleString()}
          change={`+${Math.round(Math.random() * 20)}%`}
          trend="up"
          icon={<Activity className="text-white" size={20} />}
          color="bg-blue-500"
          description="sesiones únicas"
        />
        <MetricCard
          title="Usuarios activos"
          value={data.organizationStats.activeUsers.toString()}
          change={`+${Math.round(Math.random() * 15)}%`}
          trend="up"
          icon={<Users className="text-white" size={20} />}
          color="bg-green-500"
          description="usuarios únicos"
        />
        <MetricCard
          title="Herramientas usadas"
          value={data.organizationStats.toolsUsed.toString()}
          change={`+${Math.round(Math.random() * 10)}%`}
          trend="up"
          icon={<Zap className="text-white" size={20} />}
          color="bg-purple-500"
          description="herramientas diferentes"
        />
        <MetricCard
          title="Tiempo promedio"
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
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="usage">Uso de herramientas</TabsTrigger>
          <TabsTrigger value="errors">Errores</TabsTrigger>
          <TabsTrigger value="providers">Proveedores</TabsTrigger>
        </TabsList>

        {/* Pestaña de Uso */}
        <TabsContent value="usage" className="space-y-4">
          {/* Gráfico de actividad de usuarios - ancho completo */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Actividad de usuarios por día</CardTitle>
              <CardDescription>Usuarios activos y eventos</CardDescription>
            </CardHeader>
            <CardContent className="w-full">
              <ChartContainer
                config={{
                  activeUsers: {
                    label: "Usuarios activos",
                    color: "#8884d8",
                  },
                  sessions: {
                    label: "Eventos",
                    color: "#82ca9d",
                  },
                }}
                className="h-[300px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.userActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend content={<ChartLegendContent />} />
                    <Area
                      type="monotone"
                      dataKey="activeUsers"
                      stackId="1"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="sessions"
                      stackId="1"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Listas lado a lado - igual tamaño */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Herramientas más usadas</CardTitle>
                <CardDescription>
                  Ranking por uso (conteo y % del total)
                </CardDescription>
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
                            <span className="text-sm font-medium">
                              {tool.tool}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-green-600">
                                {tool.successRate}%
                              </span>
                              <span className="text-xs text-gray-500">
                                ({tool.count})
                              </span>
                            </div>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
                              style={{
                                width: `${Math.round(
                                  (tool.count / totalToolCount) * 100
                                )}%`,
                              }}
                            />
                          </div>
                          <div className="text-xs text-gray-500">
                            Tiempo promedio: {(tool.avgTime / 1000).toFixed(2)}s
                            • % del total:{" "}
                            {Math.round((tool.count / totalToolCount) * 100)}%
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

            {/* Card de Usuarios Más Activos */}
            <Card>
              <CardHeader>
                <CardTitle>Usuarios más activos</CardTitle>
                <CardDescription>
                  Top usuarios por sesiones únicas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {data.topUsers.length > 0 ? (
                    data.topUsers.map((user: any, i) => (
                      <div
                        key={user.userId}
                        className="flex items-center gap-3 p-3 rounded-lg bg-gray-50"
                      >
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                            {user.name
                              ? user.name.charAt(0).toUpperCase()
                              : "U"}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {user.username}
                          </p>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-gray-500">
                              {user.count} sesiones
                            </span>
                            <span className="text-xs text-blue-600">
                              {user.percentage}%
                            </span>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            #{i + 1}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      Sin datos de usuarios para este periodo.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pestaña de Errores */}
        <TabsContent value="errors" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  Errores / Generaciones
                </CardTitle>
                <CardDescription>
                  Proporción entre errores y generaciones exitosas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    errors: {
                      label: "Errores",
                      color: "hsl(var(--destructive))",
                    },
                    successful: {
                      label: "Generaciones Exitosas",
                      color: "hsl(var(--primary))",
                    },
                  }}
                  className="h-[400px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: "Errores",
                            value: data.errorRates.reduce(
                              (sum, day) => sum + day.errors,
                              0
                            ),
                            fill: "var(--color-errors)",
                          },
                          {
                            name: "Generaciones exitosas",
                            value: data.errorRates.reduce(
                              (sum, day) => sum + (day.total - day.errors),
                              0
                            ),
                            fill: "var(--color-successful)",
                          },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(1)}%`
                        }
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          {
                            name: "Errores",
                            value: data.errorRates.reduce(
                              (sum, day) => sum + day.errors,
                              0
                            ),
                            fill: "var(--color-errors)",
                          },
                          {
                            name: "Generaciones exitosas",
                            value: data.errorRates.reduce(
                              (sum, day) => sum + (day.total - day.errors),
                              0
                            ),
                            fill: "var(--color-successful)",
                          },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltipContent />} />
                      <Legend content={<ChartLegendContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top errores</CardTitle>
                <CardDescription>Errores más frecuentes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.topErrors.length > 0 ? (
                    data.topErrors.map((error, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 rounded-lg bg-red-50"
                      >
                        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-red-900">
                            {error.error}
                          </p>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-red-600">
                              {error.count} ocurrencias
                            </span>
                            <span className="text-xs text-red-500">
                              Último: {error.lastOccurrence}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                      <p className="text-green-600 font-medium">
                        ¡Sin errores!
                      </p>
                      <p className="text-sm text-gray-500">
                        No se encontraron errores en el período seleccionado
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pestaña de Proveedores */}
        <TabsContent value="providers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Uso de proveedores de IA</CardTitle>
              <CardDescription>
                Distribución de uso por proveedor
                {data.providerUsage.every(p => p.count === 0) && (
                  <span className="block text-amber-600 text-sm mt-1">
                    ⚠️ No hay datos de proveedores para este período
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  count: { label: "Uso", color: "#10B981" },
                  tokens: { label: "Tokens", color: "#3B82F6" },
                  cost: { label: "Costo ($)", color: "#F59E0B" },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={data.providerUsage} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="provider" 
                      tick={{ fontSize: 12 }}
                      axisLine={{ stroke: '#e0e0e0' }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      axisLine={{ stroke: '#e0e0e0' }}
                    />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 border rounded-lg shadow-lg">
                              <p className="font-semibold">{label}</p>
                              <p className="text-sm text-gray-600">Uso: {data.count}</p>
                              <p className="text-sm text-gray-600">Tokens: {data.tokens.toLocaleString()}</p>
                              <p className="text-sm text-gray-600">Costo: ${data.cost.toFixed(4)}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill="#10B981"
                      radius={[4, 4, 0, 0]}
                      name="Uso"
                    />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </ChartContainer>
              
              {/* Tabla de detalles de proveedores */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Detalles por proveedor</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {data.providerUsage.map((provider) => (
                    <div key={provider.provider} className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-medium text-gray-900">{provider.provider}</h5>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Uso:</span>
                          <span className="font-medium">{provider.count}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tokens:</span>
                          <span className="font-medium">{provider.tokens.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Costo:</span>
                          <span className="font-medium">${provider.cost.toFixed(4)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de rango personalizado */}
      <Dialog open={isCustomDateModalOpen} onOpenChange={setIsCustomDateModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Seleccionar rango personalizado</DialogTitle>
            <DialogDescription>
              Elige las fechas de inicio y fin para tu análisis personalizado.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="start-date" className="text-right">
                Desde
              </Label>
              <Input
                id="start-date"
                type="date"
                value={customDateRange.startDate}
                onChange={(e) => setCustomDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="end-date" className="text-right">
                Hasta
              </Label>
              <Input
                id="end-date"
                type="date"
                value={customDateRange.endDate}
                onChange={(e) => setCustomDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsCustomDateModalOpen(false);
                setCustomDateRange({ 
                  startDate: new Date().toISOString().split('T')[0], 
                  endDate: new Date().toISOString().split('T')[0] 
                });
              }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (customDateRange.startDate && customDateRange.endDate) {
                  if (new Date(customDateRange.startDate) <= new Date(customDateRange.endDate)) {
                    setDateRange(`custom:${customDateRange.startDate}:${customDateRange.endDate}`);
                    setIsCustomDateModalOpen(false);
                  } else {
                    toast.error("La fecha de inicio debe ser anterior a la fecha de fin");
                  }
                } else {
                  toast.error("Por favor selecciona ambas fechas");
                }
              }}
            >
              Aplicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
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
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ReactNode;
  color: string;
  description: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-center space-x-2">
              <h3 className="text-2xl font-bold">{value}</h3>
              <div
                className={`flex items-center space-x-1 text-sm ${
                  trend === "up" ? "text-green-600" : "text-red-600"
                }`}
              >
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
          <div className={`${color} rounded-full p-3`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
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
  );
}

function NoDataState({
  dateRange,
  setDateRange,
  setIsCustomDateModalOpen,
  getDateRangeText,
}: {
  dateRange: string;
  setDateRange: (range: string) => void;
  setIsCustomDateModalOpen: (open: boolean) => void;
  getDateRangeText: () => string | undefined;
}) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Analytics de herramientas</h1>
          <p className="text-muted-foreground mt-1">
            Métricas de uso y rendimiento de tus herramientas de IA
          </p>
        </div>
        <Select value={dateRange} onValueChange={(value) => {
          if (value === "custom") {
            setIsCustomDateModalOpen(true);
          } else {
            setDateRange(value);
          }
        }}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="h-4 w-4" />
            <SelectValue>
              {getDateRangeText() || undefined}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Últimos 7 días</SelectItem>
            <SelectItem value="30d">Últimos 30 días</SelectItem>
            <SelectItem value="90d">Últimos 90 días</SelectItem>
            <SelectItem value="12m">Último año</SelectItem>
            <SelectItem value="custom">Rango personalizado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <BarChart className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            No hay datos disponibles
          </h3>
          <p className="text-gray-500 text-center max-w-md">
            No se encontraron datos para el período seleccionado. Comienza a
            usar las herramientas para ver métricas aquí.
          </p>
          <Button className="mt-4" onClick={() => setDateRange("90d")}>
            Ampliar período de búsqueda
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics de herramientas</h1>
        <p className="text-muted-foreground mt-1">
          Métricas de uso y rendimiento de tus herramientas de IA
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <AlertCircle className="h-16 w-16 text-red-300 mb-4" />
          <h3 className="text-lg font-semibold text-red-600 mb-2">
            Error al cargar datos
          </h3>
          <p className="text-gray-500 text-center max-w-md">
            Hubo un problema al cargar los datos de analytics. Por favor,
            intenta de nuevo más tarde.
          </p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

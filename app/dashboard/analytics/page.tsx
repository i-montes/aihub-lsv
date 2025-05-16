import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, LineChart, TrendingUp, Users, ArrowUpRight, ArrowDownRight } from "lucide-react"

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <div className="flex items-center gap-2 bg-white rounded-lg p-2">
          <span className="text-sm font-medium">Últimos 30 días</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-chevron-down"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>

      {/* Tarjetas de métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Mensajes Totales"
          value="24,532"
          change="+12.5%"
          trend="up"
          icon={<BarChart className="text-white" size={20} />}
          color="bg-sidebar"
        />
        <MetricCard
          title="Tasa de Respuesta"
          value="92%"
          change="+3.2%"
          trend="up"
          icon={<LineChart className="text-sidebar" size={20} />}
          color="bg-yellow"
        />
        <MetricCard
          title="Usuarios Activos"
          value="8,421"
          change="+5.1%"
          trend="up"
          icon={<Users className="text-white" size={20} />}
          color="bg-coral"
        />
        <MetricCard
          title="Conversión"
          value="18.3%"
          change="-2.4%"
          trend="down"
          icon={<TrendingUp className="text-white" size={20} />}
          color="bg-sidebar"
        />
      </div>

      {/* Gráfico principal */}
      <Card className="bg-white rounded-3xl shadow-sm">
        <CardHeader className="pb-0">
          <CardTitle>Rendimiento de Mensajes</CardTitle>
          <CardDescription>Análisis de mensajes enviados, recibidos y tasa de respuesta</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-[300px] w-full">
            {/* Simulación de gráfico con divs */}
            <div className="h-full w-full flex items-end justify-between gap-1 pt-10 relative">
              {/* Línea horizontal */}
              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gray-200"></div>

              {/* Líneas verticales de datos */}
              {Array.from({ length: 30 }).map((_, i) => {
                const height1 = 50 + Math.random() * 150
                const height2 = 30 + Math.random() * 100

                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-0">
                    <div className="w-full flex items-end justify-center gap-[1px]">
                      <div className="w-[40%] bg-sidebar rounded-t-sm" style={{ height: `${height1}px` }}></div>
                      <div className="w-[40%] bg-coral rounded-t-sm" style={{ height: `${height2}px` }}></div>
                    </div>
                    {i % 5 === 0 && <div className="text-[10px] text-gray-500 mt-1">{i + 1}</div>}
                  </div>
                )
              })}

              {/* Línea de tendencia */}
              <div className="absolute top-0 left-0 right-0 h-[1px] border-t border-dashed border-yellow"></div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-sidebar rounded-sm"></div>
              <span className="text-sm">Enviados</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-coral rounded-sm"></div>
              <span className="text-sm">Recibidos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow rounded-sm"></div>
              <span className="text-sm">Tendencia</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráficos secundarios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white rounded-3xl shadow-sm">
          <CardHeader className="pb-0">
            <CardTitle>Distribución por Plataforma</CardTitle>
            <CardDescription>Porcentaje de mensajes por canal</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-[200px]">
              {/* Simulación de gráfico circular */}
              <div className="relative w-[180px] h-[180px] rounded-full border-8 border-sidebar">
                <div
                  className="absolute inset-0 border-8 border-transparent border-t-coral border-r-coral rounded-full"
                  style={{ transform: "rotate(45deg)" }}
                ></div>
                <div
                  className="absolute inset-0 border-8 border-transparent border-t-yellow rounded-full"
                  style={{ transform: "rotate(225deg)" }}
                ></div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-sidebar rounded-sm"></div>
                <span className="text-sm">WhatsApp (45%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-coral rounded-sm"></div>
                <span className="text-sm">Instagram (35%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow rounded-sm"></div>
                <span className="text-sm">Messenger (20%)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-3xl shadow-sm">
          <CardHeader className="pb-0">
            <CardTitle>Rendimiento de Chatbots</CardTitle>
            <CardDescription>Efectividad y uso de chatbots</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Soporte 24/7</span>
                  <span className="text-sm">98%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-sidebar rounded-full" style={{ width: "98%" }}></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Ventas</span>
                  <span className="text-sm">87%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-coral rounded-full" style={{ width: "87%" }}></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">FAQ</span>
                  <span className="text-sm">92%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow rounded-full" style={{ width: "92%" }}></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Onboarding</span>
                  <span className="text-sm">78%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-sidebar rounded-full" style={{ width: "78%" }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
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
}: {
  title: string
  value: string
  change: string
  trend: "up" | "down"
  icon: React.ReactNode
  color: string
}) {
  return (
    <Card className="bg-white rounded-3xl shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            <div className="flex items-center mt-1">
              {trend === "up" ? (
                <ArrowUpRight size={14} className="text-green-500" />
              ) : (
                <ArrowDownRight size={14} className="text-red-500" />
              )}
              <p className={`text-xs ${trend === "up" ? "text-green-500" : "text-red-500"} ml-1`}>{change}</p>
            </div>
          </div>
          <div className={`w-12 h-12 ${color} rounded-full flex items-center justify-center`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}

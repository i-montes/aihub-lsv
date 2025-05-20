"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
} from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

// Datos simulados para los gráficos
const engagementData = [
  { fecha: "1 May", vistas: 1200, interacciones: 840, compartidos: 320 },
  { fecha: "8 May", vistas: 1800, interacciones: 1200, compartidos: 480 },
  { fecha: "15 May", vistas: 1400, interacciones: 980, compartidos: 350 },
  { fecha: "22 May", vistas: 2200, interacciones: 1540, compartidos: 620 },
  { fecha: "29 May", vistas: 2600, interacciones: 1820, compartidos: 730 },
  { fecha: "5 Jun", vistas: 2900, interacciones: 2030, compartidos: 810 },
  { fecha: "12 Jun", vistas: 3100, interacciones: 2170, compartidos: 870 },
]

const contentTypeData = [
  { tipo: "Reportajes", cantidad: 42, porcentaje: 35 },
  { tipo: "Entrevistas", cantidad: 28, porcentaje: 23 },
  { tipo: "Noticias", cantidad: 38, porcentaje: 32 },
  { tipo: "Opinión", cantidad: 12, porcentaje: 10 },
]

const sourceData = [
  { fuente: "Entrevistas directas", cantidad: 45, color: "bg-sidebar" },
  { fuente: "Comunicados oficiales", cantidad: 32, color: "bg-coral" },
  { fuente: "Redes sociales", cantidad: 28, color: "bg-yellow" },
  { fuente: "Investigación propia", cantidad: 38, color: "bg-green-500" },
  { fuente: "Agencias de noticias", cantidad: 22, color: "bg-blue-500" },
]

const audienceData = [
  { hora: "6am", lectores: 120 },
  { hora: "9am", lectores: 580 },
  { hora: "12pm", lectores: 320 },
  { hora: "3pm", lectores: 420 },
  { hora: "6pm", lectores: 650 },
  { hora: "9pm", lectores: 210 },
]

const topicTrendsData = [
  { tema: "Política", tendencia: 85, cambio: "+12%" },
  { tema: "Economía", tendencia: 72, cambio: "+8%" },
  { tema: "Tecnología", tendencia: 68, cambio: "+15%" },
  { tema: "Salud", tendencia: 63, cambio: "+5%" },
  { tema: "Medio ambiente", tendencia: 58, cambio: "+20%" },
]

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("30d")

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Análisis Periodístico</h1>
          <p className="text-muted-foreground mt-1">Métricas y tendencias de tu contenido</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm">
            <Calendar size={16} />
            <select
              className="text-sm font-medium bg-transparent border-none focus:outline-none"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="7d">Últimos 7 días</option>
              <option value="30d">Últimos 30 días</option>
              <option value="90d">Últimos 90 días</option>
              <option value="12m">Último año</option>
            </select>
          </div>

          <button className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm text-sm">
            <Filter size={16} />
            <span>Filtros</span>
          </button>

          <button className="flex items-center gap-2 bg-sidebar text-white rounded-lg p-2 shadow-sm text-sm">
            <Download size={16} />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* Resumen de métricas clave */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Artículos Publicados"
          value="124"
          change="+18%"
          trend="up"
          icon={<BarChart className="text-white" size={20} />}
          color="bg-sidebar"
          description="vs. periodo anterior"
        />
        <MetricCard
          title="Engagement Total"
          value="68.5%"
          change="+12.3%"
          trend="up"
          icon={<ThumbsUp className="text-white" size={20} />}
          color="bg-coral"
          description="interacciones/vistas"
        />
        <MetricCard
          title="Tiempo de Lectura"
          value="4:32"
          change="+0:45"
          trend="up"
          icon={<Clock className="text-white" size={20} />}
          color="bg-yellow"
          description="promedio por artículo"
        />
        <MetricCard
          title="Alcance"
          value="28.4K"
          change="+32%"
          trend="up"
          icon={<Globe className="text-white" size={20} />}
          color="bg-green-500"
          description="lectores únicos"
        />
      </div>

      {/* Pestañas de análisis */}
      <Tabs defaultValue="engagement" className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="content">Contenido</TabsTrigger>
          <TabsTrigger value="audience">Audiencia</TabsTrigger>
          <TabsTrigger value="sources">Fuentes</TabsTrigger>
        </TabsList>

        {/* Pestaña de Engagement */}
        <TabsContent value="engagement" className="space-y-4">
          <Card className="bg-white rounded-3xl shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Tendencias de Engagement</CardTitle>
                  <CardDescription>Análisis de vistas, interacciones y compartidos</CardDescription>
                </div>
                <div className="flex gap-2">
                  <button className="text-xs bg-gray-100 px-3 py-1 rounded-full">Diario</button>
                  <button className="text-xs bg-sidebar text-white px-3 py-1 rounded-full">Semanal</button>
                  <button className="text-xs bg-gray-100 px-3 py-1 rounded-full">Mensual</button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[300px] w-full">
                <ChartContainer
                  config={{
                    vistas: {
                      label: "Vistas",
                      color: "hsl(var(--chart-1))",
                    },
                    interacciones: {
                      label: "Interacciones",
                      color: "hsl(var(--chart-2))",
                    },
                    compartidos: {
                      label: "Compartidos",
                      color: "hsl(var(--chart-3))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={engagementData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="fecha" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="vistas"
                        stroke="var(--color-vistas)"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="interacciones"
                        stroke="var(--color-interacciones)"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="compartidos"
                        stroke="var(--color-compartidos)"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-white rounded-3xl shadow-sm">
              <CardHeader>
                <CardTitle>Artículos Más Compartidos</CardTitle>
                <CardDescription>Top 5 artículos con mayor difusión</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { titulo: "La crisis climática en América Latina", compartidos: 1240, categoria: "Medio Ambiente" },
                    { titulo: "Entrevista exclusiva: El futuro de la IA", compartidos: 980, categoria: "Tecnología" },
                    { titulo: "Análisis: Impacto de la inflación en 2023", compartidos: 845, categoria: "Economía" },
                    { titulo: "Reportaje: Sistema de salud en crisis", compartidos: 720, categoria: "Salud" },
                    {
                      titulo: "Investigación: Corrupción en el sector público",
                      compartidos: 690,
                      categoria: "Política",
                    },
                  ].map((articulo, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-start gap-3">
                        <div className="bg-gray-100 text-sidebar font-bold rounded-full w-7 h-7 flex items-center justify-center text-sm">
                          {i + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{articulo.titulo}</p>
                          <span className="text-xs text-gray-500">{articulo.categoria}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <Share2 size={14} className="text-sidebar" />
                        {articulo.compartidos}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-3xl shadow-sm">
              <CardHeader>
                <CardTitle>Canales de Distribución</CardTitle>
                <CardDescription>Origen del tráfico y compartidos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { canal: "Redes Sociales", porcentaje: 42, desglose: "Twitter 45%, Facebook 30%, Instagram 25%" },
                    { canal: "Búsqueda Orgánica", porcentaje: 28, desglose: "Google 92%, Bing 5%, Otros 3%" },
                    { canal: "Email", porcentaje: 15, desglose: "Newsletter 80%, Campañas 20%" },
                    { canal: "Referrals", porcentaje: 10, desglose: "Medios aliados 65%, Blogs 35%" },
                    { canal: "Directo", porcentaje: 5, desglose: "Tráfico directo a URL" },
                  ].map((canal, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{canal.canal}</span>
                        <span className="text-sm font-bold">{canal.porcentaje}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${i === 0 ? "bg-sidebar" : i === 1 ? "bg-coral" : i === 2 ? "bg-yellow" : i === 3 ? "bg-green-500" : "bg-blue-500"} rounded-full`}
                          style={{ width: `${canal.porcentaje}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500">{canal.desglose}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pestaña de Contenido */}
        <TabsContent value="content" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="bg-white rounded-3xl shadow-sm lg:col-span-2">
              <CardHeader>
                <CardTitle>Rendimiento por Tipo de Contenido</CardTitle>
                <CardDescription>Análisis de engagement por formato</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-[300px]">
                  <ChartContainer
                    config={{
                      cantidad: {
                        label: "Cantidad",
                        color: "hsl(var(--chart-1))",
                      },
                      porcentaje: {
                        label: "Engagement %",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={contentTypeData} barSize={40}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="tipo" />
                        <YAxis yAxisId="left" orientation="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar yAxisId="left" dataKey="cantidad" fill="var(--color-cantidad)" radius={[4, 4, 0, 0]} />
                        <Bar
                          yAxisId="right"
                          dataKey="porcentaje"
                          fill="var(--color-porcentaje)"
                          radius={[4, 4, 0, 0]}
                        />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-3xl shadow-sm">
              <CardHeader>
                <CardTitle>Tendencias Temáticas</CardTitle>
                <CardDescription>Temas con mayor crecimiento</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topicTrendsData.map((tema, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{tema.tema}</span>
                        <span className="text-xs text-green-500 font-medium">{tema.cambio}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${i === 0 ? "bg-sidebar" : i === 1 ? "bg-coral" : i === 2 ? "bg-yellow" : i === 3 ? "bg-green-500" : "bg-blue-500"} rounded-full`}
                          style={{ width: `${tema.tendencia}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Índice de interés: {tema.tendencia}/100</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-white rounded-3xl shadow-sm">
              <CardHeader>
                <CardTitle>Análisis de Sentimiento</CardTitle>
                <CardDescription>Percepción del contenido publicado</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-500">68%</div>
                    <div className="text-xs text-gray-500">Positivo</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-500">22%</div>
                    <div className="text-xs text-gray-500">Neutral</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-500">10%</div>
                    <div className="text-xs text-gray-500">Negativo</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Reportajes</span>
                      <span>72% positivo</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden flex">
                      <div className="h-full bg-green-500 rounded-l-full" style={{ width: "72%" }}></div>
                      <div className="h-full bg-gray-400" style={{ width: "18%" }}></div>
                      <div className="h-full bg-red-500 rounded-r-full" style={{ width: "10%" }}></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Entrevistas</span>
                      <span>65% positivo</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden flex">
                      <div className="h-full bg-green-500 rounded-l-full" style={{ width: "65%" }}></div>
                      <div className="h-full bg-gray-400" style={{ width: "25%" }}></div>
                      <div className="h-full bg-red-500 rounded-r-full" style={{ width: "10%" }}></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Noticias</span>
                      <span>58% positivo</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden flex">
                      <div className="h-full bg-green-500 rounded-l-full" style={{ width: "58%" }}></div>
                      <div className="h-full bg-gray-400" style={{ width: "30%" }}></div>
                      <div className="h-full bg-red-500 rounded-r-full" style={{ width: "12%" }}></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Opinión</span>
                      <span>52% positivo</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden flex">
                      <div className="h-full bg-green-500 rounded-l-full" style={{ width: "52%" }}></div>
                      <div className="h-full bg-gray-400" style={{ width: "28%" }}></div>
                      <div className="h-full bg-red-500 rounded-r-full" style={{ width: "20%" }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-3xl shadow-sm">
              <CardHeader>
                <CardTitle>Palabras Clave</CardTitle>
                <CardDescription>Términos con mayor impacto</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {[
                    { palabra: "Democracia", tamaño: "text-xl", color: "bg-sidebar text-white" },
                    { palabra: "Inflación", tamaño: "text-lg", color: "bg-coral text-white" },
                    { palabra: "Sostenibilidad", tamaño: "text-xl", color: "bg-yellow text-black" },
                    { palabra: "Innovación", tamaño: "text-base", color: "bg-green-500 text-white" },
                    { palabra: "Derechos", tamaño: "text-lg", color: "bg-blue-500 text-white" },
                    { palabra: "Pandemia", tamaño: "text-sm", color: "bg-gray-200 text-gray-700" },
                    { palabra: "Educación", tamaño: "text-base", color: "bg-purple-500 text-white" },
                    { palabra: "Tecnología", tamaño: "text-lg", color: "bg-sidebar text-white" },
                    { palabra: "Justicia", tamaño: "text-base", color: "bg-coral text-white" },
                    { palabra: "Economía", tamaño: "text-base", color: "bg-yellow text-black" },
                    { palabra: "Salud", tamaño: "text-sm", color: "bg-green-500 text-white" },
                    { palabra: "Política", tamaño: "text-xl", color: "bg-blue-500 text-white" },
                  ].map((palabra, i) => (
                    <span key={i} className={`${palabra.tamaño} ${palabra.color} px-3 py-1 rounded-full font-medium`}>
                      {palabra.palabra}
                    </span>
                  ))}
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-medium mb-2">Términos emergentes</h4>
                  <div className="space-y-2">
                    {[
                      { termino: "Inteligencia artificial", crecimiento: "+215%" },
                      { termino: "Crisis energética", crecimiento: "+180%" },
                      { termino: "Seguridad alimentaria", crecimiento: "+145%" },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <span className="text-sm">{item.termino}</span>
                        <span className="text-xs font-medium text-green-500">{item.crecimiento}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pestaña de Audiencia */}
        <TabsContent value="audience" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="bg-white rounded-3xl shadow-sm lg:col-span-2">
              <CardHeader>
                <CardTitle>Patrones de Lectura</CardTitle>
                <CardDescription>Horarios de mayor actividad</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-[300px]">
                  <ChartContainer
                    config={{
                      lectores: {
                        label: "Lectores",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={audienceData} barSize={40}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="hora" />
                        <YAxis />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="lectores" fill="var(--color-lectores)" radius={[4, 4, 0, 0]} />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-3xl shadow-sm">
              <CardHeader>
                <CardTitle>Demografía de Lectores</CardTitle>
                <CardDescription>Perfil de audiencia</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Distribución por edad</h4>
                    <div className="space-y-2">
                      {[
                        { grupo: "18-24", porcentaje: 15 },
                        { grupo: "25-34", porcentaje: 32 },
                        { grupo: "35-44", porcentaje: 28 },
                        { grupo: "45-54", porcentaje: 18 },
                        { grupo: "55+", porcentaje: 7 },
                      ].map((item, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>{item.grupo}</span>
                            <span>{item.porcentaje}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${i === 0 ? "bg-sidebar" : i === 1 ? "bg-coral" : i === 2 ? "bg-yellow" : i === 3 ? "bg-green-500" : "bg-blue-500"} rounded-full`}
                              style={{ width: `${item.porcentaje}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Distribución por género</h4>
                    <div className="flex items-center justify-center gap-4">
                      <div className="text-center">
                        <div className="inline-block w-24 h-24 rounded-full border-8 border-sidebar relative">
                          <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">
                            48%
                          </span>
                        </div>
                        <p className="text-xs mt-2">Masculino</p>
                      </div>
                      <div className="text-center">
                        <div className="inline-block w-24 h-24 rounded-full border-8 border-coral relative">
                          <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">
                            52%
                          </span>
                        </div>
                        <p className="text-xs mt-2">Femenino</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-white rounded-3xl shadow-sm">
              <CardHeader>
                <CardTitle>Dispositivos y Plataformas</CardTitle>
                <CardDescription>Cómo acceden tus lectores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Tipo de dispositivo</h4>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex justify-between text-xs">
                          <span>Móvil</span>
                          <span>68%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-sidebar rounded-full" style={{ width: "68%" }}></div>
                        </div>
                      </div>
                      <div className="w-8"></div>
                      <div className="space-y-1 flex-1">
                        <div className="flex justify-between text-xs">
                          <span>Desktop</span>
                          <span>24%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-coral rounded-full" style={{ width: "24%" }}></div>
                        </div>
                      </div>
                      <div className="w-8"></div>
                      <div className="space-y-1 flex-1">
                        <div className="flex justify-between text-xs">
                          <span>Tablet</span>
                          <span>8%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-yellow rounded-full" style={{ width: "8%" }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Navegadores</h4>
                    <div className="space-y-2">
                      {[
                        { navegador: "Chrome", porcentaje: 58 },
                        { navegador: "Safari", porcentaje: 22 },
                        { navegador: "Firefox", porcentaje: 12 },
                        { navegador: "Edge", porcentaje: 6 },
                        { navegador: "Otros", porcentaje: 2 },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor:
                                i === 0
                                  ? "var(--sidebar)"
                                  : i === 1
                                    ? "var(--coral)"
                                    : i === 2
                                      ? "var(--yellow)"
                                      : i === 3
                                        ? "green"
                                        : "blue",
                            }}
                          ></div>
                          <span className="text-xs">{item.navegador}</span>
                          <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                i === 0
                                  ? "bg-sidebar"
                                  : i === 1
                                    ? "bg-coral"
                                    : i === 2
                                      ? "bg-yellow"
                                      : i === 3
                                        ? "bg-green-500"
                                        : "bg-blue-500"
                              }`}
                              style={{ width: `${item.porcentaje}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium">{item.porcentaje}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-3xl shadow-sm">
              <CardHeader>
                <CardTitle>Geografía de Lectores</CardTitle>
                <CardDescription>Distribución por ubicación</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative h-[180px] bg-gray-50 rounded-lg overflow-hidden">
                    {/* Mapa simplificado */}
                    <div className="absolute inset-0 opacity-20 bg-sidebar"></div>
                    <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-sidebar rounded-full"></div>
                    <div className="absolute top-1/3 left-1/2 w-3 h-3 bg-coral rounded-full"></div>
                    <div className="absolute top-1/2 left-1/3 w-2 h-2 bg-yellow rounded-full"></div>
                    <div className="absolute top-2/3 left-2/3 w-4 h-4 bg-sidebar rounded-full"></div>
                    <div className="absolute top-1/2 left-3/4 w-2 h-2 bg-coral rounded-full"></div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Principales países</h4>
                    <div className="space-y-2">
                      {[
                        { pais: "México", porcentaje: 32 },
                        { pais: "Colombia", porcentaje: 24 },
                        { pais: "Argentina", porcentaje: 18 },
                        { pais: "España", porcentaje: 12 },
                        { pais: "Chile", porcentaje: 8 },
                        { pais: "Otros", porcentaje: 6 },
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                i === 0
                                  ? "bg-sidebar"
                                  : i === 1
                                    ? "bg-coral"
                                    : i === 2
                                      ? "bg-yellow"
                                      : i === 3
                                        ? "bg-green-500"
                                        : i === 4
                                          ? "bg-blue-500"
                                          : "bg-gray-400"
                              }`}
                            ></div>
                            <span className="text-sm">{item.pais}</span>
                          </div>
                          <span className="text-xs font-medium">{item.porcentaje}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pestaña de Fuentes */}
        <TabsContent value="sources" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="bg-white rounded-3xl shadow-sm lg:col-span-2">
              <CardHeader>
                <CardTitle>Distribución de Fuentes</CardTitle>
                <CardDescription>Origen de la información publicada</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-[300px] flex items-center justify-center">
                  <div className="w-[300px] h-[300px] relative">
                    {/* Gráfico circular simplificado */}
                    <div className="absolute inset-0 rounded-full border-[30px] border-sidebar"></div>
                    <div
                      className="absolute inset-0 rounded-full border-[30px] border-transparent border-t-coral border-r-coral"
                      style={{ transform: "rotate(45deg)" }}
                    ></div>
                    <div
                      className="absolute inset-0 rounded-full border-[30px] border-transparent border-t-yellow border-r-yellow"
                      style={{ transform: "rotate(160deg)" }}
                    ></div>
                    <div
                      className="absolute inset-0 rounded-full border-[30px] border-transparent border-t-green-500"
                      style={{ transform: "rotate(250deg)" }}
                    ></div>
                    <div
                      className="absolute inset-0 rounded-full border-[30px] border-transparent border-t-blue-500"
                      style={{ transform: "rotate(310deg)" }}
                    ></div>

                    {/* Centro del gráfico */}
                    <div className="absolute inset-0 m-[60px] rounded-full bg-white flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold">165</div>
                        <div className="text-xs text-gray-500">Fuentes totales</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mt-4">
                  {sourceData.map((source, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${source.color}`}></div>
                      <span className="text-xs">{source.fuente.split(" ")[0]}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-3xl shadow-sm">
              <CardHeader>
                <CardTitle>Calidad de Fuentes</CardTitle>
                <CardDescription>Evaluación de confiabilidad</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-sidebar">8.7</div>
                      <div className="text-xs text-gray-500">Índice de confiabilidad</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-coral">92%</div>
                      <div className="text-xs text-gray-500">Verificables</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow">4.2</div>
                      <div className="text-xs text-gray-500">Fuentes/artículo</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Tipo de fuentes</h4>
                    <div className="space-y-2">
                      {[
                        { tipo: "Primarias", porcentaje: 65, descripcion: "Entrevistas, documentos originales" },
                        { tipo: "Secundarias", porcentaje: 28, descripcion: "Análisis, informes" },
                        { tipo: "Terciarias", porcentaje: 7, descripcion: "Compilaciones, resúmenes" },
                      ].map((item, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium">{item.tipo}</span>
                            <span>{item.porcentaje}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${i === 0 ? "bg-sidebar" : i === 1 ? "bg-coral" : "bg-yellow"} rounded-full`}
                              style={{ width: `${item.porcentaje}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500">{item.descripcion}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white rounded-3xl shadow-sm">
            <CardHeader>
              <CardTitle>Fuentes Más Citadas</CardTitle>
              <CardDescription>Principales referencias utilizadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { nombre: "Instituto Nacional de Estadística", tipo: "Oficial", citas: 28, confiabilidad: "Alta" },
                  { nombre: "Universidad Nacional", tipo: "Académica", citas: 24, confiabilidad: "Alta" },
                  { nombre: "Ministerio de Economía", tipo: "Oficial", citas: 22, confiabilidad: "Alta" },
                  { nombre: "Centro de Investigación Política", tipo: "Think Tank", citas: 18, confiabilidad: "Media" },
                  {
                    nombre: "Organización Mundial de la Salud",
                    tipo: "Internacional",
                    citas: 16,
                    confiabilidad: "Alta",
                  },
                  { nombre: "Asociación de Empresarios", tipo: "Privada", citas: 14, confiabilidad: "Media" },
                ].map((fuente, i) => (
                  <div key={i} className="p-3 border border-gray-100 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-sm">{fuente.nombre}</h4>
                        <p className="text-xs text-gray-500">{fuente.tipo}</p>
                      </div>
                      <div
                        className={`px-2 py-1 rounded-full text-xs ${
                          fuente.confiabilidad === "Alta"
                            ? "bg-green-100 text-green-700"
                            : fuente.confiabilidad === "Media"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {fuente.confiabilidad}
                      </div>
                    </div>
                    <div className="mt-2 flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        <MessageSquare size={14} className="text-sidebar" />
                        <span className="text-xs">{fuente.citas} citas</span>
                      </div>
                      <button className="text-xs text-sidebar">Ver artículos</button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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
              <p className="text-xs text-gray-500 ml-2">{description}</p>
            </div>
          </div>
          <div className={`w-12 h-12 ${color} rounded-full flex items-center justify-center`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}

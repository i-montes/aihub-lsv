import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Layout } from "@/components/layout"
import { BarChart, LineChart, TrendingUp, Users, ArrowUpRight, ArrowDownRight } from "lucide-react"

export default function AnalyticsPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Análisis de Productividad</h1>
            <p className="text-sm text-gray-500 mt-1">Métricas de uso y eficiencia para periodistas</p>
          </div>
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

        {/* Tarjetas de métricas principales - actualizadas para periodistas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Tiempo Ahorrado"
            value="42.5 hrs"
            change="+15.2%"
            trend="up"
            icon={<BarChart className="text-white" size={20} />}
            color="bg-sidebar"
          />
          <MetricCard
            title="Textos Corregidos"
            value="328"
            change="+8.7%"
            trend="up"
            icon={<LineChart className="text-sidebar" size={20} />}
            color="bg-yellow"
          />
          <MetricCard
            title="Facts Verificados"
            value="1,245"
            change="+12.3%"
            trend="up"
            icon={<Users className="text-white" size={20} />}
            color="bg-coral"
          />
          <MetricCard
            title="Hilos Generados"
            value="86"
            change="+24.6%"
            trend="up"
            icon={<TrendingUp className="text-white" size={20} />}
            color="bg-sidebar"
          />
        </div>

        {/* Gráfico principal - actualizado para mostrar uso de herramientas */}
        <Card className="bg-white rounded-3xl shadow-sm">
          <CardHeader className="pb-0">
            <CardTitle>Uso de Herramientas</CardTitle>
            <CardDescription>Distribución del tiempo y recursos entre las diferentes herramientas</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px] w-full">
              {/* Gráfico de líneas */}
              <div className="h-full w-full relative">
                {/* Líneas de guía horizontales */}
                <div className="absolute inset-0 flex flex-col justify-between">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-full h-px bg-gray-100"></div>
                  ))}
                </div>

                {/* Línea horizontal base */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gray-200"></div>

                {/* Líneas verticales de guía */}
                <div className="absolute inset-0 flex justify-between">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-full w-px bg-gray-50"></div>
                  ))}
                </div>

                {/* SVG para las líneas */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {/* Definición de gradientes */}
                  <defs>
                    <linearGradient id="lineGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#4a6cf7" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#4a6cf7" stopOpacity="0.2" />
                    </linearGradient>
                    <linearGradient id="lineGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#f27474" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#f27474" stopOpacity="0.2" />
                    </linearGradient>
                    <linearGradient id="lineGradient3" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#ffb547" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#ffb547" stopOpacity="0.2" />
                    </linearGradient>
                    <linearGradient id="lineGradient4" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#4ade80" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#4ade80" stopOpacity="0.2" />
                    </linearGradient>
                  </defs>

                  {/* Áreas bajo las líneas */}
                  <path
                    d="M0,100 L0,70 C6.25,65 12.5,60 18.75,55 C25,50 31.25,60 37.5,50 C43.75,40 50,30 56.25,40 C62.5,50 68.75,45 75,35 C81.25,25 87.5,30 93.75,25 L100,20 L100,100 Z"
                    fill="url(#lineGradient1)"
                    opacity="0.2"
                  />
                  <path
                    d="M0,100 L0,80 C6.25,75 12.5,70 18.75,75 C25,80 31.25,70 37.5,65 C43.75,60 50,65 56.25,70 C62.5,75 68.75,65 75,60 C81.25,55 87.5,60 93.75,55 L100,50 L100,100 Z"
                    fill="url(#lineGradient2)"
                    opacity="0.2"
                  />
                  <path
                    d="M0,100 L0,85 C6.25,80 12.5,85 18.75,80 C25,75 31.25,80 37.5,75 C43.75,70 50,75 56.25,80 C62.5,85 68.75,80 75,75 C81.25,70 87.5,75 93.75,70 L100,65 L100,100 Z"
                    fill="url(#lineGradient3)"
                    opacity="0.2"
                  />
                  <path
                    d="M0,100 L0,90 C6.25,85 12.5,90 18.75,85 C25,80 31.25,85 37.5,90 C43.75,85 50,80 56.25,85 C62.5,90 68.75,85 75,80 C81.25,85 87.5,90 93.75,85 L100,80 L100,100 Z"
                    fill="url(#lineGradient4)"
                    opacity="0.2"
                  />

                  {/* Líneas */}
                  <path
                    d="M0,70 C6.25,65 12.5,60 18.75,55 C25,50 31.25,60 37.5,50 C43.75,40 50,30 56.25,40 C62.5,50 68.75,45 75,35 C81.25,25 87.5,30 93.75,25 L100,20"
                    fill="none"
                    stroke="#4a6cf7"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M0,80 C6.25,75 12.5,70 18.75,75 C25,80 31.25,70 37.5,65 C43.75,60 50,65 56.25,70 C62.5,75 68.75,65 75,60 C81.25,55 87.5,60 93.75,55 L100,50"
                    fill="none"
                    stroke="#f27474"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M0,85 C6.25,80 12.5,85 18.75,80 C25,75 31.25,80 37.5,75 C43.75,70 50,75 56.25,80 C62.5,85 68.75,80 75,75 C81.25,70 87.5,75 93.75,70 L100,65"
                    fill="none"
                    stroke="#ffb547"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M0,90 C6.25,85 12.5,90 18.75,85 C25,80 31.25,85 37.5,90 C43.75,85 50,80 56.25,85 C62.5,90 68.75,85 75,80 C81.25,85 87.5,90 93.75,85 L100,80"
                    fill="none"
                    stroke="#4ade80"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />

                  {/* Puntos en las líneas */}
                  {[0, 18.75, 37.5, 56.25, 75, 93.75].map((x, index) => (
                    <React.Fragment key={index}>
                      <circle cx={x} cy="70" r="2" fill="#4a6cf7" stroke="#fff" strokeWidth="1" />
                      <circle cx={x} cy="80" r="2" fill="#f27474" stroke="#fff" strokeWidth="1" />
                      <circle cx={x} cy="85" r="2" fill="#ffb547" stroke="#fff" strokeWidth="1" />
                      <circle cx={x} cy="90" r="2" fill="#4ade80" stroke="#fff" strokeWidth="1" />
                    </React.Fragment>
                  ))}
                </svg>

                {/* Etiquetas del eje X */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
                  {["01", "05", "10", "15", "20", "25", "30"].map((label) => (
                    <div key={label} className="text-[11px] text-gray-500 mt-2 font-medium">
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-6 mt-6 flex-wrap">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ background: "linear-gradient(to right, #4a6cf7, #6a8eff)" }}
                ></div>
                <span className="text-sm font-medium">Asistente de escritura</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ background: "linear-gradient(to right, #f27474, #ff9797)" }}
                ></div>
                <span className="text-sm font-medium">Corrector de texto</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ background: "linear-gradient(to right, #ffb547, #ffd283)" }}
                ></div>
                <span className="text-sm font-medium">Fact checker</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ background: "linear-gradient(to right, #4ade80, #86efac)" }}
                ></div>
                <span className="text-sm font-medium">Generador de hilos</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gráficos secundarios - actualizados para periodistas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white rounded-3xl shadow-sm">
            <CardHeader className="pb-0">
              <CardTitle>Ahorro de Tiempo por Herramienta</CardTitle>
              <CardDescription>Minutos ahorrados en promedio por uso</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center justify-center h-[220px]">
                {/* Gráfico circular mejorado */}
                <div className="relative w-[200px] h-[200px]">
                  {/* Círculo base */}
                  <div className="absolute inset-0 rounded-full border-[16px] border-gray-100"></div>

                  {/* Segmentos del gráfico */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                    <defs>
                      <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#4a6cf7" />
                        <stop offset="100%" stopColor="#6a8eff" />
                      </linearGradient>
                      <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f27474" />
                        <stop offset="100%" stopColor="#ff9797" />
                      </linearGradient>
                      <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ffb547" />
                        <stop offset="100%" stopColor="#ffd283" />
                      </linearGradient>
                      <linearGradient id="gradient4" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#4ade80" />
                        <stop offset="100%" stopColor="#86efac" />
                      </linearGradient>
                    </defs>

                    {/* Segmento 42% - Asistente */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="url(#gradient1)"
                      strokeWidth="16"
                      strokeDasharray={`${42 * 2.51} ${100 * 2.51}`}
                      strokeDashoffset="0"
                      transform="rotate(-90 50 50)"
                    />

                    {/* Segmento 28% - Corrector */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="url(#gradient2)"
                      strokeWidth="16"
                      strokeDasharray={`${28 * 2.51} ${100 * 2.51}`}
                      strokeDashoffset={`${-42 * 2.51}`}
                      transform="rotate(-90 50 50)"
                    />

                    {/* Segmento 18% - Fact checker */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="url(#gradient3)"
                      strokeWidth="16"
                      strokeDasharray={`${18 * 2.51} ${100 * 2.51}`}
                      strokeDashoffset={`${-(42 + 28) * 2.51}`}
                      transform="rotate(-90 50 50)"
                    />

                    {/* Segmento 12% - Hilos */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="url(#gradient4)"
                      strokeWidth="16"
                      strokeDasharray={`${12 * 2.51} ${100 * 2.51}`}
                      strokeDashoffset={`${-(42 + 28 + 18) * 2.51}`}
                      transform="rotate(-90 50 50)"
                    />
                  </svg>

                  {/* Círculo central */}
                  <div className="absolute inset-[16px] bg-white rounded-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold">42.5h</div>
                      <div className="text-xs text-gray-500">Total ahorrado</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-6 mt-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ background: "linear-gradient(to right, #4a6cf7, #6a8eff)" }}
                  ></div>
                  <span className="text-sm font-medium">Asistente (42%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ background: "linear-gradient(to right, #f27474, #ff9797)" }}
                  ></div>
                  <span className="text-sm font-medium">Corrector (28%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ background: "linear-gradient(to right, #ffb547, #ffd283)" }}
                  ></div>
                  <span className="text-sm font-medium">Fact checker (18%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ background: "linear-gradient(to right, #4ade80, #86efac)" }}
                  ></div>
                  <span className="text-sm font-medium">Hilos (12%)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-3xl shadow-sm">
            <CardHeader className="pb-0">
              <CardTitle>Precisión de Herramientas</CardTitle>
              <CardDescription>Tasa de acierto y calidad de resultados</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-sm"
                        style={{ background: "linear-gradient(to right, #4a6cf7, #6a8eff)" }}
                      ></div>
                      <span className="text-sm font-medium">Corrector de texto</span>
                    </div>
                    <span className="text-sm font-bold">98%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: "98%",
                        background: "linear-gradient(to right, #4a6cf7, #6a8eff)",
                        boxShadow: "0 2px 4px rgba(74, 108, 247, 0.3)",
                      }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-sm"
                        style={{ background: "linear-gradient(to right, #f27474, #ff9797)" }}
                      ></div>
                      <span className="text-sm font-medium">Fact checker</span>
                    </div>
                    <span className="text-sm font-bold">92%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: "92%",
                        background: "linear-gradient(to right, #f27474, #ff9797)",
                        boxShadow: "0 2px 4px rgba(242, 116, 116, 0.3)",
                      }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-sm"
                        style={{ background: "linear-gradient(to right, #ffb547, #ffd283)" }}
                      ></div>
                      <span className="text-sm font-medium">Asistente de escritura</span>
                    </div>
                    <span className="text-sm font-bold">89%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: "89%",
                        background: "linear-gradient(to right, #ffb547, #ffd283)",
                        boxShadow: "0 2px 4px rgba(255, 181, 71, 0.3)",
                      }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-sm"
                        style={{ background: "linear-gradient(to right, #4ade80, #86efac)" }}
                      ></div>
                      <span className="text-sm font-medium">Generador de hilos</span>
                    </div>
                    <span className="text-sm font-bold">85%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: "85%",
                        background: "linear-gradient(to right, #4ade80, #86efac)",
                        boxShadow: "0 2px 4px rgba(74, 222, 128, 0.3)",
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Nueva sección: Análisis de productividad por tipo de contenido */}
        <Card className="bg-white rounded-3xl shadow-sm">
          <CardHeader className="pb-0">
            <CardTitle>Productividad por Tipo de Contenido</CardTitle>
            <CardDescription>Tiempo ahorrado según el formato periodístico</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-white to-gray-50 p-5 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-gray-800">Noticias</h3>
                  <span className="text-xs bg-blue-500 bg-opacity-10 text-blue-600 px-2 py-1 rounded-full font-medium">
                    +32%
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-800">18.5 hrs</p>
                <p className="text-xs text-gray-500 mt-1">Tiempo ahorrado este mes</p>
                <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: "78%",
                      background: "linear-gradient(to right, #4a6cf7, #6a8eff)",
                      boxShadow: "0 1px 3px rgba(74, 108, 247, 0.3)",
                    }}
                  ></div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-white to-gray-50 p-5 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-gray-800">Reportajes</h3>
                  <span className="text-xs bg-red-500 bg-opacity-10 text-red-600 px-2 py-1 rounded-full font-medium">
                    +45%
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-800">12.3 hrs</p>
                <p className="text-xs text-gray-500 mt-1">Tiempo ahorrado este mes</p>
                <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: "65%",
                      background: "linear-gradient(to right, #f27474, #ff9797)",
                      boxShadow: "0 1px 3px rgba(242, 116, 116, 0.3)",
                    }}
                  ></div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-white to-gray-50 p-5 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-gray-800">Entrevistas</h3>
                  <span className="text-xs bg-yellow-500 bg-opacity-10 text-yellow-600 px-2 py-1 rounded-full font-medium">
                    +18%
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-800">8.7 hrs</p>
                <p className="text-xs text-gray-500 mt-1">Tiempo ahorrado este mes</p>
                <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: "52%",
                      background: "linear-gradient(to right, #ffb547, #ffd283)",
                      boxShadow: "0 1px 3px rgba(255, 181, 71, 0.3)",
                    }}
                  ></div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-white to-gray-50 p-5 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-gray-800">Opinión</h3>
                  <span className="text-xs bg-green-500 bg-opacity-10 text-green-600 px-2 py-1 rounded-full font-medium">
                    +27%
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-800">6.2 hrs</p>
                <p className="text-xs text-gray-500 mt-1">Tiempo ahorrado este mes</p>
                <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: "45%",
                      background: "linear-gradient(to right, #4ade80, #86efac)",
                      boxShadow: "0 1px 3px rgba(74, 222, 128, 0.3)",
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
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
  const gradientMap = {
    "bg-sidebar": "linear-gradient(135deg, #4a6cf7, #6a8eff)",
    "bg-yellow": "linear-gradient(135deg, #ffb547, #ffd283)",
    "bg-coral": "linear-gradient(135deg, #f27474, #ff9797)",
    "bg-green-500": "linear-gradient(135deg, #4ade80, #86efac)",
  }

  const gradient = gradientMap[color] || gradientMap["bg-sidebar"]

  return (
    <Card className="bg-white rounded-3xl shadow-sm overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-center justify-between p-6">
          <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            <div className="flex items-center mt-2">
              {trend === "up" ? (
                <ArrowUpRight size={14} className="text-green-500" />
              ) : (
                <ArrowDownRight size={14} className="text-red-500" />
              )}
              <p className={`text-xs ${trend === "up" ? "text-green-500" : "text-red-500"} ml-1 font-medium`}>
                {change}
              </p>
            </div>
          </div>
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center shadow-md"
            style={{ background: gradient }}
          >
            {icon}
          </div>
        </div>
        <div className="h-1" style={{ background: gradient }}></div>
      </CardContent>
    </Card>
  )
}

import type React from "react";
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Loader2 } from "lucide-react";
import { MODELS } from "@/lib/utils";

/**
 * Props para el componente AnalysisResultsPanel
 */
interface AnalysisResultsPanelProps {
  markdownContent: string | null;
  isVisible: boolean;
  isStreaming?: boolean;
  streamingStep?: string;
  isCompareMode?: boolean;
  result1?: string | null;
  result2?: string | null;
  model1Name?: string;
  model2Name?: string;
}

/**
 * Panel de resultados del análisis de desinformación
 * Muestra los resultados detallados del análisis de IA
 */
export const AnalysisResultsPanel: React.FC<AnalysisResultsPanelProps> = ({
  markdownContent,
  isVisible,
  isStreaming = false,
  streamingStep = "",
  isCompareMode = false,
  result1 = null,
  result2 = null,
  model1Name = "Modelo 1",
  model2Name = "Modelo 2",
}) => {
  if (!isVisible) {
    return null;
  }

  const name1 = model1Name.split(" - ")[1];
  const name2 = model2Name.split(" - ")[1];

  return (
    <div className="w-1/2 flex flex-col h-full">
      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-4">
        <TrendingUp className="w-6 h-6" />
        Resultados del análisis de IA
      </h2>

      <Tabs defaultValue="model1" className="w-full">
        <Card className="flex-1 overflow-hidden">
          <CardHeader>
            {isCompareMode && (
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="model1">
                  {MODELS[name1 as keyof typeof MODELS]}
                </TabsTrigger>
                <TabsTrigger value="model2">
                  {MODELS[name2 as keyof typeof MODELS]}
                </TabsTrigger>
              </TabsList>
            )}
          </CardHeader>
          <CardContent className="h-full max-h-[calc(100vh-242px)] overflow-y-auto">
            {/* Mostrar indicador de streaming si está activo */}
            {isStreaming && (
              <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span className="text-sm text-blue-700">
                  {streamingStep || "Generando análisis..."}
                </span>
              </div>
            )}

            {isCompareMode ? (
              // Modo comparación con tabs
              <>
                <TabsContent value="model1" className="mt-4">
                  <div className="prose prose-sm max-w-none">
                    <div className="markdown-content">
                      {result1 || isStreaming ? (
                        <>
                          <ReactMarkdown
                            components={{
                              h1: ({ children }) => (
                                <h1 className="text-xl font-bold text-gray-900 mb-3">
                                  {children}
                                </h1>
                              ),
                              h2: ({ children }) => (
                                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                                  {children}
                                </h2>
                              ),
                              h3: ({ children }) => (
                                <h3 className="text-base font-medium text-gray-700 mb-2">
                                  {children}
                                </h3>
                              ),
                              a: ({ children, href }) => (
                                <a
                                  className="text-blue-600 hover:underline"
                                  href={href}
                                >
                                  {children}
                                </a>
                              ),
                              p: ({ children }) => (
                                <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                                  {children}
                                </p>
                              ),
                              ul: ({ children }) => (
                                <ul className="list-disc list-inside mb-3 space-y-1">
                                  {children}
                                </ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="list-decimal list-outside mb-3 space-y-1 pl-6">
                                  {children}
                                </ol>
                              ),
                              li: ({ children }) => (
                                <li className="text-sm text-gray-600">
                                  {children}
                                </li>
                              ),
                              strong: ({ children }) => (
                                <strong className="font-semibold text-gray-800">
                                  {children}
                                </strong>
                              ),
                              em: ({ children }) => (
                                <em className="italic text-gray-700">
                                  {children}
                                </em>
                              ),
                              blockquote: ({ children }) => (
                                <blockquote className="border-l-4 border-blue-200 pl-4 py-2 bg-blue-50 mb-3">
                                  {children}
                                </blockquote>
                              ),
                              code: ({ children }) => (
                                <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">
                                  {children}
                                </code>
                              ),
                              pre: ({ children }) => (
                                <pre className="bg-gray-100 p-3 rounded-md overflow-x-auto mb-3">
                                  {children}
                                </pre>
                              ),
                            }}
                          >
                            {result1 || ""}
                          </ReactMarkdown>

                          {/* Cursor parpadeante durante streaming */}
                          {isStreaming && (
                            <span className="inline-block w-2 h-4 bg-blue-600 animate-pulse ml-1" />
                          )}
                        </>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>Los resultados del {model1Name} aparecerán aquí</p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="model2" className="mt-4">
                  <div className="prose prose-sm max-w-none">
                    <div className="markdown-content">
                      {result2 || isStreaming ? (
                        <>
                          <ReactMarkdown
                            components={{
                              h1: ({ children }) => (
                                <h1 className="text-xl font-bold text-gray-900 mb-3">
                                  {children}
                                </h1>
                              ),
                              h2: ({ children }) => (
                                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                                  {children}
                                </h2>
                              ),
                              h3: ({ children }) => (
                                <h3 className="text-base font-medium text-gray-700 mb-2">
                                  {children}
                                </h3>
                              ),
                              a: ({ children, href }) => (
                                <a
                                  className="text-blue-600 hover:underline"
                                  href={href}
                                >
                                  {children}
                                </a>
                              ),
                              p: ({ children }) => (
                                <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                                  {children}
                                </p>
                              ),
                              ul: ({ children }) => (
                                <ul className="list-disc list-inside mb-3 space-y-1">
                                  {children}
                                </ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="list-decimal list-outside mb-3 space-y-1 pl-6">
                                  {children}
                                </ol>
                              ),
                              li: ({ children }) => (
                                <li className="text-sm text-gray-600">
                                  {children}
                                </li>
                              ),
                              strong: ({ children }) => (
                                <strong className="font-semibold text-gray-800">
                                  {children}
                                </strong>
                              ),
                              em: ({ children }) => (
                                <em className="italic text-gray-700">
                                  {children}
                                </em>
                              ),
                              blockquote: ({ children }) => (
                                <blockquote className="border-l-4 border-green-200 pl-4 py-2 bg-green-50 mb-3">
                                  {children}
                                </blockquote>
                              ),
                              code: ({ children }) => (
                                <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">
                                  {children}
                                </code>
                              ),
                              pre: ({ children }) => (
                                <pre className="bg-gray-100 p-3 rounded-md overflow-x-auto mb-3">
                                  {children}
                                </pre>
                              ),
                            }}
                          >
                            {result2 || ""}
                          </ReactMarkdown>

                          {/* Cursor parpadeante durante streaming */}
                          {isStreaming && (
                            <span className="inline-block w-2 h-4 bg-green-600 animate-pulse ml-1" />
                          )}
                        </>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>Los resultados del {model2Name} aparecerán aquí</p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </>
            ) : (
              // Modo normal sin comparación
              <div className="prose prose-sm max-w-none">
                <div className="markdown-content">
                  {markdownContent || isStreaming ? (
                    <>
                      <ReactMarkdown
                        components={{
                          h1: ({ children }) => (
                            <h1 className="text-xl font-bold text-gray-900 mb-3">
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-lg font-semibold text-gray-800 mb-2">
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-base font-medium text-gray-700 mb-2">
                              {children}
                            </h3>
                          ),
                          a: ({ children, href }) => (
                            <a
                              className="text-blue-600 hover:underline"
                              href={href}
                            >
                              {children}
                            </a>
                          ),
                          p: ({ children }) => (
                            <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                              {children}
                            </p>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc list-inside mb-3 space-y-1">
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal list-outside mb-3 space-y-1 pl-6">
                              {children}
                            </ol>
                          ),
                          li: ({ children }) => (
                            <li className="text-sm text-gray-600">
                              {children}
                            </li>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-semibold text-gray-800">
                              {children}
                            </strong>
                          ),
                          em: ({ children }) => (
                            <em className="italic text-gray-700">{children}</em>
                          ),
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-blue-200 pl-4 py-2 bg-blue-50 mb-3">
                              {children}
                            </blockquote>
                          ),
                          code: ({ children }) => (
                            <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">
                              {children}
                            </code>
                          ),
                          pre: ({ children }) => (
                            <pre className="bg-gray-100 p-3 rounded-md overflow-x-auto mb-3">
                              {children}
                            </pre>
                          ),
                        }}
                      >
                        {markdownContent || ""}
                      </ReactMarkdown>

                      {/* Cursor parpadeante durante streaming */}
                      {isStreaming && (
                        <span className="inline-block w-2 h-4 bg-blue-600 animate-pulse ml-1" />
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Los resultados del análisis aparecerán aquí</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
};

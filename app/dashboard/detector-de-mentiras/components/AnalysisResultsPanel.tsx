import type React from "react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { renderToString } from "react-dom/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { TrendingUp, Loader2, Copy, Check } from "lucide-react";
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
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("model1");

  if (!isVisible) {
    return null;
  }

  const name1 = model1Name.split(" - ")[1];
  const name2 = model2Name.split(" - ")[1];

  // Función para convertir markdown a HTML usando los mismos componentes de estilo
  const convertMarkdownToHtml = (markdown: string) => {
    const markdownComponent = (
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.75rem' }}>
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 style={{ fontSize: '1rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
              {children}
            </h3>
          ),
          a: ({ children, href }) => (
            <a style={{ color: '#2563eb', textDecoration: 'underline' }} href={href}>
              {children}
            </a>
          ),
          p: ({ children }) => (
            <p style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '0.5rem', lineHeight: '1.5' }}>
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', marginBottom: '0.75rem' }}>
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol style={{ listStyleType: 'decimal', paddingLeft: '1.5rem', marginBottom: '0.75rem' }}>
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '0.25rem' }}>
              {children}
            </li>
          ),
          strong: ({ children }) => (
            <strong style={{ fontWeight: '600', color: '#1f2937' }}>
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em style={{ fontStyle: 'italic', color: '#374151' }}>
              {children}
            </em>
          ),
          blockquote: ({ children }) => (
            <blockquote style={{ borderLeft: '4px solid #93c5fd', paddingLeft: '1rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', backgroundColor: '#eff6ff', marginBottom: '0.75rem' }}>
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontFamily: 'monospace' }}>
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre style={{ backgroundColor: '#f3f4f6', padding: '0.75rem', borderRadius: '0.375rem', overflowX: 'auto', marginBottom: '0.75rem' }}>
              {children}
            </pre>
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    );

    return renderToString(markdownComponent);
  };

  // Función para copiar contenido al portapapeles como HTML
  const handleCopy = async () => {
    let markdownToCopy = "";
    
    if (isCompareMode) {
      // En modo comparación, copiar el contenido de la tab activa
      markdownToCopy = activeTab === "model1" ? (result1 || "") : (result2 || "");
    } else {
      // En modo normal, copiar el contenido markdown
      markdownToCopy = markdownContent || "";
    }

    if (!markdownToCopy.trim()) {
      return; // No copiar si no hay contenido
    }

    try {
      // Convertir markdown a HTML
      const htmlContent = convertMarkdownToHtml(markdownToCopy);
      
      // Crear un ClipboardItem con HTML
      const clipboardItem = new ClipboardItem({
        'text/html': new Blob([htmlContent], { type: 'text/html' }),
        'text/plain': new Blob([markdownToCopy], { type: 'text/plain' })
      });
      
      await navigator.clipboard.write([clipboardItem]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
      // Fallback: copiar como texto plano si falla el HTML
      try {
        await navigator.clipboard.writeText(markdownToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackErr) {
        console.error('Error en fallback:', fallbackErr);
      }
    }
  };

  // Determinar si hay contenido para copiar
  const hasContentToCopy = isCompareMode 
    ? (activeTab === "model1" ? !!result1?.trim() : !!result2?.trim())
    : !!markdownContent?.trim();

  return (
    <div className="w-1/2 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp className="w-6 h-6" />
          Resultados
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          disabled={!hasContentToCopy || isStreaming}
          className="flex items-center gap-2"
          title={copied ? "¡Copiado!" : "Copiar contenido"}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-green-600">Copiado</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copiar</span>
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="model1" className="w-full" onValueChange={setActiveTab}>
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
                      <p>Los resultados aparecerán aquí</p>
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

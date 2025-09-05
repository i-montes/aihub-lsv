'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, ExternalLink, Trash2, Loader2, Image, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { UrlMetadata } from '@/app/api/url-metadata/types';

interface TextUrlExtractorProps {
  placeholder?: string;
  className?: string;
  onUrlsChange?: (urls: string[]) => void;
  initialText?: string;
  maxHeight?: string;
  showExternalLinks?: boolean;
  allowRemoveUrls?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  onMetadata?: (metadata: Map<string, UrlMetadata & {isLoading: boolean}>) => void;
}

interface ExtractedUrl {
  url: string;
  id: string;
  isValid: boolean;
}

const TextUrlExtractor: React.FC<TextUrlExtractorProps> = ({
  placeholder = "Ingresa texto aquí y las URLs serán detectadas automáticamente...",
  className,
  onUrlsChange,
  initialText = "",
  maxHeight = "200px",
  showExternalLinks = true,
  allowRemoveUrls = false,
  value,
  onChange,
  onMetadata
}) => {
  const [text, setText] = useState<string>(value || initialText);
  const [extractedUrls, setExtractedUrls] = useState<ExtractedUrl[]>([]);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [urlMetadata, setUrlMetadata] = useState<Map<string, UrlMetadata & {isLoading: boolean}>>(new Map());
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Función para validar si una URL es válida
  const isValidUrl = useCallback((url: string): boolean => {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }, []);


  // Función para normalizar URLs para mostrar
  const normalizeUrl = useCallback((url: string): string => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  }, []);



  // Función para normalizar URLs para comparación de duplicados
  const normalizeUrlForComparison = useCallback((url: string): string => {
    let normalized = url.trim();
    
    // Agregar https:// si no tiene protocolo
    if (!normalized.match(/^https?:\/\//)) {
      normalized = `https://${normalized}`;
    }
    
    // Remover trailing slash excepto para dominios raíz
    if (normalized.endsWith('/') && normalized.split('/').length > 3) {
      normalized = normalized.slice(0, -1);
    }
    
    return normalized;
  }, []);

  // Función para cargar metadatos desde caché
  const loadCachedMetadata = (): Map<string, UrlMetadata & {isLoading: boolean}> => {
    try {
      const cached = localStorage.getItem('url-metadata-cache');
      if (cached) {
        const parsedCache = JSON.parse(cached);
        const cacheMap = new Map<string, UrlMetadata & {isLoading: boolean}>();
        
        // Filtrar entradas que no sean muy antiguas (24 horas)
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000; // 24 horas
        
        Object.entries(parsedCache).forEach(([url, data]: [string, any]) => {
          if (data.timestamp && (now - data.timestamp) < maxAge) {
            cacheMap.set(url, {
              url: data.url,
              title: data.title,
              description: data.description,
              image: data.image,
              statusCode: data.statusCode,
              isValid: data.isValid,
              error: data.error,
              isLoading: false,
              complete_text: data.complete_text,
              
              // Twitter-specific fields
              isTwitter: data.isTwitter,
              text: data.text,
              username: data.username,
              name: data.name,
              author_image: data.author_image,
              follower_count: data.follower_count,
              like_count: data.like_count,
              retweet_count: data.retweet_count,
              creation_date: data.creation_date,
              user_description: data.user_description,
              media_image: data.media_image,
              media_video: data.media_video
            });
          }
        });
        
        return cacheMap;
      }
    } catch (error) {
      console.error('Error loading cached metadata:', error);
    }
    return new Map<string, UrlMetadata & { isLoading: boolean }>();
  };
  
  // Función para guardar metadatos en caché
  const saveCachedMetadata = (metadata: Map<string, UrlMetadata & {isLoading: boolean}>) => {
    try {
      const cacheObject: Record<string, any> = {};
      metadata.forEach((data, url) => {
        if (!data.isLoading) {
          cacheObject[url] = {
            ...data,
            timestamp: Date.now()
          };
        }
      });
      localStorage.setItem('url-metadata-cache', JSON.stringify(cacheObject));
    } catch (error) {
      console.error('Error saving cached metadata:', error);
    }
  };

  // Función para analizar URLs y obtener metadatos
  const analyzeUrls = useCallback(async (urls: string[]) => {
    if (urls.length === 0) return;
    
    setIsAnalyzing(true);
    
    // Cargar metadatos desde caché
    const cachedMetadata = loadCachedMetadata();
    const newMetadata = new Map(urlMetadata);
    
    // Separar URLs que ya están en caché de las que necesitan análisis
    const urlsToAnalyze: string[] = [];
    
    urls.forEach(url => {
      const cached = cachedMetadata.get(url);
      if (cached) {
        // Usar datos del caché
        newMetadata.set(url, cached);
      } else {
        // Marcar como cargando y agregar a la lista de análisis
        newMetadata.set(url, {
          url,
          statusCode: 0,
          isValid: false,
          isLoading: true
        });
        urlsToAnalyze.push(url);
      }
    });
    
    setUrlMetadata(newMetadata);
    
    // Si no hay URLs para analizar, terminar aquí
    if (urlsToAnalyze.length === 0) {
      setIsAnalyzing(false);
      return;
    }
    
    try {
      const response = await fetch('/api/url-metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ urls: urlsToAnalyze }),
      });
      
      if (!response.ok) {
        throw new Error('Error al analizar URLs');
      }
      
      const data = await response.json();
      
      // Actualizar metadatos
      const updatedMetadata = new Map(newMetadata);
      data.results.forEach((result: UrlMetadata) => {
        updatedMetadata.set(result.url, {
          ...result,
          isLoading: false
        });
      });
      
      setUrlMetadata(updatedMetadata);
      // Guardar en caché los nuevos resultados
      saveCachedMetadata(updatedMetadata);
      
    } catch (error) {
      console.error('Error analyzing URLs:', error);
      toast.error('Error al analizar las URLs');
      
      // Marcar URLs como error
      const errorMetadata = new Map(newMetadata);
      urlsToAnalyze.forEach(url => {
        errorMetadata.set(url, {
          url,
          statusCode: 0,
          isValid: false,
          isLoading: false,
          error: 'Error de conexión'
        });
      });
      setUrlMetadata(errorMetadata);
    } finally {
      setIsAnalyzing(false);
    }
  }, [urlMetadata]);

  // Extraer URLs del texto
  const extractUrls = useCallback((inputText: string): ExtractedUrl[] => {
    // Regex mejorada para detectar URLs - más específica y robusta
    const urlRegex = /(https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&=\/]*)?|(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&=\/]*)?)/gi;
    
    // Dividir el texto en líneas y procesar cada línea
    const lines = inputText.split(/\r?\n/);
    const allMatches: string[] = [];
    
    // Procesar cada línea por separado para asegurar detección correcta
    for (const line of lines) {
      const lineMatches = line.match(urlRegex) || [];
      allMatches.push(...lineMatches);
    }
    
    // También procesar el texto completo como respaldo
    const globalMatches = inputText.match(urlRegex) || [];
    allMatches.push(...globalMatches);
    
    // Filtrar URLs únicas usando normalización para comparación
    const uniqueUrls: string[] = [];
    const seenNormalizedUrls = new Set<string>();
    
    for (const match of allMatches) {
      const trimmedUrl = match.trim();
      
      if (trimmedUrl) {
        const normalizedForComparison = normalizeUrlForComparison(trimmedUrl);
        
        // Solo agregar si no hemos visto esta URL normalizada antes
        if (!seenNormalizedUrls.has(normalizedForComparison)) {
          seenNormalizedUrls.add(normalizedForComparison);
          uniqueUrls.push(trimmedUrl);
        }
      }
    }
    
    // Limitar a un máximo de 7 URLs
    const limitedUrls = uniqueUrls.slice(0, 7);
    const hasMoreUrls = uniqueUrls.length > 7;
    
    const result = limitedUrls.map((url, index) => ({
      url: normalizeUrl(url),
      id: `url-${index}-${Date.now()}`,
      isValid: isValidUrl(url)
    }));
    
    // Agregar información sobre URLs adicionales si las hay
    if (hasMoreUrls) {
      (result as any).hasMoreUrls = true;
      (result as any).totalUrls = uniqueUrls.length;
    }
    
    return result;
  }, [normalizeUrl, isValidUrl, normalizeUrlForComparison]);

  // Efecto para sincronizar con la prop value
  useEffect(() => {
    if (value !== undefined && value !== text) {
      setText(value);
    }
  }, [value]);

  // Efecto para extraer URLs cuando cambia el texto
  useEffect(() => {
    const urls = extractUrls(text);
    setExtractedUrls(urls);
    
    // Notificar URLs válidas al componente padre
    const validUrlStrings = urls
      .filter(urlObj => urlObj.isValid)
      .map(urlObj => urlObj.url);
    
    if (onUrlsChange) {
      onUrlsChange(validUrlStrings);
    }
  }, [text, extractUrls, onUrlsChange]);
  
  // Efecto separado para analizar URLs cuando se detectan nuevas
  useEffect(() => {
    const validUrls = extractedUrls
      .filter(urlObj => urlObj.isValid)
      .map(urlObj => urlObj.url);
    
    if (validUrls.length > 0) {
      // Solo analizar URLs que no han sido analizadas previamente
      const urlsToAnalyze = validUrls.filter(url => !urlMetadata.has(url));
      if (urlsToAnalyze.length > 0) {
        analyzeUrls(urlsToAnalyze);
      }
    }
  }, [extractedUrls, urlMetadata, analyzeUrls]);

  // Efecto para notificar metadatos al componente padre
  useEffect(() => {
    if (onMetadata) {
      onMetadata(urlMetadata);
    }
  }, [urlMetadata, onMetadata]);

  // Función para copiar URL al clipboard
  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (error) {
      console.error('Error al copiar URL:', error);
    }
  };

  // Función para abrir URL en nueva pestaña
  const openUrl = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Función para remover URL de la lista
  const removeUrl = (urlId: string) => {
    const updatedUrls = extractedUrls.filter(u => u.id !== urlId);
    setExtractedUrls(updatedUrls);
    
    if (onUrlsChange) {
      onUrlsChange(updatedUrls.filter(u => u.isValid).map(u => u.url));
    }
  };

  const validUrls = extractedUrls.filter(u => u.isValid);
  const invalidUrls = extractedUrls.filter(u => !u.isValid);

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Textarea para entrada de texto */}
      <div className="space-y-2">
        <Textarea
          value={text}
          onChange={(e) => {
            const newValue = e.target.value;
            setText(newValue);
            if (onChange) {
              onChange(newValue);
            }
          }}
          rows={8}
          placeholder={placeholder}
        />
        <div className="text-sm text-muted-foreground">
          {extractedUrls.length > 0 && (
            <span>
              {invalidUrls.length > 0 && (
                <span className="text-amber-600 ml-2">
                  ({invalidUrls.length} inválida{invalidUrls.length !== 1 ? 's' : ''})
                </span>
              )}
              {(extractedUrls as any).hasMoreUrls && (
                <span className="text-blue-600 ml-2">
                  (Mostrando 7 de {(extractedUrls as any).totalUrls} URLs encontradas)
                </span>
              )}
            </span>
          )}
        </div>
      </div>

      {/* Lista de URLs detectadas */}
      {extractedUrls.length > 0 && (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="url-previews" className="border rounded-lg">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">URLs Detectadas</span>
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                  {validUrls.length}/7
                </Badge>
                {(() => {
                  const totalCharacters = validUrls.reduce((total, urlObj) => {
                    const metadata = urlMetadata.get(urlObj.url);
                    if (metadata?.complete_text) {
                      return total + metadata.complete_text.length;
                    } else if (metadata?.isTwitter && metadata?.text) {
                      return total + metadata.text.length;
                    }
                    return total;
                  }, 0);
                  
                  return totalCharacters > 0 ? (
                    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300">
                      {totalCharacters.toLocaleString()} caracteres
                    </Badge>
                  ) : null;
                })()}
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-2">
            {/* URLs válidas */}
            {(validUrls.reverse()).map((urlObj) => {
              const metadata = urlMetadata.get(urlObj.url);
              const isLoading = metadata?.isLoading || false;
              const hasMetadata = metadata && !isLoading && metadata.isValid;
              
              return (
                <div
                  key={urlObj.id}
                  className="group relative bg-gradient-to-br from-white to-gray-50/50 rounded-xl border border-gray-200/60 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:border-gray-300/80"
                >
                  {/* Remove URL Button - Positioned absolutely (only for remove) */}
                  {allowRemoveUrls && (
                    <div className="absolute top-3 right-3 z-10">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeUrl(urlObj.id)}
                        className="h-8 w-8 p-0 bg-white/80 backdrop-blur-sm hover:bg-red-50 text-red-500 hover:text-red-700 shadow-sm border border-gray-200/50 hover:border-red-200"
                        title="Remover URL"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                  
                  {/* Content Area - Two Column Layout */}
                  {hasMetadata ? (
                    <div className="p-4">
                      <div className="flex gap-4">
                        {/* Image Column */}
                        <div className="flex-shrink-0">
                          {metadata.image || (metadata.isTwitter && metadata.author_image) ? (
                            <img 
                              src={metadata.image || metadata.author_image} 
                              alt="Preview" 
                              className="w-20 h-20 object-cover rounded-lg border border-gray-200/60 shadow-sm"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-20 h-20 bg-gray-100 rounded-lg border border-gray-200/60 flex items-center justify-center">
                              <ExternalLink className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        {/* Content Column */}
                        <div className="flex-1 min-w-0">
                          {/* Title */}
                          {(metadata.title || (metadata.isTwitter && metadata.name && metadata.username)) && (
                            <div className="mb-1">
                              <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight">
                                {metadata.isTwitter && metadata.name && metadata.username 
                                  ? `${metadata.name} @${metadata.username}`
                                  : metadata.title
                                }
                              </h3>
                            </div>
                          )}
                          
                          {/* Description */}
                          {(metadata.description || (metadata.isTwitter && metadata.text)) && (
                            <div className="mb-3">
                              <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                                {metadata.isTwitter && metadata.text 
                                  ? metadata.text
                                  : metadata.description
                                }
                              </p>
                            </div>
                          )}
                          
                          {/* HTTP Status and Action Buttons Row */}
                          <div className="flex items-center justify-between">
                            {/* HTTP Status and Character Count */}
                            <div className="flex items-center space-x-2">
                              {isLoading ? (
                                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 shadow-sm">
                                  <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                                  Analizando
                                </Badge>
                              ) : metadata?.isValid ? (
                                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm">
                                  <CheckCircle className="h-3 w-3 mr-1.5" />
                                  HTTP {metadata.statusCode}
                                </Badge>
                              ) : metadata?.error ? (
                                <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200 shadow-sm">
                                  <AlertCircle className="h-3 w-3 mr-1.5" />
                                  Error
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm">
                                  <CheckCircle className="h-3 w-3 mr-1.5" />
                                  Válida
                                </Badge>
                              )}
                              
                              {/* Character Count Badge */}
                              {(metadata?.complete_text || (metadata?.isTwitter && metadata?.text)) && (
                                <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300 shadow-sm">
                                  <FileText className="h-3 w-3 mr-1.5" />
                                  {metadata.complete_text 
                                    ? metadata.complete_text.length.toLocaleString()
                                    : metadata.text?.length.toLocaleString()
                                  } caracteres
                                </Badge>
                              )}
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(urlObj.url)}
                                className="h-7 w-7 p-0 hover:bg-gray-100 shadow-sm border border-gray-200/50"
                                title="Copiar URL"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              {showExternalLinks && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openUrl(urlObj.url)}
                                  className="h-7 w-7 p-0 hover:bg-gray-100 shadow-sm border border-gray-200/50"
                                  title="Abrir en nueva pestaña"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Loading or Basic State - Two Column Layout */
                    <div className="p-4">
                      {isLoading ? (
                        <div className="flex gap-4">
                          {/* Image Placeholder */}
                          <div className="flex-shrink-0">
                            <div className="w-20 h-20 bg-gray-100 rounded-lg animate-pulse"></div>
                          </div>
                          {/* Content Placeholder */}
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
                            <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4"></div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-4 items-center py-4">
                          <div className="flex-shrink-0">
                            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                              <ExternalLink className="h-8 w-8 text-gray-400" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-500 mb-3">URL detectada y validada</p>
                            
                            {/* HTTP Status and Action Buttons Row */}
                            <div className="flex items-center justify-between">
                              {/* HTTP Status */}
                              <div className="flex-shrink-0">
                                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm">
                                  <CheckCircle className="h-3 w-3 mr-1.5" />
                                  Válida
                                </Badge>
                              </div>
                              
                              {/* Action Buttons */}
                              <div className="flex items-center space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(urlObj.url)}
                                  className="h-7 w-7 p-0 hover:bg-gray-100 shadow-sm border border-gray-200/50"
                                  title="Copiar URL"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                                {showExternalLinks && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openUrl(urlObj.url)}
                                    className="h-7 w-7 p-0 hover:bg-gray-100 shadow-sm border border-gray-200/50"
                                    title="Abrir en nueva pestaña"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Error State - Two Column Layout */}
                  {metadata?.error && !isLoading && (
                    <div className="p-4">
                      <div className="flex gap-4 items-center py-4">
                        <div className="flex-shrink-0">
                          <div className="w-20 h-20 bg-red-50 rounded-lg flex items-center justify-center">
                            <AlertCircle className="h-8 w-8 text-red-500" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-red-600 font-medium mb-1">Error al analizar</p>
                          <p className="text-xs text-red-500 line-clamp-2 mb-3">{metadata.error}</p>
                          
                          {/* HTTP Status and Action Buttons Row */}
                          <div className="flex items-center justify-between">
                            {/* HTTP Status */}
                            <div className="flex-shrink-0">
                              <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200 shadow-sm">
                                <AlertCircle className="h-3 w-3 mr-1.5" />
                                Error
                              </Badge>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(urlObj.url)}
                                className="h-7 w-7 p-0 hover:bg-gray-100 shadow-sm border border-gray-200/50"
                                title="Copiar URL"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              {showExternalLinks && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openUrl(urlObj.url)}
                                  className="h-7 w-7 p-0 hover:bg-gray-100 shadow-sm border border-gray-200/50"
                                  title="Abrir en nueva pestaña"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* URLs inválidas */}
            {invalidUrls.map((urlObj) => (
              <div
                key={urlObj.id}
                className="group relative bg-gradient-to-br from-red-50 to-red-100/30 rounded-xl border border-red-200/60 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:border-red-300/80"
              >
                {/* Status Badge - Positioned absolutely */}
                <div className="absolute top-3 right-3 z-10">
                  <Badge variant="secondary" className="bg-red-100 text-red-700 border-red-300 shadow-sm">
                    <AlertCircle className="h-3 w-3 mr-1.5" />
                    Inválida
                  </Badge>
                </div>

                {/* Action Button - Positioned absolutely */}
                {allowRemoveUrls && (
                  <div className="absolute top-3 left-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeUrl(urlObj.id)}
                      className="h-8 w-8 p-0 bg-white/80 backdrop-blur-sm hover:bg-red-50 text-red-500 hover:text-red-700 shadow-sm border border-red-200/50 hover:border-red-300"
                      title="Remover URL"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
                
                {/* Content Area */}
                <div className="p-4 pt-12">
                  <div className="text-center py-6">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <AlertCircle className="h-6 w-6 text-red-500" />
                    </div>
                    <p className="text-sm text-red-700 font-medium mb-1">URL inválida</p>
                    <p className="text-xs text-red-600 font-mono break-all px-2">{urlObj.url}</p>
                  </div>
                </div>
              </div>
            ))}

                {/* Mensaje de copiado */}
                {copiedUrl && copiedUrl !== 'all' && (
                  <div className="text-sm text-green-600 font-medium">
                    ✓ URL copiada al portapapeles
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
};

export default TextUrlExtractor;
export type { TextUrlExtractorProps, ExtractedUrl };
"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  RefreshCw,
  Search,
  AlertCircle,
  ExternalLink,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import type { WordPressPost, WordPressConnection } from "@/types/proofreader";
import { getSupabaseClient } from "@/lib/supabase/client";

export interface WordPressSearchDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSearch?: (query: string, page?: number, perPage?: number) => Promise<void>;
  onNavigateToSettings?: () => void;
  onInsertContent?: (post: WordPressPost) => void;
  onInsertMultipleContent?: (posts: WordPressPost[]) => void;
  searchResults?: WordPressPost[];
  isSearching?: boolean;
  searchError?: string | null;
  hasSearched?: boolean;
  buttonLabel?: string;
  buttonClassName?: string;
  buttonSize?: "default" | "sm" | "lg" | "icon";
  dialogTitle?: string;
  dialogDescription?: string;
  placeholder?: string;
  noConnectionMessage?: string;
  noResultsMessage?: string;
  hideButton?: boolean;
  fullWidth?: boolean;
  allowMultipleSelection?: boolean;
  categories?: string; // Comma-separated category IDs
}

// Función para limpiar el HTML de los excerpts de WordPress
const stripHtml = (html: string) => {
  if (typeof window !== "undefined") {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  }
  return html.replace(/<[^>]*>?/gm, "");
};

// Función para detectar si el texto es una URL
const isUrl = (str: string): boolean => {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
};

// Función para extraer el slug de una URL
const extractSlugFromUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    // Remove leading and trailing slashes, then get the last segment
    const segments = pathname.split('/').filter(segment => segment.length > 0);
    return segments.length > 0 ? segments[segments.length - 1] : null;
  } catch {
    return null;
  }
};

export function WordPressSearchDialog({
  open,
  onOpenChange,
  onSearch: externalOnSearch,
  onNavigateToSettings: externalOnNavigateToSettings,
  onInsertContent,
  onInsertMultipleContent,
  searchResults: externalSearchResults,
  isSearching: externalIsSearching,
  searchError: externalSearchError,
  hasSearched: externalHasSearched,
  buttonLabel = "Buscar en WordPress",
  buttonClassName = "",
  buttonSize = "sm",
  dialogTitle = "Buscar en WordPress",
  dialogDescription = "Busca artículos y contenido en tu sitio de WordPress",
  placeholder = "Escribe tu búsqueda o pega una URL...",
  noConnectionMessage = "No hay conexión a WordPress",
  noResultsMessage = "No se encontraron resultados para",
  hideButton = false,
  fullWidth = false,
  allowMultipleSelection = false,
  categories = "",
}: WordPressSearchDialogProps) {
  // Estado interno para la conexión a WordPress
  const [wordpressConnection, setWordpressConnection] = useState<{
    exists: boolean;
    isLoading: boolean;
    userRole?: string;
    connectionData?: WordPressConnection;
  }>({
    exists: false,
    isLoading: true,
    userRole: undefined,
    connectionData: undefined,
  });

  // Estados internos para la búsqueda
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(open || false);
  const [internalSearchResults, setInternalSearchResults] = useState<
    WordPressPost[]
  >([]);
  const [internalIsSearching, setInternalIsSearching] = useState(false);
  const [internalSearchError, setInternalSearchError] = useState<string | null>(
    null
  );
  const [internalHasSearched, setInternalHasSearched] = useState(false);

  // Estados para selección múltiple
  const [selectedPosts, setSelectedPosts] = useState<Set<number>>(new Set());

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [perPage] = useState(10); // Número de resultados por página

  // Referencia para el scroll automático
  const resultsRef = useRef<HTMLDivElement>(null);

  // Usar estados externos si se proporcionan, de lo contrario usar los internos
  const searchResults = externalSearchResults || internalSearchResults;
  const isSearching =
    externalIsSearching !== undefined
      ? externalIsSearching
      : internalIsSearching;
  const searchError =
    externalSearchError !== undefined
      ? externalSearchError
      : internalSearchError;
  const hasSearched =
    externalHasSearched !== undefined
      ? externalHasSearched
      : internalHasSearched;

  const isAdmin =
    wordpressConnection.userRole === "OWNER" ||
    wordpressConnection.userRole === "ADMIN";

  // Función para verificar la conexión a WordPress
  const checkWordPressConnection = async () => {
    try {
      setWordpressConnection((prev) => ({ ...prev, isLoading: true }));
      const supabase = getSupabaseClient();

      // Obtener la sesión del usuario
      const { data: userData } = await supabase.auth.getUser();

      if (!userData?.user) {
        setWordpressConnection({ exists: false, isLoading: false });
        return;
      }

      // Obtener el perfil del usuario
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("organizationId, role")
        .eq("id", userData.user.id)
        .single();

      if (profileError || !profileData?.organizationId) {
        setWordpressConnection({ exists: false, isLoading: false });
        return;
      }

      // Verificar si existe una conexión a WordPress
      const { data: wpConnection, error: wpError } = await supabase
        .from("wordpress_integration_table")
        .select("*")
        .eq("organizationId", profileData.organizationId)
        .eq("active", true)
        .single();

      if (wpError || !wpConnection || !wpConnection.site_url) {
        setWordpressConnection({
          exists: false,
          isLoading: false,
          userRole: profileData.role,
        });
        return;
      }

      // Conexión exitosa
      setWordpressConnection({
        exists: true,
        isLoading: false,
        userRole: profileData.role,
        connectionData: wpConnection as WordPressConnection,
      });
    } catch (error) {
      console.error("Error al verificar la conexión a WordPress:", error);
      setWordpressConnection({ exists: false, isLoading: false });
    }
  };

  // Función interna para buscar en WordPress
  const internalOnSearch = async (query: string, page: number = 1) => {
    if (!wordpressConnection.exists || !wordpressConnection.connectionData) {
      setInternalSearchError("No hay conexión a WordPress configurada");
      return;
    }

    try {
      setInternalIsSearching(true);
      setInternalSearchError(null);

      let apiUrl = `/api/wordpress/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`;

      if (categories) {
        apiUrl += `&categories=${encodeURIComponent(categories)}`;
      }

      const response = await fetch(apiUrl);

      // Verificar si la respuesta es JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.warn("La respuesta no es JSON:", await response.text());
        setInternalSearchError("Error en la respuesta del servidor");
        setInternalIsSearching(false);
        setInternalHasSearched(true);
        return;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        setInternalSearchError(data.message || "Error al buscar en WordPress");
        setInternalSearchResults([]);
        setTotalPages(1);
        setTotalResults(0);
        setCurrentPage(1);
      } else {
        setInternalSearchResults(data?.data || []);
        // Actualizar información de paginación
        setTotalPages(data?.total?.pages || 1);
        setTotalResults(data?.total?.count || 0);
        setCurrentPage(page);
        // Hacer scroll a los resultados si hay resultados
        if (data?.data && data.data.length > 0) {
          scrollToResults();
        }
      }
    } catch (error) {
      console.error("Error al buscar en WordPress:", error);
      setInternalSearchError("Error al conectar con WordPress");
      setInternalSearchResults([]);
      setTotalPages(1);
      setTotalResults(0);
      setCurrentPage(1);
    } finally {
      setInternalIsSearching(false);
      setInternalHasSearched(true);
    }
  };

  // Función para navegar a la configuración
  const internalOnNavigateToSettings = () => {
    setDialogOpen(false);
    // Navegar a la página de configuración de WordPress
    window.location.href = "/dashboard/settings/wordpress";
  };

  // Usar la función de búsqueda externa si se proporciona, de lo contrario usar la interna
  const onSearch = externalOnSearch || internalOnSearch;

  // Usar la función de navegación externa si se proporciona, de lo contrario usar la interna
  const onNavigateToSettings =
    externalOnNavigateToSettings || internalOnNavigateToSettings;

  const handleOpenChange = (newOpen: boolean) => {
    setDialogOpen(newOpen);
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Resetear paginación al hacer nueva búsqueda
      setCurrentPage(1);
      if (externalOnSearch) {
        externalOnSearch(searchQuery, 1, perPage);
      } else {
        internalOnSearch(searchQuery, 1);
      }
    }
  };

  // Funciones de paginación
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      if (externalOnSearch) {
        // Si se usa búsqueda externa, pasar parámetros de paginación
        setCurrentPage(page);
        externalOnSearch(searchQuery, page, perPage);
      } else {
        internalOnSearch(searchQuery, page);
      }
    }
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  // Función para hacer scroll automático a los resultados
  const scrollToResults = () => {
    setTimeout(() => {
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100); // Pequeño delay para asegurar que el DOM se haya actualizado
  };

  // Función para manejar la selección de posts
  const handlePostSelection = (postId: number, isSelected: boolean) => {
    setSelectedPosts((prev) => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(postId);
      } else {
        newSet.delete(postId);
      }
      return newSet;
    });
  };

  // Función para seleccionar todos los posts
  const selectAllPosts = () => {
    setSelectedPosts(new Set(searchResults.map((post) => post.id)));
  };

  // Función para deseleccionar todos los posts
  const deselectAllPosts = () => {
    setSelectedPosts(new Set());
  };

  // Función para insertar posts seleccionados
  const insertSelectedPosts = () => {
    if (selectedPosts.size === 0) return;

    const postsToInsert = searchResults.filter((post) =>
      selectedPosts.has(post.id)
    );

    if (onInsertMultipleContent) {
      onInsertMultipleContent(postsToInsert);
    } else {
      // Si no hay función para insertar múltiples, usar la función de inserción única
      // Esto es un fallback, ya que se espera que onInsertMultipleContent esté definida

      if (postsToInsert.length === 0) return;

      if (onInsertContent) {
        // Fallback: insertar uno por uno
        postsToInsert.forEach((post) => onInsertContent(post));
      }
    }

    // Limpiar selección después de insertar
    setSelectedPosts(new Set());
    setDialogOpen(false);
  };

  // Función para manejar clic en post (single o multiple selection)
  const handlePostClick = (post: WordPressPost) => {
    if (allowMultipleSelection) {
      // En modo múltiple, solo cambiar selección
      handlePostSelection(post.id, !selectedPosts.has(post.id));
    } else {
      // En modo simple, insertar directamente
      if (onInsertContent) {
        onInsertContent(post);
      }
    }
  };

  // Verificar la conexión a WordPress al montar el componente
  useEffect(() => {
    checkWordPressConnection();
  }, []);

  // Limpiar selección cuando se cierra el diálogo o cambia la búsqueda
  useEffect(() => {
    if (!dialogOpen || !allowMultipleSelection) {
      setSelectedPosts(new Set());
    }
  }, [dialogOpen, allowMultipleSelection]);

  return (
    <Dialog
      open={open !== undefined ? open : dialogOpen}
      onOpenChange={handleOpenChange}
    >
      {!hideButton && (
        <DialogTrigger asChild>
          <Button
            size={buttonSize}
            variant={"ghost"}
            className={`shadow-sm hover:shadow-lg transition-all hover:opacity-90 border  ${buttonClassName} ${
              fullWidth ? "w-full" : ""
            }`}
          >
            <div className="flex items-center">
              <ExternalLink className="w-4 h-4 mr-2" />
              {buttonLabel}
            </div>
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Image
              src="/wordpress-logo.png"
              alt="WordPress Logo"
              width={24}
              height={24}
              className="mr-2"
            />
            {dialogTitle}
            {allowMultipleSelection && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Selección múltiple
              </span>
            )}
            {wordpressConnection.connectionData?.siteName && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({wordpressConnection.connectionData.siteName})
              </span>
            )}
          </DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>

        {wordpressConnection.isLoading ? (
          <div className="flex justify-center items-center py-8">
            <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
          </div>
        ) : wordpressConnection.exists ? (
          <>
            <form onSubmit={handleSearch} className="mt-4">
              <div className="flex items-center space-x-2">
                <div className="flex-1">
                  <Input
                    placeholder={placeholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                  {/* Indicador de URL detectada */}
                  {searchQuery && isUrl(searchQuery) && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                      <div className="flex items-center text-sm text-blue-700">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        <span className="font-medium">URL detectada:</span>
                        <span className="ml-1">
                          Buscando por slug "{extractSlugFromUrl(searchQuery)}"
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <Button type="submit" disabled={isSearching} className="text-white">
                  {isSearching ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Buscar
                    </>
                  )}
                </Button>
              </div>
            </form>
            <div className="mt-4 max-h-[400px] min-h-[200px] overflow-y-auto relative" ref={resultsRef}>
              {/* Mostrar loader cuando está buscando */}
              {isSearching ? (
                <div className="flex items-center justify-center py-16">
                  <div className="flex flex-col items-center space-y-2">
                    <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
                    <p className="text-sm text-gray-600">Buscando contenido...</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Contenido normal cuando no está buscando */}

              {searchError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-red-700">{searchError}</p>
                </div>
              )}

              {searchResults.length > 0 ? (
                <div className="space-y-3">
                  {allowMultipleSelection && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">
                        {selectedPosts.size} de {searchResults.length}{" "}
                        seleccionados
                      </span>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={selectAllPosts}
                          disabled={selectedPosts.size === searchResults.length}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Todos
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={deselectAllPosts}
                          disabled={selectedPosts.size === 0}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Ninguno
                        </Button>
                      </div>
                    </div>
                  )}

                  {searchResults.map((post) => (
                    <div
                      key={post.id}
                      className={`border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        allowMultipleSelection && selectedPosts.has(post.id)
                          ? "bg-blue-50 border-blue-200"
                          : ""
                      }`}
                      onClick={() => handlePostClick(post)}
                      title={
                        allowMultipleSelection
                          ? "Haz clic para seleccionar/deseleccionar este contenido"
                          : "Haz clic para insertar este contenido en el editor manteniendo el formato"
                      }
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start space-x-3 flex-1">
                          {allowMultipleSelection && (
                            <Checkbox
                              checked={selectedPosts.has(post.id)}
                              onCheckedChange={(checked) =>
                                handlePostSelection(post.id, checked as boolean)
                              }
                              onClick={(e) => e.stopPropagation()}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-base mb-2">
                              {post.title.rendered
                                ? stripHtml(post.title.rendered)
                                : `Post #${post.id}`}
                            </h3>
                            {post.excerpt.rendered && (
                              <p className="text-sm text-gray-600 mt-1 mb-2 line-clamp-3">
                                {post.excerpt.rendered
                                  ? stripHtml(post.excerpt.rendered)
                                  : ""}
                              </p>
                            )}
                            <p className="text-xs text-gray-400">
                              {new Date(post.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <a
                          href={post.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700 ml-2 flex-shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  ))}

                  {allowMultipleSelection && selectedPosts.size > 0 && (
                    <div className="sticky bottom-0 bg-white border-t pt-3 mt-3">
                      <Button
                        onClick={insertSelectedPosts}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white hover:opacity-90"
                      >
                        Insertar {selectedPosts.size} contenido
                        {selectedPosts.size > 1 ? "s" : ""}
                      </Button>
                    </div>
                  )}

                  {/* Paginación */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <div className="text-sm text-gray-600">
                        Mostrando {((currentPage - 1) * perPage) + 1} - {Math.min(currentPage * perPage, totalResults)} de {totalResults} resultados
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={goToFirstPage}
                          disabled={currentPage === 1}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={goToPreviousPage}
                          disabled={currentPage === 1}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        
                        {/* Números de página */}
                        {(() => {
                          const pages = [];
                          const startPage = Math.max(1, currentPage - 2);
                          const endPage = Math.min(totalPages, currentPage + 2);
                          
                          for (let i = startPage; i <= endPage; i++) {
                            pages.push(
                              <Button
                                key={i}
                                variant={i === currentPage ? "default" : "outline"}
                                size="sm"
                                onClick={() => goToPage(i)}
                                className="h-8 w-8 p-0"
                              >
                                {i}
                              </Button>
                            );
                          }
                          return pages;
                        })()}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={goToNextPage}
                          disabled={currentPage === totalPages}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={goToLastPage}
                          disabled={currentPage === totalPages}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronsRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : hasSearched && !isSearching ? (
                <div className="text-center py-8 text-gray-500">
                  {noResultsMessage} "{searchQuery}"
                </div>
              ) : null}
                </>
              )}
            </div>
          </>
        ) : (
          <div className="mt-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-amber-800 font-medium">
                  {noConnectionMessage}
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  {isAdmin
                    ? "Como administrador, puedes configurar la conexión a WordPress para tu organización."
                    : "Contacta al administrador para configurar la conexión a WordPress."}
                </p>
                {isAdmin && (
                  <Button
                    onClick={onNavigateToSettings}
                    className="mt-3 bg-gradient-to-r from-blue-600 to-blue-400 text-white hover:opacity-90"
                    size="sm"
                  >
                    Configurar ahora
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

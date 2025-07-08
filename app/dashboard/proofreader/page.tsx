"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Suggestion, WordPressPost } from "@/types/proofreader";
import { ProofreaderEditor } from "@/components/proofreader/editor";
import { Statistics } from "@/components/proofreader/statistics";
import { SuggestionsPanel } from "@/components/proofreader/suggestions-panel";
import { WordPressSearchDialog } from "@/components/shared/wordpress-search-dialog";
import { ProofreaderHeader } from "@/components/proofreader/header";
import { ApiKeyRequiredModal } from "@/components/proofreader/api-key-required-modal";
import { analyzeText } from "@/actions/analyze-text";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronLeft, ChevronRight, Copy } from "lucide-react";

const getProviderDisplayName = (provider: string): string => {
  switch (provider.toLowerCase()) {
    case "openai":
      return "OpenAI";
    case "anthropic":
      return "Anthropic";
    case "google":
      return "Google";
    default:
      return provider;
  }
};

export default function ProofreaderPage() {
  // State
  const [originalText, setOriginalText] = useState("");
  const [correctedText, setCorrectedText] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [activeSuggestion, setActiveSuggestion] = useState<Suggestion | null>(
    null
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<{
    model: string;
    provider: string;
  }>({ model: "", provider: "" });
  const [modelProviderMap, setModelProviderMap] = useState<
    Record<string, string>
  >({});
  const [appliedSuggestions, setAppliedSuggestions] = useState<Suggestion[]>(
    []
  );
  const [stats, setStats] = useState<{
    readabilityScore: number;
    grammarScore: number;
    styleScore: number;
  }>({
    readabilityScore: 0,
    grammarScore: 0,
    styleScore: 0,
  });
  const [isAnalyzed, setIsAnalyzed] = useState(false);

  // Estado para el modal de API key requerida
  const [apiKeyStatus, setApiKeyStatus] = useState<{
    isLoading: boolean;
    hasApiKey: boolean;
    isAdmin: boolean;
  }>({
    isLoading: true,
    hasApiKey: false,
    isAdmin: false,
  });

  // Refs
  const editorRef = useRef<{
    getHTML: () => string;
    getText: () => string;
    setContent: (content: string) => void;
  } | null>(null);

  // Hooks
  const router = useRouter();

  // Verificar si existe alguna API key al cargar la página
  useEffect(() => {
    checkApiKeyExists();
  }, []);

  // Modificar la función scrollToSuggestion para marcar el texto
  const scrollToSuggestion = (suggestion: Suggestion) => {
    setActiveSuggestion(suggestion);
    highlightTextInContainer(suggestion);
  };

  // Función para resaltar texto en el contenedor de HTML renderizado
  const highlightTextInContainer = (suggestion: Suggestion) => {
    try {
      // Obtener el contenedor del texto corregido
      const correctedContainer = document.querySelector(
        ".rendered-html-container"
      );
      if (!correctedContainer) return;

      // Eliminar cualquier resaltado previo
      const previousHighlights = correctedContainer.querySelectorAll(
        ".suggestion-highlight"
      );
      previousHighlights.forEach((el) => {
        const span = el as HTMLElement;
        const parent = span.parentNode;
        if (parent) {
          parent.replaceChild(
            document.createTextNode(span.textContent || ""),
            span
          );
          parent.normalize();
        }
      });

      // Función para buscar y resaltar texto en nodos
      const findAndHighlightText = (
        node: Node,
        searchText: string
      ): boolean => {
        if (node.nodeType === Node.TEXT_NODE && node.textContent) {
          const text = node.textContent;
          const index = text.indexOf(searchText);

          if (index >= 0) {
            const before = text.substring(0, index);
            const highlight = text.substring(index, index + searchText.length);
            const after = text.substring(index + searchText.length);

            const span = document.createElement("span");
            span.textContent = highlight;
            span.className = "suggestion-highlight";
            span.setAttribute("data-suggestion-id", suggestion.id);
            span.style.backgroundColor = "#FFEB3B";
            span.style.padding = "0 2px";
            span.style.borderRadius = "2px";

            const fragment = document.createDocumentFragment();
            if (before) fragment.appendChild(document.createTextNode(before));
            fragment.appendChild(span);
            if (after) fragment.appendChild(document.createTextNode(after));

            node.parentNode?.replaceChild(fragment, node);

            setTimeout(() => {
              span.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 100);

            return true;
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const tagName = (node as Element).tagName.toLowerCase();
          if (tagName === "script" || tagName === "style") {
            return false;
          }

          for (let i = 0; i < node.childNodes.length; i++) {
            if (findAndHighlightText(node.childNodes[i], searchText)) {
              return true;
            }
          }
        }

        return false;
      };

      findAndHighlightText(correctedContainer, suggestion.original);
    } catch (error) {
      console.error("Error al resaltar texto:", error);
    }
  };

  // Añadir estilos globales para la animación de resaltado
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = `
      @keyframes pulse-highlight {
        0% { background-color: #FFEB3B; }
        50% { background-color: #FFF59D; }
        100% { background-color: #FFEB3B; }
      }
      .suggestion-highlight {
        animation: pulse-highlight 2s infinite;
        box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
      }
      .applied-suggestion {
        background-color: #E3F2FD;
        padding: 0 2px;
        border-radius: 2px;
        box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05);
        transition: background-color 0.3s ease;
      }
      /* Estilos para el contenedor de HTML renderizado - copia los estilos del editor TipTap */
      .rendered-html-container {
        font-family: "Inter", sans-serif;
        color: rgb(55, 65, 81);
      }
      .rendered-html-container .prose {
        max-width: none;
      }
      .rendered-html-container h1 {
        font-size: 2.25rem;
        line-height: 2.5rem;
        font-weight: 800;
        margin-top: 2rem;
        margin-bottom: 1rem;
        color: rgb(17, 24, 39);
      }
      .rendered-html-container h2 {
        font-size: 1.875rem;
        line-height: 2.25rem;
        font-weight: 700;
        margin-top: 2rem;
        margin-bottom: 1rem;
        color: rgb(17, 24, 39);
      }
      .rendered-html-container h3 {
        font-size: 1.5rem;
        line-height: 2rem;
        font-weight: 600;
        margin-top: 1.5rem;
        margin-bottom: 0.75rem;
        color: rgb(17, 24, 39);
      }
      .rendered-html-container h4 {
        font-size: 1.25rem;
        line-height: 1.75rem;
        font-weight: 600;
        margin-top: 1.5rem;
        margin-bottom: 0.75rem;
        color: rgb(17, 24, 39);
      }
      .rendered-html-container h5 {
        font-size: 1.125rem;
        line-height: 1.75rem;
        font-weight: 600;
        margin-top: 1.25rem;
        margin-bottom: 0.5rem;
        color: rgb(17, 24, 39);
      }
      .rendered-html-container h6 {
        font-size: 1rem;
        line-height: 1.5rem;
        font-weight: 600;
        margin-top: 1.25rem;
        margin-bottom: 0.5rem;
        color: rgb(17, 24, 39);
      }
      .rendered-html-container p {
        margin-bottom: 1rem;
        line-height: 1.75;
      }
      .rendered-html-container strong {
        font-weight: 600;
        color: rgb(17, 24, 39);
      }
      .rendered-html-container em {
        font-style: italic;
      }
      .rendered-html-container u {
        text-decoration: underline;
      }
      .rendered-html-container s {
        text-decoration: line-through;
      }
      .rendered-html-container a {
        color: rgb(59, 130, 246);
        text-decoration: underline;
        font-weight: 500;
      }
      .rendered-html-container a:hover {
        color: rgb(37, 99, 235);
      }
      .rendered-html-container ul {
        list-style-type: disc;
        margin-left: 1.5rem;
        margin-bottom: 1rem;
      }
      .rendered-html-container ol {
        list-style-type: decimal;
        margin-left: 1.5rem;
        margin-bottom: 1rem;
      }
      .rendered-html-container li {
        margin-bottom: 0.5rem;
        line-height: 1.75;
      }
      .rendered-html-container li p {
        margin-bottom: 0.5rem;
      }
      .rendered-html-container blockquote {
        border-left: 4px solid rgb(229, 231, 235);
        padding-left: 1rem;
        margin: 1.5rem 0;
        font-style: italic;
        color: rgb(75, 85, 99);
        background-color: rgb(249, 250, 251);
        padding: 1rem;
        border-radius: 0.375rem;
      }
      .rendered-html-container blockquote p {
        margin-bottom: 0;
      }
      .rendered-html-container code {
        background-color: rgb(243, 244, 246);
        color: rgb(239, 68, 68);
        padding: 0.125rem 0.375rem;
        border-radius: 0.25rem;
        font-family: "Fira Code", monospace;
        font-size: 0.875rem;
      }
      .rendered-html-container pre {
        background-color: rgb(17, 24, 39);
        color: rgb(243, 244, 246);
        padding: 1rem;
        border-radius: 0.5rem;
        overflow-x: auto;
        margin: 1rem 0;
      }
      .rendered-html-container pre code {
        background-color: transparent;
        color: inherit;
        padding: 0;
        border-radius: 0;
      }
      .rendered-html-container img {
        max-width: 100%;
        height: auto;
        border-radius: 0.5rem;
        margin: 1rem 0;
      }
      .rendered-html-container hr {
        border: none;
        border-top: 1px solid rgb(229, 231, 235);
        margin: 2rem 0;
      }
      .rendered-html-container table {
        width: 100%;
        border-collapse: collapse;
        margin: 1rem 0;
        border: 1px solid rgb(229, 231, 235);
        border-radius: 0.5rem;
        overflow: hidden;
      }
      .rendered-html-container th,
      .rendered-html-container td {
        padding: 0.75rem;
        text-align: left;
        border-bottom: 1px solid rgb(229, 231, 235);
      }
      .rendered-html-container th {
        background-color: rgb(249, 250, 251);
        font-weight: 600;
        color: rgb(17, 24, 39);
      }
      .rendered-html-container tr:last-child td {
        border-bottom: none;
      }
      /* Estilos específicos del editor TipTap */
      .rendered-html-container .ProseMirror {
        outline: none;
      }
      .rendered-html-container [data-placeholder]:before {
        content: attr(data-placeholder);
        float: left;
        color: rgb(156, 163, 175);
        pointer-events: none;
        height: 0;
      }
    `;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Functions
  const checkApiKeyExists = async () => {
    try {
      setApiKeyStatus((prev) => ({ ...prev, isLoading: true }));
      const supabase = getSupabaseClient();

      // Obtener la sesión del usuario actual
      const { data: userData } = await supabase.auth.getUser();

      if (!userData?.user) {
        setApiKeyStatus({ isLoading: false, hasApiKey: false, isAdmin: false });
        return;
      }

      // Obtener el ID de la organización y el rol del usuario
      const { data: profileData, error: userError } = await supabase
        .from("profiles")
        .select("organizationId, role")
        .eq("id", userData.user.id)
        .single();

      if (userError || !profileData?.organizationId) {
        setApiKeyStatus({ isLoading: false, hasApiKey: false, isAdmin: false });
        return;
      }

      // Verificar si el usuario es admin o propietario
      const isAdmin =
        profileData.role === "OWNER" || profileData.role === "ADMIN";

      // Verificar si existe alguna API key para esta organización y obtener sus modelos
      const { data: apiKeys, error: apiKeyError } = await supabase
        .from("api_key_table")
        .select("id, models, provider")
        .eq("organizationId", profileData.organizationId)
        .eq("status", "ACTIVE");

      if (apiKeyError) {
        console.error("Error al verificar API keys:", apiKeyError);
        setApiKeyStatus({ isLoading: false, hasApiKey: false, isAdmin });
        return;
      }

      // Extraer todos los modelos disponibles de las API keys con su proveedor
      const allModels: string[] = [];
      const map: Record<string, string> = {};
      apiKeys.forEach(
        (key: { id: string; models: string[]; provider: string }) => {
          if (key.models && Array.isArray(key.models)) {
            key.models.forEach((model) => {
              if (!allModels.includes(model)) {
                allModels.push(model);
                map[model] = key.provider || "";
              }
            });
          }
        }
      );

      // Si hay al menos una API key, establecer hasApiKey como true
      setApiKeyStatus({
        isLoading: false,
        hasApiKey: apiKeys.length > 0,
        isAdmin,
      });

      // Establecer los modelos disponibles
      setAvailableModels(allModels);

      // Establecer el modelo seleccionado por defecto (el primero de la lista o vacío si no hay)
      if (apiKeys.length > 0 && allModels.length > 0) {
        const firstKey = apiKeys[0];
        const firstModel = allModels[0];
        setSelectedModel({
          model: firstModel,
          provider: firstKey.provider || "",
        });
      }

      setModelProviderMap(map);
    } catch (error) {
      console.error("Error al verificar API keys:", error);
      setApiKeyStatus({ isLoading: false, hasApiKey: false, isAdmin: false });
    }
  };

  const handleTextChange = (html: string) => {
    setOriginalText(html);
  };

  const handleAnalyzeText = async () => {
    setIsAnalyzing(true);

    try {
      const textContent = editorRef.current?.getText() || "";
      const htmlContent = editorRef.current?.getHTML() || "";

      setOriginalText(htmlContent);

      if (!textContent.trim()) {
        toast.error("El texto está vacío", {
          description: "Por favor, escribe algo para analizar.",
        });
        setIsAnalyzing(false);
        return;
      }

      // Llamar a la función de análisis de texto
      const result = await analyzeText(textContent, selectedModel);

      if (!result.success) {
        toast.error("Error al analizar el texto", {
          description: result.error || "Ocurrió un error inesperado.",
        });
        setIsAnalyzing(false);
        return;
      }

      // Actualizar las sugerencias
      setSuggestions((result.correcciones || []) as Suggestion[]);

      // Establecer el texto corregido y cambiar al modo analizado
      setCorrectedText(htmlContent);
      setIsAnalyzed(true);

      // Actualizar estadísticas basadas en las correcciones
      const totalErrors = result.correcciones.length;
      const spellingErrors = result.correcciones.filter(
        (c) => c.type === "spelling"
      ).length;
      const grammarErrors = result.correcciones.filter(
        (c) => c.type === "grammar"
      ).length;
      const styleErrors = result.correcciones.filter(
        (c) => c.type === "style"
      ).length;
      const punctuationErrors = result.correcciones.filter(
        (c) => c.type === "punctuation"
      ).length;

      const baseScore = 100;
      const grammarScore = Math.max(
        0,
        baseScore - (grammarErrors + punctuationErrors) * 5
      );
      const styleScore = Math.max(0, baseScore - styleErrors * 3);
      const readabilityScore = Math.max(0, baseScore - totalErrors * 2);

      setStats({
        readabilityScore,
        grammarScore,
        styleScore,
      });

      // Si hay sugerencias, seleccionar la primera
      if (result.correcciones.length > 0) {
        setActiveSuggestion(result.correcciones[0] as Suggestion);
        // Resaltar la primera sugerencia después de un pequeño delay
        setTimeout(() => {
          highlightTextInContainer(result.correcciones[0] as Suggestion);
        }, 100);
      }

      // Reiniciar las sugerencias aplicadas
      setAppliedSuggestions([]);

      toast.success("Análisis completado", {
        description: `Se encontraron ${totalErrors} sugerencias de mejora.`,
      });
    } catch (error) {
      console.error("Error al analizar el texto:", error);
      toast.error("Error al analizar el texto", {
        description:
          "Ocurrió un error inesperado. Por favor, inténtalo de nuevo.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBackToEditor = () => {
    setIsAnalyzed(false);
    setCorrectedText("");
    setSuggestions([]);
    setActiveSuggestion(null);
    setAppliedSuggestions([]);
    setStats({
      readabilityScore: 0,
      grammarScore: 0,
      styleScore: 0,
    });
  };

  const copyText = async () => {
    // Determinar qué texto copiar
    const textToCopy = isAnalyzed ? correctedText : originalText;

    if (!textToCopy) return;

    try {
      const styledHtml = `
      <html>
        <head>
          <style>
            body { font-family: 'Inter', sans-serif; line-height: 1.6; }
            h1 { font-size: 1.8rem; margin-top: 1.5rem; margin-bottom: 0.75rem; font-weight: bold; }
            h2 { font-size: 1.5rem; margin-top: 1.5rem; margin-bottom: 0.75rem; font-weight: bold; }
            h3 { font-size: 1.25rem; margin-top: 1.5rem; margin-bottom: 0.75rem; font-weight: bold; }
            p { margin-bottom: 1rem; }
            a { color: #2563eb; text-decoration: underline; }
            ul, ol { padding-left: 1.5rem; margin-bottom: 1rem; }
            li { margin-bottom: 0.25rem; }
            blockquote { border-left: 3px solid #e5e7eb; padding-left: 1rem; font-style: italic; color: #4b5563; }
          </style>
        </head>
        <body>
          ${textToCopy}
        </body>
      </html>
    `;

      const blob = new Blob([styledHtml], { type: "text/html" });
      const plainText = isAnalyzed
        ? document.querySelector(".rendered-html-container")?.textContent || ""
        : editorRef.current?.getText() || "";
      const plainTextBlob = new Blob([plainText], { type: "text/plain" });

      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": blob,
          "text/plain": plainTextBlob,
        }),
      ]);

      toast.success("Contenido copiado con formato", {});
    } catch (error) {
      console.error("Error al copiar con formato:", error);
      navigator.clipboard.writeText(textToCopy);
      toast.warning("Contenido copiado como texto plano", {
        description: "Es posible que se pierda el formato al pegar.",
      });
    }
  };

  const navigateSuggestions = (direction: "next" | "prev") => {
    if (!activeSuggestion || suggestions.length === 0) {
      setActiveSuggestion(suggestions[0]);
      return;
    }

    const currentIndex = suggestions.findIndex(
      (s) => s.id === activeSuggestion.id
    );
    let newIndex;

    if (direction === "next") {
      newIndex = (currentIndex + 1) % suggestions.length;
    } else {
      newIndex = (currentIndex - 1 + suggestions.length) % suggestions.length;
    }

    scrollToSuggestion(suggestions[newIndex]);
  };

  // Función para aplicar una sugerencia
  const applySuggestion = (suggestion: Suggestion) => {
    try {
      const correctedContainer = document.querySelector(
        ".rendered-html-container"
      );
      if (!correctedContainer) {
        console.error("No se encontró el contenedor del texto corregido");
        return;
      }

      const highlightedElement = correctedContainer.querySelector(
        `.suggestion-highlight[data-suggestion-id="${suggestion.id}"]`
      ) as HTMLElement;

      if (highlightedElement) {
        const correctedSpan = document.createElement("span");
        correctedSpan.textContent = suggestion.suggestion;
        correctedSpan.className = "applied-suggestion";
        correctedSpan.title = `Corrección aplicada: "${suggestion.original}" → "${suggestion.suggestion}"`;

        highlightedElement.parentNode?.replaceChild(
          correctedSpan,
          highlightedElement
        );

        const newCorrectedHtml = correctedContainer.innerHTML;
        setCorrectedText(newCorrectedHtml);

        setAppliedSuggestions((prev) => [...prev, suggestion]);
      } else {
        // Buscar y reemplazar directamente en el HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(correctedText, "text/html");

        const findAndReplaceText = (
          node: Node,
          searchText: string,
          replaceText: string
        ): boolean => {
          if (node.nodeType === Node.TEXT_NODE && node.textContent) {
            const text = node.textContent;
            const index = text.indexOf(searchText);

            if (index >= 0) {
              const before = text.substring(0, index);
              const after = text.substring(index + searchText.length);

              const beforeNode = document.createTextNode(before);
              const afterNode = document.createTextNode(after);
              const replacementSpan = document.createElement("span");
              replacementSpan.textContent = replaceText;
              replacementSpan.className = "applied-suggestion";
              replacementSpan.title = `Corrección aplicada: "${searchText}" → "${replaceText}"`;

              const fragment = document.createDocumentFragment();
              fragment.appendChild(beforeNode);
              fragment.appendChild(replacementSpan);
              fragment.appendChild(afterNode);

              node.parentNode?.replaceChild(fragment, node);
              return true;
            }
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            const tagName = (node as Element).tagName.toLowerCase();
            if (tagName === "script" || tagName === "style") {
              return false;
            }

            const childNodes = Array.from(node.childNodes);
            for (let i = 0; i < childNodes.length; i++) {
              if (findAndReplaceText(childNodes[i], searchText, replaceText)) {
                return true;
              }
            }
          }
          return false;
        };

        findAndReplaceText(
          doc.body,
          suggestion.original,
          suggestion.suggestion
        );

        const newCorrectedHtml = doc.body.innerHTML;
        setCorrectedText(newCorrectedHtml);

        setAppliedSuggestions((prev) => [...prev, suggestion]);
      }
    } catch (error) {
      console.error("Error al aplicar la sugerencia:", error);
      toast.error("Error al aplicar la corrección", {
        description:
          "No se pudo aplicar la corrección. Por favor, inténtalo de nuevo.",
      });
    } finally {
      setSuggestions(suggestions.filter((s) => s.id !== suggestion.id));
      setActiveSuggestion(null);
    }
  };

  const ignoreSuggestion = (suggestionId: string) => {
    setSuggestions(suggestions.filter((s) => s.id !== suggestionId));
    setActiveSuggestion(null);

    toast.info("Sugerencia ignorada", {
      description: "La sugerencia ha sido eliminada de la lista.",
    });
  };

  const insertPostContent = (post: WordPressPost) => {
    console.log("Insertando contenido de WordPress:", post);

    if (editorRef.current) {
      try {
        // Obtener el título y contenido con formato HTML
        const title = post.title.rendered;
        const content = post.content.rendered;

        // Crear el contenido HTML completo
        const fullContent = `<h1>${title}</h1>\n${content}`;

        // Insertar en el editor manteniendo el formato HTML completo
        editorRef.current.setContent(fullContent);

        // Actualizar el estado del texto original
        setOriginalText(fullContent);

        // Cerrar el modal
        setDialogOpen(false);

        // Mostrar notificación de éxito
        toast.success("Contenido importado con éxito", {
          description:
            "El contenido de WordPress se ha insertado manteniendo el formato original.",
        });
      } catch (error) {
        console.error("Error al insertar contenido en el editor:", error);
        toast.error("Error al importar contenido", {
          description:
            "No se pudo insertar el contenido en el editor. Por favor, inténtalo de nuevo.",
        });
      }
    } else {
      console.error("Editor ref no encontrada");
      toast.error("Error al importar contenido", {
        description:
          "No se pudo acceder al editor. Por favor, recarga la página e inténtalo de nuevo.",
      });
    }
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const [model, provider] = value.split("|");
    setSelectedModel({ model, provider });
  };

  // Si está cargando, mostrar un estado de carga
  if (apiKeyStatus.isLoading) {
    return (
      <div className="container mx-auto h-[calc(100vh-122px)] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em]"></div>
          <p className="mt-4 text-gray-500">Cargando corrector de textos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto h-[calc(100vh-122px)] flex flex-col p-4 max-w-7xl overflow-hidden">
      <ApiKeyRequiredModal
        isOpen={!apiKeyStatus.hasApiKey}
        isAdmin={apiKeyStatus.isAdmin}
      />

      <div className="flex flex-col h-full space-y-4">
        <div className="flex justify-between items-center">
          <ProofreaderHeader
            onCopyText={copyText}
            hasText={!!originalText || !!correctedText}
            showCopyButton={isAnalyzed}
          />
          <WordPressSearchDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            onInsertContent={insertPostContent}
            buttonLabel="Importar de WordPress"
            dialogTitle="Importar contenido de WordPress"
            dialogDescription="Busca y selecciona un artículo de tu sitio WordPress para corregirlo"
            placeholder="Buscar artículos..."
            noResultsMessage="No se encontraron artículos para"
            hideButton={true}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
          <div className="lg:col-span-2 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4 bg-gray-50 p-2 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center space-x-2">
                {isAnalyzed && (
                  <Button
                    onClick={handleBackToEditor}
                    variant="outline"
                    size="sm"
                    className="bg-white border-gray-200 hover:bg-gray-50"
                  >
                    ← Volver al editor
                  </Button>
                )}
                <span className="text-sm font-medium text-gray-700">
                  {isAnalyzed ? "Texto Corregido" : "Editor de Texto"}
                </span>
              </div>
              <div className="relative">
                <select
                  className="appearance-none w-64 h-10 rounded-md border border-gray-200 bg-white pl-4 pr-10 py-2 text-sm font-medium shadow-sm transition-all hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={`${selectedModel.model}|${selectedModel.provider}`}
                  onChange={handleModelChange}
                  disabled={availableModels.length === 0}
                >
                  {availableModels.length > 0 ? (
                    availableModels.map((model) => (
                      <option
                        key={model}
                        value={`${model}|${modelProviderMap[model]}`}
                      >
                        {model} (
                        {getProviderDisplayName(modelProviderMap[model])})
                      </option>
                    ))
                  ) : (
                    <option value="|">No hay modelos disponibles</option>
                  )}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2.5 4.5L6 8L9.5 4.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <Card className="flex-1 overflow-hidden border-0 shadow-lg flex flex-col h-full">
              <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
                {!isAnalyzed ? (
                  <ProofreaderEditor
                    onTextChange={handleTextChange}
                    onAnalyzeText={handleAnalyzeText}
                    isAnalyzing={isAnalyzing}
                    suggestions={suggestions}
                    activeSuggestion={activeSuggestion}
                    setActiveSuggestion={setActiveSuggestion}
                    navigateSuggestions={navigateSuggestions}
                    editorRef={editorRef}
                    initialContent={originalText}
                  />
                ) : (
                  <div className="h-full overflow-auto relative">
                    {isAnalyzing ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em]"></div>
                          <p className="mt-4 text-gray-500">
                            Analizando texto...
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="rendered-html-container h-full overflow-auto p-6 bg-white ">
                        <div className="prose max-w-none text-gray-900">
                          <div
                            dangerouslySetInnerHTML={{ __html: correctedText }}
                            className="flex flex-col gap-4"
                          />
                        </div>
                      </div>
                    )}
                    <Button
                      size="sm"
                      variant="secondary"
                      className="shadow-sm hover:shadow-md transition-all absolute bottom-4 right-6 z-10"
                      onClick={copyText}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar texto
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="overflow-hidden flex flex-col">
            <Card className="flex-1 border-0 shadow-lg flex flex-col overflow-hidden">
              <CardContent className="p-6 flex-1 flex flex-col overflow-hidden">
                <Statistics
                  readabilityScore={stats.readabilityScore}
                  grammarScore={stats.grammarScore}
                  styleScore={stats.styleScore}
                />

                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                  Sugerencias
                </h2>

                <SuggestionsPanel
                  suggestions={suggestions}
                  activeSuggestion={activeSuggestion}
                  onSuggestionClick={scrollToSuggestion}
                  onApplySuggestion={applySuggestion}
                  onIgnoreSuggestion={ignoreSuggestion}
                />

                {appliedSuggestions.length > 0 && (
                  <div className="mt-4">
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem
                        value="applied-corrections"
                        className="border rounded-lg"
                      >
                        <AccordionTrigger className="px-3 py-2 hover:no-underline">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-semibold text-gray-700">
                              Correcciones aplicadas
                            </span>
                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                              {appliedSuggestions.length}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-3 pb-3">
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {appliedSuggestions.map((suggestion, index) => (
                              <div
                                key={suggestion.id}
                                className="bg-gray-50 rounded-md p-3 border border-gray-200"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="text-xs text-gray-500 mb-1">
                                      Corrección #{index + 1}
                                    </div>
                                    <div className="text-sm">
                                      <span className="font-medium text-red-600 line-through">
                                        {suggestion.original}
                                      </span>
                                      <span className="mx-2 text-gray-400">
                                        →
                                      </span>
                                      <span className="font-medium text-green-600">
                                        {suggestion.suggestion}
                                      </span>
                                    </div>
                                    {suggestion.explanation && (
                                      <div className="text-xs text-gray-600 mt-1 italic">
                                        {suggestion.explanation}
                                      </div>
                                    )}
                                  </div>
                                  <div className="ml-2">
                                    <span
                                      className={`
                                      inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                                      ${
                                        suggestion.type === "grammar"
                                          ? "bg-blue-100 text-blue-800"
                                          : ""
                                      }
                                      ${
                                        suggestion.type === "spelling"
                                          ? "bg-red-100 text-red-800"
                                          : ""
                                      }
                                      ${
                                        suggestion.type === "style"
                                          ? "bg-purple-100 text-purple-800"
                                          : ""
                                      }
                                      ${
                                        suggestion.type === "punctuation"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : ""
                                      }
                                    `}
                                    >
                                      {suggestion.type === "grammar" &&
                                        "Gramática"}
                                      {suggestion.type === "spelling" &&
                                        "Ortografía"}
                                      {suggestion.type === "style" && "Estilo"}
                                      {suggestion.type === "punctuation" &&
                                        "Puntuación"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  Globe,
  Link2,
  Key,
  CheckCircle2,
  ArrowRight,
  Loader2,
  XCircle,
  RefreshCw,
  Settings2,
} from "lucide-react";
import Image from "next/image";
import { getSupabaseClient } from "@/lib/supabase/client";
import { v4 as uuidv4 } from "uuid";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAuth } from "@/hooks/use-auth";

export default function WordpressSettingsPage() {
  const { profile } = useAuth();

  const [status, setStatus] = useState<
    "idle" | "testing" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [siteName, setSiteName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingConnection, setExistingConnection] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [wordpressComConnection, setWordpressComConnection] =
    useState<any>(null);
  const [isConnectingWordPressCom, setIsConnectingWordPressCom] =
    useState(false);
  const [wordpressComCredentials, setWordpressComCredentials] = useState({
    username: "",
    password: "",
  });
  const [postCount, setPostCount] = useState<number | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionType, setConnectionType] = useState<
    "self-hosted" | "wordpress-com"
  >("self-hosted");
  const [unifiedFormData, setUnifiedFormData] = useState({
    site_url: "",
    username: "",
    password: "",
    api_path: "/wp-json/wp/v2",
    wordpress_com_url: "",
  });

  useEffect(() => {
    async function loadExistingConnection() {
      try {
        setIsLoading(true);
        const supabase = getSupabaseClient();

        // Buscar conexiones existentes (self-hosted y WordPress.com)
        const { data, error } = await supabase
          .from("wordpress_integration_table")
          .select("*")
          .eq("organizationId", profile?.organizationId)
          .eq("active", true);

        // Separar conexiones por tipo
        if (data && Array.isArray(data)) {
          const selfHosted = data.find(
            (conn) => conn.connection_type !== "wordpress_com"
          );
          const wordpressCom = data.find(
            (conn) => conn.connection_type === "wordpress_com"
          );

          if (selfHosted) {
            setExistingConnection(selfHosted);
            if (selfHosted.site_name) {
              setSiteName(selfHosted.site_name);
            }
          }

          if (wordpressCom) {
            setWordpressComConnection(wordpressCom);
          }
        } else if (data && !Array.isArray(data)) {
          // Compatibilidad con respuesta única
          if (data.connection_type === "wordpress_com") {
            setWordpressComConnection(data);
          } else {
            setExistingConnection(data);
            if (data.site_name) {
              setSiteName(data.site_name);
            }
          }
        }

        if (error) {
          console.log("No hay conexión existente o ocurrió un error:", error);
        }
      } catch (error) {
        console.error("Error al cargar la conexión existente:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadExistingConnection();
  }, []);

  const handleUnifiedFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setUnifiedFormData((prev) => ({
      ...prev,
      [id === "unifiedUrl"
        ? "site_url"
        : id === "unifiedUsername"
        ? "username"
        : id === "unifiedPassword"
        ? "password"
        : id === "unifiedApiPath"
        ? "api_path"
        : id === "unifiedWordPressComUrl"
        ? "wordpress_com_url"
        : id]: value,
    }));
  };

  const handleConnectionTypeChange = (
    type: "self-hosted" | "wordpress-com"
  ) => {
    setConnectionType(type);
    // Reset form data when switching types
    setUnifiedFormData({
      site_url: "",
      username: "",
      password: "",
      api_path: "/wp-json/wp/v2",
      wordpress_com_url: "",
    });
  };

  const testSelfHostedConnection = async (skipValidationMessage = false) => {
    if (
      !unifiedFormData.site_url ||
      !unifiedFormData.username ||
      !unifiedFormData.password
    ) {
      if (!skipValidationMessage) {
        setStatus("error");
        setMessage("Por favor, completa todos los campos requeridos");
      }
      return false;
    }

    try {
      setStatus("testing");
      setMessage("Probando conexión con WordPress auto-hospedado...");
      setSiteName(null);
      setPostCount(null);

      // Usar nuestro endpoint de prueba de conexión
      const response = await fetch("/api/wordpress/test-connection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          site_url: unifiedFormData.site_url,
          username: unifiedFormData.username,
          password: unifiedFormData.password,
          connection_type: "self_hosted",
          organization_id: profile?.organizationId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || `Error al conectar: ${response.status}`);
      }

      // Guardar el conteo de posts
      setPostCount(data.post_count);

      setStatus("success");
      setMessage(`Conexión exitosa`);
      return true;
    } catch (error) {
      console.error("Error al probar la conexión:", error);
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Error al conectar con WordPress"
      );
      return false;
    }
  };

  const testWordPressComConnection = async (skipValidationMessage = false) => {
    if (
      !unifiedFormData.site_url ||
      !unifiedFormData.username ||
      !unifiedFormData.password
    ) {
      if (!skipValidationMessage) {
        setStatus("error");
        setMessage("Por favor, completa todos los campos requeridos");
      }
      return false;
    }

    try {
      setStatus("testing");
      setMessage("Probando conexión con WordPress.com...");
      setSiteName(null);
      setPostCount(null);

      // Para WordPress.com, primero necesitamos obtener el token
      const authResponse = await fetch("/api/wordpress/oauth/authorize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          site_url: unifiedFormData.site_url,
          username: unifiedFormData.username,
          password: unifiedFormData.password,
          test_only: true,
        }),
      });

      const authData = await authResponse.json();

      if (!authResponse.ok || authData.error) {
        throw new Error(
          authData.error || `Error al autenticar: ${authResponse.status}`
        );
      }

      // Ahora probar la conexión usando el endpoint de test
      const testResponse = await fetch("/api/wordpress/test-connection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          connection_type: "wordpress_com",
          connection_id: authData.connection_id,
          organization_id: profile?.organizationId,
        }),
      });

      const testData = await testResponse.json();

      if (!testResponse.ok || !testData.success) {
        throw new Error(
          testData.error || `Error al probar conexión: ${testResponse.status}`
        );
      }

      setPostCount(testData.post_count);
      setStatus("success");
      setMessage(`Conexión exitosa con WordPress.com`);
      return true;
    } catch (error) {
      console.error("Error al probar la conexión:", error);
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Error al conectar con WordPress.com"
      );
      return false;
    }
  };

  const saveSelfHostedConnection = async () => {
    // Validar campos antes de proceder
    if (
      !unifiedFormData.site_url ||
      !unifiedFormData.username ||
      !unifiedFormData.password
    ) {
      setStatus("error");
      setMessage("Por favor, completa todos los campos requeridos");
      return;
    }

    try {
      setIsSubmitting(true);

      // Primero probar la conexión
      const isConnectionValid = await testSelfHostedConnection(true);

      if (!isConnectionValid) {
        setIsSubmitting(false);
        return;
      }

      // Si la conexión es válida, guardar en Supabase
      const supabase = getSupabaseClient();

      // Obtener el ID de la organización del usuario actual
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("No hay sesión activa");
      }

      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("organizationId")
        .eq("id", user.id)
        .single();

      if (userError || !userData?.organizationId) {
        throw new Error("No se pudo obtener la organización del usuario");
      }

      // Normalizar URL
      let siteUrl = unifiedFormData.site_url;
      if (!siteUrl.startsWith("http")) {
        siteUrl = `https://${siteUrl}`;
      }
      if (siteUrl.endsWith("/")) {
        siteUrl = siteUrl.slice(0, -1);
      }

      // Normalizar ruta de API
      let apiPath = unifiedFormData.api_path;
      if (!apiPath.startsWith("/")) {
        apiPath = `/${apiPath}`;
      }
      if (apiPath.endsWith("/")) {
        apiPath = apiPath.slice(0, -1);
      }

      // Guardar la integración
      const { error: insertError } = await supabase
        .from("wordpress_integration_table")
        .insert({
          id: uuidv4(),
          organizationId: userData.organizationId,
          site_url: siteUrl,
          api_path: apiPath,
          username: unifiedFormData.username,
          password: unifiedFormData.password,
          site_name: siteName || "Sitio WordPress",
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

      if (insertError) {
        throw new Error(
          `Error al guardar la integración: ${insertError.message}`
        );
      }

      // Recargar la página para mostrar la conexión guardada
      window.location.reload();
    } catch (error) {
      console.error("Error al guardar la integración:", error);
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Error al guardar la integración"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveWordPressComConnection = async () => {
    // Validar campos requeridos una sola vez
    if (
      !unifiedFormData.site_url ||
      !unifiedFormData.username ||
      !unifiedFormData.password
    ) {
      setStatus("error");
      setMessage("Por favor, completa todos los campos requeridos");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/wordpress/oauth/authorize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          site_url: unifiedFormData.site_url,
          username: unifiedFormData.username,
          password: unifiedFormData.password,
        }),
      });

      if (response.ok) {
        // Recargar la página para mostrar la nueva conexión
        window.location.reload();
      } else {
        const errorData = await response.json();
        setStatus("error");
        setMessage(
          `Error al conectar con WordPress.com: ${
            errorData.error || "Error desconocido"
          }`
        );
      }
    } catch (error) {
      console.error("Error al conectar con WordPress.com:", error);
      setStatus("error");
      setMessage(
        `Error al conectar con WordPress.com: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const testExistingConnection = async () => {
    const connection = existingConnection || wordpressComConnection;
    if (!connection) return;

    try {
      setIsTestingConnection(true);
      setStatus("testing");
      setMessage("Probando conexión existente...");
      setPostCount(null);

      // Determinar el tipo de conexión y preparar los datos
      const isWordPressCom = connection.connection_type === "wordpress_com";

      const requestBody = isWordPressCom
        ? {
            connection_type: "wordpress_com",
            connection_id: connection.id,
            organization_id: profile?.organizationId,
          }
        : {
            site_url: connection.site_url,
            username: connection.username,
            password: connection.password,
            connection_type: "self_hosted",
            organization_id: profile?.organizationId,
          };

      const response = await fetch("/api/wordpress/test-connection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || `Error al probar conexión: ${response.status}`
        );
      }

      setPostCount(data.post_count);
      setStatus("success");
      setMessage(`Conexión verificada exitosamente`);
    } catch (error) {
      console.error("Error al verificar la conexión:", error);
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Error al verificar la conexión"
      );
    } finally {
      setIsTestingConnection(false);
    }
  };

  const verifyExistingConnection = async () => {
    if (!existingConnection) return;

    try {
      setIsVerifying(true);

      // Usar nuestro endpoint de proxy para verificar la conexión existente
      const response = await fetch("/api/wordpress/test-connection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          site_url: existingConnection.site_url,
          username: existingConnection.username,
          password: existingConnection.password,
          api_path: existingConnection.api_path || "/wp-json/wp/v2",
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        alert(
          `Error al verificar la conexión: ${
            data.error || "Verifica las credenciales"
          }`
        );
      } else {
        // Actualizar el nombre del sitio si ha cambiado
        if (data.site.name !== existingConnection.site_name) {
          const supabase = getSupabaseClient();
          await supabase
            .from("wordpress_integration_table")
            .update({
              site_name: data.site.name,
              updatedAt: new Date().toISOString(),
            })
            .eq("id", existingConnection.id);

          // Actualizar el estado local
          setExistingConnection({
            ...existingConnection,
            site_name: data.site.name,
          });
        }

        alert(`Conexión verificada correctamente. Sitio: ${data.site.name}`);
      }
    } catch (error) {
      console.error("Error al verificar la conexión:", error);
      alert(
        `Error al verificar la conexión: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDisconnect = async () => {
    if (!existingConnection) return;

    setIsDeleting(true);
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from("wordpress_integration_table")
        .update({ active: false })
        .eq("id", existingConnection.id);

      if (error) {
        console.error("Error al desconectar:", error);
        alert("Error al desconectar WordPress");
      } else {
        setExistingConnection(null);
        setSiteName("");
        alert("WordPress desconectado exitosamente");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al desconectar WordPress");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleWordPressComCredentialsChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { id, value } = e.target;
    const field = id === "wpComUsername" ? "username" : "password";
    setWordpressComCredentials((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleWordPressComConnect = async () => {
    if (
      !unifiedFormData.site_url ||
      !unifiedFormData.username ||
      !unifiedFormData.password
    ) {
      setStatus("error");
      setMessage("Por favor, completa todos los campos requeridos");
      return;
    }

    setIsConnectingWordPressCom(true);
    try {
      const response = await fetch("/api/wordpress/oauth/authorize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          site_url: unifiedFormData.site_url,
          username: unifiedFormData.username,
          password: unifiedFormData.password,
        }),
      });

      if (response.ok) {
        // Recargar la página para mostrar la nueva conexión
        window.location.reload();
      } else {
        const errorData = await response.json();
        setStatus("error");
        setMessage(
          `Error al conectar con WordPress.com: ${
            errorData.error || "Error desconocido"
          }`
        );
      }
    } catch (error) {
      console.error("Error al conectar con WordPress.com:", error);
      setStatus("error");
      setMessage("Error al iniciar la conexión con WordPress.com");
    } finally {
      setIsConnectingWordPressCom(false);
    }
  };

  const handleWordPressComDisconnect = async () => {
    if (!wordpressComConnection) return;

    setIsDeleting(true);
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from("wordpress_integration_table")
        .update({ active: false })
        .eq("id", wordpressComConnection.id);

      if (error) {
        console.error("Error al desconectar WordPress.com:", error);
        alert("Error al desconectar WordPress.com");
      } else {
        setWordpressComConnection(null);
        alert("WordPress.com desconectado exitosamente");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al desconectar WordPress.com");
    } finally {
      setIsDeleting(false);
    }
  };

  const disconnectWordPress = async () => {
    if (!existingConnection) return;

    if (
      !confirm(
        "¿Estás seguro de que deseas eliminar esta conexión con WordPress? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }

    try {
      setIsDeleting(true);
      const supabase = getSupabaseClient();

      // Eliminar completamente el registro de la base de datos
      const { error } = await supabase
        .from("wordpress_integration_table")
        .delete()
        .eq("id", existingConnection.id);

      if (error) {
        throw new Error(
          `Error al eliminar la conexión con WordPress: ${error.message}`
        );
      }

      // Recargar la página
      window.location.reload();
    } catch (error) {
      console.error("Error al eliminar la conexión con WordPress:", error);
      alert(
        `Error al eliminar la conexión: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="mb-2">
        <h2 className="text-2xl font-bold">Integración con WordPress</h2>
        <p className="text-muted-foreground">
          Conecta tu sitio de WordPress para mejorar tu flujo de trabajo
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div>
          <Card className="border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white p-2 rounded-full shadow-sm">
                  <Image
                    src="/placeholder.svg?key=wordpress"
                    alt="WordPress"
                    width={40}
                    height={40}
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-xl">
                    Integración con WordPress
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Conecta tu sitio WordPress de forma sencilla y segura
                  </p>
                </div>
              </div>

              {/* Selector de Tipo de Conexión - Solo mostrar si no hay ninguna conexión existente */}
              {!(existingConnection || wordpressComConnection) && (
                <div className="flex gap-2 p-1 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                  <button
                    onClick={() => handleConnectionTypeChange("self-hosted")}
                    className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ease-in-out transform flex items-center justify-center gap-2 ${
                      connectionType === "self-hosted"
                        ? "bg-white text-blue-600 shadow-md scale-105 border border-blue-200"
                        : "text-gray-600 hover:text-gray-800 hover:bg-white/50 hover:scale-102"
                    }`}
                  >
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
                      className="lucide lucide-server"
                    >
                      <rect width="20" height="8" x="2" y="2" rx="2" ry="2" />
                      <rect width="20" height="8" x="2" y="14" rx="2" ry="2" />
                      <line x1="6" x2="6.01" y1="6" y2="6" />
                      <line x1="6" x2="6.01" y1="18" y2="18" />
                    </svg>
                    WordPress Auto-hospedado
                  </button>
                  <button
                    onClick={() => handleConnectionTypeChange("wordpress-com")}
                    className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ease-in-out transform flex items-center justify-center gap-2 ${
                      connectionType === "wordpress-com"
                        ? "bg-white text-blue-600 shadow-md scale-105 border border-blue-200"
                        : "text-gray-600 hover:text-gray-800 hover:bg-white/50 hover:scale-102"
                    }`}
                  >
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
                      className="lucide lucide-cloud"
                    >
                      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
                    </svg>
                    WordPress.com
                  </button>
                </div>
              )}
            </div>
            <CardContent className="p-6 space-y-6">
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 text-sidebar animate-spin" />
                </div>
              ) : existingConnection || wordpressComConnection ? (
                <>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-green-700 font-medium">
                        {existingConnection
                          ? existingConnection?.site_name ||
                            "Tu sitio WordPress"
                          : wordpressComConnection?.site_name ||
                            "Tu sitio WordPress.com"}{" "}
                        está conectado correctamente.
                      </p>
                      <p className="text-sm text-green-700">
                        Puedes utilizar todas las funcionalidades de
                        integración.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          URL del Sitio
                        </p>
                        <p className="font-medium flex items-center gap-2">
                          <Globe className="h-4 w-4 text-sidebar" />
                          <a
                            href={
                              existingConnection?.site_url ||
                              wordpressComConnection?.site_url
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sidebar hover:underline"
                          >
                            {existingConnection?.site_url ||
                              wordpressComConnection?.site_url}
                          </a>
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          Tipo de Conexión
                        </p>
                        <p className="font-medium flex items-center gap-2">
                          {existingConnection ? (
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
                              className="lucide lucide-server text-sidebar"
                            >
                              <rect
                                width="20"
                                height="8"
                                x="2"
                                y="2"
                                rx="2"
                                ry="2"
                              />
                              <rect
                                width="20"
                                height="8"
                                x="2"
                                y="14"
                                rx="2"
                                ry="2"
                              />
                              <line x1="6" x2="6.01" y1="6" y2="6" />
                              <line x1="6" x2="6.01" y1="18" y2="18" />
                            </svg>
                          ) : (
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
                              className="lucide lucide-cloud text-sidebar"
                            >
                              <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
                            </svg>
                          )}
                          {existingConnection
                            ? "WordPress Auto-hospedado"
                            : "WordPress.com (OAuth2)"}
                        </p>
                      </div>
                    </div>

                    {existingConnection && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          Ruta de API
                        </p>
                        <p className="font-medium flex items-center gap-2">
                          <Settings2 className="h-4 w-4 text-sidebar" />
                          {existingConnection?.api_path || "/wp-json/wp/v2"}
                        </p>
                      </div>
                    )}

                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        Conectado desde
                      </p>
                      <p className="font-medium">
                        {new Date(
                          existingConnection?.createdAt ||
                            wordpressComConnection?.createdAt
                        ).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    {/* Área de mensajes de estado para conexiones existentes */}
                    {(status !== "idle" || message) &&
                      (existingConnection || wordpressComConnection) && (
                        <div
                          className={`p-4 rounded-lg text-sm font-medium shadow-sm border-l-4 transition-all duration-500 ease-in-out ${
                            status === "success"
                              ? "bg-gradient-to-r from-green-50 to-green-100 text-green-800 border-l-green-500 border border-green-200"
                              : status === "error"
                              ? "bg-gradient-to-r from-red-50 to-red-100 text-red-800 border-l-red-500 border border-red-200"
                              : "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border-l-blue-500 border border-blue-200"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {status === "success" && (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            )}
                            {status === "error" && (
                              <XCircle className="h-5 w-5 text-red-600" />
                            )}
                            {status === "testing" && (
                              <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                            )}
                            <div>
                              <span>{message}</span>
                              {status === "success" && postCount !== null && (
                                <p className="text-sm text-green-700 mt-1">
                                  Posts encontrados:{" "}
                                  <span className="font-medium">
                                    {postCount}
                                  </span>
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                    <div className="flex flex-col sm:flex-row gap-3 mt-6">
                      <Button
                        variant="outline"
                        className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                        onClick={
                          existingConnection
                            ? disconnectWordPress
                            : handleWordPressComDisconnect
                        }
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        {isDeleting ? "Desconectando..." : "Desconectar"}
                      </Button>

                      <Button
                        className="bg-sidebar text-white hover:bg-sidebar/90 flex items-center gap-2"
                        onClick={testExistingConnection}
                        disabled={isTestingConnection}
                      >
                        {isTestingConnection ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                        {isTestingConnection
                          ? "Probando..."
                          : "Probar Conexión"}
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                /* Solo mostrar el formulario si no hay ninguna conexión existente */
                !(existingConnection || wordpressComConnection) && (
                  <div className="space-y-6">
                    {status === "idle" && (
                      <div
                        className={`p-4 border rounded-lg flex items-start gap-3 ${
                          connectionType === "wordpress-com"
                            ? "bg-blue-50 border-blue-200"
                            : "bg-yellow-50 border-yellow-200"
                        }`}
                      >
                        {connectionType === "wordpress-com" ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-info text-blue-500 flex-shrink-0 mt-0.5"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <path d="l 12,16 0,-4" />
                            <path d="l 12,8 0,0" />
                          </svg>
                        ) : (
                          <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p
                            className={`text-sm font-medium ${
                              connectionType === "wordpress-com"
                                ? "text-blue-700"
                                : "text-yellow-700"
                            }`}
                          >
                            {connectionType === "wordpress-com"
                              ? "Conecta tu sitio de WordPress.com"
                              : "Conecta tu sitio WordPress auto-hospedado"}
                          </p>
                          <p
                            className={`text-sm ${
                              connectionType === "wordpress-com"
                                ? "text-blue-700"
                                : "text-yellow-700"
                            }`}
                          >
                            {connectionType === "wordpress-com"
                              ? "Ingresa tus credenciales de WordPress.com para conectar usando Password Grant (solo para desarrollo y testing)."
                              : "Conecta tu sitio para facilitar el uso de las herramientas de KIT.AI. No publicaremos ningún contenido automáticamente."}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Mensaje de estado unificado */}
                    {message && (
                      <div
                        className={`p-4 rounded-lg text-sm font-medium shadow-sm border-l-4 transition-all duration-500 ease-in-out ${
                          status === "success"
                            ? "bg-gradient-to-r from-green-50 to-green-100 text-green-800 border-l-green-500 border border-green-200"
                            : status === "error"
                            ? "bg-gradient-to-r from-red-50 to-red-100 text-red-800 border-l-red-500 border border-red-200"
                            : "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border-l-blue-500 border border-blue-200"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {status === "success" && (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          )}
                          {status === "error" && (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                          {status === "testing" && (
                            <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                          )}
                          <div>
                            <span>{message}</span>
                            {status === "success" && siteName && (
                              <p className="text-sm text-green-700 mt-1">
                                Nombre del sitio:{" "}
                                <span className="font-medium">{siteName}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-5 transition-all duration-500 ease-in-out">
                      <div className="space-y-2">
                        <Label
                          htmlFor="unifiedUrl"
                          className="flex items-center gap-2"
                        >
                          <Globe className="h-4 w-4" />
                          {connectionType === "wordpress-com"
                            ? "URL de WordPress.com"
                            : "URL del Sitio"}
                        </Label>
                        <div className="relative">
                          <Input
                            id="unifiedUrl"
                            placeholder={
                              connectionType === "wordpress-com"
                                ? "https://tusitio.wordpress.com"
                                : "https://tusitio.com"
                            }
                            className="pl-10 bg-white hover:border-gray-400 transition-all duration-200"
                            value={unifiedFormData.site_url}
                            onChange={handleUnifiedFormChange}
                          />
                          <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {connectionType === "wordpress-com"
                            ? "Introduce la URL completa de tu sitio WordPress.com (ej: https://tusitio.wordpress.com)"
                            : "Introduce la URL completa de tu sitio WordPress"}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label
                            htmlFor="unifiedUsername"
                            className="flex items-center gap-2"
                          >
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
                              className="lucide lucide-user"
                            >
                              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                            {connectionType === "wordpress-com"
                              ? "Email/Username"
                              : "Nombre de Usuario"}
                          </Label>
                          <Input
                            id="unifiedUsername"
                            placeholder={
                              connectionType === "wordpress-com"
                                ? "tu-email@ejemplo.com"
                                : "admin"
                            }
                            className="bg-white hover:border-gray-400 transition-all duration-200"
                            value={unifiedFormData.username}
                            onChange={handleUnifiedFormChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="unifiedPassword"
                            className="flex items-center gap-2"
                          >
                            <Key className="h-4 w-4" />
                            {connectionType === "wordpress-com"
                              ? "Contraseña"
                              : "Contraseña de Aplicación"}
                          </Label>
                          <Input
                            id="unifiedPassword"
                            type="password"
                            placeholder="••••••••••••"
                            className="bg-white hover:border-gray-400 transition-all duration-200"
                            value={unifiedFormData.password}
                            onChange={handleUnifiedFormChange}
                          />
                          <p className="text-xs text-muted-foreground">
                            {connectionType === "wordpress-com" ? (
                              "Usa tu contraseña regular de WordPress.com. Este método es solo para desarrollo y testing."
                            ) : (
                              <a
                                href="https://make.wordpress.org/core/2020/11/05/application-passwords-integration-guide/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sidebar hover:underline"
                              >
                                ¿Cómo crear una contraseña de aplicación?
                              </a>
                            )}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`transition-all duration-500 ease-in-out overflow-hidden ${
                          connectionType === "self-hosted"
                            ? "max-h-96 opacity-100 transform translate-y-0"
                            : "max-h-0 opacity-0 transform -translate-y-2"
                        }`}
                      >
                        {connectionType === "self-hosted" && (
                          <Accordion
                            type="single"
                            collapsible
                            className="w-full"
                          >
                            <AccordionItem value="advanced-options">
                              <AccordionTrigger className="text-sm font-medium">
                                <span className="flex items-center gap-2">
                                  <Settings2 className="h-4 w-4" /> Opciones
                                  Avanzadas
                                </span>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-2 pt-2">
                                  <Label
                                    htmlFor="unifiedApiPath"
                                    className="flex items-center gap-2"
                                  >
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
                                      className="lucide lucide-code"
                                    >
                                      <polyline points="16 18 22 12 16 6" />
                                      <polyline points="8 6 2 12 8 18" />
                                    </svg>
                                    Ruta de la API
                                  </Label>
                                  <Input
                                    id="unifiedApiPath"
                                    placeholder="/wp-json/wp/v2"
                                    className="bg-white hover:border-gray-400 transition-all duration-200"
                                    value={unifiedFormData.api_path}
                                    onChange={handleUnifiedFormChange}
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    Ruta base de la API REST de WordPress. El
                                    valor predeterminado es /wp-json/wp/v2
                                  </p>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-6">
                      {connectionType === "self-hosted" ? (
                        <>
                          <Button
                            onClick={testSelfHostedConnection}
                            variant="outline"
                            className="flex items-center gap-2 transform hover:scale-105 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg"
                            disabled={status === "testing" || isSubmitting}
                          >
                            {status === "testing" ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4" />
                            )}
                            {status === "testing"
                              ? "Probando..."
                              : "Probar Conexión"}
                          </Button>
                          <Button
                            onClick={saveSelfHostedConnection}
                            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 flex items-center gap-2 transform hover:scale-105 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                            disabled={status === "testing" || isSubmitting}
                          >
                            {isSubmitting ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4" />
                            )}
                            {isSubmitting ? "Guardando..." : "Guardar Conexión"}
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            onClick={testWordPressComConnection}
                            variant="outline"
                            className="flex items-center gap-2 transform hover:scale-105 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg"
                            disabled={status === "testing" || isSubmitting}
                          >
                            {status === "testing" ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4" />
                            )}
                            {status === "testing"
                              ? "Probando..."
                              : "Probar Conexión"}
                          </Button>
                          <Button
                            onClick={saveWordPressComConnection}
                            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 flex items-center gap-2 transform hover:scale-105 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                            disabled={status === "testing" || isSubmitting}
                          >
                            {isSubmitting ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
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
                                className="lucide lucide-link"
                              >
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                              </svg>
                            )}
                            {isSubmitting ? "Guardando..." : "Guardar Conexión"}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

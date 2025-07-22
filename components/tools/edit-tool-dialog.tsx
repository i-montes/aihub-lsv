"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BarChart2, Edit2, AlertCircle, Copy, Check } from "lucide-react";
import { ToolEditor } from "@/components/tools/tool-editor";
import { ToolConfig } from "@/components/tools/tool-config";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Tool } from "@/types/tool";
import { getSupabaseClient } from "@/lib/supabase/client";
import { ApiKeyRequiredModal } from "../proofreader/api-key-required-modal";

interface PromptItem {
  title: string;
  content: string;
}

interface EditToolDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tool: Tool | null;
  onSave: (tool: Tool) => void;
}

/**
 * Dialog for editing an existing tool with a two-column layout
 */
export function EditToolDialog({
  isOpen,
  onOpenChange,
  tool,
  onSave,
}: EditToolDialogProps) {
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [activePromptIndex, setActivePromptIndex] = useState(0);
  const [toolSchema, setToolSchema] = useState<any>(null);
  const [toolTemperature, setToolTemperature] = useState<number | null>(0.7);
  const [toolTopP, setToolTopP] = useState<number>(1);
  const [toolModels, setToolModels] = useState<
    { provider: string; model: string }[] | []
  >([]);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string>("");

  // Initialize form when tool changes
  useEffect(() => {
    if (tool) {
      let promptsArray: PromptItem[] = [];

      // Parse prompts from tool
      if (typeof tool.prompts === "string") {
        try {
          // Try to parse as JSON
          const parsed = JSON.parse(tool.prompts);
          if (Array.isArray(parsed)) {
            promptsArray = parsed;
          } else {
            // If not an array, create a default prompt
            promptsArray = [{ title: "Principal", content: tool.prompts }];
          }
        } catch (e) {
          // If parsing fails, create a default prompt
          promptsArray = [{ title: "Principal", content: tool.prompts }];
        }
      } else if (Array.isArray(tool.prompts)) {
        promptsArray = tool.prompts as PromptItem[];
      } else if (typeof tool.prompts === "object" && tool.prompts !== null) {
        promptsArray = [
          {
            title: "Principal",
            content: JSON.stringify(tool.prompts, null, 2),
          },
        ];
      }

      // Ensure we have at least one prompt
      if (promptsArray.length === 0) {
        promptsArray = [{ title: "Principal", content: "" }];
      }

      setPrompts(promptsArray);
      setActivePromptIndex(0);
      setToolSchema(tool.schema || {});
      setToolTemperature(tool.temperature as number);
      setToolTopP(tool.topP as number);

      console.log("Tool models:", tool.models);
      
      // Initialize models from tool data
      if (tool.models && Array.isArray(tool.models)) {
        setToolModels(tool.models);
      } else {
        setToolModels([]);
      }
    }
  }, [tool]);

  // Track changes
  useEffect(() => {
    if (tool) {
      let originalPrompts: PromptItem[] = [];

      // Parse original prompts for comparison
      if (typeof tool.prompts === "string") {
        try {
          const parsed = JSON.parse(tool.prompts);
          if (Array.isArray(parsed)) {
            originalPrompts = parsed;
          } else {
            originalPrompts = [{ title: "Principal", content: tool.prompts }];
          }
        } catch (e) {
          originalPrompts = [{ title: "Principal", content: tool.prompts }];
        }
      } else if (Array.isArray(tool.prompts)) {
        originalPrompts = tool.prompts as PromptItem[];
      } else if (typeof tool.prompts === "object" && tool.prompts !== null) {
        originalPrompts = [
          {
            title: "Principal",
            content: JSON.stringify(tool.prompts, null, 2),
          },
        ];
      }
    }
  }, [tool, prompts, toolSchema, toolTemperature, toolTopP]);

  // Reset copied state after 2 seconds
  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  if (!tool) return null;

  const handlePromptChange = (content: string) => {
    const newPrompts = [...prompts];
    newPrompts[activePromptIndex].content = content;
    setPrompts(newPrompts);
  };

  const handleCopyPrompt = async () => {
    if (prompts[activePromptIndex]) {
      try {
        await navigator.clipboard.writeText(prompts[activePromptIndex].content);
        setIsCopied(true);
      } catch (err) {
        console.error("Failed to copy text: ", err);
      }
    }
  };

  const handleSave = () => {
    // Validate that at least one model is selected
    if (!toolModels || toolModels.length === 0) {
      setSaveError("Debe seleccionar al menos un modelo antes de guardar");
      return;
    }

    // Clear any previous error
    setSaveError("");

    if (tool) {
      onSave({
        ...tool,
        prompts: prompts,
        schema: toolSchema,
        temperature: toolTemperature as number,
        topP: toolTopP as number,
        models: toolModels,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      
      <DialogContent className="sm:max-w-[900px] lg:max-w-[1000px] w-[95vw] max-h-[90vh] h-full overflow-hidden p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="h-5 w-5 text-sidebar" />
              <div>
                <span className="text-sidebar font-medium">{tool.title}</span>
                <span className="text-xs text-gray-500 block">
                  Última edición: {tool.lastUsed}
                </span>
              </div>
            </DialogTitle>

            <div className="flex items-center gap-2">
              {tool.isDefault && (
                <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs font-medium">
                  Herramienta predeterminada
                </div>
              )}
              <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md">
                <BarChart2 className="h-4 w-4 text-sidebar" />
                <span className="text-sm font-medium">{tool.usageCount}</span>
              </div>
            </div>
          </div>
        </DialogHeader>

        {tool.isDefault && (
          <div className="bg-amber-50 border-y border-amber-200 px-6 py-3 flex items-start gap-2 flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-amber-800">
                Estás editando una herramienta predeterminada. Al guardar los
                cambios, se creará una copia personalizada para tu organización.
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Left column - Prompt Editor */}
          <div className="flex-1 border-r overflow-hidden flex flex-col">
            <div className="p-4 flex-1 overflow-hidden flex flex-col">
              <Tabs
                value={activePromptIndex.toString()}
                onValueChange={(value) =>
                  setActivePromptIndex(Number.parseInt(value))
                }
                className="flex flex-col h-full overflow-hidden"
              >
                <div className="flex items-center justify-between border-b pb-2 mb-4 flex-shrink-0">
                  <TabsList className="h-9">
                    {prompts.map((prompt, index) => (
                      <TabsTrigger
                        key={index}
                        value={index.toString()}
                        className="px-3 py-1.5 text-sm"
                      >
                        {prompt.title}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  <div className="flex items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 flex items-center gap-1"
                      onClick={handleCopyPrompt}
                    >
                      {isCopied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      <span>{isCopied ? "Copiado" : "Copiar"}</span>
                    </Button>
                  </div>
                </div>

                <div className="flex-1 overflow-hidden">
                  {prompts.map((prompt, index) => (
                    <TabsContent
                      key={index}
                      value={index.toString()}
                      className="mt-0 h-full overflow-auto data-[state=active]:flex data-[state=active]:flex-col"
                      style={{ paddingBottom: "1rem" }}
                    >
                      <ToolEditor
                        promptText={prompt.content}
                        onPromptChange={handlePromptChange}
                        lastEdited={tool.lastUsed}
                      />
                    </TabsContent>
                  ))}
                </div>
              </Tabs>
            </div>
          </div>

          {/* Right column - Configuration */}
          <div className="w-full md:w-[350px] lg:w-[400px] overflow-y-auto">
            <div className="p-4">
              <h3 className="text-md font-medium mb-3 text-gray-700">
                Configuración:
              </h3>
              <ToolConfig
                schema={toolSchema}
                onSchemaChange={(schema) => setToolSchema(schema)}
                temperature={toolTemperature as number}
                onTemperatureChange={(temp) => setToolTemperature(temp)}
                topP={toolTopP}
                onTopPChange={(topP) => setToolTopP(topP)}
                models={toolModels}
                onModelsChange={(models) => setToolModels(models)}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t bg-white shadow-[0_-2px_5px_rgba(0,0,0,0.05)] z-10 flex-shrink-0">
          {saveError && (
            <div className="flex-1 mr-4">
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {saveError}
              </p>
            </div>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!toolModels || toolModels.length === 0}
            className={`${(!toolModels || toolModels.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {tool.isDefault ? "Crear copia personalizada" : "Guardar cambios"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

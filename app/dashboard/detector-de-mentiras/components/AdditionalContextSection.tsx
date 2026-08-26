import type React from "react";
import { Control, Controller, UseFormSetValue } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/ui/form";
import { type FormSchema } from "../constants";
import { HelpCircle, MessageCircle, Youtube } from "lucide-react";
import TextUrlExtractor from "@/components/shared/text-url-extractor";
import YoutubeTranscriptExtractor from "@/components/shared/youtube-transcript-extractor";

/**
 * Props para el componente AdditionalContextSection
 */
interface AdditionalContextSectionProps {
  control: Control<FormSchema>;
  errors: any;
  setValue: UseFormSetValue<FormSchema>;
}

/**
 * Sección de contexto adicional del formulario
 * Permite al usuario proporcionar información adicional relevante
 */
export const AdditionalContextSection: React.FC<
  AdditionalContextSectionProps
> = ({ control, errors, setValue }) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-blue-500" />
          Contexto
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Label htmlFor="additionalContext" className="text-sm font-medium">
              Información adicional (opcional)
            </Label>
            <div className="group relative">
              <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                Información adicional (opcional) para contextualizar tu chequeo.
              </div>
            </div>
          </div>

          <Controller
            name="additional_context.text"
            control={control}
            render={({ field }) => (
              <TextUrlExtractor
                value={field.value}
                onChange={field.onChange}
                onMetadata={(metadata) =>
                  setValue(
                    "additional_context.metadata",
                    Object.fromEntries(metadata) as any
                  )
                }
                placeholder="Escribe aquí cualquier contexto adicional que consideres relevante para el análisis..."
                maxHeight="150px"
              />
            )}
          />
          {errors.additional_context?.text && (
            <FormMessage>{errors.additional_context.text.message}</FormMessage>
          )}
        </div>

        {/* Transcripciones de videos de YouTube */}
        <div className="mt-6 space-y-2 border-t pt-4">
          <div className="mb-2 flex items-center gap-2">
            <Youtube className="h-4 w-4 text-red-500" />
            <Label className="text-sm font-medium">
              Transcripciones de video (opcional)
            </Label>
            <div className="group relative">
              <HelpCircle className="h-4 w-4 cursor-help text-gray-400" />
              <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 transform whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                Extrae la transcripción de videos de YouTube para incluirla en el análisis.
              </div>
            </div>
          </div>

          <Controller
            name="additional_context.transcripts"
            control={control}
            render={({ field }) => (
              <YoutubeTranscriptExtractor
                value={field.value ?? []}
                onChange={field.onChange}
              />
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};

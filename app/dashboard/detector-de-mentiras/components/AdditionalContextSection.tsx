import type React from "react";
import { Control, Controller, UseFormSetValue } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/ui/form";
import { type FormSchema } from "../constants";
import { MessageCircle } from "lucide-react";
import TextUrlExtractor from "@/components/shared/text-url-extractor";

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
          Contexto adicional
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="additionalContext" className="text-sm font-medium">
            Información adicional (opcional)
          </Label>
          <Controller
            name="additional_context.text"
            control={control}
            render={({ field }) => (
              <TextUrlExtractor
                value={field.value}
                onChange={field.onChange}
                onMetadata={(metadata) =>
                  setValue("additional_context.metadata", Object.fromEntries(metadata) as any)
                }
                placeholder="Escribe aquí cualquier contexto adicional que consideres relevante para el análisis..."
                maxHeight="150px"
              />
            )}
          />
          {errors.additional_context?.text && (
            <FormMessage>{errors.additional_context.text.message}</FormMessage>
          )}
          <p className="text-xs text-gray-500">
            Este campo es opcional pero puede ayudar a mejorar la precisión del
            análisis.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

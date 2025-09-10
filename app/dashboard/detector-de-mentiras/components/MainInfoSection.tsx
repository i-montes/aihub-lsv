import type React from "react";
import {
  Control,
  Controller,
  UseFormGetValues,
  UseFormSetValue,
} from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormMessage } from "@/components/ui/form";
import { RATING_OPTIONS, type FormSchema } from "../constants";
import {
  FileText,
  HelpCircle,
  Image,
  ImageIcon,
  LinkIcon,
  MessageSquare,
  Star,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFileUpload } from "../hooks/useFileUpload";
import TextUrlExtractor from "@/components/shared/text-url-extractor";
import { Badge } from "@/components/ui/badge";

/**
 * Props para el componente MainInfoSection
 */
interface MainInfoSectionProps {
  control: Control<FormSchema>;
  errors: any;
  setValue: UseFormSetValue<FormSchema>;
  getValues: UseFormGetValues<FormSchema>;
}

/**
 * Sección principal de información del formulario
 * Contiene los campos de información básica y rating
 */
export const MainInfoSection: React.FC<MainInfoSectionProps> = ({
  control,
  errors,
  setValue,
  getValues,
}) => {
  const {
    uploadedFiles,
    isDragOver,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileSelect,
    removeFile,
  } = useFileUpload({
    setValue,
    getValues,
    fieldName: "disinformation.images",
  });

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Información principal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Campo de información */}
        <div className="space-y-6">
          {/* Carga de archivos */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Label className="text-base font-medium flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Imágenes de la desinformación
              </Label>
              <div className="group relative">
                <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  Sube las imágenes del contenido que quieres verificar
                </div>
              </div>
            </div>
            {/* Zona de drag & drop */}
            <div
              className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                isDragOver ? "border-blue-400 bg-blue-50" : "border-gray-300"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Arrastra o selecciona tus imágenes
                  </p>
                  <p className="text-xs text-gray-500">
                    Formatos permitidos: .png,.jpg,.jpeg
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  accept=".png,.jpg,.jpeg"
                  onChange={(e) => handleFileSelect(e)}
                  className="hidden"
                  id="file-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    document.getElementById("file-upload")?.click()
                  }
                >
                  Seleccionar
                </Button>
              </div>
            </div>

            {/* Lista de archivos subidos */}
            {uploadedFiles?.length > 0 && (
              <div className="border rounded-lg divide-y">
                {uploadedFiles?.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      {file.type.startsWith("image/") ? (
                        <Image className="w-4 h-4 text-blue-500" />
                      ) : (
                        <FileText className="w-4 h-4 text-green-500" />
                      )}
                      <span className="font-medium truncate max-w-[200px]">
                        {file.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(1)}MB
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-red-500 h-6 w-6 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {errors.disinformation?.images && (
              <FormMessage>{errors.disinformation.images.message}</FormMessage>
            )}
          </div>

          {/* Enlaces de Desinformación */}
          <div className="mt-10">
            <div className="flex items-center gap-2 mb-2">
              <Label className="text-base font-medium flex items-center gap-2">
                <LinkIcon className="w-4 h-4" />
                Enlaces de la desinformación
              </Label>
              <div className="group relative">
                <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  Agrega enlaces de los sitios donde circula la desinformación (uno por línea)
                </div>
              </div>
            </div>
            <Controller
              name="disinformation.text"
              control={control}
              render={({ field }) => (
                <TextUrlExtractor
                  value={field.value}
                  onChange={field.onChange}
                  onMetadata={(metadata) => {
                    // console.log("metadata: ", Object.fromEntries(metadata));
                    setValue("disinformation.metadata", Object.fromEntries(metadata) as any);
                  }}
                  placeholder={`Agrega los enlaces del contenido desinformativo, uno por línea:\n\nhttps://ejemplo.com/video\nhttps://ejemplo.com/articulo\nhttps://ejemplo.com/documento.pdf`}
                  className="mt-1"
                  maxHeight="120px"
                />
              )}
            />
            {errors?.disinformation?.text && (
              <FormMessage>{errors.disinformation?.text?.message}</FormMessage>
            )}
          </div>

          {/* ¿De qué trata? */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label className="text-base font-medium flex items-center gap-2">
                ¿De qué trata? *
              </Label>
              <div className="group relative">
                <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  Explica de que se trata la desinformación
                </div>
              </div>
            </div>
            <Controller
              name="disinformation.description"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  placeholder="Breve descripción del contenido desinformativo"
                  rows={4}
                  className={`${errors?.disinformation?.description ? "border-red-500 border rounded-md" : ""}`}
                />
              )}
            />
            {errors?.disinformation?.description && (
              <span className="text-red-500 text-xs">{errors.disinformation?.description?.message}</span>
            )}
          </div>

          {/* Calificación inicial */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label className="text-base font-medium flex items-center gap-2">
                Calificación *
              </Label>
              <div className="group relative">
                <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  Selecciona la calificación de tu chequeo.
                </div>
              </div>
            </div>
            <Controller
              name="rating"
              control={control}
              render={({ field }) => (
                <Select
                  defaultValue={field.value || ""}
                  onValueChange={(value) => {
                    if (value.length) {
                      field.onChange(value);
                    }
                  }}
                >
                  <SelectTrigger className={`${errors?.rating ? "border-red-500 border rounded-md" : ""}`}>
                    <SelectValue placeholder="Selecciona una calificación" />
                  </SelectTrigger>
                  <SelectContent>
                    {RATING_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <Badge className={option.color}>{option.label}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors?.rating && (
              <span className="text-red-500 text-xs">{errors.rating?.message}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

import type React from "react";
import {
  Control,
  Controller,
  UseFormGetValues,
  UseFormSetValue,
} from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form";
import { type FormSchema, type UploadedFile } from "../constants";
import { useFileUpload } from "../hooks/useFileUpload";
import {
  CheckCircle,
  Upload,
  X,
  FileText,
  Image,
  Link,
  ImageIcon,
  HelpCircle,
} from "lucide-react";
import TextUrlExtractor from "@/components/shared/text-url-extractor";

/**
 * Props para el componente VerificationSection
 */
interface VerificationSectionProps {
  control: Control<FormSchema>;
  errors: any;
  setValue: UseFormSetValue<FormSchema>;
  getValues: UseFormGetValues<FormSchema>;
}

/**
 * Sección de métodos de verificación del formulario
 * Contiene los campos para URLs y carga de archivos
 */
export const VerificationSection: React.FC<VerificationSectionProps> = ({
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
  } = useFileUpload({ setValue, getValues, fieldName: "verification.images" });

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          Métodos de verificación
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Extractor de texto desde URL */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Label className="text-base font-medium flex items-center gap-2">
              Estrategia de verificación
            </Label>
            <div className="group relative">
              <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                Lista cada método que usaste en la verificación y pon debajo los enlaces.
              </div>
            </div>
          </div>
          <Controller
            name="verification.text"
            control={control}
            render={({ field }) => (
              <TextUrlExtractor
                value={field.value}
                onChange={field.onChange}
                onMetadata={(metadata) =>
                  setValue(
                    "verification.metadata",
                    Object.fromEntries(metadata) as any
                  )
                }
                placeholder="Describe las estrategias utilizadas para la verificación"
                className="mt-1"
                maxHeight="100px"
              />
            )}
          />
        </div>

        {/* Carga de archivos */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Label className="text-base font-medium flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Imágenes de evidencia
            </Label>
            <div className="group relative">
              <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                Suba imágenes que demuestren la veracidad de la información.
                <br />
                <br />
                <span className="text-xs text-gray-300">
                  Formatos permitidos: .png,.jpg,.jpeg
                </span>
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
                id="file-upload-validations"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  document.getElementById("file-upload-validations")?.click()
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

          {errors.verification?.images && (
            <FormMessage>{errors.verification.images.message}</FormMessage>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

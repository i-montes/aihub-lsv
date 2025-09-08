import { useState } from "react";
import { UseFormSetValue, UseFormGetValues } from "react-hook-form";
import { UploadedFile, FormSchema } from "../constants";
import { generateId } from "../utils";

/**
 * Hook personalizado para manejar la subida de archivos y drag & drop
 * @param setValue - Función setValue de React Hook Form
 * @param getValues - Función getValues de React Hook Form
 * @param fieldName - Nombre del campo en el formulario
 * @returns Funciones y estado para manejo de archivos
 */

interface Props {
  setValue: UseFormSetValue<FormSchema>;
  getValues: UseFormGetValues<FormSchema>;
  fieldName: "disinformation.images" | "verification.images";
}

export const useFileUpload = ({ setValue, getValues, fieldName }: Props) => {
  const [dragOver, setDragOver] = useState<string | null>(fieldName);

  // Estado para archivos subidos (específico para disinformation en MainInfoSection)
  const uploadedFiles = getValues(fieldName) || [];
  const isDragOver = dragOver === fieldName;

  /**
   * Maneja la subida de archivos para una sección específica
   * @param files - Lista de archivos a subir
   */
  const handleFileUpload = (files: FileList) => {
    const newFiles: UploadedFile[] = [];

    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        return;
      }

      const fileType = file.type.startsWith("image/") ? "image" : "document";
      const uploadedFile: UploadedFile = {
        name: file.name,
        size: file.size,
        id: generateId(),
        file,
        type: fileType,
      };

      if (fileType === "image") {
        const reader = new FileReader();
        reader.onload = (e) => {
          uploadedFile.preview = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      }

      newFiles.push(uploadedFile);
    });

    const currentImages = getValues(fieldName);
    console.log(newFiles, fieldName);
    setValue(fieldName, [...(currentImages || []), ...newFiles]);
  };

  /**
   * Maneja el evento de drag over
   * @param e - Evento de drag
   * @param type - Tipo de sección (opcional, por defecto "disinformation")
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(fieldName);
  };

  /**
   * Maneja el evento de drag leave
   * @param e - Evento de drag
   */
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
  };

  /**
   * Maneja el evento de drop
   * @param e - Evento de drop
   * @param type - Tipo de sección donde hacer drop (opcional, por defecto "disinformation")
   */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  /**
   * Maneja la selección de archivos desde input
   * @param e - Evento de cambio del input
   * @param type - Tipo de sección (opcional, por defecto "disinformation")
   */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
  };

  /**
   * Elimina un archivo de una sección específica
   * @param fileIdOrIndex - ID del archivo o índice a eliminar
   * @param type - Tipo de sección (opcional, por defecto "disinformation")
   */
  const removeFile = (fileIdOrIndex: string | number) => {
    const currentImages = getValues(fieldName);
    setValue(
      fieldName,
      currentImages.filter((_, index) => index !== fileIdOrIndex)
    );
  };

  return {
    // Estados
    uploadedFiles,
    isDragOver,
    dragOver,

    // Funciones de manejo de archivos
    handleFileUpload,
    handleFileSelect,

    // Funciones de drag & drop
    handleDragOver,
    handleDragLeave,
    handleDrop,

    // Función de eliminación
    removeFile,
  };
};

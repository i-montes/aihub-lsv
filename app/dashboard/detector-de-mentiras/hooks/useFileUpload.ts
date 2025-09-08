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
   * Crea un preview para un archivo de imagen usando FileReader
   * @param file - Archivo de imagen
   * @returns Promise que resuelve con el preview en base64
   */
  const createImagePreview = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = () => {
        reject(new Error('Error al leer el archivo'));
      };
      reader.readAsDataURL(file);
    });
  };

  /**
   * Maneja la subida de archivos para una sección específica
   * @param files - Lista de archivos a subir
   */
  const handleFileUpload = async (files: FileList) => {
    const newFiles: UploadedFile[] = [];

    for (const file of Array.from(files)) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        continue;
      }

      const fileType = file.type.startsWith("image/") ? "image" : "document";
      let preview = "";

      // Si es una imagen, crear el preview de forma asíncrona
      if (fileType === "image") {
        try {
          preview = await createImagePreview(file);
        } catch (error) {
          console.error('Error al crear preview:', error);
          preview = "";
        }
      }

      const uploadedFile: UploadedFile = {
        name: file.name,
        size: file.size,
        id: generateId(),
        file,
        type: fileType,
        preview,
      };

      newFiles.push(uploadedFile);
    }

    const currentImages = getValues(fieldName);
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
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await handleFileUpload(files);
    }
  };

  /**
   * Maneja la selección de archivos desde input
   * @param e - Evento de cambio del input
   * @param type - Tipo de sección (opcional, por defecto "disinformation")
   */
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFileUpload(files);
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

import { type UploadedFile } from "./constants";

/**
 * Valida si un archivo es de un tipo permitido
 * @param file - El archivo a validar
 * @returns true si el archivo es válido, false en caso contrario
 */
export const isValidFileType = (file: File): boolean => {
  const allowedTypes = [
    // Imágenes
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    // Documentos
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  return allowedTypes.includes(file.type);
};

/**
 * Valida el tamaño de un archivo
 * @param file - El archivo a validar
 * @param maxSizeMB - Tamaño máximo permitido en MB (por defecto 10MB)
 * @returns true si el tamaño es válido, false en caso contrario
 */
export const isValidFileSize = (
  file: File,
  maxSizeMB: number = 10
): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

/**
 * Convierte un archivo a base64
 * @param file - El archivo a convertir
 * @returns Promise que resuelve con la cadena base64
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Error al convertir archivo a base64"));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Genera una vista previa de un archivo
 * @param file - El archivo para generar la vista previa
 * @returns Promise que resuelve con la URL de la vista previa o null
 */
export const generateFilePreview = async (
  file: File
): Promise<string | null> => {
  if (file.type.startsWith("image/")) {
    return URL.createObjectURL(file);
  }
  return null;
};

/**
 * Procesa un archivo y lo convierte al formato UploadedFile
 * @param file - El archivo a procesar
 * @returns Promise que resuelve con el objeto UploadedFile
 */
export const processFile = async (file: File): Promise<UploadedFile> => {
  const preview = await generateFilePreview(file);
  const base64 = await fileToBase64(file);

  return {
    id: generateId(),
    file,
    name: file.name,
    size: file.size,
    type: file.type as UploadedFile["type"],
    preview: preview ?? "",
    base64,
  };
};

/**
 * Formatea el tamaño de un archivo en una cadena legible
 * @param bytes - Tamaño en bytes
 * @returns Cadena formateada (ej: "1.5 MB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Valida una URL
 * @param url - La URL a validar
 * @returns true si la URL es válida, false en caso contrario
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Extrae el dominio de una URL
 * @param url - La URL de la cual extraer el dominio
 * @returns El dominio o null si la URL es inválida
 */
export const extractDomain = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return null;
  }
};

/**
 * Limpia y formatea texto para análisis
 * @param text - El texto a limpiar
 * @returns Texto limpio y formateado
 */
export const cleanText = (text: string): string => {
  return text
    .trim()
    .replace(/\s+/g, " ") // Reemplaza múltiples espacios con uno solo
    .replace(/[\r\n]+/g, " ") // Reemplaza saltos de línea con espacios
    .substring(0, 5000); // Limita a 5000 caracteres
};

/**
 * Genera un ID único simple
 * @returns ID único basado en timestamp y número aleatorio
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Debounce function para optimizar llamadas frecuentes
 * @param func - Función a ejecutar
 * @param wait - Tiempo de espera en milisegundos
 * @returns Función debounced
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Convierte un porcentaje a un color CSS
 * @param percentage - Porcentaje (0-100)
 * @returns Color CSS en formato hsl
 */
export const percentageToColor = (percentage: number): string => {
  // Verde (120) para 100%, rojo (0) para 0%
  const hue = (percentage / 100) * 120;
  return `hsl(${hue}, 70%, 50%)`;
};

/**
 * Trunca texto a una longitud específica
 * @param text - Texto a truncar
 * @param maxLength - Longitud máxima
 * @returns Texto truncado con "..." si es necesario
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
};

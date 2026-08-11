/**
 * Comprime una imagen para que no exceda el tamaño máximo especificado.
 * Las imágenes viajan al modelo como base64 dentro del prompt, así que un
 * archivo grande infla la petición y puede tumbarla.
 *
 * @param file Archivo de imagen a comprimir
 * @param maxSizeKB Tamaño máximo en KB (por defecto 500KB)
 * @param initialQuality Calidad de compresión inicial (0-1, por defecto 0.8)
 * @returns El archivo comprimido, o el original si no hizo falta comprimirlo
 */
export async function compressImageIfNeeded(
  file: File,
  maxSizeKB = 500,
  initialQuality = 0.8
): Promise<File> {
  const maxSizeBytes = maxSizeKB * 1024;
  const fileSizeKB = file.size / 1024;

  // El rango 450-650KB ya es óptimo: comprimir más sólo degrada la lectura
  if (fileSizeKB >= 450 && fileSizeKB <= 650) {
    return file;
  }

  if (file.size <= maxSizeBytes || !file.type.startsWith("image/")) {
    return file;
  }

  try {
    const imageBitmap = await createImageBitmap(file);

    let quality = initialQuality;
    let width = imageBitmap.width;
    let height = imageBitmap.height;
    let compressedFile = file;
    let attempts = 0;
    const MAX_ATTEMPTS = 3;

    // Limitar dimensiones máximas antes de empezar a bajar calidad
    const MAX_DIMENSION = 2000;
    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      if (width > height) {
        height = Math.round(height * (MAX_DIMENSION / width));
        width = MAX_DIMENSION;
      } else {
        width = Math.round(width * (MAX_DIMENSION / height));
        height = MAX_DIMENSION;
      }
    }

    const toCompressedFile = async (
      targetWidth: number,
      targetHeight: number,
      targetQuality: number,
      mimeType = file.type,
      name = file.name
    ): Promise<File | null> => {
      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      ctx.drawImage(imageBitmap, 0, 0, targetWidth, targetHeight);

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(
          (result) => resolve(result ?? new Blob([file], { type: file.type })),
          mimeType,
          targetQuality
        );
      });

      return new File([blob], name, {
        type: mimeType,
        lastModified: file.lastModified,
      });
    };

    while (compressedFile.size > maxSizeBytes && attempts < MAX_ATTEMPTS) {
      attempts++;

      if (attempts > 1) {
        // No bajar de 0.5: por debajo el modelo deja de leer bien la imagen
        quality = Math.max(quality - 0.15, 0.5);

        if (
          attempts === MAX_ATTEMPTS - 1 &&
          compressedFile.size > maxSizeBytes * 1.5
        ) {
          width = Math.floor(width * 0.8);
          height = Math.floor(height * 0.8);
        }

        if (attempts === MAX_ATTEMPTS) {
          width = Math.floor(width * 0.7);
          height = Math.floor(height * 0.7);
          quality = 0.5;
        }
      }

      const result = await toCompressedFile(width, height, quality);
      if (!result) break;
      compressedFile = result;

      // Si caímos en el rango óptimo, no seguir degradando
      const compressedSizeKB = compressedFile.size / 1024;
      if (compressedSizeKB >= 450 && compressedSizeKB <= 650) {
        return compressedFile;
      }
    }

    // Último recurso: forzar JPEG y reducir dimensiones
    if (compressedFile.size > maxSizeBytes) {
      const finalWidth = Math.min(1200, Math.floor(width * 0.6));
      const finalHeight = Math.floor(height * (finalWidth / width));

      const result = await toCompressedFile(
        finalWidth,
        finalHeight,
        0.5,
        "image/jpeg",
        file.name.replace(/\.[^/.]+$/, "") + ".jpg"
      );
      if (result) compressedFile = result;
    }

    return compressedFile;
  } catch (error) {
    console.error("Error al comprimir la imagen:", error);
    return file;
  }
}

/**
 * Comprime múltiples imágenes en paralelo
 */
export async function compressImagesIfNeeded(
  files: File[],
  maxSizeKB = 500
): Promise<File[]> {
  return Promise.all(
    files.map((file) => compressImageIfNeeded(file, maxSizeKB))
  );
}

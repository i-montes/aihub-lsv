import { z } from "zod";

/**
 * Interface para archivos subidos
 */
export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  base64?: string;
  preview?: string;
  type: "image" | "document";
}

/**
 * Opciones de calificación para el detector de mentiras
 */
export const RATING_OPTIONS = [
  { value: "cierto", label: "Cierto", color: "bg-green-100 text-green-800" },
  {
    value: "cierto-pero",
    label: "Cierto, pero",
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    value: "debatible",
    label: "Debatible",
    color: "bg-orange-100 text-orange-800",
  },
  { value: "enganoso", label: "Engañoso", color: "bg-red-100 text-red-800" },
  { value: "falso", label: "Falso", color: "bg-red-100 text-red-800" },
];

/**
 * Schema de Zod para metadata de URLs
 */
export const metadataSchema = z.object({
  key: z.string().optional(),
  value: z.object({
    url: z.string().default("").optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    image: z.string().optional(),
    statusCode: z.number().optional(),
    isValid: z.boolean().optional(),
    error: z.string().optional(),
    complete_text: z.string().optional(),

    // Twitter metadata
    isTwitter: z.boolean().optional(),
    text: z.string().optional(),
    username: z.string().optional(),
    name: z.string().optional(),
    follower_count: z.number().optional(),
    author_image: z.string().optional(),
    like_count: z.number().optional(),
    retweet_count: z.number().optional(),
    creation_date: z.union([z.string(), z.date()]).optional(),
    user_description: z.string().optional(),
    media_image: z.string().optional(),
    media_video: z.string().optional(),
  }).optional(),
});

/**
 * Schema principal del formulario
 */
export const formSchema = z.object({
  rating: z
    .enum(["cierto", "cierto-pero", "debatible", "enganoso", "falso"], {
      required_error: "Selecciona una calificación",
    }),
  disinformation: z.object({
    images: z.array(z.any()).default([]),
    text: z
      .string()
      .default("")
      .describe("Texto del input de enlaces de desinformacion"),
    metadata: metadataSchema.optional(),
    description: z
      .string()
      .min(1, "La descripción es obligatoria")
      .describe("Texto del input de descripcion de desinformacion"),
  }),
  verification: z.object({
    text: z
      .string()
      .default("")
      .describe("Texto del input de Estrategia de Verificación"),
    metadata: metadataSchema.optional(),
    images: z.array(z.any()).default([]),
  }),
  additional_context: z.object({
    text: z
      .string()
      .default("")
      .describe("Texto del input de Estrategia de Verificación"),
    metadata: metadataSchema.optional(),
  }),
});

/**
 * Tipo inferido del schema del formulario
 */
export type FormSchema = z.infer<typeof formSchema>;

/**
 * Valores por defecto del formulario
 */
export const defaultFormValues: FormSchema = {
  rating: "cierto",
  disinformation: {
    images: [],
    text: "",
    metadata: undefined,
    description: "",
  },
  verification: {
    text: "",
    metadata: undefined,
    images: [],
  },
  additional_context: {
    text: "",
    metadata: undefined,
  },
};

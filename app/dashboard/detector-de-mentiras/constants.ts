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
 * Opciones de calificación para el detector de mentiras.
 * `promptValue` es el texto que se envía al modelo: el slug (`cierto-pero`,
 * `enganoso`) no es lo que el prompt espera leer.
 */
export const RATING_OPTIONS = [
  {
    value: "cierto",
    label: "Cierto",
    promptValue: "cierto",
    color: "bg-green-100 text-green-800",
  },
  {
    value: "cierto-pero",
    label: "Cierto, pero",
    promptValue: "cierto, pero",
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    value: "debatible",
    label: "Debatible",
    promptValue: "debatible",
    color: "bg-orange-100 text-orange-800",
  },
  {
    value: "enganoso",
    label: "Engañoso",
    promptValue: "engañoso",
    color: "bg-red-100 text-red-800",
  },
  {
    value: "falso",
    label: "Falso",
    promptValue: "falso",
    color: "bg-red-100 text-red-800",
  },
];

/**
 * Traduce el valor del formulario a la calificación que lee el modelo
 */
export const getRatingPromptValue = (rating: string): string =>
  RATING_OPTIONS.find((option) => option.value === rating)?.promptValue ?? rating;

/**
 * Niveles de esfuerzo de razonamiento soportados por OpenAI
 */
export const OPENAI_REASONING_EFFORTS = [
  "low",
  "medium",
  "high",
  "xhigh",
] as const;

/**
 * Niveles de verbosidad soportados por OpenAI
 */
export const OPENAI_VERBOSITY_LEVELS = ["low", "medium", "high"] as const;

/**
 * Niveles de esfuerzo soportados por Anthropic (thinking adaptativo)
 */
export const ANTHROPIC_EFFORTS = ["low", "medium", "high"] as const;

/**
 * Schema de Zod para metadata de URLs
 */
export const metadataSchema = z.record(
  z.string(),
  z.object({
    url: z.string().default("").optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    image: z.string().optional(),
    statusCode: z.number().optional(),
    isValid: z.boolean().optional(),
    error: z.string().optional(),
    complete_text: z.string().optional(),

    // YouTube metadata
    isYouTube: z.boolean().optional(),

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
);

/**
 * Schema principal del formulario
 */
export const formSchema = z.object({
  selectedModel: z.object({
    provider: z.string().min(1, "Selecciona un proveedor"),
    model: z.string().min(1, "Selecciona un modelo"),
  }),
  model_to_compare_1: z.object({
    provider: z.string(),
    model: z.string(),
  }).optional(),
  compare: z.boolean().default(false),
  // Hiperparámetros por proveedor. Se aplican al modelo que corresponda,
  // así que se envían siempre aunque sólo uno esté en uso.
  openaiReasoningEffort: z
    .enum(OPENAI_REASONING_EFFORTS)
    .default("medium"),
  openaiVerbosity: z.enum(OPENAI_VERBOSITY_LEVELS).default("medium"),
  anthropicEffort: z.enum(ANTHROPIC_EFFORTS).default("medium"),
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
}).superRefine((data, ctx) => {
  // Si compare es true, el modelo de comparación es obligatorio
  if (data.compare) {
    // Validar model_to_compare_1
    if (!data.model_to_compare_1?.provider || data.model_to_compare_1.provider.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Selecciona un proveedor para el modelo de comparación",
        path: ["model_to_compare_1"],
      });
    }
    if (!data.model_to_compare_1?.model || data.model_to_compare_1.model.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Selecciona el modelo de comparación",
        path: ["model_to_compare_1"],
      });
    }
  }
});

/**
 * Tipo inferido del schema del formulario
 */
export type FormSchema = z.infer<typeof formSchema>;

/**
 * Valores por defecto del formulario
 */
export const defaultFormValues: Partial<FormSchema> = {
  compare: false,
  model_to_compare_1: {
    provider: "",
    model: "",
  },
  openaiReasoningEffort: "medium",
  openaiVerbosity: "medium",
  anthropicEffort: "medium",
  // selectedModel se establecerá dinámicamente cuando se carguen los modelos disponibles
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

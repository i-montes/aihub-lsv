import * as z from "zod"

export const profileSchema = z.object({
  name: z
    .string()
    .min(1, { message: "El nombre es requerido" })
    .max(50, { message: "El nombre no puede exceder los 50 caracteres" }),
  lastname: z
    .string()
    .min(1, { message: "El apellido es requerido" })
    .max(50, { message: "El apellido no puede exceder los 50 caracteres" }),
  email: z
    .string()
    .min(1, { message: "El correo electrónico es requerido" })
    .email({ message: "Ingresa un correo electrónico válido" }),
})

export type ProfileFormValues = z.infer<typeof profileSchema>

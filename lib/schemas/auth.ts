import * as z from "zod"

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "El correo electrónico es requerido" })
    .email({ message: "Ingresa un correo electrónico válido" }),
  password: z
    .string()
    .min(1, { message: "La contraseña es requerida" })
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
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
    password: z
      .string()
      .min(1, { message: "La contraseña es requerida" })
      .min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
      .regex(/[A-Z]/, { message: "La contraseña debe contener al menos una letra mayúscula" })
      .regex(/[a-z]/, { message: "La contraseña debe contener al menos una letra minúscula" })
      .regex(/[0-9]/, { message: "La contraseña debe contener al menos un número" }),
    confirmPassword: z.string().min(1, { message: "Confirma tu contraseña" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })

export type RegisterFormValues = z.infer<typeof registerSchema>

// Esquema para solicitar restablecimiento de contraseña
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: "El correo electrónico es requerido" })
    .email({ message: "Ingresa un correo electrónico válido" }),
})

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

// Esquema para establecer nueva contraseña
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, { message: "La contraseña es requerida" })
      .min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
      .regex(/[A-Z]/, { message: "La contraseña debe contener al menos una letra mayúscula" })
      .regex(/[a-z]/, { message: "La contraseña debe contener al menos una letra minúscula" })
      .regex(/[0-9]/, { message: "La contraseña debe contener al menos un número" }),
    confirmPassword: z.string().min(1, { message: "Confirma tu contraseña" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

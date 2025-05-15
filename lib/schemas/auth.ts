import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email({ message: "Por favor, introduce un email válido" }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
  remember: z.boolean().optional(),
})

export const registerSchema = z
  .object({
    name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
    lastname: z.string().min(2, { message: "El apellido debe tener al menos 2 caracteres" }),
    email: z.string().email({ message: "Por favor, introduce un email válido" }),
    password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
    confirmPassword: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
    terms: z.boolean().refine((val) => val === true, {
      message: "Debes aceptar los términos y condiciones",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })

export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Por favor, introduce un email válido" }),
})

export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
    confirmPassword: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })

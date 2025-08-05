import { z } from 'zod'

// Schema para login
export const loginSchema = z.object({
  email: z
    .string()
    .email('Email inválido')
    .min(1, 'Email es requerido'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña es muy larga'),
})

// Schema para registro de admin
export const registerAdminSchema = z.object({
  email: z
    .string()
    .email('Email inválido')
    .min(1, 'Email es requerido'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña es muy larga'),
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es muy largo')
    .optional(),
})

// Schema para refresh token
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token es requerido'),
})

// Tipos TypeScript derivados de los schemas
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterAdminInput = z.infer<typeof registerAdminSchema>
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>
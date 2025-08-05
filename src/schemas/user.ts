import { z } from 'zod'

// Schema para registro inicial de usuario
export const registerUserSchema = z.object({
  fullName: z
    .string()
    .min(2, 'El nombre completo debe tener al menos 2 caracteres')
    .max(100, 'El nombre completo es muy largo')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo debe contener letras y espacios'),
  
  phone: z
    .string()
    .regex(/^\+[1-9]\d{9,14}$/, 'El teléfono debe estar en formato internacional (+51987654321)'),
  
  email: z
    .string()
    .email('Email inválido')
    .toLowerCase(),
  
  address: z
    .string()
    .min(10, 'La dirección debe tener al menos 10 caracteres')
    .max(200, 'La dirección es muy larga'),
  
  locationLat: z
    .number()
    .min(-90, 'Latitud inválida')
    .max(90, 'Latitud inválida'),
  
  locationLng: z
    .number()
    .min(-180, 'Longitud inválida')
    .max(180, 'Longitud inválida'),
  
  acceptedTerms: z
    .boolean()
    .refine(val => val === true, {
      message: 'Debes aceptar los términos y condiciones'
    })
})

// Schema para reenviar código de verificación
export const resendCodeSchema = z.object({
  phone: z
    .string()
    .regex(/^\+[1-9]\d{9,14}$/, 'El teléfono debe estar en formato internacional'),
})

// Schema para verificación de código SMS
export const verifyPhoneSchema = z.object({
  phone: z
    .string()
    .regex(/^\+[1-9]\d{9,14}$/, 'El teléfono debe estar en formato internacional'),
  code: z
    .string()
    .length(6, 'El código debe tener exactamente 6 dígitos')
    .regex(/^\d{6}$/, 'El código solo debe contener números'),
})

// Schema para actualización de datos adicionales
export const updateUserSchema = z.object({
  fullName: z
    .string()
    .min(2, 'El nombre completo debe tener al menos 2 caracteres')
    .max(100, 'El nombre completo es muy largo')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo debe contener letras y espacios')
    .optional(),
  
  email: z
    .string()
    .email('Email inválido')
    .toLowerCase()
    .optional(),
  
  address: z
    .string()
    .min(10, 'La dirección debe tener al menos 10 caracteres')
    .max(200, 'La dirección es muy larga')
    .optional(),
  
  locationLat: z
    .number()
    .min(-90, 'Latitud inválida')
    .max(90, 'Latitud inválida')
    .optional(),
  
  locationLng: z
    .number()
    .min(-180, 'Longitud inválida')
    .max(180, 'Longitud inválida')
    .optional(),
})

// Tipos TypeScript derivados de los schemas
export type RegisterUserInput = z.infer<typeof registerUserSchema>
export type VerifyPhoneInput = z.infer<typeof verifyPhoneSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type ResendCodeInput = z.infer<typeof resendCodeSchema>
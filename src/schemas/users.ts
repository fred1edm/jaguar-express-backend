import { z } from 'zod'

// Schema para registro de usuario
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

// Schema para verificación de teléfono
export const verifyPhoneSchema = z.object({
  phone: z
    .string()
    .regex(/^\+[1-9]\d{9,14}$/, 'El teléfono debe estar en formato internacional'),
  
  code: z
    .string()
    .length(6, 'El código debe tener exactamente 6 dígitos')
    .regex(/^\d{6}$/, 'El código solo debe contener números')
})

// Schema para reenvío de código
export const resendCodeSchema = z.object({
  phone: z
    .string()
    .regex(/^\+[1-9]\d{9,14}$/, 'El teléfono debe estar en formato internacional')
})

// Tipos TypeScript derivados de los schemas
export type RegisterUserInput = z.infer<typeof registerUserSchema>
export type VerifyPhoneInput = z.infer<typeof verifyPhoneSchema>
export type ResendCodeInput = z.infer<typeof resendCodeSchema>

// Ejemplos de respuestas para documentación
export const responseExamples = {
  registerSuccess: {
    success: true,
    data: {
      userId: 'clp123abc456def789',
      message: 'Usuario registrado exitosamente. Código de verificación enviado por WhatsApp.'
    }
  },
  
  registerError: {
    success: false,
    error: 'El teléfono ya está registrado',
    message: 'Error en el registro'
  },
  
  verifySuccess: {
    success: true,
    data: {
      user: {
        id: 'clp123abc456def789',
        fullName: 'Juan Pérez',
        phone: '+51987654321',
        email: 'juan@example.com',
        phoneVerified: true
      },
      accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      expiresIn: 86400
    }
  },
  
  verifyError: {
    success: false,
    error: 'Código incorrecto o expirado',
    message: 'Error en la verificación'
  },
  
  resendSuccess: {
    success: true,
    data: {
      message: 'Código reenviado por WhatsApp'
    }
  },
  
  resendError: {
    success: false,
    error: 'No se puede reenviar el código. Espera 1 minuto.',
    message: 'Error al reenviar código'
  },
  
  profileSuccess: {
    success: true,
    data: {
      id: 'clp123abc456def789',
      fullName: 'Juan Pérez',
      phone: '+51987654321',
      email: 'juan@example.com',
      address: 'Av. Principal 123, Lima',
      locationLat: -12.0464,
      locationLng: -77.0428,
      phoneVerified: true,
      acceptedTerms: true,
      createdAt: '2024-01-15T10:30:00.000Z'
    }
  },
  
  profileError: {
    success: false,
    error: 'Usuario no encontrado',
    message: 'Error al obtener perfil'
  }
}
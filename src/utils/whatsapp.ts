import axios from 'axios'

const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN!
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID!
const WHATSAPP_API_URL = `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`

/**
 * Envía un código de verificación por WhatsApp usando la API oficial de Meta
 * @param phone - Número de teléfono en formato internacional (ej: +51987654321)
 * @param code - Código de verificación de 6 dígitos
 */
export async function sendVerificationCodeWhatsApp(phone: string, code: string): Promise<void> {
  try {
    // Formatear el número de teléfono (remover espacios, guiones, etc.)
    const formattedPhone = phone.replace(/[^\d+]/g, '')
    
    // Mensaje de verificación
    const message = {
      messaging_product: 'whatsapp',
      to: formattedPhone,
      type: 'template',
      template: {
        name: 'verification_code', // Nombre del template aprobado
        language: {
          code: 'es' // Español
        },
        components: [
          {
            type: 'body',
            parameters: [
              {
                type: 'text',
                text: code
              }
            ]
          }
        ]
      }
    }

    // Si no tienes un template aprobado, usa mensaje de texto libre
    const fallbackMessage = {
      messaging_product: 'whatsapp',
      to: formattedPhone,
      type: 'text',
      text: {
        body: `🔐 Tu código de verificación para Jaguar Express es: ${code}\n\nEste código expira en 5 minutos.\n\n¡No compartas este código con nadie!`
      }
    }

    const response = await axios.post(WHATSAPP_API_URL, fallbackMessage, {
      headers: {
        'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('✅ Código de verificación enviado por WhatsApp:', {
      phone: formattedPhone,
      messageId: response.data.messages?.[0]?.id,
      status: response.data.messages?.[0]?.message_status
    })

  } catch (error: any) {
    console.error('❌ Error enviando código por WhatsApp:', {
      phone,
      error: error.response?.data || error.message
    })
    
    // Re-lanzar el error para que el controlador pueda manejarlo
    throw new Error(`Error enviando WhatsApp: ${error.response?.data?.error?.message || error.message}`)
  }
}

/**
 * Valida el formato del número de teléfono
 * @param phone - Número de teléfono
 * @returns true si el formato es válido
 */
export function validatePhoneNumber(phone: string): boolean {
  // Debe empezar con + y tener entre 10-15 dígitos
  const phoneRegex = /^\+[1-9]\d{9,14}$/
  return phoneRegex.test(phone)
}

/**
 * Genera un código de verificación de 6 dígitos
 * @returns Código de 6 dígitos
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Almacén temporal en memoria para códigos de verificación
 * En producción, considera usar Redis para escalabilidad
 */
interface VerificationData {
  code: string
  expiresAt: Date
  attempts: number
}

const verificationCodes = new Map<string, VerificationData>()

/**
 * Almacena un código de verificación temporalmente
 * @param phone - Número de teléfono
 * @param code - Código de verificación
 * @param ttlMinutes - Tiempo de vida en minutos (default: 5)
 */
export function storeVerificationCode(phone: string, code: string, ttlMinutes: number = 5): void {
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000)
  verificationCodes.set(phone, {
    code,
    expiresAt,
    attempts: 0
  })
  
  // Limpiar código expirado automáticamente
  setTimeout(() => {
    verificationCodes.delete(phone)
  }, ttlMinutes * 60 * 1000)
}

/**
 * Verifica un código de verificación
 * @param phone - Número de teléfono
 * @param code - Código a verificar
 * @returns true si el código es válido
 */
export function verifyCode(phone: string, code: string): boolean {
  const data = verificationCodes.get(phone)
  
  if (!data) {
    return false // No hay código para este teléfono
  }
  
  if (new Date() > data.expiresAt) {
    verificationCodes.delete(phone)
    return false // Código expirado
  }
  
  data.attempts++
  
  if (data.attempts > 3) {
    verificationCodes.delete(phone)
    return false // Demasiados intentos
  }
  
  if (data.code === code) {
    verificationCodes.delete(phone) // Código usado exitosamente
    return true
  }
  
  return false // Código incorrecto
}

/**
 * Verifica si existe un código válido para un teléfono
 * @param phone - Número de teléfono
 * @returns true si existe un código válido
 */
export function hasValidCode(phone: string): boolean {
  const data = verificationCodes.get(phone)
  return data ? new Date() <= data.expiresAt : false
}
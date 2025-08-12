import { FastifyInstance } from 'fastify'
import { usersController } from '../controllers/users.controller.js'
import { userAuthMiddleware } from '../middleware/users-auth.js'

/**
 * Rutas para usuarios finales
 * Prefijo: /api/users
 */
export default async function userRoutes(fastify: FastifyInstance) {
  // Registrar hooks para logging
  fastify.addHook('preHandler', async (request, reply) => {
    // Logging simplificado para producción
  })

  /**
   * POST /api/users/register
   * Registra un nuevo usuario y envía código de verificación por WhatsApp
   * 
   * Body:
   * {
   *   "fullName": "Juan Pérez",
   *   "phone": "+51987654321",
   *   "email": "juan@example.com",
   *   "address": "Av. Principal 123, Lima",
   *   "locationLat": -12.0464,
   *   "locationLng": -77.0428,
   *   "acceptedTerms": true
   * }
   * 
   * Respuesta exitosa (201):
   * {
   *   "success": true,
   *   "data": {
   *     "userId": "clp123abc456def789",
   *     "message": "Usuario registrado exitosamente. Código de verificación enviado por WhatsApp."
   *   },
   *   "message": "Usuario registrado exitosamente"
   * }
   * 
   * Respuesta de error (409 - Conflicto):
   * {
   *   "success": false,
   *   "error": "El teléfono ya está registrado",
   *   "message": "Conflicto en el registro"
   * }
   */
  fastify.post('/register', {
    handler: usersController.register.bind(usersController)
  })

  /**
   * POST /api/users/verify-phone
   * Verifica el código de WhatsApp y activa la cuenta
   * 
   * Body:
   * {
   *   "phone": "+51987654321",
   *   "code": "123456"
   * }
   * 
   * Respuesta exitosa (200):
   * {
   *   "success": true,
   *   "data": {
   *     "user": {
   *       "id": "clp123abc456def789",
   *       "fullName": "Juan Pérez",
   *       "phone": "+51987654321",
   *       "email": "juan@example.com",
   *       "phoneVerified": true
   *     },
   *     "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
   *     "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
   *     "expiresIn": 86400
   *   },
   *   "message": "Teléfono verificado exitosamente"
   * }
   * 
   * Respuesta de error (400 - Código incorrecto):
   * {
   *   "success": false,
   *   "error": "Código incorrecto o expirado",
   *   "message": "Error en la verificación"
   * }
   */
  fastify.post('/verify-phone', {
    handler: usersController.verifyPhone.bind(usersController)
  })

  /**
   * POST /api/users/resend-code
   * Reenvía el código de verificación por WhatsApp
   * 
   * Body:
   * {
   *   "phone": "+51987654321"
   * }
   * 
   * Respuesta exitosa (200):
   * {
   *   "success": true,
   *   "data": {
   *     "message": "Código reenviado por WhatsApp"
   *   },
   *   "message": "Código reenviado exitosamente"
   * }
   * 
   * Respuesta de error (429 - Demasiadas solicitudes):
   * {
   *   "success": false,
   *   "error": "Ya se envió un código. Espera 5 minutos antes de solicitar otro.",
   *   "message": "Demasiadas solicitudes"
   * }
   */
  fastify.post('/resend-code', {
    handler: usersController.resendCode.bind(usersController)
  })

  /**
   * GET /api/users/me
   * Obtiene el perfil del usuario autenticado
   * 
   * Headers:
   * Authorization: Bearer <access_token>
   * 
   * Respuesta exitosa (200):
   * {
   *   "success": true,
   *   "data": {
   *     "id": "clp123abc456def789",
   *     "fullName": "Juan Pérez",
   *     "phone": "+51987654321",
   *     "email": "juan@example.com",
   *     "address": "Av. Principal 123, Lima",
   *     "locationLat": -12.0464,
   *     "locationLng": -77.0428,
   *     "phoneVerified": true,
   *     "acceptedTerms": true,
   *     "createdAt": "2024-01-15T10:30:00.000Z"
   *   },
   *   "message": "Perfil obtenido exitosamente"
   * }
   * 
   * Respuesta de error (401 - No autorizado):
   * {
   *   "success": false,
   *   "error": "Token de acceso requerido",
   *   "message": "No autorizado"
   * }
   */
  fastify.get('/me', {
    preHandler: [userAuthMiddleware],
    handler: usersController.getProfile.bind(usersController)
  })

  /**
   * PUT /api/users/me
   * Actualiza el perfil del usuario autenticado
   * 
   * Headers:
   * Authorization: Bearer <access_token>
   * 
   * Body:
   * {
   *   "fullName": "Juan Pérez Actualizado",
   *   "phone": "+51987654321",
   *   "address": "Nueva dirección 456, Lima"
   * }
   * 
   * Respuesta exitosa (200):
   * {
   *   "success": true,
   *   "data": {
   *     "id": "clp123abc456def789",
   *     "fullName": "Juan Pérez Actualizado",
   *     "phone": "+51987654321",
   *     "email": "juan@example.com",
   *     "address": "Nueva dirección 456, Lima",
   *     "locationLat": -12.0464,
   *     "locationLng": -77.0428,
   *     "phoneVerified": true,
   *     "acceptedTerms": true,
   *     "createdAt": "2024-01-15T10:30:00.000Z"
   *   },
   *   "message": "Perfil actualizado exitosamente"
   * }
   * 
   * Respuesta de error (401 - No autorizado):
   * {
   *   "success": false,
   *   "error": "Token de acceso requerido",
   *   "message": "No autorizado"
   * }
   */
  fastify.put('/me', {
    preHandler: [userAuthMiddleware],
    handler: usersController.updateProfile.bind(usersController)
  })

  /**
   * GET /api/users/orders/:id
   * Obtiene un pedido específico del usuario autenticado
   * 
   * Headers:
   * Authorization: Bearer <access_token>
   * 
   * Params:
   * id: ID del pedido
   * 
   * Respuesta exitosa (200):
   * {
   *   "success": true,
   *   "data": {
   *     "id": "clp123abc456def789",
   *     "status": "EN_CAMINO",
   *     "total": 45.50,
   *     "subtotal": 40.00,
   *     "deliveryFee": 5.50,
   *     "paymentMethod": "EFECTIVO",
   *     "customerAddress": "Av. Principal 123, Lima",
   *     "estimatedTime": "30-45 minutos",
   *     "business": {
   *       "id": "clp987zyx654wvu321",
   *       "name": "Restaurante El Buen Sabor",
   *       "phone": "+51987654321",
   *       "address": "Calle Comercio 456, Lima"
   *     },
   *     "items": [
   *       {
   *         "id": "item123",
   *         "quantity": 2,
   *         "price": 15.00,
   *         "product": {
   *           "name": "Hamburguesa Clásica",
   *           "description": "Carne, lechuga, tomate"
   *         }
   *       }
   *     ],
   *     "createdAt": "2024-01-15T10:30:00.000Z",
   *     "updatedAt": "2024-01-15T11:00:00.000Z"
   *   },
   *   "message": "Pedido obtenido exitosamente"
   * }
   * 
   * Respuesta de error (403 - Acceso denegado):
   * {
   *   "success": false,
   *   "error": "No tienes permiso para ver este pedido",
   *   "message": "Acceso denegado"
   * }
   */
  fastify.get('/orders/:id', {
    preHandler: [userAuthMiddleware],
    handler: usersController.getOrderById.bind(usersController)
  })

  /**
   * GET /api/users/my-orders
   * Obtiene el historial de pedidos del usuario autenticado
   * 
   * Headers:
   * Authorization: Bearer <access_token>
   * 
   * Respuesta exitosa (200):
   * {
   *   "success": true,
   *   "data": [
   *     {
   *       "id": "clp123abc456def789",
   *       "status": "ENTREGADO",
   *       "total": 45.50,
   *       "business": {
   *         "name": "Restaurante El Buen Sabor"
   *       },
   *       "createdAt": "2024-01-15T10:30:00.000Z"
   *     }
   *   ],
   *   "message": "Historial de pedidos obtenido exitosamente"
   * }
   */
  fastify.get('/my-orders', {
    preHandler: [userAuthMiddleware],
    handler: usersController.getMyOrders.bind(usersController)
  })

  // Hook para logging de respuestas
  fastify.addHook('onSend', async (request, reply, payload) => {
    // Logging simplificado para producción
  })
}

// Exportar también la función con nombre para mayor flexibilidad
export { userRoutes as usersRoutes }
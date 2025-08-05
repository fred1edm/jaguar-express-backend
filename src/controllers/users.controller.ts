import { FastifyRequest, FastifyReply } from 'fastify'
import { usersService } from '../services/users.service'
import { 
  registerUserSchema, 
  verifyPhoneSchema, 
  resendCodeSchema,
  RegisterUserInput,
  VerifyPhoneInput,
  ResendCodeInput
} from '../schemas/users'
import { successResponse, errorResponse } from '../utils/response'
import { UserAuthPayload } from '../types'

// Extender el tipo de request para incluir user
declare module 'fastify' {
  interface FastifyRequest {
    user?: UserAuthPayload
  }
}

export class UsersController {
  /**
   * POST /api/users/register
   * Registra un nuevo usuario y envía código de verificación por WhatsApp
   */
  async register(request: FastifyRequest, reply: FastifyReply) {
    try {
      // Validar datos de entrada
      const validatedData = registerUserSchema.parse(request.body)

      // Registrar usuario
      const result = await usersService.registerUser(validatedData)

      return reply.status(201).send(successResponse(result, 'Usuario registrado exitosamente'))

    } catch (error: any) {
      console.error('Error en register:', error)
      
      // Errores de validación de Zod
      if (error.name === 'ZodError') {
        return reply.status(400).send(errorResponse(
          'Datos inválidos',
          error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ')
        ))
      }

      // Errores de negocio
      if (error.message.includes('ya está registrado')) {
        return reply.status(409).send(errorResponse(
          error.message,
          'Conflicto en el registro'
        ))
      }

      if (error.message.includes('WhatsApp')) {
        return reply.status(503).send(errorResponse(
          'Error enviando código de verificación',
          'Servicio temporalmente no disponible'
        ))
      }

      // Error genérico
      return reply.status(500).send(errorResponse(
        'Error interno del servidor',
        'Error en el registro'
      ))
    }
  }

  /**
   * POST /api/users/verify-phone
   * Verifica el código de WhatsApp y activa la cuenta
   */
  async verifyPhone(request: FastifyRequest, reply: FastifyReply) {
    try {
      // Validar datos de entrada
      const { phone, code } = verifyPhoneSchema.parse(request.body)

      // Verificar código
      const result = await usersService.verifyPhone(phone, code)

      return reply.status(200).send(successResponse(result, 'Teléfono verificado exitosamente'))

    } catch (error: any) {
      console.error('Error en verifyPhone:', error)
      
      // Errores de validación de Zod
      if (error.name === 'ZodError') {
        return reply.status(400).send(errorResponse(
          'Datos inválidos',
          error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ')
        ))
      }

      // Errores de negocio
      if (error.message.includes('Código incorrecto') || error.message.includes('expirado')) {
        return reply.status(400).send(errorResponse(
          error.message,
          'Error en la verificación'
        ))
      }

      if (error.message.includes('no encontrado')) {
        return reply.status(404).send(errorResponse(
          error.message,
          'Usuario no encontrado'
        ))
      }

      // Error genérico
      return reply.status(500).send(errorResponse(
        'Error interno del servidor',
        'Error en la verificación'
      ))
    }
  }

  /**
   * POST /api/users/resend-code
   * Reenvía el código de verificación por WhatsApp
   */
  async resendCode(request: FastifyRequest, reply: FastifyReply) {
    try {
      // Validar datos de entrada
      const { phone } = resendCodeSchema.parse(request.body)

      // Reenviar código
      const result = await usersService.resendCode(phone)

      return reply.status(200).send(successResponse(result, 'Código reenviado exitosamente'))

    } catch (error: any) {
      console.error('Error en resendCode:', error)
      
      // Errores de validación de Zod
      if (error.name === 'ZodError') {
        return reply.status(400).send(errorResponse(
          'Datos inválidos',
          error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ')
        ))
      }

      // Errores de negocio
      if (error.message.includes('no encontrado')) {
        return reply.status(404).send(errorResponse(
          error.message,
          'Usuario no encontrado'
        ))
      }

      if (error.message.includes('ya está verificado')) {
        return reply.status(400).send(errorResponse(
          error.message,
          'Teléfono ya verificado'
        ))
      }

      if (error.message.includes('Ya se envió') || error.message.includes('Espera')) {
        return reply.status(429).send(errorResponse(
          error.message,
          'Demasiadas solicitudes'
        ))
      }

      if (error.message.includes('WhatsApp')) {
        return reply.status(503).send(errorResponse(
          'Error enviando código de verificación',
          'Servicio temporalmente no disponible'
        ))
      }

      // Error genérico
      return reply.status(500).send(errorResponse(
        'Error interno del servidor',
        'Error al reenviar código'
      ))
    }
  }

  /**
   * GET /api/users/me
   * Obtiene el perfil del usuario autenticado
   */
  async getProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      // El middleware userAuthMiddleware debe haber agregado el user al request
      if (!request.user) {
        return reply.status(401).send(errorResponse(
          'Token de acceso requerido',
          'No autorizado'
        ))
      }

      // Obtener perfil del usuario
      const userProfile = await usersService.getUserProfile(request.user.userId)

      return reply.status(200).send(successResponse(userProfile, 'Perfil obtenido exitosamente'))

    } catch (error: any) {
      console.error('Error en getProfile:', error)
      
      if (error.message.includes('no encontrado')) {
        return reply.status(404).send(errorResponse(
          error.message,
          'Usuario no encontrado'
        ))
      }

      // Error genérico
      return reply.status(500).send(errorResponse(
        'Error interno del servidor',
        'Error al obtener perfil'
      ))
    }
  }

  /**
   * PUT /api/users/me
   * Actualiza el perfil del usuario autenticado
   */
  async updateProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      // El middleware userAuthMiddleware debe haber agregado el user al request
      if (!request.user) {
        return reply.status(401).send(errorResponse(
          'Token de acceso requerido',
          'No autorizado'
        ))
      }

      // Validar datos de entrada (necesitaremos crear el schema)
      const updateData = request.body as any
      
      // Validar que al menos un campo esté presente
      if (!updateData.fullName && !updateData.phone && !updateData.address) {
        return reply.status(400).send(errorResponse(
          'Al menos un campo debe ser proporcionado para actualizar',
          'Datos inválidos'
        ))
      }

      // Actualizar perfil del usuario
      const updatedProfile = await usersService.updateUserProfile(request.user.userId, updateData)

      return reply.status(200).send(successResponse(updatedProfile, 'Perfil actualizado exitosamente'))

    } catch (error: any) {
      console.error('Error en updateProfile:', error)
      
      if (error.message.includes('no encontrado')) {
        return reply.status(404).send(errorResponse(
          error.message,
          'Usuario no encontrado'
        ))
      }

      if (error.message.includes('ya existe') || error.message.includes('duplicado')) {
        return reply.status(409).send(errorResponse(
          error.message,
          'Conflicto de datos'
        ))
      }

      // Error genérico
      return reply.status(500).send(errorResponse(
        'Error interno del servidor',
        'Error al actualizar perfil'
      ))
    }
  }

  /**
   * GET /api/users/orders/:id
   * Obtiene un pedido específico del usuario autenticado
   */
  async getOrderById(request: FastifyRequest, reply: FastifyReply) {
    try {
      // El middleware userAuthMiddleware debe haber agregado el user al request
      if (!request.user) {
        return reply.status(401).send(errorResponse(
          'Token de acceso requerido',
          'No autorizado'
        ))
      }

      // Obtener ID del pedido desde los parámetros
      const { id } = request.params as { id: string }

      if (!id) {
        return reply.status(400).send(errorResponse(
          'ID del pedido es requerido',
          'Datos inválidos'
        ))
      }

      // Obtener pedido específico del usuario
      const order = await usersService.getUserOrderById(request.user.userId, id)

      return reply.status(200).send(successResponse(order, 'Pedido obtenido exitosamente'))

    } catch (error: any) {
      console.error('Error en getOrderById:', error)
      
      if (error.message.includes('no encontrado')) {
        return reply.status(404).send(errorResponse(
          error.message,
          'Pedido no encontrado'
        ))
      }

      if (error.message.includes('No tienes permiso')) {
        return reply.status(403).send(errorResponse(
          error.message,
          'Acceso denegado'
        ))
      }

      // Error genérico
      return reply.status(500).send(errorResponse(
        'Error interno del servidor',
        'Error al obtener pedido'
      ))
    }
  }

  /**
   * GET /api/users/my-orders
   * Obtiene el historial de pedidos del usuario autenticado
   */
  async getMyOrders(request: FastifyRequest, reply: FastifyReply) {
    try {
      // El middleware userAuthMiddleware debe haber agregado el user al request
      if (!request.user) {
        return reply.status(401).send(errorResponse(
          'Token de acceso requerido',
          'No autorizado'
        ))
      }

      // Obtener pedidos del usuario
      const orders = await usersService.getUserOrders(request.user.userId)

      return reply.status(200).send(successResponse(orders, 'Historial de pedidos obtenido exitosamente'))

    } catch (error: any) {
      console.error('Error en getMyOrders:', error)
      
      if (error.message.includes('no encontrado')) {
        return reply.status(404).send(errorResponse(
          error.message,
          'Usuario no encontrado'
        ))
      }

      // Error genérico
      return reply.status(500).send(errorResponse(
        'Error interno del servidor',
        'Error al obtener historial de pedidos'
      ))
    }
  }
}

export const usersController = new UsersController()
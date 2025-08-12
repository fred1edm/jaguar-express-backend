import { FastifyRequest, FastifyReply } from 'fastify'
import { verifyUserAccessToken } from '../utils/jwt.js'
import { usersService } from '../services/users.service.js'
import { errorResponse } from '../utils/response.js'
import { UserAuthPayload } from '../types/index.js'

// Extender el tipo de request para incluir user
declare module 'fastify' {
  interface FastifyRequest {
    user?: UserAuthPayload
  }
}

/**
 * Middleware de autenticación para usuarios finales
 * Verifica el token JWT y adjunta la información del usuario al request
 */
export async function userAuthMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    // Obtener token del header Authorization
    const authHeader = request.headers.authorization
    
    if (!authHeader) {
      return reply.status(401).send(errorResponse(
        'Token de acceso requerido',
        'No autorizado'
      ))
    }

    // Verificar formato del header (Bearer token)
    const tokenParts = authHeader.split(' ')
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
      return reply.status(401).send(errorResponse(
        'Formato de token inválido. Use: Bearer <token>',
        'No autorizado'
      ))
    }

    const token = tokenParts[1]

    // Verificar y decodificar el token
    const decoded = verifyUserAccessToken(token)
    
    if (!decoded) {
      return reply.status(401).send(errorResponse(
        'Token inválido o expirado',
        'No autorizado'
      ))
    }

    // Verificar que sea un token de usuario
    if (decoded.type !== 'user') {
      return reply.status(403).send(errorResponse(
        'Token de tipo incorrecto',
        'Acceso denegado'
      ))
    }

    // Verificar que el usuario existe y está activo
    const user = await usersService.getUserById(decoded.userId)
    
    if (!user) {
      return reply.status(401).send(errorResponse(
        'Usuario no encontrado',
        'No autorizado'
      ))
    }

    // Verificar que el teléfono esté verificado
    if (!user.phoneVerified) {
      return reply.status(403).send(errorResponse(
        'Teléfono no verificado. Complete la verificación primero.',
        'Acceso denegado'
      ))
    }

    // Adjuntar información del usuario al request
    request.user = {
      userId: user.id,
      phone: user.phone,
      type: 'user'
    }

    // Continuar con el siguiente middleware/handler
    return

  } catch (error: any) {
    console.error('Error en userAuthMiddleware:', error)
    
    // Errores específicos de JWT
    if (error.name === 'JsonWebTokenError') {
      return reply.status(401).send(errorResponse(
        'Token malformado',
        'No autorizado'
      ))
    }
    
    if (error.name === 'TokenExpiredError') {
      return reply.status(401).send(errorResponse(
        'Token expirado',
        'No autorizado'
      ))
    }
    
    if (error.name === 'NotBeforeError') {
      return reply.status(401).send(errorResponse(
        'Token no válido aún',
        'No autorizado'
      ))
    }

    // Error genérico
    return reply.status(500).send(errorResponse(
      'Error interno del servidor',
      'Error de autenticación'
    ))
  }
}

/**
 * Middleware opcional para usuarios - no falla si no hay token
 * Útil para rutas que pueden funcionar con o sin autenticación
 */
export async function optionalUserAuthMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authHeader = request.headers.authorization
    
    // Si no hay header, continuar sin autenticación
    if (!authHeader) {
      return
    }

    // Si hay header, intentar autenticar
    await userAuthMiddleware(request, reply)
    
  } catch (error) {
    // En caso de error, simplemente continuar sin autenticación
    console.warn('Error en optionalUserAuthMiddleware (ignorado):', error)
    return
  }
}
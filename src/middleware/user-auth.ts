import { FastifyRequest, FastifyReply } from 'fastify'
import { verifyUserAccessToken } from '../utils/jwt.js'
import { errorResponse } from '../utils/response.js'
import { UserService } from '../services/user.service.js'

export const userAuthMiddleware = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const authHeader = request.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send(
        errorResponse('Token de autenticación requerido', 'No autorizado')
      )
    }

    const token = authHeader.substring(7)
    const payload = verifyUserAccessToken(token)
    
    // Verificar que el usuario existe y está activo
    const user = await UserService.getUserById(payload.userId)
    
    if (!user) {
      return reply.status(401).send(
        errorResponse('Usuario no encontrado', 'No autorizado')
      )
    }
    
    if (!user.phoneVerified) {
      return reply.status(401).send(
        errorResponse('Usuario no verificado', 'No autorizado')
      )
    }
    
    // Agregar info del usuario al request
    ;(request as any).user = payload
    
  } catch (error) {
    let message = 'Token inválido'
    
    if (error instanceof Error) {
      if (error.name === 'TokenExpiredError') {
        message = 'Token expirado'
      } else if (error.name === 'JsonWebTokenError') {
        message = 'Token malformado'
      } else if (error.message.includes('Token inválido para usuario')) {
        message = 'Acceso no autorizado para este tipo de usuario'
      }
    }
    
    return reply.status(401).send(
      errorResponse(message, 'No autorizado')
    )
  }
}
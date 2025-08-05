import { FastifyRequest, FastifyReply } from 'fastify'
import { verifyAdminAccessToken } from '../utils/jwt'
import { errorResponse } from '../utils/response'
import { AuthService } from '../services/auth.service'

export const authMiddleware = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const authHeader = request.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send(
        errorResponse('Token de autenticación requerido', 'No autorizado')
      )
    }

    const token = authHeader.substring(7)
    const payload = verifyAdminAccessToken(token)
    
    // Verificar que el admin existe en la base de datos
    const admin = await AuthService.getAdminById(payload.adminId)
    
    if (!admin) {
      return reply.status(401).send(
        errorResponse('Administrador no encontrado', 'No autorizado')
      )
    }
    
    // Agregar info del admin al request
    ;(request as any).admin = payload
    ;(request as any).user = {
      id: payload.adminId,
      email: payload.email,
      role: payload.role
    }
    
  } catch (error) {
    let message = 'Token inválido'
    
    if (error instanceof Error) {
      if (error.name === 'TokenExpiredError') {
        message = 'Token expirado'
      } else if (error.name === 'JsonWebTokenError') {
        message = 'Token malformado'
      } else if (error.message.includes('Token inválido para administrador')) {
        message = 'Acceso no autorizado para este tipo de usuario'
      }
    }
    
    return reply.status(401).send(
      errorResponse(message, 'No autorizado')
    )
  }
}
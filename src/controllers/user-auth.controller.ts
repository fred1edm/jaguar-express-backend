import { FastifyRequest, FastifyReply } from 'fastify'
import { UserService } from '../services/user.service'
import { successResponse, errorResponse } from '../utils/response'
import { verifyUserRefreshToken } from '../utils/jwt'

export class UserAuthController {
  
  // Login de usuario (para usuarios ya verificados)
  static async login(
    request: FastifyRequest<{ Body: { phone: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { phone } = request.body
      const result = await UserService.loginUser(phone)
      
      return reply.send(
        successResponse(result, 'Login exitoso')
      )
    } catch (error) {
      return reply.status(400).send(
        errorResponse(error instanceof Error ? error.message : 'Error en login')
      )
    }
  }

  // Obtener perfil del usuario
  static async getProfile(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const { userId } = (request as any).user
      
      const user = await UserService.getUserById(userId)
      
      return reply.send(
        successResponse(user, 'Perfil obtenido exitosamente')
      )
    } catch (error) {
      return reply.status(404).send(
        errorResponse(error instanceof Error ? error.message : 'Error al obtener perfil')
      )
    }
  }

  // Refresh token para usuario
  static async refreshToken(
    request: FastifyRequest<{ Body: { refreshToken: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { refreshToken } = request.body
      
      // Verificar refresh token
      const payload = verifyUserRefreshToken(refreshToken)
      
      // Generar nuevos tokens
      const tokens = await UserService.refreshUserToken(payload.userId, payload.phone)
      
      return reply.send(
        successResponse(tokens, 'Tokens renovados exitosamente')
      )
    } catch (error) {
      return reply.status(401).send(
        errorResponse('Refresh token inválido')
      )
    }
  }

  // Logout de usuario
  static async logout(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    // En un sistema JWT stateless, el logout es del lado del cliente
    return reply.send(
      successResponse(null, 'Logout exitoso')
    )
  }
}
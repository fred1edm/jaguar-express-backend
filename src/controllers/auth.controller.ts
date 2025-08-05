import { FastifyRequest, FastifyReply } from 'fastify'
import { AuthService } from '../services/auth.service'
import { successResponse, errorResponse } from '../utils/response'
import { LoginInput, RegisterAdminInput, RefreshTokenInput } from '../schemas/auth'
import { verifyRefreshToken } from '../utils/jwt'

export class AuthController {
  
  // POST /api/admin/auth/login
  static async login(
    request: FastifyRequest<{ Body: LoginInput }>,
    reply: FastifyReply
  ) {
    try {
      const result = await AuthService.loginAdmin(request.body)
      
      return reply.send(
        successResponse(result, 'Login exitoso')
      )
    } catch (error) {
      return reply.status(400).send(
        errorResponse(error instanceof Error ? error.message : 'Error en login')
      )
    }
  }

  // POST /api/admin/auth/register
  static async register(
    request: FastifyRequest<{ Body: RegisterAdminInput }>,
    reply: FastifyReply
  ) {
    try {
      const result = await AuthService.registerAdmin(request.body)
      
      return reply.status(201).send(
        successResponse(result, 'Administrador registrado exitosamente')
      )
    } catch (error) {
      return reply.status(400).send(
        errorResponse(error instanceof Error ? error.message : 'Error en registro')
      )
    }
  }

  // GET /api/admin/auth/me
  static async getProfile(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const { adminId } = (request as any).admin
      
      const admin = await AuthService.getAdminById(adminId)
      
      return reply.send(
        successResponse(admin, 'Perfil obtenido exitosamente')
      )
    } catch (error) {
      return reply.status(404).send(
        errorResponse(error instanceof Error ? error.message : 'Error al obtener perfil')
      )
    }
  }

  // POST /api/admin/auth/refresh
  static async refreshToken(
    request: FastifyRequest<{ Body: RefreshTokenInput }>,
    reply: FastifyReply
  ) {
    try {
      const { refreshToken } = request.body
      
      // Verificar refresh token
      const payload = verifyRefreshToken(refreshToken)
      
      // Generar nuevos tokens
      const tokens = await AuthService.refreshToken(payload.adminId, payload.email)
      
      return reply.send(
        successResponse(tokens, 'Tokens renovados exitosamente')
      )
    } catch (error) {
      return reply.status(401).send(
        errorResponse('Refresh token inválido')
      )
    }
  }

  // POST /api/admin/auth/logout
  static async logout(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    // En un sistema JWT stateless, el logout es del lado del cliente
    // Aquí podríamos agregar el token a una blacklist si fuera necesario
    
    return reply.send(
      successResponse(null, 'Logout exitoso')
    )
  }
}
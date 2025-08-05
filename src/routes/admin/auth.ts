import { FastifyInstance } from 'fastify'
import { AuthController } from '../../controllers/auth.controller'
import { authMiddleware } from '../../middleware/auth'
import { loginSchema, registerAdminSchema, refreshTokenSchema } from '../../schemas/auth'
import { validateBody } from '../../utils/validation'

export default async function authRoutes(fastify: FastifyInstance) {
  
  // Login - POST /api/admin/auth/login
  fastify.post('/login', {
    preHandler: [validateBody(loginSchema)],
  }, AuthController.login)

  // Registro - POST /api/admin/auth/register
  fastify.post('/register', {
    preHandler: [validateBody(registerAdminSchema)],
  }, AuthController.register)

  // Refresh Token - POST /api/admin/auth/refresh
  fastify.post('/refresh', {
    preHandler: [validateBody(refreshTokenSchema)],
  }, AuthController.refreshToken)

  // Rutas protegidas (requieren autenticación)
  
  // Perfil - GET /api/admin/auth/me
  fastify.get('/me', {
    preHandler: [authMiddleware],
  }, AuthController.getProfile)

  // Logout - POST /api/admin/auth/logout
  fastify.post('/logout', {
    preHandler: [authMiddleware],
  }, AuthController.logout)
}
import { FastifyInstance } from 'fastify'
import { UserController } from '../controllers/user.controller'
import { UserAuthController } from '../controllers/user-auth.controller'
import { userAuthMiddleware } from '../middleware/user-auth'

export default async function userRoutes(fastify: FastifyInstance) {
  // Rutas de registro y verificación (públicas)
  fastify.post('/register', UserController.register)
  fastify.post('/verify', UserController.verifyPhone)
  
  // Rutas de autenticación
  fastify.post('/login', UserAuthController.login)
  fastify.post('/refresh', UserAuthController.refreshToken)

  // Rutas protegidas (requieren autenticación de usuario)
  fastify.register(async function (fastify) {
    fastify.addHook('preHandler', userAuthMiddleware)
    
    fastify.get('/profile', UserAuthController.getProfile)
    fastify.post('/logout', UserAuthController.logout)
    fastify.put('/:userId', UserController.updateUser)
    fastify.get('/:userId', UserController.getUser)
  })
}
import { FastifyInstance } from 'fastify'
import authRoutes from './auth'
import businessRoutes from './business'
import productRoutes from './products'
import orderRoutes from './orders'
import customOrderRoutes from './custom-orders'
import transportRequestRoutes from './transport-requests'
import uploadRoutes from './upload'  // ← NUEVO
import usuariosRoutes from './usuarios'  // ← NUEVO
import usersRoutes from './users'  // ← NUEVO
import auditRoutes from './audit'  // ← NUEVO

export default async function adminRoutes(fastify: FastifyInstance) {
  // Rutas de autenticación (sin middleware)
  fastify.register(authRoutes, { prefix: '/auth' })
  
  // Rutas protegidas (con middleware)
  fastify.register(businessRoutes, { prefix: '/business' })
  fastify.register(productRoutes, { prefix: '/products' })
  fastify.register(orderRoutes, { prefix: '/orders' })
  fastify.register(customOrderRoutes, { prefix: '/custom-orders' })
  fastify.register(transportRequestRoutes, { prefix: '/transport-requests' })
  fastify.register(uploadRoutes, { prefix: '/upload' })  // ← NUEVO
  fastify.register(usuariosRoutes, { prefix: '/usuarios' })  // ← NUEVO
  fastify.register(usersRoutes, { prefix: '/users' })  // ← NUEVO
  fastify.register(auditRoutes, { prefix: '/audit' })  // ← NUEVO
}
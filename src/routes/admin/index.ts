import { FastifyInstance } from 'fastify'
import authRoutes from './auth.js'
import businessRoutes from './business.js'
import productRoutes from './products.js'
import orderRoutes from './orders.js'
import customOrderRoutes from './custom-orders.js'
import transportRequestRoutes from './transport-requests.js'
import uploadRoutes from './upload.js'  // ← NUEVO
import usuariosRoutes from './usuarios.js'  // ← NUEVO
import usersRoutes from './users.js'  // ← NUEVO
import auditRoutes from './audit.js'  // ← NUEVO
import configuracionRoutes from './configuracion.js'  // ← NUEVO

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
  fastify.register(configuracionRoutes, { prefix: '/configuracion' })  // ← NUEVO
}
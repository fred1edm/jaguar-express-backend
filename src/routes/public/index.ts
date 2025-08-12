import { FastifyInstance } from 'fastify'
import businessRoutes from './business.js'
import productRoutes from './products.js'
import orderRoutes from './orders.js'  // ← NUEVO

export default async function publicRoutes(fastify: FastifyInstance) {
  fastify.register(businessRoutes, { prefix: '/business' })
  fastify.register(productRoutes, { prefix: '/products' })
  fastify.register(orderRoutes, { prefix: '/' })  // ← NUEVO (sin prefix para que sea /api/orders)
}
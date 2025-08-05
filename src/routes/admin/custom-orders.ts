import { FastifyInstance } from 'fastify'
import { OrderController } from '../../controllers/order.controller'
import { authMiddleware } from '../../middleware/auth'
import { orderQuerySchema } from '../../schemas/order'
import { validateQuery } from '../../utils/validation'

export default async function customOrderRoutes(fastify: FastifyInstance) {
  
  // Todas las rutas de admin requieren autenticación
  fastify.addHook('preHandler', authMiddleware)

  // GET /api/admin/custom-orders - Obtener encargos personalizados
  fastify.get('/', {
    preHandler: [validateQuery(orderQuerySchema)],
  }, OrderController.getCustomOrders)
}
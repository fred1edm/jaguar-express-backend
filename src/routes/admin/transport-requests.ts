import { FastifyInstance } from 'fastify'
import { OrderController } from '../../controllers/order.controller'
import { authMiddleware } from '../../middleware/auth'
import { orderQuerySchema } from '../../schemas/order'
import { validateQuery } from '../../utils/validation'

export default async function transportRequestRoutes(fastify: FastifyInstance) {
  
  // Todas las rutas de admin requieren autenticación
  fastify.addHook('preHandler', authMiddleware)

  // GET /api/admin/transport-requests - Obtener solicitudes de transporte
  fastify.get('/', {
    preHandler: [validateQuery(orderQuerySchema)],
  }, OrderController.getTransportRequests)
}
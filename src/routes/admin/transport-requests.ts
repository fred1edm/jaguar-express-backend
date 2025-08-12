import { FastifyInstance } from 'fastify'
import { OrderController } from '../../controllers/order.controller.js'
import { authMiddleware } from '../../middleware/auth.js'
import { orderQuerySchema } from '../../schemas/order.js'
import { validateQuery } from '../../utils/validation.js'

export default async function transportRequestRoutes(fastify: FastifyInstance) {
  
  // Todas las rutas de admin requieren autenticación
  fastify.addHook('preHandler', authMiddleware)

  // GET /api/admin/transport-requests - Obtener solicitudes de transporte
  fastify.get('/', {
    preHandler: [validateQuery(orderQuerySchema)],
  }, OrderController.getTransportRequests)
}
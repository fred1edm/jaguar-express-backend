import { FastifyInstance } from 'fastify'
import { OrderController } from '../../controllers/order.controller'
import { authMiddleware } from '../../middleware/auth'
import { 
  updateOrderStatusSchema, 
  orderQuerySchema 
} from '../../schemas/order'
import { validateBody, validateQuery } from '../../utils/validation'

export default async function orderRoutes(fastify: FastifyInstance) {
  
  // Todas las rutas de admin requieren autenticación
  fastify.addHook('preHandler', authMiddleware)

  // GET /api/admin/orders - Obtener todos los pedidos
  fastify.get('/', {
    preHandler: [validateQuery(orderQuerySchema)],
  }, OrderController.getAllOrders)

  // GET /api/admin/orders/stats - Obtener estadísticas
  fastify.get('/stats', OrderController.getOrderStats)

  // GET /api/admin/orders/:id - Obtener pedido por ID
  fastify.get('/:id', OrderController.getOrderByIdAdmin)

  // PUT /api/admin/orders/:id/status - Actualizar estado del pedido
  fastify.put('/:id/status', {
    preHandler: [validateBody(updateOrderStatusSchema)],
  }, OrderController.updateOrderStatus)
}
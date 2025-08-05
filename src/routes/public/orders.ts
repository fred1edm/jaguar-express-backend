import { FastifyInstance } from 'fastify'
import { OrderController } from '../../controllers/order.controller'
import { 
  createOrderSchema, 
  createCustomOrderSchema,
  createTransportRequestSchema 
} from '../../schemas/order'
import { validateBody } from '../../utils/validation'
import { optionalUserAuthMiddleware } from '../../middleware/users-auth'

export default async function orderRoutes(fastify: FastifyInstance) {
  
  // POST /api/orders - Crear nuevo pedido de delivery
  fastify.post('/', {
    preHandler: [optionalUserAuthMiddleware]
  }, OrderController.createOrder)

  // GET /api/orders/:id - Obtener pedido por ID
  fastify.get('/:id', OrderController.getOrderByIdPublic)

  // GET /api/orders/phone/:phone - Buscar pedidos por teléfono
  fastify.get('/phone/:phone', OrderController.getOrdersByPhone)

  // POST /api/custom-orders - Crear encargo personalizado
  fastify.post('/custom-orders', {
    preHandler: [validateBody(createCustomOrderSchema)],
  }, OrderController.createCustomOrder)

  // POST /api/transport-requests - Crear solicitud de transporte
  fastify.post('/transport-requests', {
    preHandler: [validateBody(createTransportRequestSchema)],
  }, OrderController.createTransportRequest)
}
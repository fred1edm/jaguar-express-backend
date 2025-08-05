import { FastifyRequest, FastifyReply } from 'fastify'
import { OrderService } from '../services/order.service'
import { successResponse, errorResponse } from '../utils/response'
import { 
  CreateOrderInput, 
  UpdateOrderStatusInput, 
  OrderQueryInput,
  CreateCustomOrderInput,
  CreateTransportRequestInput 
} from '../schemas/order'

export class OrderController {
  
  // POST /api/orders - Crear nuevo pedido (Público)
  static async createOrder(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      let result
      const body = request.body as CreateOrderInput
      
      // Obtener userId si el usuario está autenticado
      const userId = request.user?.userId || null
      
      switch (body.type) {
        case 'DELIVERY':
          result = await OrderService.createDeliveryOrder(body, userId)
          break
        case 'ENCARGO':
          // Por ahora redirigir a custom orders
          throw new Error('Use el endpoint /api/custom-orders para encargos')
        case 'TRANSPORTE':
          // Por ahora redirigir a transport requests
          throw new Error('Use el endpoint /api/transport-requests para transporte')
        default:
          throw new Error('Tipo de pedido no válido')
      }
      
      return reply.status(201).send(
        successResponse(result, 'Pedido creado exitosamente')
      )
    } catch (error) {
      return reply.status(400).send(
        errorResponse(error instanceof Error ? error.message : 'Error al crear pedido')
      )
    }
  }

  // GET /api/admin/orders - Obtener todos los pedidos (Admin)
  static async getAllOrders(
    request: FastifyRequest<{ Querystring: OrderQueryInput }>,
    reply: FastifyReply
  ) {
    try {
      const result = await OrderService.getAllOrders(request.query)
      
      return reply.send(
        successResponse(result, 'Pedidos obtenidos exitosamente')
      )
    } catch (error) {
      return reply.status(500).send(
        errorResponse(error instanceof Error ? error.message : 'Error al obtener pedidos')
      )
    }
  }

  // GET /api/admin/orders/:id - Obtener pedido por ID (Admin)
  static async getOrderByIdAdmin(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const order = await OrderService.getOrderById(request.params.id, true)
      
      return reply.send(
        successResponse(order, 'Pedido obtenido exitosamente')
      )
    } catch (error) {
      return reply.status(404).send(
        errorResponse(error instanceof Error ? error.message : 'Pedido no encontrado')
      )
    }
  }

  // GET /api/orders/:id - Obtener pedido por ID (Público)
  static async getOrderByIdPublic(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const order = await OrderService.getOrderById(request.params.id, false)
      
      return reply.send(
        successResponse(order, 'Pedido obtenido exitosamente')
      )
    } catch (error) {
      return reply.status(404).send(
        errorResponse(error instanceof Error ? error.message : 'Pedido no encontrado')
      )
    }
  }

  // PUT /api/admin/orders/:id/status - Actualizar estado del pedido
  static async updateOrderStatus(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateOrderStatusInput }>,
    reply: FastifyReply
  ) {
    try {
      const order = await OrderService.updateOrderStatus(request.params.id, request.body)
      
      return reply.send(
        successResponse(order, 'Estado del pedido actualizado exitosamente')
      )
    } catch (error) {
      return reply.status(400).send(
        errorResponse(error instanceof Error ? error.message : 'Error al actualizar estado')
      )
    }
  }

  // GET /api/admin/orders/stats - Obtener estadísticas
  static async getOrderStats(
    request: FastifyRequest<{ Querystring: { businessId?: string } }>,
    reply: FastifyReply
  ) {
    try {
      const stats = await OrderService.getOrderStats(request.query.businessId)
      
      return reply.send(
        successResponse(stats, 'Estadísticas obtenidas exitosamente')
      )
    } catch (error) {
      return reply.status(500).send(
        errorResponse(error instanceof Error ? error.message : 'Error al obtener estadísticas')
      )
    }
  }

  // GET /api/orders/phone/:phone - Buscar pedidos por teléfono
  static async getOrdersByPhone(
    request: FastifyRequest<{ Params: { phone: string } }>,
    reply: FastifyReply
  ) {
    try {
      const orders = await OrderService.getOrdersByPhone(request.params.phone)
      
      return reply.send(
        successResponse(orders, 'Pedidos obtenidos exitosamente')
      )
    } catch (error) {
      return reply.status(500).send(
        errorResponse(error instanceof Error ? error.message : 'Error al obtener pedidos')
      )
    }
  }

  // POST /api/custom-orders - Crear encargo personalizado
  static async createCustomOrder(
    request: FastifyRequest<{ Body: CreateCustomOrderInput }>,
    reply: FastifyReply
  ) {
    try {
      const result = await OrderService.createCustomOrder(request.body)
      
      return reply.status(201).send(
        successResponse(result, 'Encargo creado exitosamente')
      )
    } catch (error) {
      return reply.status(400).send(
        errorResponse(error instanceof Error ? error.message : 'Error al crear encargo')
      )
    }
  }

  // GET /api/admin/custom-orders - Obtener encargos personalizados
  static async getCustomOrders(
    request: FastifyRequest<{ Querystring: OrderQueryInput }>,
    reply: FastifyReply
  ) {
    try {
      const result = await OrderService.getCustomOrders(request.query)
      
      return reply.send(
        successResponse(result, 'Encargos obtenidos exitosamente')
      )
    } catch (error) {
      return reply.status(500).send(
        errorResponse(error instanceof Error ? error.message : 'Error al obtener encargos')
      )
    }
  }

  // POST /api/transport-requests - Crear solicitud de transporte
  static async createTransportRequest(
    request: FastifyRequest<{ Body: CreateTransportRequestInput }>,
    reply: FastifyReply
  ) {
    try {
      const result = await OrderService.createTransportRequest(request.body)
      
      return reply.status(201).send(
        successResponse(result, 'Solicitud de transporte creada exitosamente')
      )
    } catch (error) {
      return reply.status(400).send(
        errorResponse(error instanceof Error ? error.message : 'Error al crear solicitud')
      )
    }
  }

  // GET /api/admin/transport-requests - Obtener solicitudes de transporte
  static async getTransportRequests(
    request: FastifyRequest<{ Querystring: OrderQueryInput }>,
    reply: FastifyReply
  ) {
    try {
      const result = await OrderService.getTransportRequests(request.query)
      
      return reply.send(
        successResponse(result, 'Solicitudes obtenidas exitosamente')
      )
    } catch (error) {
      return reply.status(500).send(
        errorResponse(error instanceof Error ? error.message : 'Error al obtener solicitudes')
      )
    }
  }
}
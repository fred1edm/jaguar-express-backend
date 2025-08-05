import { z } from 'zod'

// Schema para item de pedido
export const orderItemSchema = z.object({
  productId: z.string().min(1, 'ID del producto es requerido'),
  quantity: z.number().min(1, 'La cantidad debe ser al menos 1').max(50, 'Cantidad máxima excedida'),
  notes: z.string().max(200, 'Las notas son muy largas').optional()
})

// Schema para información del cliente
export const customerInfoSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100, 'Nombre muy largo'),
  phone: z.string().min(9, 'El teléfono debe tener al menos 9 dígitos').max(15, 'Teléfono muy largo'),
  address: z.string().min(10, 'La dirección debe ser más específica').max(300, 'Dirección muy larga'),
  coordinates: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180)
  }).optional()
})

// Schema para crear pedido
export const createOrderSchema = z.object({
  type: z.enum(['DELIVERY', 'ENCARGO', 'TRANSPORTE']).default('DELIVERY'),
  businessId: z.string().min(1, 'ID del negocio es requerido').optional(),
  customerInfo: customerInfoSchema,
  items: z.array(orderItemSchema).min(1, 'Debe incluir al menos un producto'),
  paymentMethod: z.enum(['EFECTIVO', 'YAPE', 'PLIN']),
  paymentProof: z.string().url('URL de comprobante inválida').optional(),
  notes: z.string().max(500, 'Las notas son muy largas').optional()
})

// Schema para actualizar estado de pedido
export const updateOrderStatusSchema = z.object({
  status: z.enum(['NUEVO', 'CONFIRMADO', 'PREPARANDO', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO']),
  assignedDriver: z.string().optional(),
  estimatedTime: z.string().optional(),
  adminNotes: z.string().max(500).optional()
})

// Schema para query de pedidos
export const orderQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
  status: z.enum(['NUEVO', 'CONFIRMADO', 'PREPARANDO', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO']).optional(),
  type: z.enum(['DELIVERY', 'ENCARGO', 'TRANSPORTE']).optional(),
  businessId: z.string().optional(),
  customerPhone: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().optional()
})

// Schema para encargo personalizado
export const createCustomOrderSchema = z.object({
  description: z.string().min(10, 'La descripción debe ser más detallada').max(1000, 'Descripción muy larga'),
  category: z.string().min(2, 'La categoría es requerida').max(50, 'Categoría muy larga'),
  urgency: z.enum(['NORMAL', 'URGENTE']).default('NORMAL'),
  customerInfo: customerInfoSchema,
  notes: z.string().max(500, 'Las notas son muy largas').optional()
})

// Schema para solicitud de transporte
export const createTransportRequestSchema = z.object({
  serviceType: z.string().min(2, 'El tipo de servicio es requerido'),
  vehicleType: z.string().min(2, 'El tipo de vehículo es requerido'),
  origin: z.string().min(10, 'La dirección de origen debe ser más específica').max(300, 'Origen muy largo'),
  destination: z.string().min(10, 'La dirección de destino debe ser más específica').max(300, 'Destino muy largo'),
  description: z.string().min(10, 'La descripción debe ser más detallada').max(1000, 'Descripción muy larga'),
  customerInfo: z.object({
    name: z.string().min(2).max(100),
    phone: z.string().min(9).max(15)
  }),
  scheduledDate: z.string().datetime().optional(),
  notes: z.string().max(500).optional()
})

// Tipos TypeScript
export type OrderItemInput = z.infer<typeof orderItemSchema>
export type CustomerInfoInput = z.infer<typeof customerInfoSchema>
export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>
export type OrderQueryInput = z.infer<typeof orderQuerySchema>
export type CreateCustomOrderInput = z.infer<typeof createCustomOrderSchema>
export type CreateTransportRequestInput = z.infer<typeof createTransportRequestSchema>
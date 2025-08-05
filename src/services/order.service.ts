import { PrismaClient, OrderStatus } from '@prisma/client'
import { 
  CreateOrderInput, 
  UpdateOrderStatusInput, 
  OrderQueryInput,
  CreateCustomOrderInput,
  CreateTransportRequestInput 
} from '../schemas/order'

const prisma = new PrismaClient()

export class OrderService {
  
  // Crear nuevo pedido de delivery
  static async createDeliveryOrder(data: CreateOrderInput, userId?: string | null) {
    if (!data.businessId) {
      throw new Error('ID del negocio es requerido para pedidos de delivery')
    }

    // Verificar que el negocio existe y está activo
    const business = await prisma.business.findFirst({
      where: {
        id: data.businessId,
        isActive: true
      }
    })

    if (!business) {
      throw new Error('Negocio no encontrado o no está activo')
    }

    // Verificar que todos los productos existen y están disponibles
    const productIds = data.items.map(item => item.productId)
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        businessId: data.businessId,
        isAvailable: true
      }
    })

    if (products.length !== productIds.length) {
      throw new Error('Algunos productos no están disponibles')
    }

    // Calcular totales
    let subtotal = 0
    const orderItems = data.items.map(item => {
      const product = products.find(p => p.id === item.productId)!
      const itemTotal = product.price * item.quantity
      subtotal += itemTotal
      
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: product.price, // Precio al momento del pedido
        notes: item.notes
      }
    })

    const deliveryFee = business.deliveryFee
    const total = subtotal + deliveryFee

    // Verificar pedido mínimo
    if (subtotal < business.minimumOrder) {
      throw new Error(`El pedido mínimo es S/ ${business.minimumOrder}`)
    }

    // Crear el pedido
    const order = await prisma.order.create({
      data: {
        type: 'DELIVERY',
        businessId: data.businessId,
        userId: userId, // Agregar userId si está disponible
        customerName: data.customerInfo.name,
        customerPhone: data.customerInfo.phone,
        customerAddress: data.customerInfo.address,
        customerNotes: data.notes,
        paymentMethod: data.paymentMethod,
        paymentProof: data.paymentProof,
        subtotal,
        deliveryFee,
        total,
        status: 'NUEVO',
        items: {
          create: orderItems
        }
      },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        }
      }
    })

    return order
  }

  // Obtener todos los pedidos (para admin)
  static async getAllOrders(query: OrderQueryInput) {
    const { page, limit, status, type, businessId, customerPhone, dateFrom, dateTo, search } = query
    const skip = (page - 1) * limit

    // Construir filtros dinámicos
    const where: any = {}
    
    if (status) where.status = status
    if (type) where.type = type
    if (businessId) where.businessId = businessId
    if (customerPhone) where.customerPhone = { contains: customerPhone }
    
    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) where.createdAt.gte = new Date(dateFrom)
      if (dateTo) where.createdAt.lte = new Date(dateTo)
    }
    
    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search } },
        { customerAddress: { contains: search, mode: 'insensitive' } },
        { id: { contains: search } }
      ]
    }

    // Obtener pedidos y total
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          business: {
            select: {
              id: true,
              name: true,
              type: true
            }
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                  category: true
                }
              }
            }
          }
        }
      }),
      prisma.order.count({ where })
    ])

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    }
  }

  // Obtener pedido por ID
  static async getOrderById(id: string, includePrivate = false) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        business: includePrivate ? true : {
          select: {
            id: true,
            name: true,
            phone: true,
            address: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                description: true,
                image: true,
                category: true
              }
            }
          }
        }
      }
    })

    if (!order) {
      throw new Error('Pedido no encontrado')
    }

    return order
  }

  // Actualizar estado del pedido
  static async updateOrderStatus(id: string, data: UpdateOrderStatusInput) {
    const order = await prisma.order.findUnique({
      where: { id }
    })

    if (!order) {
      throw new Error('Pedido no encontrado')
    }

    // Validar transiciones de estado
    const validTransitions: { [key: string]: string[] } = {
      'NUEVO': ['CONFIRMADO', 'CANCELADO'],
      'CONFIRMADO': ['PREPARANDO', 'CANCELADO'],
      'PREPARANDO': ['EN_CAMINO', 'CANCELADO'],
      'EN_CAMINO': ['ENTREGADO', 'CANCELADO'],
      'ENTREGADO': [],
      'CANCELADO': []
    }

    if (!validTransitions[order.status].includes(data.status)) {
      throw new Error(`No se puede cambiar de ${order.status} a ${data.status}`)
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: data.status as OrderStatus,
        assignedDriver: data.assignedDriver,
        estimatedTime: data.estimatedTime,
        updatedAt: new Date()
      },
      include: {
        business: {
          select: {
            id: true,
            name: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        }
      }
    })

    return updatedOrder
  }

  // Obtener estadísticas de pedidos
  static async getOrderStats(businessId?: string) {
    const where = businessId ? { businessId } : {}

    const [
      totalOrders,
      ordersByStatus,
      ordersByPaymentMethod,
      totalRevenue,
      avgOrderValue,
      ordersToday
    ] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.groupBy({
        by: ['status'],
        where,
        _count: { status: true }
      }),
      prisma.order.groupBy({
        by: ['paymentMethod'],
        where,
        _count: { paymentMethod: true }
      }),
      prisma.order.aggregate({
        where: { ...where, status: 'ENTREGADO' },
        _sum: { total: true }
      }),
      prisma.order.aggregate({
        where,
        _avg: { total: true }
      }),
      prisma.order.count({
        where: {
          ...where,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      })
    ])

    return {
      totalOrders,
      ordersByStatus,
      ordersByPaymentMethod,
      totalRevenue: totalRevenue._sum.total || 0,
      averageOrderValue: avgOrderValue._avg.total || 0,
      ordersToday
    }
  }

  // Crear encargo personalizado
  static async createCustomOrder(data: CreateCustomOrderInput) {
    const customOrder = await prisma.customOrder.create({
      data: {
        description: data.description,
        category: data.category,
        urgency: data.urgency,
        customerName: data.customerInfo.name,
        customerPhone: data.customerInfo.phone,
        customerAddress: data.customerInfo.address,
        notes: data.notes,
        status: 'PENDIENTE'
      }
    })

    return customOrder
  }

  // Crear solicitud de transporte
  static async createTransportRequest(data: CreateTransportRequestInput) {
    const transportRequest = await prisma.transportRequest.create({
      data: {
        serviceType: data.serviceType,
        vehicleType: data.vehicleType,
        origin: data.origin,
        destination: data.destination,
        description: data.description,
        customerName: data.customerInfo.name,
        customerPhone: data.customerInfo.phone,
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : null,
        notes: data.notes,
        status: 'COTIZANDO'
      }
    })

    return transportRequest
  }

  // Obtener encargos personalizados
  static async getCustomOrders(query: OrderQueryInput) {
    const { page, limit, search } = query
    const skip = (page - 1) * limit

    const where: any = {}
    
    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search } },
        { category: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [customOrders, total] = await Promise.all([
      prisma.customOrder.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { urgency: 'desc' },
          { createdAt: 'desc' }
        ]
      }),
      prisma.customOrder.count({ where })
    ])

    return {
      customOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    }
  }

  // Obtener solicitudes de transporte
  static async getTransportRequests(query: OrderQueryInput) {
    const { page, limit, search } = query
    const skip = (page - 1) * limit

    const where: any = {}
    
    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search } },
        { origin: { contains: search, mode: 'insensitive' } },
        { destination: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [transportRequests, total] = await Promise.all([
      prisma.transportRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.transportRequest.count({ where })
    ])

    return {
      transportRequests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    }
  }

  // Buscar pedido por teléfono (para clientes)
  static async getOrdersByPhone(phone: string) {
    const orders = await prisma.order.findMany({
      where: { 
        customerPhone: phone 
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        business: {
          select: {
            id: true,
            name: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        }
      }
    })

    return orders
  }
}
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { authMiddleware } from '../../middleware/auth.js'

const prisma = new PrismaClient()

export default async function usersRoutes(fastify: FastifyInstance) {
  // Middleware de autenticación para todas las rutas
  fastify.addHook('preHandler', authMiddleware)

  /**
   * GET /api/admin/users/stats
   * Obtiene estadísticas de usuarios finales
   */
  fastify.get('/stats', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Obtener estadísticas básicas de usuarios
      const totalUsers = await prisma.user.count()
      const verifiedUsers = await prisma.user.count({
        where: { phoneVerified: true }
      })
      const unverifiedUsers = totalUsers - verifiedUsers

      // Usuarios nuevos hoy
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const newUsersToday = await prisma.user.count({
        where: {
          createdAt: {
            gte: today
          }
        }
      })

      // Usuarios nuevos esta semana
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      weekAgo.setHours(0, 0, 0, 0)
      const newUsersThisWeek = await prisma.user.count({
        where: {
          createdAt: {
            gte: weekAgo
          }
        }
      })

      // Usuarios nuevos este mes
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      monthAgo.setHours(0, 0, 0, 0)
      const newUsersThisMonth = await prisma.user.count({
        where: {
          createdAt: {
            gte: monthAgo
          }
        }
      })

      // Top clientes (usuarios con más pedidos y gastos)
      const topCustomers = await prisma.user.findMany({
        select: {
          id: true,
          fullName: true,
          email: true,
          _count: {
            select: {
              orders: true
            }
          },
          orders: {
            select: {
              total: true
            }
          }
        },
        where: {
          phoneVerified: true,
          orders: {
            some: {}
          }
        },
        orderBy: {
          orders: {
            _count: 'desc'
          }
        },
        take: 10
      })

      // Calcular el total gastado por cada cliente
      const topCustomersWithStats = topCustomers.map(customer => ({
        id: customer.id,
        name: customer.fullName,
        email: customer.email || '',
        totalOrders: customer._count.orders,
        totalSpent: customer.orders.reduce((sum, order) => sum + (order.total || 0), 0)
      }))

      const stats = {
        totalUsers,
        activeUsers: verifiedUsers,
        inactiveUsers: unverifiedUsers,
        newUsersToday,
        newUsersThisWeek,
        newUsersThisMonth,
        topCustomers: topCustomersWithStats
      }

      return reply.send({
        success: true,
        data: stats
      })
    } catch (error) {
      console.error('Error al obtener estadísticas de usuarios:', error)
      return reply.status(500).send({
        success: false,
        error: 'Error al obtener estadísticas de usuarios'
      })
    }
  })

  /**
   * GET /api/admin/users
   * Obtiene lista de usuarios finales con filtros y paginación
   */
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        phoneVerified,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = request.query as any

      const skip = (page - 1) * limit
      const where: any = {}

      // Filtro de búsqueda
      if (search) {
        where.OR = [
          { fullName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } }
        ]
      }

      // Filtro de verificación de teléfono
      if (phoneVerified !== undefined) {
        where.phoneVerified = phoneVerified === 'true'
      }

      // Configurar ordenamiento
      const orderBy: any = {}
      if (sortBy === 'totalOrders') {
        orderBy.orders = { _count: sortOrder }
      } else {
        orderBy[sortBy] = sortOrder
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: parseInt(limit),
          orderBy,
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            phoneVerified: true,
            createdAt: true,
            _count: {
              select: {
                orders: true
              }
            },
            orders: {
              select: {
                total: true,
                createdAt: true
              },
              orderBy: {
                createdAt: 'desc'
              },
              take: 1
            }
          }
        }),
        prisma.user.count({ where })
      ])

      // Formatear datos de usuarios
      const formattedUsers = users.map(user => ({
        id: user.id,
        name: user.fullName,
        email: user.email || '',
        phone: user.phone || '',
        isActive: user.phoneVerified,
        totalOrders: user._count.orders,
        totalSpent: user.orders.reduce((sum, order) => sum + (order.total || 0), 0),
        lastOrderDate: user.orders[0]?.createdAt || null,
        createdAt: user.createdAt
      }))

      return reply.send({
        success: true,
        data: formattedUsers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      })
    } catch (error) {
      console.error('Error al obtener usuarios:', error)
      return reply.status(500).send({
        success: false,
        error: 'Error al obtener usuarios'
      })
    }
  })

  /**
   * GET /api/admin/users/:id
   * Obtiene un usuario específico por ID
   */
  fastify.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string }

      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          phoneVerified: true,
          createdAt: true,
          _count: {
            select: {
              orders: true
            }
          },
          orders: {
            select: {
              id: true,
              total: true,
              status: true,
              createdAt: true
            },
            orderBy: {
              createdAt: 'desc'
            },
            take: 10
          }
        }
      })

      if (!user) {
        return reply.status(404).send({
          success: false,
          error: 'Usuario no encontrado'
        })
      }

      const formattedUser = {
        id: user.id,
        name: user.fullName,
        email: user.email || '',
        phone: user.phone || '',
        isActive: user.phoneVerified,
        totalOrders: user._count.orders,
        totalSpent: user.orders.reduce((sum, order) => sum + (order.total || 0), 0),
        lastOrderDate: user.orders[0]?.createdAt || null,
        createdAt: user.createdAt
      }

      return reply.send({
        success: true,
        data: formattedUser
      })
    } catch (error) {
      console.error('Error al obtener usuario:', error)
      return reply.status(500).send({
        success: false,
        error: 'Error al obtener usuario'
      })
    }
  })
}
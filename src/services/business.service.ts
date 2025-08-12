import { PrismaClient, BusinessType } from '@prisma/client'
import { CreateBusinessInput, UpdateBusinessInput, BusinessQueryInput } from '../schemas/business.js'

const prisma = new PrismaClient()

export class BusinessService {
  
  // Crear nuevo negocio
  static async createBusiness(data: CreateBusinessInput) {
    const business = await prisma.business.create({
      data: {
        name: data.name,
        type: data.type as BusinessType,
        description: data.description,
        logo: data.logo,
        address: data.address,
        phone: data.phone,
        zone: data.zone,
        schedule: data.schedule,
        deliveryFee: data.deliveryFee,
        minimumOrder: data.minimumOrder,
        isPromoted: data.isPromoted,
        discount: data.discount,
        isActive: true,
        rating: 0,
        reviewCount: 0,
      }
    })

    return business
  }

  // Obtener todos los negocios (para admin)
  static async getAllBusinesses(query: BusinessQueryInput) {
    const { page, limit, search, type, zone, isActive, isPromoted } = query
    const skip = (page - 1) * limit

    // Construir filtros dinámicos
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { zone: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (type) where.type = type
    if (zone) where.zone = { contains: zone, mode: 'insensitive' }
    if (isActive !== undefined) where.isActive = isActive
    if (isPromoted !== undefined) where.isPromoted = isPromoted

    // Obtener negocios y total
    const [businesses, total] = await Promise.all([
      prisma.business.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { isPromoted: 'desc' },
          { rating: 'desc' },
          { createdAt: 'desc' }
        ],
        include: {
          _count: {
            select: {
              products: true,
              orders: true
            }
          }
        }
      }),
      prisma.business.count({ where })
    ])

    return {
      businesses,
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

  // Obtener negocios activos (para webview público)
  static async getActiveBusinesses(query: BusinessQueryInput) {
    const { page, limit, search, type, zone } = query
    const skip = (page - 1) * limit

    const where: any = { isActive: true }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { zone: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (type) where.type = type
    if (zone) where.zone = { contains: zone, mode: 'insensitive' }

    const [businesses, total] = await Promise.all([
      prisma.business.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { isPromoted: 'desc' },
          { rating: 'desc' },
          { name: 'asc' }
        ],
        select: {
          id: true,
          name: true,
          type: true,
          description: true,
          logo: true,
          address: true,
          zone: true,
          deliveryFee: true,
          minimumOrder: true,
          rating: true,
          reviewCount: true,
          isPromoted: true,
          discount: true,
          schedule: true
        }
      }),
      prisma.business.count({ where })
    ])

    // Determinar si cada negocio está abierto ahora
const businessesWithStatus = businesses.map(business => {
  const now = new Date()
  const dayNames = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']
  const currentDay = dayNames[now.getDay()]
  const currentTime = now.toTimeString().slice(0, 5) // HH:MM
  
  const schedule = business.schedule as any
  const todaySchedule = schedule[currentDay]
  
  let isOpen = false
  if (todaySchedule && todaySchedule.isOpen) {
    const openTime = todaySchedule.open
    const closeTime = todaySchedule.close
    isOpen = currentTime >= openTime && currentTime <= closeTime
  }

  return {
    ...business,
    isOpen
  }
})

    return {
      businesses: businessesWithStatus,
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

  // Obtener negocio por ID
  static async getBusinessById(id: string, includePrivate = false) {
    const business = await prisma.business.findUnique({
      where: { id },
      include: {
        products: includePrivate ? true : {
          where: { isAvailable: true },
          orderBy: { isPopular: 'desc' }
        },
        _count: {
          select: {
            products: true,
            orders: true
          }
        }
      }
    })

    if (!business) {
      throw new Error('Negocio no encontrado')
    }

    // Si es para público, verificar que esté activo
    if (!includePrivate && !business.isActive) {
      throw new Error('Negocio no disponible')
    }

    return business
  }

  // Actualizar negocio
  static async updateBusiness(id: string, data: UpdateBusinessInput) {
    const business = await prisma.business.findUnique({
      where: { id }
    })

    if (!business) {
      throw new Error('Negocio no encontrado')
    }

    const updatedBusiness = await prisma.business.update({
      where: { id },
      data: {
        ...data,
        type: data.type as BusinessType | undefined,
        updatedAt: new Date()
      }
    })

    return updatedBusiness
  }

  // Eliminar negocio
  static async deleteBusiness(id: string) {
    const business = await prisma.business.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
            orders: true
          }
        }
      }
    })

    if (!business) {
      throw new Error('Negocio no encontrado')
    }

    // Verificar si tiene pedidos
    if (business._count.orders > 0) {
      throw new Error('No se puede eliminar un negocio que tiene pedidos')
    }

    await prisma.business.delete({
      where: { id }
    })

    return { message: 'Negocio eliminado exitosamente' }
  }

  // Cambiar estado de negocio
  static async toggleBusinessStatus(id: string) {
    const business = await prisma.business.findUnique({
      where: { id }
    })

    if (!business) {
      throw new Error('Negocio no encontrado')
    }

    const updatedBusiness = await prisma.business.update({
      where: { id },
      data: {
        isActive: !business.isActive,
        updatedAt: new Date()
      }
    })

    return updatedBusiness
  }

  // Obtener estadísticas de negocios
  static async getBusinessStats() {
    const [
      totalBusinesses,
      activeBusinesses,
      businessesByType,
      topRatedBusinesses
    ] = await Promise.all([
      prisma.business.count(),
      prisma.business.count({ where: { isActive: true } }),
      prisma.business.groupBy({
        by: ['type'],
        _count: { type: true }
      }),
      prisma.business.findMany({
        where: { isActive: true },
        orderBy: { rating: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          rating: true,
          reviewCount: true
        }
      })
    ])

    return {
      totalBusinesses,
      activeBusinesses,
      inactiveBusinesses: totalBusinesses - activeBusinesses,
      businessesByType,
      topRatedBusinesses
    }
  }
}
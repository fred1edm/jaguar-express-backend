import { PrismaClient } from '@prisma/client'
import { CreateProductInput, UpdateProductInput, ProductQueryInput, MenuQueryInput } from '../schemas/product.js'

const prisma = new PrismaClient()

export class ProductService {
  
  // Crear nuevo producto
  static async createProduct(data: CreateProductInput) {
    // Verificar que el negocio existe
    const business = await prisma.business.findUnique({
      where: { id: data.businessId }
    })

    if (!business) {
      throw new Error('Negocio no encontrado')
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        image: data.image,
        category: data.category,
        businessId: data.businessId,
        isPopular: data.isPopular,
        isAvailable: data.isAvailable,
        preparationTime: data.preparationTime,
        ingredients: data.ingredients,
        allergens: data.allergens,
        discount: data.discount,
      },
      include: {
        business: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return product
  }

  // Obtener todos los productos (para admin)
  static async getAllProducts(query: ProductQueryInput) {
    const { page, limit, search, category, businessId, isAvailable, isPopular, minPrice, maxPrice } = query
    const skip = (page - 1) * limit

    // Construir filtros dinámicos
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (category) where.category = { contains: category, mode: 'insensitive' }
    if (businessId) where.businessId = businessId
    if (isAvailable !== undefined) where.isAvailable = isAvailable
    if (isPopular !== undefined) where.isPopular = isPopular
    
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {}
      if (minPrice !== undefined) where.price.gte = minPrice
      if (maxPrice !== undefined) where.price.lte = maxPrice
    }

    // Obtener productos y total
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { isPopular: 'desc' },
          { isAvailable: 'desc' },
          { name: 'asc' }
        ],
        include: {
          business: {
            select: {
              id: true,
              name: true,
              type: true
            }
          }
        }
      }),
      prisma.product.count({ where })
    ])

    return {
      products,
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

  // Obtener menú de un negocio específico (para webview)
  static async getBusinessMenu(query: MenuQueryInput) {
    const { businessId, category, includeUnavailable } = query

    // Verificar que el negocio existe y está activo
    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        description: true,
        image: true,
        address: true,
        phone: true,
        zone: true,
        deliveryFee: true,
        minimumOrder: true,
        rating: true,
        reviewCount: true,
        schedule: true
      }
    })

    if (!business) {
      throw new Error('Negocio no encontrado o no está activo')
    }

    // Construir filtros para productos
    const where: any = { businessId }
    
    if (!includeUnavailable) {
      where.isAvailable = true
    }
    
    if (category) {
      where.category = { contains: category, mode: 'insensitive' }
    }

    // Obtener productos
    const products = await prisma.product.findMany({
      where,
      orderBy: [
        { isPopular: 'desc' },
        { category: 'asc' },
        { name: 'asc' }
      ]
    })

    // Agrupar productos por categoría
    const productsByCategory: { [key: string]: any[] } = {}
    const categories: string[] = []

    products.forEach(product => {
      if (!productsByCategory[product.category]) {
        productsByCategory[product.category] = []
        categories.push(product.category)
      }
      productsByCategory[product.category].push(product)
    })

    // Determinar si el negocio está abierto ahora
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
      business: {
        ...business,
        isOpen
      },
      categories,
      productsByCategory,
      totalProducts: products.length
    }
  }

  // Obtener producto por ID
  static async getProductById(id: string, includePrivate = false) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            type: true,
            isActive: true
          }
        }
      }
    })

    if (!product) {
      throw new Error('Producto no encontrado')
    }

    // Si es para público, verificar que esté disponible y el negocio activo
    if (!includePrivate) {
      if (!product.isAvailable || !product.business.isActive) {
        throw new Error('Producto no disponible')
      }
    }

    return product
  }

  // Actualizar producto
  static async updateProduct(id: string, data: UpdateProductInput) {
    const product = await prisma.product.findUnique({
      where: { id }
    })

    if (!product) {
      throw new Error('Producto no encontrado')
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      },
      include: {
        business: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return updatedProduct
  }

  // Eliminar producto
  static async deleteProduct(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            orderItems: true
          }
        }
      }
    })

    if (!product) {
      throw new Error('Producto no encontrado')
    }

    // Verificar si tiene pedidos
    if (product._count.orderItems > 0) {
      throw new Error('No se puede eliminar un producto que tiene pedidos')
    }

    await prisma.product.delete({
      where: { id }
    })

    return { message: 'Producto eliminado exitosamente' }
  }

  // Cambiar disponibilidad de producto
  static async toggleProductAvailability(id: string) {
    const product = await prisma.product.findUnique({
      where: { id }
    })

    if (!product) {
      throw new Error('Producto no encontrado')
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        isAvailable: !product.isAvailable,
        updatedAt: new Date()
      }
    })

    return updatedProduct
  }

  // Obtener categorías de productos
  static async getProductCategories(businessId?: string) {
    const where = businessId ? { businessId } : {}

    const categories = await prisma.product.groupBy({
      by: ['category'],
      where,
      _count: {
        category: true
      },
      orderBy: {
        _count: {
          category: 'desc'
        }
      }
    })

    return categories.map(cat => ({
      name: cat.category,
      count: cat._count.category
    }))
  }

  // Obtener estadísticas de productos
  static async getProductStats(businessId?: string) {
    const where = businessId ? { businessId } : {}

    const [
      totalProducts,
      availableProducts,
      popularProducts,
      productsByCategory,
      avgPrice
    ] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.count({ where: { ...where, isAvailable: true } }),
      prisma.product.count({ where: { ...where, isPopular: true } }),
      prisma.product.groupBy({
        by: ['category'],
        where,
        _count: { category: true }
      }),
      prisma.product.aggregate({
        where,
        _avg: { price: true }
      })
    ])

    return {
      totalProducts,
      availableProducts,
      unavailableProducts: totalProducts - availableProducts,
      popularProducts,
      productsByCategory,
      averagePrice: avgPrice._avg.price || 0
    }
  }

  // Productos populares (para webview)
  static async getPopularProducts(limit = 10) {
    const products = await prisma.product.findMany({
      where: {
        isAvailable: true,
        isPopular: true,
        business: {
          isActive: true
        }
      },
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            deliveryFee: true,
            zone: true
          }
        }
      }
    })

    return products
  }
}
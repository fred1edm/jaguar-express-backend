import { FastifyRequest, FastifyReply } from 'fastify'
import { ProductService } from '../services/product.service'
import { successResponse, errorResponse } from '../utils/response'
import { CreateProductInput, UpdateProductInput, ProductQueryInput, MenuQueryInput } from '../schemas/product'

export class ProductController {
  
  // GET /api/admin/products - Obtener todos los productos (Admin)
  static async getAllProducts(
    request: FastifyRequest<{ Querystring: ProductQueryInput }>,
    reply: FastifyReply
  ) {
    try {
      const result = await ProductService.getAllProducts(request.query)
      
      return reply.send(
        successResponse(result, 'Productos obtenidos exitosamente')
      )
    } catch (error) {
      return reply.status(500).send(
        errorResponse(error instanceof Error ? error.message : 'Error al obtener productos')
      )
    }
  }

  // GET /api/business/:businessId/menu - Obtener menú de negocio (Público)
  static async getBusinessMenu(
    request: FastifyRequest<{ Params: { businessId: string }; Querystring: Omit<MenuQueryInput, 'businessId'> }>,
    reply: FastifyReply
  ) {
    try {
      const query = {
        businessId: request.params.businessId,
        ...request.query
      }
      
      const result = await ProductService.getBusinessMenu(query)
      
      return reply.send(
        successResponse(result, 'Menú obtenido exitosamente')
      )
    } catch (error) {
      return reply.status(404).send(
        errorResponse(error instanceof Error ? error.message : 'Error al obtener menú')
      )
    }
  }

  // GET /api/admin/products/:id - Obtener producto por ID (Admin)
  static async getProductByIdAdmin(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const product = await ProductService.getProductById(request.params.id, true)
      
      return reply.send(
        successResponse(product, 'Producto obtenido exitosamente')
      )
    } catch (error) {
      return reply.status(404).send(
        errorResponse(error instanceof Error ? error.message : 'Producto no encontrado')
      )
    }
  }

  // GET /api/products/:id - Obtener producto por ID (Público)
  static async getProductByIdPublic(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const product = await ProductService.getProductById(request.params.id, false)
      
      return reply.send(
        successResponse(product, 'Producto obtenido exitosamente')
      )
    } catch (error) {
      return reply.status(404).send(
        errorResponse(error instanceof Error ? error.message : 'Producto no encontrado')
      )
    }
  }

  // POST /api/admin/products - Crear nuevo producto
  static async createProduct(
    request: FastifyRequest<{ Body: CreateProductInput }>,
    reply: FastifyReply
  ) {
    try {
      const product = await ProductService.createProduct(request.body)
      
      return reply.status(201).send(
        successResponse(product, 'Producto creado exitosamente')
      )
    } catch (error) {
      return reply.status(400).send(
        errorResponse(error instanceof Error ? error.message : 'Error al crear producto')
      )
    }
  }

  // PUT /api/admin/products/:id - Actualizar producto
  static async updateProduct(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateProductInput }>,
    reply: FastifyReply
  ) {
    try {
      const product = await ProductService.updateProduct(request.params.id, request.body)
      
      return reply.send(
        successResponse(product, 'Producto actualizado exitosamente')
      )
    } catch (error) {
      return reply.status(400).send(
        errorResponse(error instanceof Error ? error.message : 'Error al actualizar producto')
      )
    }
  }

  // DELETE /api/admin/products/:id - Eliminar producto
  static async deleteProduct(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const result = await ProductService.deleteProduct(request.params.id)
      
      return reply.send(
        successResponse(result, 'Producto eliminado exitosamente')
      )
    } catch (error) {
      return reply.status(400).send(
        errorResponse(error instanceof Error ? error.message : 'Error al eliminar producto')
      )
    }
  }

  // PATCH /api/admin/products/:id/toggle - Cambiar disponibilidad
  static async toggleProductAvailability(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const product = await ProductService.toggleProductAvailability(request.params.id)
      
      return reply.send(
        successResponse(product, 'Disponibilidad del producto actualizada')
      )
    } catch (error) {
      return reply.status(400).send(
        errorResponse(error instanceof Error ? error.message : 'Error al cambiar disponibilidad')
      )
    }
  }

  // GET /api/admin/products/categories - Obtener categorías
  static async getProductCategories(
    request: FastifyRequest<{ Querystring: { businessId?: string } }>,
    reply: FastifyReply
  ) {
    try {
      const categories = await ProductService.getProductCategories(request.query.businessId)
      
      return reply.send(
        successResponse(categories, 'Categorías obtenidas exitosamente')
      )
    } catch (error) {
      return reply.status(500).send(
        errorResponse(error instanceof Error ? error.message : 'Error al obtener categorías')
      )
    }
  }

  // GET /api/admin/products/stats - Obtener estadísticas
  static async getProductStats(
    request: FastifyRequest<{ Querystring: { businessId?: string } }>,
    reply: FastifyReply
  ) {
    try {
      const stats = await ProductService.getProductStats(request.query.businessId)
      
      return reply.send(
        successResponse(stats, 'Estadísticas obtenidas exitosamente')
      )
    } catch (error) {
      return reply.status(500).send(
        errorResponse(error instanceof Error ? error.message : 'Error al obtener estadísticas')
      )
    }
  }

  // GET /api/products/popular - Obtener productos populares (Público)
  static async getPopularProducts(
    request: FastifyRequest<{ Querystring: { limit?: number } }>,
    reply: FastifyReply
  ) {
    try {
      const products = await ProductService.getPopularProducts(request.query.limit)
      
      return reply.send(
        successResponse(products, 'Productos populares obtenidos exitosamente')
      )
    } catch (error) {
      return reply.status(500).send(
        errorResponse(error instanceof Error ? error.message : 'Error al obtener productos populares')
      )
    }
  }
}
import { FastifyInstance } from 'fastify'
import { ProductController } from '../../controllers/product.controller.js'

export default async function productRoutes(fastify: FastifyInstance) {
  
  // GET /api/products/popular - Obtener productos populares
  fastify.get('/popular', ProductController.getPopularProducts)

  // GET /api/products/:id - Obtener producto por ID
  fastify.get('/:id', ProductController.getProductByIdPublic)
}
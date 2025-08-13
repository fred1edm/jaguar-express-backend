import { FastifyInstance } from 'fastify'
import { ProductController } from '../../controllers/product.controller.js'
import { authMiddleware } from '../../middleware/auth.js'
import { 
  createProductSchema, 
  updateProductSchema, 
  productQuerySchema 
} from '../../schemas/product.js'
import { validateBody, validateQuery } from '../../utils/validation.js'

export default async function productRoutes(fastify: FastifyInstance) {
  
  // Todas las rutas de admin requieren autenticación
  fastify.addHook('preHandler', authMiddleware)

  // GET /api/admin/products - Obtener todos los productos
  fastify.get('/', {
    preHandler: [validateQuery(productQuerySchema)],
  }, ProductController.getAllProducts)

  // GET /api/admin/products/categories - Obtener categorías
  fastify.get('/categories', ProductController.getProductCategories)

  // GET /api/admin/products/stats - Obtener estadísticas
  fastify.get('/stats', ProductController.getProductStats)

  // GET /api/admin/products/:id - Obtener producto por ID
  fastify.get('/:id', ProductController.getProductByIdAdmin)

  // POST /api/admin/products - Crear nuevo producto
  fastify.post('/', {
    preHandler: [validateBody(createProductSchema)],
  }, ProductController.createProduct)

  // PUT /api/admin/products/:id - Actualizar producto
  fastify.put('/:id', {
    preHandler: [validateBody(updateProductSchema)],
  }, ProductController.updateProduct)

  // PATCH /api/admin/products/:id/toggle - Cambiar disponibilidad
  fastify.patch('/:id/toggle', ProductController.toggleProductAvailability)

  // DELETE /api/admin/products/:id - Eliminar producto
  fastify.delete('/:id', ProductController.deleteProduct)
}
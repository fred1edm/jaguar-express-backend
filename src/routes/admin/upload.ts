import { FastifyInstance } from 'fastify'
import { UploadController } from '../../controllers/upload.controller'
import { authMiddleware } from '../../middleware/auth'

export default async function uploadRoutes(fastify: FastifyInstance) {
  
  // Todas las rutas de upload requieren autenticación
  fastify.addHook('preHandler', authMiddleware)

  // POST /api/admin/upload/business/:id/image - Subir imagen de negocio
  fastify.post('/business/:id/image', UploadController.uploadBusinessImage)

  // POST /api/admin/upload/product/:id/image - Subir imagen de producto
  fastify.post('/product/:id/image', UploadController.uploadProductImage)

  // POST /api/admin/upload/generic - Subir imagen genérica
  fastify.post('/generic', UploadController.uploadGenericImage)

  // DELETE /api/admin/upload/business/:id/image - Eliminar imagen de negocio
  fastify.delete('/business/:id/image', UploadController.deleteBusinessImage)

  // DELETE /api/admin/upload/product/:id/image - Eliminar imagen de producto
  fastify.delete('/product/:id/image', UploadController.deleteProductImage)
}
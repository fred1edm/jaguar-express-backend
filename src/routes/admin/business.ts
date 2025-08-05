import { FastifyInstance } from 'fastify'
import { BusinessController } from '../../controllers/business.controller'
import { authMiddleware } from '../../middleware/auth'
import { 
  createBusinessSchema, 
  updateBusinessSchema, 
  businessQuerySchema 
} from '../../schemas/business'
import { validateBody, validateQuery } from '../../utils/validation'

export default async function businessRoutes(fastify: FastifyInstance) {
  
  // Todas las rutas de admin requieren autenticación
  fastify.addHook('preHandler', authMiddleware)

  // GET /api/admin/business - Obtener todos los negocios
  fastify.get('/', {
    preHandler: [validateQuery(businessQuerySchema)],
  }, BusinessController.getAllBusinesses)

  // GET /api/admin/business/stats - Obtener estadísticas (DEBE IR ANTES QUE /:id)
  fastify.get('/stats', BusinessController.getBusinessStats)

  // POST /api/admin/business - Crear nuevo negocio
  fastify.post('/', {
    preHandler: [validateBody(createBusinessSchema)],
  }, BusinessController.createBusiness)

  // GET /api/admin/business/:id - Obtener negocio por ID (DESPUÉS DE /stats)
  fastify.get('/:id', BusinessController.getBusinessByIdAdmin)

  // PUT /api/admin/business/:id - Actualizar negocio
  fastify.put('/:id', {
    preHandler: [validateBody(updateBusinessSchema)],
  }, BusinessController.updateBusiness)

  // PATCH /api/admin/business/:id/toggle - Cambiar estado
  fastify.patch('/:id/toggle', BusinessController.toggleBusinessStatus)

  // DELETE /api/admin/business/:id - Eliminar negocio
  fastify.delete('/:id', BusinessController.deleteBusiness)
}
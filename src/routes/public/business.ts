import { FastifyInstance } from 'fastify'
import { BusinessController } from '../../controllers/business.controller.js'
import { ProductController } from '../../controllers/product.controller.js'
import { businessQuerySchema } from '../../schemas/business.js'
import { validateQuery } from '../../utils/validation.js'

export default async function businessRoutes(fastify: FastifyInstance) {
  
  // GET /api/business - Obtener negocios activos
  fastify.get('/', {
    preHandler: [validateQuery(businessQuerySchema)],
  }, BusinessController.getActiveBusinesses)

  // GET /api/business/:id - Obtener negocio por ID
  fastify.get('/:id', BusinessController.getBusinessByIdPublic)

  // GET /api/business/:businessId/menu - Obtener menú del negocio
  fastify.get('/:businessId/menu', ProductController.getBusinessMenu)
}
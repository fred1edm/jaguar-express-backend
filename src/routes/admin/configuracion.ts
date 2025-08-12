import { FastifyInstance } from 'fastify'
import { ConfiguracionController } from '../../controllers/configuracion.controller.js'
import { authMiddleware } from '../../middleware/auth.js'

export default async function configuracionRoutes(fastify: FastifyInstance) {
  
  // Todas las rutas de admin requieren autenticación
  fastify.addHook('preHandler', authMiddleware)

  // GET /api/admin/configuracion - Obtener configuración del sistema
  fastify.get('/', ConfiguracionController.getConfiguracion)

  // PUT /api/admin/configuracion - Actualizar configuración del sistema
  fastify.put('/', ConfiguracionController.updateConfiguracion)
}
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { auditService } from '../../services/audit.service';
import { authMiddleware } from '../../middleware/auth';
import { AUDIT_ACTIONS, createAuditLog } from '../../middleware/audit';

interface AuditRequest extends FastifyRequest {
  admin?: {
    id: string;
    email: string;
    role: string;
  };
}

// Middleware para verificar rol SUPERADMIN
const superAdminOnly = async (request: FastifyRequest, reply: FastifyReply) => {
  const req = request as AuditRequest;
  
  if (!req.admin) {
    return reply.status(401).send({
      success: false,
      error: 'Acceso denegado. Autenticación requerida'
    });
  }
  
  if (req.admin.role !== 'SUPERADMIN') {
    return reply.status(403).send({
      success: false,
      error: 'Acceso denegado. Se requiere rol SUPERADMIN'
    });
  }
};

export default async function auditRoutes(fastify: FastifyInstance) {
  // Aplicar autenticación y verificación de rol SUPERADMIN a todas las rutas
  fastify.addHook('preHandler', authMiddleware);
  fastify.addHook('preHandler', superAdminOnly);

  /**
   * GET /api/admin/audit/logs
   * Obtiene logs de auditoría con filtros y paginación
   */
  fastify.get('/logs', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const req = request as AuditRequest;
      const { 
        page = 1, 
        limit = 20, 
        adminId, 
        action, 
        startDate, 
        endDate 
      } = request.query as any;
      
      // Validar parámetros
      const pageNum = Math.max(1, Number(page));
      const limitNum = Math.min(100, Math.max(1, Number(limit)));
      
      const filters: any = {
        page: pageNum,
        limit: limitNum
      };
      
      if (adminId) filters.adminId = adminId as string;
      if (action) filters.action = action as string;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      
      const result = await auditService.getAuditLogs(filters);
      
      // Registrar que se accedió a los logs de auditoría
      if (req.admin) {
        await createAuditLog(
          req.admin.id,
          AUDIT_ACTIONS.VIEW_AUDIT_LOGS,
          `Visualización de logs de auditoría por ${req.admin.email}`
        );
      }
      
      return reply.send({ success: true, data: result });
    } catch (error) {
      console.error('Error al obtener logs de auditoría:', error);
      return reply.status(500).send({
        success: false,
        error: 'Error al obtener registros de auditoría'
      });
    }
  });

  /**
   * GET /api/admin/audit/logs/:id
   * Obtiene un log de auditoría específico por ID
   */
  fastify.get('/logs/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      
      if (!id) {
        return reply.status(400).send({
          success: false,
          error: 'ID de log requerido'
        });
      }
      
      const log = await auditService.getAuditLogById(id);
      
      if (!log) {
        return reply.status(404).send({
          success: false,
          error: 'Registro de auditoría no encontrado'
        });
      }
      
      return reply.send({ success: true, data: log });
    } catch (error) {
      console.error('Error al obtener log de auditoría:', error);
      return reply.status(500).send({
        success: false,
        error: 'Error al obtener registro de auditoría'
      });
    }
  });

  /**
   * GET /api/admin/audit/stats
   * Obtiene estadísticas de auditoría
   */
  fastify.get('/stats', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { adminId } = request.query as { adminId?: string };
      
      const stats = await auditService.getAuditStats();
      
      return reply.send({ success: true, data: stats });
    } catch (error) {
      console.error('Error al obtener estadísticas de auditoría:', error);
      return reply.status(500).send({
        success: false,
        error: 'Error al obtener estadísticas de auditoría'
      });
    }
  });

  /**
   * GET /api/admin/audit/logs/admin/:adminId
   * Obtiene logs por administrador específico
   */
  fastify.get('/logs/admin/:adminId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { adminId } = request.params as { adminId: string };
      const { limit = 50 } = request.query as { limit?: number };
      
      if (!adminId) {
        return reply.status(400).send({
          success: false,
          error: 'ID de administrador requerido'
        });
      }
      
      const logs = await auditService.getLogsByAdminId(
        adminId, 
        1,
        Math.min(100, Number(limit))
      );
      
      return reply.send({ success: true, data: logs });
    } catch (error) {
      console.error('Error al obtener logs por administrador:', error);
      return reply.status(500).send({
        success: false,
        error: 'Error al obtener logs por administrador'
      });
    }
  });

  /**
   * GET /api/admin/audit/logs/action/:action
   * Obtiene logs por tipo de acción
   */
  fastify.get('/logs/action/:action', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { action } = request.params as { action: string };
      const { limit = 50 } = request.query as { limit?: number };
      
      if (!action) {
        return reply.status(400).send({
          success: false,
          error: 'Tipo de acción requerido'
        });
      }
      
      const logs = await auditService.getLogsByAction(
        action, 
        1,
        Math.min(100, Number(limit))
      );
      
      return reply.send({ success: true, data: logs });
    } catch (error) {
      console.error('Error al obtener logs por acción:', error);
      return reply.status(500).send({
        success: false,
        error: 'Error al obtener logs por acción'
      });
    }
  });

  /**
   * POST /api/admin/audit/cleanup
   * Limpia logs antiguos (solo SUPERADMIN)
   */
  fastify.post('/cleanup', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { daysToKeep = 90 } = request.body as { daysToKeep?: number };
      
      const deletedCount = await auditService.cleanupOldLogs(daysToKeep);
      
      return reply.send({
        success: true,
        data: { deletedCount },
        message: `Se eliminaron ${deletedCount} registros antiguos`
      });
    } catch (error) {
      console.error('Error al limpiar logs antiguos:', error);
      return reply.status(500).send({
        success: false,
        error: 'Error al limpiar logs antiguos'
      });
    }
  });
}
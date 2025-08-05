import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuditLogFilters {
  adminId?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export interface AuditLogStats {
  totalLogs: number;
  logsByAction: { action: string; count: number }[];
  logsByAdmin: { adminEmail: string; count: number }[];
  recentActivity: number; // logs in last 24 hours
}

export class AuditService {
  /**
   * Obtiene logs de auditoría con filtros y paginación
   */
  static async getAuditLogs(filters: AuditLogFilters = {}) {
    const {
      adminId,
      action,
      startDate,
      endDate,
      page = 1,
      limit = 20
    } = filters;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (adminId) {
      where.adminId = adminId;
    }

    if (action) {
      where.action = action;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = startDate;
      }
      if (endDate) {
        where.createdAt.lte = endDate;
      }
    }

    const [logs, total] = await Promise.all([
      prisma.adminLog.findMany({
        where,
        include: {
          admin: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.adminLog.count({ where })
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Obtiene un log de auditoría específico por ID
   */
  static async getAuditLogById(id: string) {
    return await prisma.adminLog.findUnique({
      where: { id },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });
  }

  /**
   * Obtiene estadísticas de auditoría
   */
  static async getAuditStats(): Promise<AuditLogStats> {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [totalLogs, logsByAction, logsByAdmin, recentActivity] = await Promise.all([
      // Total de logs
      prisma.adminLog.count(),
      
      // Logs por acción
      prisma.adminLog.groupBy({
        by: ['action'],
        _count: {
          action: true
        },
        orderBy: {
          _count: {
            action: 'desc'
          }
        },
        take: 10
      }),
      
      // Logs por administrador
      prisma.adminLog.groupBy({
        by: ['adminId'],
        _count: {
          adminId: true
        },
        orderBy: {
          _count: {
            adminId: 'desc'
          }
        },
        take: 10
      }),
      
      // Actividad reciente (últimas 24 horas)
      prisma.adminLog.count({
        where: {
          createdAt: {
            gte: yesterday
          }
        }
      })
    ]);

    // Obtener información de administradores para los logs por admin
    const adminIds = logsByAdmin.map(log => log.adminId);
    const admins = await prisma.admin.findMany({
      where: {
        id: {
          in: adminIds
        }
      },
      select: {
        id: true,
        email: true
      }
    });

    const adminMap = new Map(admins.map(admin => [admin.id, admin.email]));

    return {
      totalLogs,
      logsByAction: logsByAction.map(log => ({
        action: log.action,
        count: log._count.action
      })),
      logsByAdmin: logsByAdmin.map(log => ({
        adminEmail: adminMap.get(log.adminId) || 'Usuario desconocido',
        count: log._count.adminId
      })),
      recentActivity
    };
  }

  /**
   * Obtiene logs de auditoría por ID de administrador
   */
  static async getLogsByAdminId(adminId: string, page = 1, limit = 20) {
    return await this.getAuditLogs({ adminId, page, limit });
  }

  /**
   * Obtiene logs de auditoría por tipo de acción
   */
  static async getLogsByAction(action: string, page = 1, limit = 20) {
    return await this.getAuditLogs({ action, page, limit });
  }

  /**
   * Elimina logs de auditoría antiguos (más de X días)
   */
  static async cleanupOldLogs(daysToKeep = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await prisma.adminLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        }
      }
    });

    return result.count;
  }
}

export const auditService = {
  getAuditLogs: AuditService.getAuditLogs,
  getAuditLogById: AuditService.getAuditLogById,
  getAuditStats: AuditService.getAuditStats,
  getLogsByAdminId: AuditService.getLogsByAdminId,
  getLogsByAction: AuditService.getLogsByAction,
  cleanupOldLogs: AuditService.cleanupOldLogs,
};

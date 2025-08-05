import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuditRequest extends FastifyRequest {
  admin?: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Hook para registrar automáticamente las acciones de auditoría en Fastify
 * @param action - Tipo de acción a registrar (LOGIN, CREATE_ADMIN, etc.)
 * @param getDescription - Función opcional para generar descripción personalizada
 */
export const auditLogger = (
  action: string,
  getDescription?: (req: AuditRequest) => string
) => {
  return async (req: AuditRequest, reply: FastifyReply) => {
    try {
      if (req.admin) {
        const description = getDescription 
          ? getDescription(req)
          : `${action} realizada por ${req.admin.email}`;

        await prisma.adminLog.create({
          data: {
            adminId: req.admin.id,
            action,
            description,
          },
        });
      }
    } catch (error) {
      console.error('Error en auditoría:', error);
      // Continuar aunque falle la auditoría
    }
  };
};

/**
 * Hook para registrar auditoría después de una respuesta exitosa en Fastify
 * @param action - Tipo de acción a registrar
 * @param getDescription - Función opcional para generar descripción personalizada
 */
export const auditLoggerAfterResponse = (
  action: string,
  getDescription?: (req: AuditRequest, reply: FastifyReply) => string
) => {
  return async (req: AuditRequest, reply: FastifyReply) => {
    // Solo registrar si la respuesta es exitosa (2xx)
    if (reply.statusCode >= 200 && reply.statusCode < 300 && req.admin) {
      try {
        const description = getDescription 
          ? getDescription(req, reply)
          : `${action} realizada por ${req.admin.email}`;

        await prisma.adminLog.create({
          data: {
            adminId: req.admin.id,
            action,
            description,
          },
        });
      } catch (error) {
        console.error('Error en auditoría post-respuesta:', error);
      }
    }
  };
};

/**
 * Función helper para crear logs de auditoría manualmente
 * @param adminId - ID del administrador
 * @param action - Tipo de acción
 * @param description - Descripción de la acción
 */
export const createAuditLog = async (
  adminId: string,
  action: string,
  description: string
) => {
  try {
    await prisma.adminLog.create({
      data: {
        adminId,
        action,
        description,
      },
    });
  } catch (error) {
    console.error('Error creando log de auditoría:', error);
  }
};

// Constantes para tipos de acciones comunes
export const AUDIT_ACTIONS = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  CREATE_ADMIN: 'CREATE_ADMIN',
  UPDATE_ADMIN: 'UPDATE_ADMIN',
  DELETE_ADMIN: 'DELETE_ADMIN',
  CREATE_BUSINESS: 'CREATE_BUSINESS',
  UPDATE_BUSINESS: 'UPDATE_BUSINESS',
  DELETE_BUSINESS: 'DELETE_BUSINESS',
  CREATE_PRODUCT: 'CREATE_PRODUCT',
  UPDATE_PRODUCT: 'UPDATE_PRODUCT',
  DELETE_PRODUCT: 'DELETE_PRODUCT',
  UPDATE_ORDER_STATUS: 'UPDATE_ORDER_STATUS',
  ASSIGN_DELIVERY: 'ASSIGN_DELIVERY',
  VIEW_AUDIT_LOGS: 'VIEW_AUDIT_LOGS',
} as const;
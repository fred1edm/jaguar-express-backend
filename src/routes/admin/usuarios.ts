import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { authMiddleware } from '../../middleware/auth.js'

const prisma = new PrismaClient()

// Middleware para verificar permisos de superadmin
const requireSuperAdmin = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user
  if (!user || user.role !== 'SUPERADMIN') {
    return reply.status(403).send({
      success: false,
      message: 'Acceso denegado. Se requieren permisos de SUPERADMIN'
    })
  }
}

export default async function usuariosRoutes(fastify: FastifyInstance) {
  // Middleware de autenticación para todas las rutas
  fastify.addHook('preHandler', authMiddleware)

  // GET /api/admin/usuarios - Listar todos los administradores
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const admins = await prisma.admin.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          lastAccess: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      return reply.send({
        success: true,
        data: admins
      })
    } catch (error) {
      console.error('Error al obtener administradores:', error)
      return reply.status(500).send({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  })

  // POST /api/admin/usuarios - Crear nuevo administrador (solo superadmin)
  fastify.post('/', {
    preHandler: requireSuperAdmin
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = request.body as any
      const { name, email, password, role } = body

      // Validar datos requeridos
      if (!name || !email || !password || !role) {
        return reply.status(400).send({
          success: false,
          message: 'Todos los campos son requeridos'
        })
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return reply.status(400).send({
          success: false,
          message: 'Formato de email inválido'
        })
      }

      // Validar rol
      if (!['SUPERADMIN', 'EDITOR', 'SOPORTE'].includes(role)) {
        return reply.status(400).send({
          success: false,
          message: 'Rol inválido'
        })
      }

      // Verificar que el email no exista
      const existingAdmin = await prisma.admin.findUnique({
        where: { email }
      })

      if (existingAdmin) {
        return reply.status(409).send({
          success: false,
          message: 'Ya existe un administrador con este email'
        })
      }

      // Hash de la contraseña
      const hashedPassword = await bcrypt.hash(password, 12)

      // Crear nuevo administrador
      const newAdmin = await prisma.admin.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role,
          isActive: true
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true
        }
      })

      return reply.status(201).send({
        success: true,
        message: 'Administrador creado exitosamente',
        data: newAdmin
      })
    } catch (error) {
      console.error('Error al crear administrador:', error)
      return reply.status(500).send({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  })

  // DELETE /api/admin/usuarios/:id - Eliminar administrador (solo superadmin)
  fastify.delete('/:id', {
    preHandler: requireSuperAdmin
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as any
      const { id } = params
      const currentUser = (request as any).user

      // Verificar que el administrador existe
      const adminToDelete = await prisma.admin.findUnique({
        where: { id }
      })

      if (!adminToDelete) {
        return reply.status(404).send({
          success: false,
          message: 'Administrador no encontrado'
        })
      }

      // Prevenir que un superadmin se elimine a sí mismo
      if (adminToDelete.id === currentUser.id) {
        return reply.status(400).send({
          success: false,
          message: 'No puedes eliminar tu propia cuenta'
        })
      }

      // Eliminar administrador
      await prisma.admin.delete({
        where: { id }
      })

      return reply.send({
        success: true,
        message: 'Administrador eliminado exitosamente'
      })
    } catch (error) {
      console.error('Error al eliminar administrador:', error)
      return reply.status(500).send({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  })
}
import { FastifyRequest, FastifyReply } from 'fastify'
import { UserService } from '../services/user.service.js'
import { registerUserSchema, verifyPhoneSchema, updateUserSchema } from '../schemas/user.js'

export class UserController {
  // Registrar nuevo usuario
  static async register(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = registerUserSchema.parse(request.body)
      const result = await UserService.registerUser(data)
      return reply.status(201).send(result)
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({ error: error.message })
      } else {
        return reply.status(500).send({ error: 'Error interno del servidor' })
      }
    }
  }

  // Verificar código SMS
  static async verifyPhone(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = verifyPhoneSchema.parse(request.body)
      const result = await UserService.verifyPhone(data)
      return reply.status(200).send(result)
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({ error: error.message })
      } else {
        return reply.status(500).send({ error: 'Error interno del servidor' })
      }
    }
  }

  // Actualizar datos del usuario
  static async updateUser(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { userId } = request.params as { userId: string }
      const data = updateUserSchema.parse(request.body)
      const user = await UserService.updateUser(userId, data)
      return reply.status(200).send(user)
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({ error: error.message })
      } else {
        return reply.status(500).send({ error: 'Error interno del servidor' })
      }
    }
  }

  // Obtener usuario por ID
  static async getUser(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { userId } = request.params as { userId: string }
      const user = await UserService.getUserById(userId)
      return reply.status(200).send(user)
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({ error: error.message })
      } else {
        return reply.status(500).send({ error: 'Error interno del servidor' })
      }
    }
  }
}
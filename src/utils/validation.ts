import { z } from 'zod'
import { FastifyRequest, FastifyReply } from 'fastify'
import { errorResponse } from './response.js'

// Utility para validar datos con Zod
export const validateBody = <T>(schema: z.ZodSchema<T>) => {
  return (request: FastifyRequest, reply: FastifyReply, done: Function) => {
    try {
      const result = schema.parse(request.body)
      request.body = result
      done()
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Corregido: usar .issues en lugar de .errors
        const errors = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`)
        return reply.status(400).send(
          errorResponse('Datos inválidos', errors.join(', '))
        )
      }
      return reply.status(400).send(
        errorResponse('Error de validación')
      )
    }
  }
}

// Utility para validar query params
export const validateQuery = <T>(schema: z.ZodSchema<T>) => {
  return (request: FastifyRequest, reply: FastifyReply, done: Function) => {
    try {
      const result = schema.parse(request.query)
      request.query = result
      done()
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Corregido: usar .issues en lugar de .errors
        const errors = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`)
        return reply.status(400).send(
          errorResponse('Parámetros inválidos', errors.join(', '))
        )
      }
      return reply.status(400).send(
        errorResponse('Error de validación en query')
      )
    }
  }
}
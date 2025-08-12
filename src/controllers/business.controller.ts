import { FastifyRequest, FastifyReply } from 'fastify'
import { BusinessService } from '../services/business.service.js'
import { successResponse, errorResponse } from '../utils/response.js'
import { CreateBusinessInput, UpdateBusinessInput, BusinessQueryInput } from '../schemas/business.js'

export class BusinessController {
  
  // GET /api/admin/business - Obtener todos los negocios (Admin)
  static async getAllBusinesses(
    request: FastifyRequest<{ Querystring: BusinessQueryInput }>,
    reply: FastifyReply
  ) {
    try {
      const result = await BusinessService.getAllBusinesses(request.query)
      
      return reply.send(
        successResponse(result, 'Negocios obtenidos exitosamente')
      )
    } catch (error) {
      return reply.status(500).send(
        errorResponse(error instanceof Error ? error.message : 'Error al obtener negocios')
      )
    }
  }

  // GET /api/business - Obtener negocios activos (Público)
  static async getActiveBusinesses(
    request: FastifyRequest<{ Querystring: BusinessQueryInput }>,
    reply: FastifyReply
  ) {
    try {
      const result = await BusinessService.getActiveBusinesses(request.query)
      
      return reply.send(
        successResponse(result, 'Negocios obtenidos exitosamente')
      )
    } catch (error) {
      return reply.status(500).send(
        errorResponse(error instanceof Error ? error.message : 'Error al obtener negocios')
      )
    }
  }

  // GET /api/admin/business/:id - Obtener negocio por ID (Admin)
  static async getBusinessByIdAdmin(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const business = await BusinessService.getBusinessById(request.params.id, true)
      
      return reply.send(
        successResponse(business, 'Negocio obtenido exitosamente')
      )
    } catch (error) {
      return reply.status(404).send(
        errorResponse(error instanceof Error ? error.message : 'Negocio no encontrado')
      )
    }
  }

  // GET /api/business/:id - Obtener negocio por ID (Público)
  static async getBusinessByIdPublic(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const business = await BusinessService.getBusinessById(request.params.id, false)
      
      return reply.send(
        successResponse(business, 'Negocio obtenido exitosamente')
      )
    } catch (error) {
      return reply.status(404).send(
        errorResponse(error instanceof Error ? error.message : 'Negocio no encontrado')
      )
    }
  }

  // POST /api/admin/business - Crear nuevo negocio
  static async createBusiness(
    request: FastifyRequest<{ Body: CreateBusinessInput }>,
    reply: FastifyReply
  ) {
    try {
      const business = await BusinessService.createBusiness(request.body)
      
      return reply.status(201).send(
        successResponse(business, 'Negocio creado exitosamente')
      )
    } catch (error) {
      return reply.status(400).send(
        errorResponse(error instanceof Error ? error.message : 'Error al crear negocio')
      )
    }
  }

  // PUT /api/admin/business/:id - Actualizar negocio
  static async updateBusiness(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateBusinessInput }>,
    reply: FastifyReply
  ) {
    try {
      const business = await BusinessService.updateBusiness(request.params.id, request.body)
      
      return reply.send(
        successResponse(business, 'Negocio actualizado exitosamente')
      )
    } catch (error) {
      return reply.status(400).send(
        errorResponse(error instanceof Error ? error.message : 'Error al actualizar negocio')
      )
    }
  }

  // DELETE /api/admin/business/:id - Eliminar negocio
  static async deleteBusiness(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const result = await BusinessService.deleteBusiness(request.params.id)
      
      return reply.send(
        successResponse(result, 'Negocio eliminado exitosamente')
      )
    } catch (error) {
      return reply.status(400).send(
        errorResponse(error instanceof Error ? error.message : 'Error al eliminar negocio')
      )
    }
  }

  // PATCH /api/admin/business/:id/toggle - Cambiar estado del negocio
  static async toggleBusinessStatus(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const business = await BusinessService.toggleBusinessStatus(request.params.id)
      
      return reply.send(
        successResponse(business, 'Estado del negocio actualizado')
      )
    } catch (error) {
      return reply.status(400).send(
        errorResponse(error instanceof Error ? error.message : 'Error al cambiar estado')
      )
    }
  }

  // GET /api/admin/business/stats - Obtener estadísticas
  static async getBusinessStats(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const stats = await BusinessService.getBusinessStats()
      
      return reply.send(
        successResponse(stats, 'Estadísticas obtenidas exitosamente')
      )
    } catch (error) {
      return reply.status(500).send(
        errorResponse(error instanceof Error ? error.message : 'Error al obtener estadísticas')
      )
    }
  }
}
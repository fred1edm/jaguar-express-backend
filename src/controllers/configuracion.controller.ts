import { FastifyRequest, FastifyReply } from 'fastify'
import { ConfiguracionService } from '../services/configuracion.service.js'
import { successResponse, errorResponse } from '../utils/response.js'

export interface UpdateConfiguracionInput {
  nombreEmpresa?: string
  logoUrl?: string
  metodosPago?: string[]
  horarioOperacion?: {
    [key: string]: {
      abierto: boolean
      inicio: string
      fin: string
    }
  }
  notificaciones?: {
    email: boolean
    sms: boolean
    push: boolean
    whatsapp: boolean
  }
  reglas?: {
    tiempoMaximoEntrega: number
    montoMinimoDelivery: number
    radioCoberturaKm: number
    comisionPlataforma: number
  }
  colores?: {
    primario: string
    secundario: string
    acento: string
    fondo: string
  }
}

export class ConfiguracionController {
  
  // GET /api/admin/configuracion
  static async getConfiguracion(request: FastifyRequest, reply: FastifyReply) {
    try {
      const configuracion = await ConfiguracionService.getConfiguracion()
      return reply.send(successResponse(configuracion, 'Configuración obtenida exitosamente'))
    } catch (error) {
      return reply.status(500).send(errorResponse('Error al obtener la configuración'))
    }
  }

  // PUT /api/admin/configuracion
  static async updateConfiguracion(request: FastifyRequest<{ Body: UpdateConfiguracionInput }>, reply: FastifyReply) {
    try {
      const configuracion = await ConfiguracionService.updateConfiguracion(request.body)
      return reply.send(successResponse(configuracion, 'Configuración actualizada exitosamente'))
    } catch (error) {
      return reply.status(500).send(errorResponse('Error al actualizar la configuración'))
    }
  }
}
import { FastifyRequest, FastifyReply } from 'fastify'
import { UploadService } from '../services/upload.service.js'
import { successResponse, errorResponse } from '../utils/response.js'

export interface MultipartFile {
  fieldname: string
  originalname: string
  encoding: string
  mimetype: string
  buffer: Buffer
  size: number
}

export class UploadController {
  
  // POST /api/admin/upload/business/:id/image - Subir imagen de negocio
  static async uploadBusinessImage(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      // Obtener archivo del request
      const data = await request.file()
      
      if (!data) {
        return reply.status(400).send(
          errorResponse('No se encontró ningún archivo')
        )
      }

      // Convertir stream a buffer
      const buffer = await data.toBuffer()
      
      const file: MultipartFile = {
        fieldname: data.fieldname,
        originalname: data.filename,
        encoding: data.encoding,
        mimetype: data.mimetype,
        buffer,
        size: buffer.length
      }

      const result = await UploadService.uploadBusinessImage(request.params.id, file)
      
      return reply.send(
        successResponse(result, 'Imagen subida exitosamente')
      )
    } catch (error) {
      return reply.status(400).send(
        errorResponse(error instanceof Error ? error.message : 'Error al subir imagen')
      )
    }
  }

  // POST /api/admin/upload/product/:id/image - Subir imagen de producto
  static async uploadProductImage(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      // Obtener archivo del request
      const data = await request.file()
      
      if (!data) {
        return reply.status(400).send(
          errorResponse('No se encontró ningún archivo')
        )
      }

      // Convertir stream a buffer
      const buffer = await data.toBuffer()
      
      const file: MultipartFile = {
        fieldname: data.fieldname,
        originalname: data.filename,
        encoding: data.encoding,
        mimetype: data.mimetype,
        buffer,
        size: buffer.length
      }

      const result = await UploadService.uploadProductImage(request.params.id, file)
      
      return reply.send(
        successResponse(result, 'Imagen subida exitosamente')
      )
    } catch (error) {
      return reply.status(400).send(
        errorResponse(error instanceof Error ? error.message : 'Error al subir imagen')
      )
    }
  }

  // POST /api/admin/upload/generic - Subir imagen genérica
  static async uploadGenericImage(
    request: FastifyRequest<{ Querystring: { folder?: string } }>,
    reply: FastifyReply
  ) {
    try {
      // Obtener archivo del request
      const data = await request.file()
      
      if (!data) {
        return reply.status(400).send(
          errorResponse('No se encontró ningún archivo')
        )
      }

      // Convertir stream a buffer
      const buffer = await data.toBuffer()
      
      const file: MultipartFile = {
        fieldname: data.fieldname,
        originalname: data.filename,
        encoding: data.encoding,
        mimetype: data.mimetype,
        buffer,
        size: buffer.length
      }

      const result = await UploadService.uploadGenericImage(file, request.query.folder)
      
      return reply.send(
        successResponse(result, 'Imagen subida exitosamente')
      )
    } catch (error) {
      return reply.status(400).send(
        errorResponse(error instanceof Error ? error.message : 'Error al subir imagen')
      )
    }
  }

  // DELETE /api/admin/upload/business/:id/image - Eliminar imagen de negocio
  static async deleteBusinessImage(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const result = await UploadService.deleteBusinessImage(request.params.id)
      
      return reply.send(
        successResponse(result, 'Imagen eliminada exitosamente')
      )
    } catch (error) {
      return reply.status(400).send(
        errorResponse(error instanceof Error ? error.message : 'Error al eliminar imagen')
      )
    }
  }

  // DELETE /api/admin/upload/product/:id/image - Eliminar imagen de producto
  static async deleteProductImage(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const result = await UploadService.deleteProductImage(request.params.id)
      
      return reply.send(
        successResponse(result, 'Imagen eliminada exitosamente')
      )
    } catch (error) {
      return reply.status(400).send(
        errorResponse(error instanceof Error ? error.message : 'Error al eliminar imagen')
      )
    }
  }
}
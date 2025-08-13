import { PrismaClient } from '@prisma/client'
import CloudinaryService from '../utils/cloudinary.js'

const prisma = new PrismaClient()

export interface UploadedFile {
  fieldname: string
  originalname: string
  encoding: string
  mimetype: string
  buffer: Buffer
  size: number
}

export class UploadService {
  
  // Validar archivo
  static validateFile(file: UploadedFile): void {
    const maxSize = parseInt(process.env.MAX_FILE_SIZE || '5242880') // 5MB
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || '').split(',')

    if (file.size > maxSize) {
      throw new Error(`Archivo muy grande. Máximo ${Math.round(maxSize / 1024 / 1024)}MB`)
    }

    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('Tipo de archivo no permitido. Solo se permiten imágenes JPEG, PNG y WebP')
    }
  }

  // Subir imagen de negocio y actualizar BD
  static async uploadBusinessImage(businessId: string, file: UploadedFile) {
    // Validar archivo
    this.validateFile(file)

    // Verificar que el negocio existe
    const business = await prisma.business.findUnique({
      where: { id: businessId }
    })

    if (!business) {
      throw new Error('Negocio no encontrado')
    }

    // Subir a Cloudinary
    const uploadResult = await CloudinaryService.uploadBusinessImage(
      file.buffer,
      businessId,
      file.originalname
    )

    // Actualizar base de datos
    const updatedBusiness = await prisma.business.update({
      where: { id: businessId },
      data: {
        image: uploadResult.secure_url,
        updatedAt: new Date()
      }
    })

    return {
      business: updatedBusiness,
      upload: {
        ...uploadResult,
        sizes: CloudinaryService.getImageSizes(uploadResult.public_id)
      }
    }
  }

  // Subir imagen de producto y actualizar BD
  static async uploadProductImage(productId: string, file: UploadedFile) {
    // Validar archivo
    this.validateFile(file)

    // Verificar que el producto existe
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        business: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!product) {
      throw new Error('Producto no encontrado')
    }

    // Subir a Cloudinary
    const uploadResult = await CloudinaryService.uploadProductImage(
      file.buffer,
      productId,
      file.originalname
    )

    // Actualizar base de datos
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        image: uploadResult.secure_url,
        updatedAt: new Date()
      },
      include: {
        business: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return {
      product: updatedProduct,
      upload: {
        ...uploadResult,
        sizes: CloudinaryService.getImageSizes(uploadResult.public_id)
      }
    }
  }

  // Subir imagen genérica (para futuras funcionalidades)
  static async uploadGenericImage(file: UploadedFile, folder = 'general') {
    // Validar archivo
    this.validateFile(file)

    // Subir a Cloudinary
    const uploadResult = await CloudinaryService.uploadFromBuffer(file.buffer, {
      folder: `jaguar-express/${folder}`,
      public_id: `${folder}-${Date.now()}`,
    })

    return {
      upload: {
        ...uploadResult,
        sizes: CloudinaryService.getImageSizes(uploadResult.public_id)
      }
    }
  }

  // Eliminar imagen y actualizar BD
  static async deleteBusinessImage(businessId: string) {
    const business = await prisma.business.findUnique({
      where: { id: businessId }
    })

    if (!business) {
      throw new Error('Negocio no encontrado')
    }

    if (business.image) {
      // Extraer public_id de la URL de Cloudinary
      const publicId = this.extractPublicIdFromUrl(business.image)
      
      if (publicId) {
        await CloudinaryService.deleteImage(publicId)
      }
    }

    // Actualizar base de datos
    const updatedBusiness = await prisma.business.update({
      where: { id: businessId },
      data: {
        image: null,
        updatedAt: new Date()
      }
    })

    return updatedBusiness
  }

  // Eliminar imagen de producto
  static async deleteProductImage(productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      throw new Error('Producto no encontrado')
    }

    if (product.image) {
      // Extraer public_id de la URL de Cloudinary
      const publicId = this.extractPublicIdFromUrl(product.image)
      
      if (publicId) {
        await CloudinaryService.deleteImage(publicId)
      }
    }

    // Actualizar base de datos
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        image: null,
        updatedAt: new Date()
      }
    })

    return updatedProduct
  }

  // Extraer public_id de una URL de Cloudinary
  private static extractPublicIdFromUrl(url: string): string | null {
    try {
      const regex = /\/(?:v\d+\/)?([^\.]+)/
      const match = url.match(regex)
      return match ? match[1] : null
    } catch {
      return null
    }
  }
}
import { v2 as cloudinary } from 'cloudinary'

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export interface UploadOptions {
  folder?: string
  public_id?: string
  overwrite?: boolean
  transformation?: Array<{
    width?: number
    height?: number
    crop?: string
    quality?: string | number
    format?: string
  }>
}

export interface UploadResult {
  public_id: string
  secure_url: string
  width: number
  height: number
  bytes: number
  format: string
  resource_type: string
  folder?: string
}

export class CloudinaryService {
  
  // Subir imagen desde buffer
  static async uploadFromBuffer(
    buffer: Buffer,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    try {
      const uploadOptions = {
        folder: options.folder || 'jaguar-express',
        public_id: options.public_id,
        overwrite: options.overwrite ?? true,
        resource_type: 'image' as const,
        transformation: options.transformation || [
          { width: 800, height: 600, crop: 'limit', quality: 'auto', format: 'webp' }
        ]
      }

      const result = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          }
        ).end(buffer)
      })

      return {
        public_id: result.public_id,
        secure_url: result.secure_url,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        format: result.format,
        resource_type: result.resource_type,
        folder: result.folder
      }
    } catch (error) {
      throw new Error(`Error subiendo imagen: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  // Subir imagen de negocio
  static async uploadBusinessImage(
    buffer: Buffer,
    businessId: string,
    filename?: string
  ): Promise<UploadResult> {
    const publicId = `business-${businessId}-${filename || Date.now()}`
    
    return this.uploadFromBuffer(buffer, {
      folder: 'jaguar-express/businesses',
      public_id: publicId,
      transformation: [
        { width: 800, height: 600, crop: 'fill', quality: 'auto', format: 'webp' },
        { width: 400, height: 300, crop: 'fill', quality: 'auto', format: 'webp' }, // thumbnail
      ]
    })
  }

  // Subir imagen de producto
  static async uploadProductImage(
    buffer: Buffer,
    productId: string,
    filename?: string
  ): Promise<UploadResult> {
    const publicId = `product-${productId}-${filename || Date.now()}`
    
    return this.uploadFromBuffer(buffer, {
      folder: 'jaguar-express/products',
      public_id: publicId,
      transformation: [
        { width: 600, height: 600, crop: 'fill', quality: 'auto', format: 'webp' },
        { width: 300, height: 300, crop: 'fill', quality: 'auto', format: 'webp' }, // thumbnail
      ]
    })
  }

  // Eliminar imagen
  static async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId)
    } catch (error) {
      throw new Error(`Error eliminando imagen: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  // Generar URLs con transformaciones
  static generateImageUrl(
    publicId: string,
    options: {
      width?: number
      height?: number
      crop?: 'fill' | 'fit' | 'limit' | 'scale'
      quality?: 'auto' | number
      format?: 'webp' | 'jpg' | 'png'
    } = {}
  ): string {
    return cloudinary.url(publicId, {
      width: options.width || 400,
      height: options.height || 300,
      crop: options.crop || 'fill',
      quality: options.quality || 'auto',
      format: options.format || 'webp',
      secure: true
    })
  }

  // Obtener múltiples tamaños de una imagen
  static getImageSizes(publicId: string) {
    return {
      thumbnail: this.generateImageUrl(publicId, { width: 150, height: 150 }),
      small: this.generateImageUrl(publicId, { width: 300, height: 300 }),
      medium: this.generateImageUrl(publicId, { width: 600, height: 600 }),
      large: this.generateImageUrl(publicId, { width: 800, height: 600 }),
      original: cloudinary.url(publicId, { secure: true })
    }
  }
}

export default CloudinaryService
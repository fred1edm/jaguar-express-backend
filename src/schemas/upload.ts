import { z } from 'zod'

// Schema para validar archivos
export const uploadFileSchema = z.object({
  fieldname: z.string(),
  originalname: z.string(),
  encoding: z.string(),
  mimetype: z.string().refine(
    (mimetype) => {
      const allowedTypes = (process.env.ALLOWED_FILE_TYPES || '').split(',')
      return allowedTypes.includes(mimetype)
    },
    { message: 'Tipo de archivo no permitido. Solo se permiten imágenes JPEG, PNG y WebP' }
  ),
  buffer: z.instanceof(Buffer),
  size: z.number().max(
    parseInt(process.env.MAX_FILE_SIZE || '5242880'),
    `El archivo es muy grande. Máximo ${Math.round(parseInt(process.env.MAX_FILE_SIZE || '5242880') / 1024 / 1024)}MB`
  )
})

// Schema para respuesta de upload
export const uploadResponseSchema = z.object({
  public_id: z.string(),
  secure_url: z.string(),
  width: z.number(),
  height: z.number(),
  bytes: z.number(),
  format: z.string(),
  folder: z.string().optional(),
  sizes: z.object({
    thumbnail: z.string(),
    small: z.string(),
    medium: z.string(),
    large: z.string(),
    original: z.string()
  }).optional()
})

// Tipos TypeScript
export type UploadFileInput = z.infer<typeof uploadFileSchema>
export type UploadResponseOutput = z.infer<typeof uploadResponseSchema>
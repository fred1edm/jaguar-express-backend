import { z } from 'zod'

// Schema para crear negocio
export const createBusinessSchema = z.object({
  name: z.string().min(2).max(100),
  type: z.enum(['RESTAURANTE', 'TIENDA', 'FARMACIA', 'OTROS']),
  description: z.string().max(500).optional(),
  logo: z.string().url().optional(),
  menuImages: z.array(z.string().url()).optional(),
  address: z.string().min(5).max(200),
  phone: z.string().min(9).max(15),
  zone: z.string().min(2).max(50),
  schedule: z.record(z.string(), z.object({
    open: z.string(),
    close: z.string(),
    isOpen: z.boolean()
  })),
  deliveryFee: z.number().min(0).max(50),
  minimumOrder: z.number().min(0).max(500),
  isPromoted: z.boolean().default(false),
  discount: z.object({
    type: z.enum(['percentage', 'fixed']),
    value: z.number().min(0),
    description: z.string().max(100)
  }).optional()
})

// Schema para actualizar negocio
export const updateBusinessSchema = createBusinessSchema.partial()

// Schema para query de búsqueda
export const businessQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
  search: z.string().optional(),
  type: z.enum(['RESTAURANTE', 'TIENDA', 'FARMACIA', 'OTROS']).optional(),
  zone: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  isPromoted: z.coerce.boolean().optional()
})

// Tipos TypeScript
export type CreateBusinessInput = z.infer<typeof createBusinessSchema>
export type UpdateBusinessInput = z.infer<typeof updateBusinessSchema>
export type BusinessQueryInput = z.infer<typeof businessQuerySchema>
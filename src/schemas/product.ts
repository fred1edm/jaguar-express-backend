import { z } from 'zod'

// Schema para crear producto
export const createProductSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es muy largo'),
  description: z
    .string()
    .max(500, 'La descripción es muy larga')
    .optional(),
  price: z
    .number()
    .min(0.01, 'El precio debe ser mayor a 0')
    .max(999.99, 'El precio es muy alto'),
  image: z
    .string()
    .url('URL de imagen inválida')
    .optional(),
  category: z
    .string()
    .min(2, 'La categoría debe tener al menos 2 caracteres')
    .max(50, 'La categoría es muy larga'),
  businessId: z
    .string()
    .min(1, 'ID del negocio es requerido'),
  isPopular: z.boolean().default(false),
  isAvailable: z.boolean().default(true),
  preparationTime: z
    .number()
    .min(1, 'El tiempo de preparación debe ser al menos 1 minuto')
    .max(120, 'El tiempo de preparación es muy largo')
    .default(15),
  ingredients: z.array(z.string()).optional(),
  allergens: z.array(z.string()).optional(),
  discount: z.object({
    type: z.enum(['percentage', 'fixed']),
    value: z.number().min(0),
    description: z.string().max(100)
  }).optional()
})

// Schema para actualizar producto
export const updateProductSchema = createProductSchema.partial().omit({ businessId: true })

// Schema para query de búsqueda de productos
export const productQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
  search: z.string().optional(),
  category: z.string().optional(),
  businessId: z.string().optional(),
  isAvailable: z.coerce.boolean().optional(),
  isPopular: z.coerce.boolean().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional()
})

// Schema para obtener menú de un negocio
export const menuQuerySchema = z.object({
  businessId: z.string().min(1, 'ID del negocio es requerido'),
  category: z.string().optional(),
  includeUnavailable: z.coerce.boolean().default(false)
})

// Tipos TypeScript
export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type ProductQueryInput = z.infer<typeof productQuerySchema>
export type MenuQueryInput = z.infer<typeof menuQuerySchema>
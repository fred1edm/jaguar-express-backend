// Tipos compartidos
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// Payload para administradores
export interface AdminAuthPayload {
  adminId: string
  email: string
  role: string
  type: 'admin'
}

// Payload para usuarios normales
export interface UserAuthPayload {
  userId: string
  phone: string
  type: 'user'
}

// Union type para ambos tipos de autenticación
export type AuthPayload = AdminAuthPayload | UserAuthPayload

export interface PaginationQuery {
  page?: number
  limit?: number
  search?: string
}
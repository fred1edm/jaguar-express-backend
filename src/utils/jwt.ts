import jwt from 'jsonwebtoken'
import { AdminAuthPayload, UserAuthPayload } from '../types/index.js'

const JWT_SECRET = process.env.JWT_SECRET!
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!
const USER_JWT_SECRET = process.env.USER_JWT_SECRET || JWT_SECRET + '_user'
const USER_JWT_REFRESH_SECRET = process.env.USER_JWT_REFRESH_SECRET || JWT_REFRESH_SECRET + '_user'

// Funciones para administradores
export const generateAdminTokens = (payload: Omit<AdminAuthPayload, 'type'>) => {
  const adminPayload: AdminAuthPayload = { ...payload, type: 'admin' }
  const accessToken = jwt.sign(adminPayload, JWT_SECRET, { expiresIn: '1h' })
  const refreshToken = jwt.sign(adminPayload, JWT_REFRESH_SECRET, { expiresIn: '7d' })
  
  return { accessToken, refreshToken }
}

export const verifyAdminAccessToken = (token: string): AdminAuthPayload => {
  const payload = jwt.verify(token, JWT_SECRET) as AdminAuthPayload
  if (payload.type !== 'admin') {
    throw new Error('Token inválido para administrador')
  }
  return payload
}

export const verifyAdminRefreshToken = (token: string): AdminAuthPayload => {
  const payload = jwt.verify(token, JWT_REFRESH_SECRET) as AdminAuthPayload
  if (payload.type !== 'admin') {
    throw new Error('Refresh token inválido para administrador')
  }
  return payload
}

// Funciones para usuarios normales
export const generateUserTokens = (payload: Omit<UserAuthPayload, 'type'>) => {
  const userPayload: UserAuthPayload = { ...payload, type: 'user' }
  const accessToken = jwt.sign(userPayload, USER_JWT_SECRET, { expiresIn: '1h' })
  const refreshToken = jwt.sign(userPayload, USER_JWT_REFRESH_SECRET, { expiresIn: '7d' })
  
  return { accessToken, refreshToken }
}

export const verifyUserAccessToken = (token: string): UserAuthPayload => {
  const payload = jwt.verify(token, USER_JWT_SECRET) as UserAuthPayload
  if (payload.type !== 'user') {
    throw new Error('Token inválido para usuario')
  }
  return payload
}

export const verifyUserRefreshToken = (token: string): UserAuthPayload => {
  const payload = jwt.verify(token, USER_JWT_REFRESH_SECRET) as UserAuthPayload
  if (payload.type !== 'user') {
    throw new Error('Refresh token inválido para usuario')
  }
  return payload
}

// Funciones legacy (mantener compatibilidad)
export const generateTokens = generateAdminTokens
export const verifyAccessToken = verifyAdminAccessToken
export const verifyRefreshToken = verifyAdminRefreshToken
import { PrismaClient } from '@prisma/client'
import { RegisterUserInput, VerifyPhoneInput, UpdateUserInput } from '../schemas/user'
import { generateSMSCode, sendSMSVerification } from '../utils/sms'
import { generateUserTokens, verifyUserRefreshToken } from '../utils/jwt'

const prisma = new PrismaClient()

export class UserService {
  // Registrar nuevo usuario
  static async registerUser(data: RegisterUserInput) {
    // Verificar si el teléfono ya existe
    const existingUser = await prisma.user.findUnique({
      where: { phone: data.phone },
    })

    if (existingUser) {
      throw new Error('Este número de teléfono ya está registrado')
    }

    // Generar código de verificación
    const verificationCode = generateSMSCode()

    // Crear usuario pendiente de verificación
    const user = await prisma.user.create({
      data: {
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        address: data.address,
        locationLat: data.locationLat,
        locationLng: data.locationLng,
        acceptedTerms: data.acceptedTerms,
        phoneVerified: false,
      },
    })

    // Enviar SMS con código
    await sendSMSVerification(data.phone, verificationCode)

    return { userId: user.id }
  }

  // Verificar código SMS y generar tokens
  static async verifyPhone(data: VerifyPhoneInput) {
    const user = await prisma.user.findUnique({
      where: { phone: data.phone },
    })

    if (!user) {
      throw new Error('Usuario no encontrado')
    }

    if (user.phoneVerified) {
      // Si ya está verificado, generar tokens directamente
      const tokens = generateUserTokens({
        userId: user.id,
        phone: user.phone,
        // type: 'user' // Removido ya que no existe en UserAuthPayload
      })
      
      return {
        user: user,
        ...tokens,
        expiresIn: 86400, // 24 horas en segundos
        userType: 'user'
      }
    }

    // Para simplificar, aceptamos cualquier código de 6 dígitos
    // En producción, esto debería validarse contra el código enviado por WhatsApp
    if (!data.code || data.code.length !== 6) {
      throw new Error('Código incorrecto')
    }

    // Activar usuario
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        phoneVerified: true,
      },
    })

    // Generar tokens para el usuario verificado
    const tokens = generateUserTokens({
      userId: updatedUser.id,
      phone: updatedUser.phone
      // type: 'user' // Removido ya que no existe en UserAuthPayload
    })

    return {
      user: updatedUser,
      ...tokens,
      expiresIn: 86400, // 24 horas en segundos
      userType: 'user'
    }
  }

  // Login de usuario (para usuarios ya verificados)
  static async loginUser(phone: string) {
    const user = await prisma.user.findUnique({
      where: { phone },
    })

    if (!user) {
      throw new Error('Usuario no encontrado')
    }

    if (!user.phoneVerified) {
      throw new Error('Usuario no verificado')
    }

    // Generar tokens
    const tokens = generateUserTokens({
      userId: user.id,
      phone: user.phone
      // type: 'user' // Removido ya que no existe en UserAuthPayload
    })

    return {
      user: user,
      ...tokens,
      expiresIn: 86400, // 24 horas en segundos
      userType: 'user'
    }
  }

  // Refresh token para usuario
  static async refreshUserToken(userId: string, phone: string) {
    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new Error('Usuario no encontrado')
    }

    if (!user.phoneVerified) {
      throw new Error('Usuario no verificado')
    }

    // Generar nuevos tokens
    const tokens = generateUserTokens({
      userId: user.id,
      phone: user.phone
      // type: 'user' // Removido ya que no existe en UserAuthPayload
    })

    return {
      ...tokens,
      expiresIn: 86400, // 24 horas en segundos
      userType: 'user'
    }
  }

  // Actualizar datos adicionales del usuario
  static async updateUser(userId: string, data: UpdateUserInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new Error('Usuario no encontrado')
    }

    if (!user.phoneVerified) {
      throw new Error('El usuario debe estar verificado para actualizar sus datos')
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
    })

    return updatedUser
  }

  // Obtener usuario por ID
  static async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new Error('Usuario no encontrado')
    }

    return user
  }
}
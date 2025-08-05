import { PrismaClient } from '@prisma/client'
import { RegisterUserInput } from '../schemas/users'
import { 
  sendVerificationCodeWhatsApp, 
  generateVerificationCode, 
  storeVerificationCode,
  verifyCode,
  hasValidCode,
  validatePhoneNumber
} from '../utils/whatsapp'
import { generateUserTokens } from '../utils/jwt'

const prisma = new PrismaClient()

export class UsersService {
  /**
   * Registra un nuevo usuario y envía código de verificación por WhatsApp
   */
  async registerUser(userData: RegisterUserInput) {
    try {
      // Validar formato de teléfono
      if (!validatePhoneNumber(userData.phone)) {
        throw new Error('Formato de teléfono inválido')
      }

      // Verificar si el usuario ya existe por teléfono
      const existingUserByPhone = await prisma.user.findUnique({
        where: { phone: userData.phone }
      })

      if (existingUserByPhone) {
        throw new Error('El teléfono ya está registrado')
      }

      // Verificar si el usuario ya existe por email
      const existingUserByEmail = await prisma.user.findUnique({
        where: { email: userData.email }
      })

      if (existingUserByEmail) {
        throw new Error('El email ya está registrado')
      }

      // Crear usuario en la base de datos
      const user = await prisma.user.create({
        data: {
          fullName: userData.fullName,
          phone: userData.phone,
          email: userData.email,
          address: userData.address,
          locationLat: userData.locationLat,
          locationLng: userData.locationLng,
          acceptedTerms: userData.acceptedTerms,
          phoneVerified: false
        }
      })

      // Generar código de verificación
      const verificationCode = generateVerificationCode()
      
      // Almacenar código temporalmente (5 minutos)
      storeVerificationCode(userData.phone, verificationCode, 5)

      // Enviar código por WhatsApp
      await sendVerificationCodeWhatsApp(userData.phone, verificationCode)

      return {
        userId: user.id,
        message: 'Usuario registrado exitosamente. Código de verificación enviado por WhatsApp.'
      }

    } catch (error: any) {
      console.error('Error en registerUser:', error)
      throw error
    }
  }

  /**
   * Verifica el código de WhatsApp y activa la cuenta
   */
  async verifyPhone(phone: string, code: string) {
    try {
      // Verificar el código
      const isValidCode = verifyCode(phone, code)
      
      if (!isValidCode) {
        throw new Error('Código incorrecto o expirado')
      }

      // Buscar usuario por teléfono
      const user = await prisma.user.findUnique({
        where: { phone }
      })

      if (!user) {
        throw new Error('Usuario no encontrado')
      }

      // Marcar teléfono como verificado
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { phoneVerified: true }
      })

      // Generar tokens JWT
      const tokens = generateUserTokens({
        userId: user.id,
        phone: user.phone,
        // type: 'user' // Removido ya que no existe en UserAuthPayload
      })

      return {
        user: {
          id: updatedUser.id,
          fullName: updatedUser.fullName,
          phone: updatedUser.phone,
          email: updatedUser.email,
          phoneVerified: updatedUser.phoneVerified
        },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: 24 * 60 * 60 // 24 horas en segundos
      }

    } catch (error: any) {
      console.error('Error en verifyPhone:', error)
      throw error
    }
  }

  /**
   * Reenvía el código de verificación por WhatsApp
   */
  async resendCode(phone: string) {
    try {
      // Verificar si el usuario existe
      const user = await prisma.user.findUnique({
        where: { phone }
      })

      if (!user) {
        throw new Error('Usuario no encontrado')
      }

      if (user.phoneVerified) {
        throw new Error('El teléfono ya está verificado')
      }

      // Verificar si ya hay un código válido (para evitar spam)
      if (hasValidCode(phone)) {
        throw new Error('Ya se envió un código. Espera 5 minutos antes de solicitar otro.')
      }

      // Generar nuevo código
      const verificationCode = generateVerificationCode()
      
      // Almacenar código temporalmente
      storeVerificationCode(phone, verificationCode, 5)

      // Enviar código por WhatsApp
      await sendVerificationCodeWhatsApp(phone, verificationCode)

      return {
        message: 'Código reenviado por WhatsApp'
      }

    } catch (error: any) {
      console.error('Error en resendCode:', error)
      throw error
    }
  }

  /**
   * Obtiene el perfil del usuario autenticado
   */
  async getUserProfile(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })

      if (!user) {
        throw new Error('Usuario no encontrado')
      }

      return {
        id: user.id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        address: user.address,
        locationLat: user.locationLat,
        locationLng: user.locationLng,
        phoneVerified: user.phoneVerified,
        acceptedTerms: user.acceptedTerms,
        createdAt: user.createdAt
      }

    } catch (error: any) {
      console.error('Error en getUserProfile:', error)
      throw error
    }
  }

  /**
   * Actualiza el perfil del usuario autenticado
   */
  async updateUserProfile(userId: string, updateData: {
    fullName?: string;
    phone?: string;
    address?: string;
  }) {
    try {
      // Verificar que el usuario existe
      const existingUser = await prisma.user.findUnique({
        where: { id: userId }
      })

      if (!existingUser) {
        throw new Error('Usuario no encontrado')
      }

      // Si se está actualizando el teléfono, verificar que no esté en uso
      if (updateData.phone && updateData.phone !== existingUser.phone) {
        const phoneExists = await prisma.user.findUnique({
          where: { phone: updateData.phone }
        })

        if (phoneExists) {
          throw new Error('El número de teléfono ya está en uso')
        }
      }

      // Actualizar usuario
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(updateData.fullName && { fullName: updateData.fullName }),
          ...(updateData.phone && { phone: updateData.phone, phoneVerified: false }), // Si cambia teléfono, debe verificar nuevamente
          ...(updateData.address && { address: updateData.address })
        }
      })

      return {
        id: updatedUser.id,
        fullName: updatedUser.fullName,
        phone: updatedUser.phone,
        email: updatedUser.email,
        address: updatedUser.address,
        locationLat: updatedUser.locationLat,
        locationLng: updatedUser.locationLng,
        phoneVerified: updatedUser.phoneVerified,
        acceptedTerms: updatedUser.acceptedTerms,
        createdAt: updatedUser.createdAt
      }

    } catch (error: any) {
      console.error('Error en updateUserProfile:', error)
      throw error
    }
  }

  /**
   * Busca un usuario por ID
   */
  async getUserById(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })

      return user

    } catch (error: any) {
      console.error('Error en getUserById:', error)
      throw error
    }
  }

  /**
   * Busca un usuario por teléfono
   */
  async getUserByPhone(phone: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { phone }
      })

      return user

    } catch (error: any) {
      console.error('Error en getUserByPhone:', error)
      throw error
    }
  }

  /**
   * Obtiene un pedido específico del usuario autenticado
   */
  async getUserOrderById(userId: string, orderId: string) {
    try {
      // Verificar que el usuario existe
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })

      if (!user) {
        throw new Error('Usuario no encontrado')
      }

      // Obtener el pedido específico
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          business: {
            select: {
              id: true,
              name: true,
              phone: true,
              address: true
            }
          },
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  description: true,
                  image: true
                }
              }
            }
          }
        }
      })

      if (!order) {
        throw new Error('Pedido no encontrado')
      }

      // Verificar que el pedido pertenece al usuario
      if (order.userId !== userId) {
        throw new Error('No tienes permiso para ver este pedido')
      }

      // Formatear datos del pedido
      const formattedOrder = {
        id: order.id,
        status: order.status,
        total: order.total,
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        paymentMethod: order.paymentMethod,
        customerAddress: order.customerAddress,
        customerNotes: order.customerNotes,
        estimatedTime: order.estimatedTime,
        assignedDriver: order.assignedDriver,
        business: order.business,
        items: order.items.map(item => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes,
          product: item.product
        })),
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }

      return formattedOrder

    } catch (error: any) {
      console.error('Error en getUserOrderById:', error)
      throw error
    }
  }

  /**
   * Obtiene el historial de pedidos del usuario autenticado
   */
  async getUserOrders(userId: string) {
    try {
      // Verificar que el usuario existe
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })

      if (!user) {
        throw new Error('Usuario no encontrado')
      }

      // Obtener pedidos del usuario ordenados por fecha descendente
      const orders = await prisma.order.findMany({
        where: { userId },
        include: {
          business: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      // Formatear datos resumidos
      const formattedOrders = orders.map(order => ({
        id: order.id,
        estado: order.status,
        total: order.total,
        negocio: order.business?.name || 'Negocio no disponible',
        fecha: order.createdAt
      }))

      return formattedOrders

    } catch (error: any) {
      console.error('Error en getUserOrders:', error)
      throw error
    }
  }
}

export const usersService = new UsersService()
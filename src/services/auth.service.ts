import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { generateAdminTokens, verifyAdminRefreshToken } from '../utils/jwt'
import { LoginInput, RegisterAdminInput } from '../schemas/auth'

const prisma = new PrismaClient()

export class AuthService {
  
  // Login de administrador
  static async loginAdmin(data: LoginInput) {
    // Buscar admin por email
    const admin = await prisma.admin.findUnique({
      where: { email: data.email },
    })

    if (!admin) {
      throw new Error('Credenciales incorrectas')
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(data.password, admin.password)
    
    if (!isPasswordValid) {
      throw new Error('Credenciales incorrectas')
    }

    // Actualizar último acceso
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastAccess: new Date() }
    })

    // Generar tokens específicos para admin
    const tokens = generateAdminTokens({
      adminId: admin.id,
      email: admin.email,
      role: admin.role,
    })

    // Retornar datos del admin (sin contraseña) y tokens
    const { password, ...adminData } = admin
    
    return {
      admin: adminData,
      ...tokens,
      expiresIn: 3600, // 1 hora en segundos
      userType: 'admin'
    }
  }

  // Registrar nuevo administrador
  static async registerAdmin(data: RegisterAdminInput) {
    // Verificar que el email no existe
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: data.email },
    })

    if (existingAdmin) {
      throw new Error('Ya existe un administrador con este email')
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(data.password, 10)

    // Crear nuevo admin
    const admin = await prisma.admin.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name || 'Administrador',
      },
    })

    // Generar tokens específicos para admin
    const tokens = generateAdminTokens({
      adminId: admin.id,
      email: admin.email,
      role: admin.role,
    })

    // Retornar datos (sin contraseña) y tokens
    const { password, ...adminData } = admin
    
    return {
      admin: adminData,
      ...tokens,
      expiresIn: 3600, // 1 hora en segundos
      userType: 'admin'
    }
  }

  // Obtener información del admin por ID
  static async getAdminById(adminId: string) {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!admin) {
      throw new Error('Administrador no encontrado')
    }

    return admin
  }

  // Refresh token para admin
  static async refreshToken(adminId: string, email: string) {
    // Verificar que el admin existe
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
    })

    if (!admin) {
      throw new Error('Administrador no encontrado')
    }

    // Generar nuevos tokens específicos para admin
    const tokens = generateAdminTokens({
      adminId: admin.id,
      email: admin.email,
      role: admin.role,
    })

    return {
      ...tokens,
      expiresIn: 3600, // 1 hora en segundos
      userType: 'admin'
    }
  }
}
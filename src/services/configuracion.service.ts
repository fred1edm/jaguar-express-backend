import { PrismaClient } from '@prisma/client'
import { UpdateConfiguracionInput } from '../controllers/configuracion.controller.js'

const prisma = new PrismaClient()

export class ConfiguracionService {
  
  // Obtener configuración del sistema
  static async getConfiguracion() {
    // Buscar la configuración existente
    let configuracion = await prisma.configuracion.findFirst()
    
    // Si no existe, crear una con valores por defecto
    if (!configuracion) {
      configuracion = await prisma.configuracion.create({
        data: {
          nombreEmpresa: 'Jaguar Express',
          metodosPago: ['EFECTIVO', 'YAPE', 'PLIN'],
          horarioOperacion: {
            lunes: { abierto: true, inicio: '08:00', fin: '22:00' },
            martes: { abierto: true, inicio: '08:00', fin: '22:00' },
            miercoles: { abierto: true, inicio: '08:00', fin: '22:00' },
            jueves: { abierto: true, inicio: '08:00', fin: '22:00' },
            viernes: { abierto: true, inicio: '08:00', fin: '22:00' },
            sabado: { abierto: true, inicio: '08:00', fin: '22:00' },
            domingo: { abierto: false, inicio: '08:00', fin: '22:00' }
          },
          notificaciones: {
            email: true,
            sms: false,
            push: true,
            whatsapp: true
          },
          reglas: {
            tiempoMaximoEntrega: 60,
            montoMinimoDelivery: 15,
            radioCoberturaKm: 10,
            comisionPlataforma: 10
          },
          colores: {
            primario: '#1f2937',
            secundario: '#3b82f6',
            acento: '#10b981',
            fondo: '#f9fafb'
          }
        }
      })
    }
    
    return configuracion
  }

  // Actualizar configuración del sistema
  static async updateConfiguracion(data: UpdateConfiguracionInput) {
    // Obtener la configuración actual
    let configuracion = await prisma.configuracion.findFirst()
    
    if (!configuracion) {
      // Si no existe, crear una nueva con los datos proporcionados
      configuracion = await prisma.configuracion.create({
        data: {
          nombreEmpresa: data.nombreEmpresa || 'Jaguar Express',
          logoUrl: data.logoUrl,
          metodosPago: data.metodosPago || ['EFECTIVO', 'YAPE', 'PLIN'],
          horarioOperacion: data.horarioOperacion || {
            lunes: { abierto: true, inicio: '08:00', fin: '22:00' },
            martes: { abierto: true, inicio: '08:00', fin: '22:00' },
            miercoles: { abierto: true, inicio: '08:00', fin: '22:00' },
            jueves: { abierto: true, inicio: '08:00', fin: '22:00' },
            viernes: { abierto: true, inicio: '08:00', fin: '22:00' },
            sabado: { abierto: true, inicio: '08:00', fin: '22:00' },
            domingo: { abierto: false, inicio: '08:00', fin: '22:00' }
          },
          notificaciones: data.notificaciones || {
            email: true,
            sms: false,
            push: true,
            whatsapp: true
          },
          reglas: data.reglas || {
            tiempoMaximoEntrega: 60,
            montoMinimoDelivery: 15,
            radioCoberturaKm: 10,
            comisionPlataforma: 10
          },
          colores: data.colores || {
            primario: '#1f2937',
            secundario: '#3b82f6',
            acento: '#10b981',
            fondo: '#f9fafb'
          }
        }
      })
    } else {
      // Actualizar la configuración existente
      const updateData: any = {}
      
      if (data.nombreEmpresa !== undefined) updateData.nombreEmpresa = data.nombreEmpresa
      if (data.logoUrl !== undefined) updateData.logoUrl = data.logoUrl
      if (data.metodosPago !== undefined) updateData.metodosPago = data.metodosPago
      if (data.horarioOperacion !== undefined) updateData.horarioOperacion = data.horarioOperacion
      if (data.notificaciones !== undefined) updateData.notificaciones = data.notificaciones
      if (data.reglas !== undefined) updateData.reglas = data.reglas
      if (data.colores !== undefined) updateData.colores = data.colores
      
      configuracion = await prisma.configuracion.update({
        where: { id: configuracion.id },
        data: updateData
      })
    }
    
    return configuracion
  }
}
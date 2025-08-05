import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateAdminRole() {
  try {
    // Actualizar el administrador existente con rol de superadmin
    const updatedAdmin = await prisma.admin.update({
      where: {
        email: 'admin@jaguarexpress.com'
      },
      data: {
        role: 'SUPERADMIN',
        isActive: true
      }
    })

    console.log('✅ Administrador actualizado exitosamente:')
    console.log(`- Email: ${updatedAdmin.email}`)
    console.log(`- Nombre: ${updatedAdmin.name}`)
    console.log(`- Rol: ${updatedAdmin.role}`)
    console.log(`- Estado: ${updatedAdmin.isActive ? 'Activo' : 'Inactivo'}`)
    
  } catch (error) {
    console.error('❌ Error al actualizar administrador:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateAdminRole()
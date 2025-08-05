import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function verifyAdmin() {
  try {
    console.log('🔍 Verificando administrador...');
    
    // Buscar el administrador por email
    const admin = await prisma.admin.findUnique({
      where: {
        email: 'admin@jaguarexpress.com'
      }
    });
    
    if (!admin) {
      console.log('❌ El administrador no existe en la base de datos.');
      return;
    }
    
    console.log('✅ Administrador encontrado:');
    console.log(`ID: ${admin.id}`);
    console.log(`Email: ${admin.email}`);
    console.log(`Nombre: ${admin.name || 'No especificado'}`);
    console.log(`Fecha de creación: ${admin.createdAt}`);
    
    // Verificar la contraseña
    const passwordMatch = await bcrypt.compare('admin123', admin.password);
    
    if (passwordMatch) {
      console.log('✅ La contraseña almacenada corresponde a "admin123"');
    } else {
      console.log('❌ La contraseña almacenada NO corresponde a "admin123"');
    }
    
  } catch (error) {
    console.error('Error al verificar el administrador:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyAdmin();
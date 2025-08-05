import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // 1. Crear admins por defecto
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const hashedPassword2 = await bcrypt.hash('manager456', 10)
  
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@jaguarexpress.com' },
    update: {},
    create: {
      email: 'admin@jaguarexpress.com',
      password: hashedPassword,
      name: 'Administrador Principal',
    },
  })

  const admin2 = await prisma.admin.upsert({
    where: { email: 'manager@jaguarexpress.com' },
    update: {},
    create: {
      email: 'manager@jaguarexpress.com',
      password: hashedPassword2,
      name: 'Gerente de Operaciones',
    },
  })

  console.log('✅ Admins creados:', admin.email, 'y', admin2.email)

  // 2. Crear negocios de ejemplo
  const business1 = await prisma.business.create({
    data: {
      name: 'Pizza Palace',
      type: 'RESTAURANTE',
      description: 'Las mejores pizzas de la ciudad',
      address: 'Av. Principal 123, Centro',
      phone: '987654321',
      zone: 'Centro',
      schedule: {
        lunes: { open: '11:00', close: '23:00', isOpen: true },
        martes: { open: '11:00', close: '23:00', isOpen: true },
        miercoles: { open: '11:00', close: '23:00', isOpen: true },
        jueves: { open: '11:00', close: '23:00', isOpen: true },
        viernes: { open: '11:00', close: '23:30', isOpen: true },
        sabado: { open: '11:00', close: '23:30', isOpen: true },
        domingo: { open: '11:00', close: '22:00', isOpen: true },
      },
      deliveryFee: 5.0,
      minimumOrder: 20.0,
      rating: 4.5,
      reviewCount: 128,
      isPromoted: true,
    },
  })

  const business2 = await prisma.business.create({
    data: {
      name: 'Burger Master',
      type: 'RESTAURANTE',
      description: 'Hamburguesas artesanales',
      address: 'Calle Comercio 456, Centro',
      phone: '987654322',
      zone: 'Centro',
      schedule: {
        lunes: { open: '12:00', close: '22:00', isOpen: true },
        martes: { open: '12:00', close: '22:00', isOpen: true },
        miercoles: { open: '12:00', close: '22:00', isOpen: true },
        jueves: { open: '12:00', close: '22:00', isOpen: true },
        viernes: { open: '12:00', close: '23:00', isOpen: true },
        sabado: { open: '12:00', close: '23:00', isOpen: true },
        domingo: { open: '12:00', close: '21:00', isOpen: true },
      },
      deliveryFee: 4.0,
      minimumOrder: 25.0,
      rating: 4.3,
      reviewCount: 89,
      isPromoted: false,
    },
  })

  // 3. Crear productos para Pizza Palace
  await prisma.product.createMany({
    data: [
      {
        name: 'Pizza Margherita',
        description: 'Tomate, mozzarella y albahaca fresca',
        price: 25.90,
        category: 'Pizzas',
        businessId: business1.id,
        isPopular: true,
        preparationTime: 20,
      },
      {
        name: 'Pizza Pepperoni',
        description: 'Pepperoni, mozzarella y salsa de tomate',
        price: 28.90,
        category: 'Pizzas',
        businessId: business1.id,
        isPopular: true,
        preparationTime: 20,
      },
      {
        name: 'Pizza Hawaiana',
        description: 'Jamón, piña y mozzarella',
        price: 27.90,
        category: 'Pizzas',
        businessId: business1.id,
        preparationTime: 25,
      },
      {
        name: 'Lasagna Clásica',
        description: 'Carne, queso y salsa boloñesa',
        price: 32.90,
        category: 'Pastas',
        businessId: business1.id,
        preparationTime: 35,
      },
      {
        name: 'Gaseosa 1.5L',
        description: 'Coca Cola, Inca Kola o Sprite',
        price: 8.50,
        category: 'Bebidas',
        businessId: business1.id,
        preparationTime: 2,
      },
      {
        name: 'Agua Mineral',
        description: 'Agua mineral 500ml',
        price: 3.50,
        category: 'Bebidas',
        businessId: business1.id,
        preparationTime: 1,
      },
    ],
  })

  // 4. Crear productos para Burger Master
  await prisma.product.createMany({
    data: [
      {
        name: 'Burger Clásica',
        description: 'Carne, lechuga, tomate, cebolla y salsas',
        price: 18.90,
        category: 'Hamburguesas',
        businessId: business2.id,
        isPopular: true,
        preparationTime: 15,
      },
      {
        name: 'Burger BBQ',
        description: 'Carne, bacon, queso cheddar y salsa BBQ',
        price: 22.90,
        category: 'Hamburguesas',
        businessId: business2.id,
        isPopular: true,
        preparationTime: 18,
      },
      {
        name: 'Papas Fritas Grande',
        description: 'Papas fritas crujientes',
        price: 12.90,
        category: 'Acompañamientos',
        businessId: business2.id,
        preparationTime: 8,
      },
      {
        name: 'Nuggets x6',
        description: 'Nuggets de pollo con salsa',
        price: 15.90,
        category: 'Acompañamientos',
        businessId: business2.id,
        preparationTime: 12,
      },
      {
        name: 'Malteada de Vainilla',
        description: 'Malteada cremosa de vainilla',
        price: 14.90,
        category: 'Bebidas',
        businessId: business2.id,
        preparationTime: 5,
      },
    ],
  })

  console.log('✅ Negocios y productos creados')

  // 5. Crear repartidor de ejemplo
  await prisma.deliveryPerson.upsert({
    where: { phone: '987654321' },
    update: {},
    create: {
      name: 'Carlos López',
      phone: '987654321',
      email: 'carlos@jaguarexpress.com',
      vehicle: {
        type: 'moto',
        plate: 'ABC-123',
        model: 'Honda Wave',
      },
      status: 'DISPONIBLE',
      totalDeliveries: 45,
      rating: 4.8,
      totalReviews: 42,
    },
  })

  console.log('✅ Repartidor creado')
  console.log('🎉 Seed completado exitosamente!')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
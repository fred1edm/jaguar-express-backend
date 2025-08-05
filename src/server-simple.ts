import dotenv from 'dotenv'
import Fastify from 'fastify'
import cors from '@fastify/cors'

// Cargar variables de entorno
dotenv.config()

const app = Fastify({
  logger: {
    level: 'debug',
  },
})

// Registrar CORS
app.register(cors, {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://v0-jaguar-express-design.vercel.app',
    'https://jaguar-express-admin.vercel.app',
  ],
})

// Health check
app.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

// Mock login endpoint para testing
app.post('/api/admin/auth/login', async (request, reply) => {
  const { email, password } = request.body as { email: string; password: string }
  
  console.log('Login attempt:', { email, password })
  
  // Credenciales de prueba
  if (email === 'admin@jaguarexpress.com' && password === 'admin123') {
    return reply.send({
      success: true,
      data: {
        accessToken: 'mock-access-token-123',
        refreshToken: 'mock-refresh-token-456',
        admin: {
          id: '1',
          email: 'admin@jaguarexpress.com',
          name: 'Administrador',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        expiresIn: 3600
      },
      message: 'Login exitoso'
    })
  }
  
  return reply.status(400).send({
    success: false,
    error: 'Credenciales incorrectas',
    message: 'Error en login'
  })
})

// Mock profile endpoint
app.get('/api/admin/auth/me', async (request, reply) => {
  return reply.send({
    success: true,
    data: {
      id: '1',
      email: 'admin@jaguarexpress.com',
      name: 'Administrador',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    message: 'Perfil obtenido exitosamente'
  })
})

// Mock business stats endpoint
app.get('/api/admin/businesses/stats', async (request, reply) => {
  return reply.send({
    success: true,
    data: {
      totalBusinesses: 25,
      activeBusinesses: 20,
      pendingBusinesses: 3,
      rejectedBusinesses: 2,
      recentBusinesses: [
        {
          id: '1',
          name: 'Restaurante El Buen Sabor',
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Farmacia San José',
          status: 'pending',
          createdAt: new Date().toISOString()
        }
      ]
    },
    message: 'Estadísticas de negocios obtenidas exitosamente'
  })
})

// Mock orders stats endpoint
app.get('/api/admin/orders/stats', async (request, reply) => {
  return reply.send({
    success: true,
    data: {
      totalOrders: 150,
      ordersToday: 15,
      totalRevenue: 12500.00,
      averageOrderValue: 83.33,
      ordersByStatus: [
        { status: 'NUEVO', _count: { status: 5 } },
        { status: 'PREPARANDO', _count: { status: 3 } },
        { status: 'EN_CAMINO', _count: { status: 2 } },
        { status: 'ENTREGADO', _count: { status: 130 } }
      ],
      recentOrders: [
        {
          id: '1',
          customerName: 'Juan Pérez',
          businessName: 'Restaurante El Buen Sabor',
          total: 25.50,
          status: 'NUEVO',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          customerName: 'María García',
          businessName: 'Farmacia San José',
          total: 15.75,
          status: 'ENTREGADO',
          createdAt: new Date().toISOString()
        }
      ]
    },
    message: 'Estadísticas de órdenes obtenidas exitosamente'
  })
})

// Mock refresh token endpoint
app.post('/api/admin/auth/refresh', async (request, reply) => {
  return reply.send({
    success: true,
    data: {
      accessToken: 'mock-refreshed-access-token-789',
      refreshToken: 'mock-refreshed-refresh-token-012',
      admin: {
        id: '1',
        email: 'admin@jaguarexpress.com',
        name: 'Administrador',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      expiresIn: 3600
    },
    message: 'Token renovado exitosamente'
  })
})

// Mock validate token endpoint
app.get('/api/admin/auth/validate', async (request, reply) => {
  return reply.send({
    success: true,
    data: {
      valid: true,
      expiresAt: Date.now() + 3600000,
      admin: {
        id: '1',
        email: 'admin@jaguarexpress.com',
        name: 'Administrador',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    },
    message: 'Token válido'
  })
})

// Mock logout endpoint
app.post('/api/admin/auth/logout', async (request, reply) => {
  return reply.send({
    success: true,
    message: 'Logout exitoso'
  })
})

// Mock businesses list endpoint
app.get('/api/admin/businesses', async (request, reply) => {
  return reply.send({
    success: true,
    data: {
      businesses: [
        {
          id: '1',
          name: 'Restaurante El Buen Sabor',
          email: 'contacto@elbuensabor.com',
          phone: '+1234567890',
          address: 'Calle Principal 123',
          category: 'Restaurante',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Farmacia San José',
          email: 'info@farmaciasanjose.com',
          phone: '+0987654321',
          address: 'Avenida Central 456',
          category: 'Farmacia',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1
      }
    },
    message: 'Negocios obtenidos exitosamente'
  })
})

// Mock single business endpoint
app.get('/api/admin/businesses/:id', async (request, reply) => {
  const { id } = request.params as { id: string }
  return reply.send({
    success: true,
    data: {
      id,
      name: 'Restaurante El Buen Sabor',
      email: 'contacto@elbuensabor.com',
      phone: '+1234567890',
      address: 'Calle Principal 123',
      category: 'Restaurante',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    message: 'Negocio obtenido exitosamente'
  })
})

// Mock create business endpoint
app.post('/api/admin/businesses', async (request, reply) => {
  return reply.send({
    success: true,
    data: {
      id: '3',
      name: 'Nuevo Negocio',
      email: 'nuevo@negocio.com',
      phone: '+1111111111',
      address: 'Nueva Dirección 789',
      category: 'Tienda',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    message: 'Negocio creado exitosamente'
  })
})

// Mock update business endpoint
app.put('/api/admin/businesses/:id', async (request, reply) => {
  const { id } = request.params as { id: string }
  return reply.send({
    success: true,
    data: {
      id,
      name: 'Negocio Actualizado',
      email: 'actualizado@negocio.com',
      phone: '+2222222222',
      address: 'Dirección Actualizada 999',
      category: 'Tienda',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    message: 'Negocio actualizado exitosamente'
  })
})

// Mock delete business endpoint
app.delete('/api/admin/businesses/:id', async (request, reply) => {
  return reply.send({
    success: true,
    message: 'Negocio eliminado exitosamente'
  })
})

// Mock toggle business status endpoint
app.put('/api/admin/businesses/:id/toggle-status', async (request, reply) => {
  const { id } = request.params as { id: string }
  return reply.send({
    success: true,
    data: {
      id,
      name: 'Restaurante El Buen Sabor',
      email: 'contacto@elbuensabor.com',
      phone: '+1234567890',
      address: 'Calle Principal 123',
      category: 'Restaurante',
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    message: 'Estado del negocio actualizado exitosamente'
  })
})

// Mock orders list endpoint
app.get('/api/admin/orders', async (request, reply) => {
  return reply.send({
    success: true,
    data: {
      orders: [
        {
          id: '1',
          customerName: 'Juan Pérez',
          customerEmail: 'juan@email.com',
          businessName: 'Restaurante El Buen Sabor',
          total: 25.50,
          status: 'NUEVO',
          items: [
            {
              name: 'Hamburguesa',
              quantity: 1,
              price: 15.50
            },
            {
              name: 'Papas Fritas',
              quantity: 1,
              price: 10.00
            }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          customerName: 'María García',
          customerEmail: 'maria@email.com',
          businessName: 'Farmacia San José',
          total: 15.75,
          status: 'ENTREGADO',
          items: [
            {
              name: 'Medicamento A',
              quantity: 1,
              price: 15.75
            }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1
      }
    },
    message: 'Órdenes obtenidas exitosamente'
  })
})

// Mock single order endpoint
app.get('/api/admin/orders/:id', async (request, reply) => {
  const { id } = request.params as { id: string }
  return reply.send({
    success: true,
    data: {
      id,
      customerName: 'Juan Pérez',
      customerEmail: 'juan@email.com',
      businessName: 'Restaurante El Buen Sabor',
      total: 25.50,
      status: 'NUEVO',
      items: [
        {
          name: 'Hamburguesa',
          quantity: 1,
          price: 15.50
        },
        {
          name: 'Papas Fritas',
          quantity: 1,
          price: 10.00
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    message: 'Orden obtenida exitosamente'
  })
})

// Mock update order status endpoint
app.put('/api/admin/orders/:id/status', async (request, reply) => {
  const { id } = request.params as { id: string }
  return reply.send({
    success: true,
    data: {
      id,
      customerName: 'Juan Pérez',
      customerEmail: 'juan@email.com',
      businessName: 'Restaurante El Buen Sabor',
      total: 25.50,
      status: 'PREPARANDO',
      items: [
        {
          name: 'Hamburguesa',
          quantity: 1,
          price: 15.50
        },
        {
          name: 'Papas Fritas',
          quantity: 1,
          price: 10.00
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    message: 'Estado de la orden actualizado exitosamente'
  })
})

const PORT = process.env.PORT || 3001

const start = async () => {
  try {
    await app.listen({ port: Number(PORT), host: '0.0.0.0' })
    console.log(`🚀 Servidor simple corriendo en puerto ${PORT}`)
    console.log(`🔗 Health check: http://localhost:${PORT}/health`)
    console.log(`📱 Login endpoint: http://localhost:${PORT}/api/admin/auth/login`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
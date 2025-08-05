import fetch from 'node-fetch'

const BASE_URL = 'http://localhost:3001/api/admin'

interface LoginResponse {
  success: boolean
  data: {
    admin: {
      id: string
      email: string
      name: string
      role: string
    }
    accessToken: string
    refreshToken: string
    expiresIn: number
    userType: string
  }
}

interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  lastAccess: string | null
  createdAt: string
  updatedAt: string
}

interface ApiResponse {
  success: boolean
  data?: any
  message?: string
}

async function testAdminUsersAPI() {
  try {
    console.log('🔐 Iniciando sesión como superadmin...')
    
    // 1. Login como superadmin
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@jaguarexpress.com',
        password: 'admin123'
      })
    })

    const loginData = await loginResponse.json() as LoginResponse
    
    if (!loginData.success) {
      throw new Error('Error en login')
    }

    const token = loginData.data.accessToken
    console.log('✅ Login exitoso')
    console.log(`- Rol: ${loginData.data.admin.role}`)
    
    // 2. Listar administradores
    console.log('\n📋 Obteniendo lista de administradores...')
    const listResponse = await fetch(`${BASE_URL}/usuarios`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    const listData = await listResponse.json() as ApiResponse
    console.log('✅ Lista obtenida:')
    console.log(`- Total de administradores: ${listData.data?.length || 0}`)
    
    if (listData.data && listData.data.length > 0) {
      listData.data.forEach((admin: AdminUser, index: number) => {
        console.log(`  ${index + 1}. ${admin.name} (${admin.email}) - Rol: ${admin.role} - Estado: ${admin.isActive ? 'Activo' : 'Inactivo'}`)
      })
    }

    // 3. Crear nuevo administrador
    console.log('\n➕ Creando nuevo administrador...')
    const createResponse = await fetch(`${BASE_URL}/usuarios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Editor de Prueba',
        email: 'editor@jaguarexpress.com',
        password: 'editor123',
        role: 'EDITOR'
      })
    })

    const createData = await createResponse.json() as ApiResponse
    
    if (createData.success) {
      console.log('✅ Administrador creado exitosamente:')
      console.log(`- ID: ${createData.data.id}`)
      console.log(`- Nombre: ${createData.data.name}`)
      console.log(`- Email: ${createData.data.email}`)
      console.log(`- Rol: ${createData.data.role}`)
    } else {
      console.log('❌ Error al crear administrador:', createData.message)
    }

    // 4. Listar administradores nuevamente
    console.log('\n📋 Lista actualizada de administradores...')
    const listResponse2 = await fetch(`${BASE_URL}/usuarios`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    const listData2 = await listResponse2.json() as ApiResponse
    console.log(`- Total de administradores: ${listData2.data?.length || 0}`)
    
    if (listData2.data && listData2.data.length > 0) {
      listData2.data.forEach((admin: AdminUser, index: number) => {
        console.log(`  ${index + 1}. ${admin.name} (${admin.email}) - Rol: ${admin.role} - Estado: ${admin.isActive ? 'Activo' : 'Inactivo'}`)
      })
    }

    // 5. Intentar eliminar el administrador recién creado
    if (createData.success && createData.data.id) {
      console.log('\n🗑️ Eliminando administrador de prueba...')
      const deleteResponse = await fetch(`${BASE_URL}/usuarios/${createData.data.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const deleteData = await deleteResponse.json() as ApiResponse
      
      if (deleteData.success) {
        console.log('✅ Administrador eliminado exitosamente')
      } else {
        console.log('❌ Error al eliminar administrador:', deleteData.message)
      }
    }

    console.log('\n🎉 Pruebas completadas exitosamente')
    
  } catch (error) {
    console.error('❌ Error en las pruebas:', error)
  }
}

testAdminUsersAPI()
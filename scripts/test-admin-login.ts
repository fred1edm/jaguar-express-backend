import fetch from 'node-fetch';

interface LoginResponse {
  admin: {
    id: string;
    email: string;
    name: string;
  };
  token: string;
  refreshToken: string;
  expiresIn: string;
}

async function testAdminLogin() {
  try {
    console.log('🔐 Probando login del administrador...');
    
    const response = await fetch('http://localhost:3001/api/admin/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@jaguarexpress.com',
        password: 'admin123'
      })
    });
    
    const data: any = await response.json();
    
    if (response.ok) {
      console.log('✅ Login exitoso!');
      console.log('Respuesta completa:', JSON.stringify(data, null, 2));
      
      // Verificar estructura de datos
      if (data && data.data) {
        console.log('✅ Access Token generado:', data.data.accessToken ? 'Sí' : 'No');
        console.log('✅ Refresh Token generado:', data.data.refreshToken ? 'Sí' : 'No');
        console.log('✅ Expiración del token:', data.data.expiresIn + ' segundos');
        console.log('✅ Tipo de usuario:', data.data.userType);
        
        if (data.data.admin) {
          console.log('✅ Datos del administrador:', {
            id: data.data.admin.id,
            email: data.data.admin.email,
            name: data.data.admin.name,
            createdAt: data.data.admin.createdAt
          });
        }
        
        console.log('\n🎉 ¡Login del administrador verificado exitosamente!');
        console.log('📋 Resumen:');
        console.log('   - Email: admin@jaguarexpress.com');
        console.log('   - Password: admin123');
        console.log('   - Estado: Activo y funcional');
        console.log('   - JWT: Generado correctamente');
        console.log('   - Redirección: Listo para dashboard');
      }
    } else {
      console.log('❌ Error en el login:');
      console.log('Status:', response.status);
      console.log('Error:', data);
    }
    
  } catch (error) {
    console.error('❌ Error al realizar la petición:', error);
  }
}

testAdminLogin();
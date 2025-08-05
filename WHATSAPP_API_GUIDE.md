# 📱 Guía de API de WhatsApp - Jaguar Express

## 🔧 Configuración Inicial

### Variables de Entorno
Agrega estas variables a tu archivo `.env`:

```env
# WhatsApp API Configuration
WHATSAPP_API_TOKEN=your_whatsapp_api_token_here
PHONE_NUMBER_ID=your_phone_number_id_here
JWT_SECRET_USER=your_user_jwt_secret_here
```

### Obtener Credenciales de WhatsApp

1. **Crear una App en Meta for Developers:**
   - Ve a https://developers.facebook.com/
   - Crea una nueva app de tipo "Business"
   - Agrega el producto "WhatsApp Business API"

2. **Configurar WhatsApp Business API:**
   - Obtén tu `PHONE_NUMBER_ID` desde la consola
   - Genera un `WHATSAPP_API_TOKEN` permanente
   - Configura un webhook (opcional para recibir respuestas)

3. **Template de Verificación (Recomendado):**
   ```json
   {
     "name": "verification_code",
     "language": "es",
     "category": "AUTHENTICATION",
     "components": [
       {
         "type": "BODY",
         "text": "Tu código de verificación para Jaguar Express es: {{1}}. Este código expira en 5 minutos."
       }
     ]
   }
   ```

## 🚀 Endpoints Disponibles

### 1. Registro de Usuario

**POST** `/api/users/register`

```bash
curl -X POST http://localhost:3001/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Juan Pérez",
    "phone": "+51987654321",
    "email": "juan@example.com",
    "address": "Av. Principal 123, Lima",
    "locationLat": -12.0464,
    "locationLng": -77.0428,
    "acceptedTerms": true
  }'
```

**Respuesta Exitosa (201):**
```json
{
  "success": true,
  "data": {
    "userId": "clp123abc456def789",
    "message": "Usuario registrado exitosamente. Código de verificación enviado por WhatsApp."
  },
  "message": "Usuario registrado exitosamente"
}
```

**Respuesta de Error (409):**
```json
{
  "success": false,
  "error": "El teléfono ya está registrado",
  "message": "Conflicto en el registro"
}
```

### 2. Verificación de Teléfono

**POST** `/api/users/verify-phone`

```bash
curl -X POST http://localhost:3001/api/users/verify-phone \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+51987654321",
    "code": "123456"
  }'
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clp123abc456def789",
      "fullName": "Juan Pérez",
      "phone": "+51987654321",
      "email": "juan@example.com",
      "phoneVerified": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400
  },
  "message": "Teléfono verificado exitosamente"
}
```

### 3. Reenvío de Código

**POST** `/api/users/resend-code`

```bash
curl -X POST http://localhost:3001/api/users/resend-code \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+51987654321"
  }'
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "message": "Código reenviado por WhatsApp"
  },
  "message": "Código reenviado exitosamente"
}
```

### 4. Perfil de Usuario

**GET** `/api/users/me`

```bash
curl -X GET http://localhost:3001/api/users/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "id": "clp123abc456def789",
    "fullName": "Juan Pérez",
    "phone": "+51987654321",
    "email": "juan@example.com",
    "address": "Av. Principal 123, Lima",
    "locationLat": -12.0464,
    "locationLng": -77.0428,
    "phoneVerified": true,
    "acceptedTerms": true,
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Perfil obtenido exitosamente"
}
```

## 🔐 Autenticación

Las rutas protegidas requieren un token JWT en el header:

```
Authorization: Bearer <access_token>
```

El token se obtiene después de verificar el teléfono exitosamente.

## 📋 Validaciones

### Formato de Teléfono
- Debe estar en formato internacional: `+[código_país][número]`
- Ejemplos válidos: `+51987654321`, `+1234567890`
- Longitud: 10-15 dígitos después del `+`

### Código de Verificación
- Exactamente 6 dígitos numéricos
- Válido por 5 minutos
- Máximo 3 intentos de verificación

### Datos de Usuario
- **fullName**: 2-100 caracteres, solo letras y espacios
- **email**: Formato de email válido
- **address**: 10-200 caracteres
- **acceptedTerms**: Debe ser `true`

## 🚨 Códigos de Error

| Código | Descripción |
|--------|-------------|
| 400 | Datos inválidos o código incorrecto |
| 401 | Token requerido o inválido |
| 403 | Teléfono no verificado |
| 404 | Usuario no encontrado |
| 409 | Teléfono o email ya registrado |
| 429 | Demasiadas solicitudes (rate limit) |
| 503 | Error en servicio de WhatsApp |

## 🧪 Testing

### Modo de Desarrollo
En desarrollo, puedes usar códigos de prueba:

```javascript
// En utils/whatsapp.ts, agregar para testing:
if (process.env.NODE_ENV === 'development' && code === '000000') {
  console.log('🧪 Código de prueba usado en desarrollo')
  return // No enviar WhatsApp real
}
```

### Postman Collection
Importa esta colección para probar los endpoints:

```json
{
  "info": {
    "name": "Jaguar Express - WhatsApp API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Registrar Usuario",
      "request": {
        "method": "POST",
        "header": [{
          "key": "Content-Type",
          "value": "application/json"
        }],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"fullName\": \"Juan Pérez\",\n  \"phone\": \"+51987654321\",\n  \"email\": \"juan@example.com\",\n  \"address\": \"Av. Principal 123, Lima\",\n  \"locationLat\": -12.0464,\n  \"locationLng\": -77.0428,\n  \"acceptedTerms\": true\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/api/users/register",
          "host": ["{{baseUrl}}"],
          "path": ["api", "users", "register"]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3001"
    }
  ]
}
```

## 🔄 Flujo Completo

1. **Usuario se registra** → Recibe código por WhatsApp
2. **Usuario ingresa código** → Obtiene tokens JWT
3. **Usuario usa token** → Accede a rutas protegidas
4. **Token expira** → Usar refresh token o re-autenticar

## 📞 Soporte

Para problemas con la API de WhatsApp:
- Verificar que el token no haya expirado
- Confirmar que el número de teléfono esté verificado en Meta
- Revisar logs del servidor para errores específicos
- Consultar documentación oficial: https://developers.facebook.com/docs/whatsapp

---

✅ **¡API de WhatsApp lista para usar!** 🚀
# Despliegue de Jaguar Express Backend en Railway

## Variables de Entorno Requeridas

Configura las siguientes variables de entorno en Railway:

### Variables Obligatorias

```
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
JWT_REFRESH_SECRET=tu_jwt_refresh_secret_muy_seguro_aqui
NODE_ENV=production
```

### Variables de Cloudinary (Opcionales)

```
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

### Variables de Configuración de Archivos (Opcionales)

```
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp
```

### Variables de Admin por Defecto (Opcionales)

```
DEFAULT_ADMIN_EMAIL=admin@jaguarexpress.com
DEFAULT_ADMIN_PASSWORD=admin123
```

## Notas Importantes

1. **DATABASE_URL**: Railway proporcionará automáticamente esta variable cuando agregues una base de datos PostgreSQL
2. **JWT_SECRET y JWT_REFRESH_SECRET**: Genera secretos seguros de al menos 32 caracteres
3. **NODE_ENV**: Debe estar configurado como 'production' para el entorno de producción
4. **Puerto**: No es necesario configurar PORT ya que Railway lo maneja automáticamente

## Configuración de Base de Datos

Railway creará automáticamente la variable DATABASE_URL cuando agregues un servicio de PostgreSQL. Esta URL tendrá el formato:

```
postgresql://postgres:password@host:port/railway
```

## Verificación del Despliegue

Una vez desplegado, puedes verificar que el backend esté funcionando accediendo a:

- `https://tu-app.railway.app/health` - Endpoint de salud
- `https://tu-app.railway.app/api/admin/configuracion` - Endpoint de configuración (requiere autenticación)

## Comandos de Build y Start

El proyecto está configurado con:

- **Build**: `npm run build` (ejecuta `prisma generate && tsc`)
- **Start**: `npm start` (ejecuta `node dist/server.js`)

Estos comandos están definidos en `railway.json` y `Procfile`.

## Instrucciones Paso a Paso para Despliegue en Railway

### Paso 1: Preparar el Repositorio

1. Asegúrate de que tu código esté en un repositorio de GitHub
2. Confirma que todos los archivos de configuración estén presentes:
   - `railway.json`
   - `Procfile`
   - `.railwayignore`
   - `package.json`
   - `prisma/schema.prisma`

### Paso 2: Crear Cuenta en Railway

1. Ve a [railway.app](https://railway.app)
2. Regístrate o inicia sesión con tu cuenta de GitHub
3. Autoriza a Railway para acceder a tus repositorios

### Paso 3: Crear Nuevo Proyecto

1. En el dashboard de Railway, haz clic en "New Project"
2. Selecciona "Deploy from GitHub repo"
3. Busca y selecciona tu repositorio `jaguar-express-backend`
4. Railway detectará automáticamente que es un proyecto Node.js

### Paso 4: Configurar Base de Datos PostgreSQL

1. En tu proyecto de Railway, haz clic en "+ New"
2. Selecciona "Database" → "Add PostgreSQL"
3. Railway creará automáticamente la base de datos y la variable `DATABASE_URL`
4. La base de datos estará disponible inmediatamente

### Paso 5: Configurar Variables de Entorno

1. Ve a la pestaña "Variables" en tu servicio
2. Agrega las siguientes variables una por una:

```
JWT_SECRET=tu_jwt_secret_muy_seguro_de_al_menos_32_caracteres
JWT_REFRESH_SECRET=tu_jwt_refresh_secret_muy_seguro_de_al_menos_32_caracteres
NODE_ENV=production
```

3. (Opcional) Si usas Cloudinary, agrega:

```
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

### Paso 6: Configurar el Despliegue

1. Railway detectará automáticamente el `railway.json` y usará la configuración
2. El build se ejecutará automáticamente: `npm install && npm run build`
3. El servidor se iniciará con: `npm start`
4. Railway asignará automáticamente un puerto y dominio

### Paso 7: Verificar el Despliegue

1. Espera a que el despliegue se complete (usualmente 2-5 minutos)
2. Railway te proporcionará una URL pública (ej: `https://tu-app.railway.app`)
3. Verifica que el backend esté funcionando:
   - Accede a `https://tu-app.railway.app/health`
   - Deberías ver una respuesta JSON indicando que el servidor está funcionando

### Paso 8: Configurar Dominio Personalizado (Opcional)

1. Ve a la pestaña "Settings" de tu servicio
2. En "Domains", haz clic en "Generate Domain" para obtener un dominio de Railway
3. O agrega tu propio dominio personalizado si tienes uno

### Paso 9: Configurar Migraciones de Base de Datos

1. Una vez desplegado, las migraciones de Prisma se ejecutarán automáticamente
2. Si necesitas ejecutar migraciones manualmente:
   - Ve a la pestaña "Deployments"
   - Haz clic en "View Logs" para ver el proceso de build
   - Las migraciones se ejecutan durante el build con `prisma generate`

### Paso 10: Monitoreo y Logs

1. Ve a la pestaña "Deployments" para ver el historial de despliegues
2. Haz clic en "View Logs" para ver los logs en tiempo real
3. Usa la pestaña "Metrics" para monitorear el rendimiento

## Solución de Problemas Comunes

### Error de Build
- Verifica que todas las dependencias estén en `package.json`
- Revisa los logs de build en Railway
- Asegúrate de que `npm run build` funcione localmente

### Error de Conexión a Base de Datos
- Verifica que la variable `DATABASE_URL` esté configurada
- Asegúrate de que el servicio de PostgreSQL esté ejecutándose
- Revisa los logs para errores de conexión

### Error de Variables de Entorno
- Verifica que todas las variables requeridas estén configuradas
- Asegúrate de que no haya espacios en blanco en los valores
- Reinicia el servicio después de cambiar variables

### Puerto o Host Incorrecto
- Railway maneja automáticamente el puerto con `process.env.PORT`
- El host debe estar configurado como `0.0.0.0` (ya configurado en `server.ts`)

## Comandos Útiles para Desarrollo Local

```bash
# Instalar dependencias
npm install

# Generar cliente de Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev

# Build del proyecto
npm run build

# Iniciar en modo desarrollo
npm run dev

# Iniciar en modo producción
npm start
```
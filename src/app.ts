import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import multipart from '@fastify/multipart'  // ← NUEVO
import fastifyStatic from '@fastify/static'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Importar rutas
import adminRoutes from './routes/admin'
import publicRoutes from './routes/public'
import userRoutes from './routes/user.routes'

const app = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  },
})

// Registrar plugins
app.register(helmet)
app.register(cors, {
  origin: [
    'http://localhost:3000', // Admin Panel local
    'https://v0-jaguar-express-design.vercel.app', // Webview
    'https://jaguar-express-admin.vercel.app', // Admin Panel producción
  ],
})

app.register(rateLimit, {
  max: 100, // máximo 100 requests
  timeWindow: '1 minute', // por minuto
})

// Registrar multipart para subida de archivos  ← NUEVO
app.register(multipart, {
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB
    files: 1, // máximo 1 archivo por request
  },
})

// Health check
app.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

// Registrar rutas API
app.register(adminRoutes, { prefix: '/api/admin' })
app.register(publicRoutes, { prefix: '/api' })
app.register(userRoutes, { prefix: '/api/users' })

// Servir archivos estáticos del frontend
// app.register(fastifyStatic, {
//   root: path.join(__dirname, '../../jaguar-express-admin/dist'),
//   prefix: '/',
//   decorateReply: false
// })

export default app
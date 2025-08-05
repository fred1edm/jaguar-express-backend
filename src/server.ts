import dotenv from 'dotenv'
import app from './app'

// Cargar variables de entorno
dotenv.config()

const PORT = process.env.PORT || 3001

const start = async () => {
  try {
    await app.listen({ port: Number(PORT), host: '0.0.0.0' })
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`)
    console.log(`🔗 Health check: http://localhost:${PORT}/health`)
    console.log(`📱 Admin API: http://localhost:${PORT}/api/admin`)
    console.log(`🌐 Public API: http://localhost:${PORT}/api`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
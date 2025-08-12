import dotenv from 'dotenv'
import app from './app.js'

// Servidor actualizado para puerto 3003

// Cargar variables de entorno
dotenv.config()

const PORT = process.env.PORT || 3001

const start = async () => {
  try {
    await app.listen({ port: Number(PORT), host: '0.0.0.0' })
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
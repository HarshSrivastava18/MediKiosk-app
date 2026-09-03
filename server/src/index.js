import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { config } from './config/index.js'
import { initSocket } from './services/socketService.js'
import { errorHandler } from './middleware/errorHandler.js'

// Import Routes
import authRoutes from './routes/auth.routes.js'
import patientRoutes from './routes/patient.routes.js'
import doctorRoutes from './routes/doctor.routes.js'
import hospitalRoutes from './routes/hospital.routes.js'
import adminRoutes from './routes/admin.routes.js'
import consentRoutes from './routes/consent.routes.js'
import aiRoutes from './routes/ai.routes.js'

const app = express()
const server = http.createServer(app)

// Initialize Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }
})

initSocket(io)

// Security & Middleware
app.use(helmet())
app.use(cors({ origin: '*' }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(morgan('dev'))

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'MediKiosk National Health Platform',
    version: '2.1.0-prod',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  })
})

// Mount API Subsystems
app.use('/api/auth', authRoutes)
app.use('/api/patient', patientRoutes)
app.use('/api/doctor', doctorRoutes)
app.use('/api/hospital', hospitalRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/consent', consentRoutes)
app.use('/api/ai', aiRoutes)

// Centralized Error Handling
app.use(errorHandler)

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use by another process.`)
    console.error(`💡 Tip: Run 'Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess -Force' to free it.`)
    process.exit(1)
  } else {
    console.error('Server error:', err)
  }
})

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`=======================================================`)
  console.log(`🚀 MediKiosk National Health API Server Live`)
  console.log(`📡 URL: http://localhost:${PORT}`)
  console.log(`🩺 Health check: http://localhost:${PORT}/api/health`)
  console.log(`🔒 Environment: ${config.nodeEnv}`)
  console.log(`⚡ WebSockets: Socket.io attached`)
  console.log(`=======================================================`)
})

export { app, server }

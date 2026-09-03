let ioInstance = null

export function initSocket(io) {
  ioInstance = io

  io.on('connection', (socket) => {
    console.log(`[WebSocket] Client connected: ${socket.id}`)

    socket.on('join_room', ({ role, id }) => {
      const room = `${role}_${id || 'global'}`
      socket.join(room)
      console.log(`[WebSocket] Socket ${socket.id} joined room: ${room}`)
    })

    socket.on('disconnect', () => {
      console.log(`[WebSocket] Client disconnected: ${socket.id}`)
    })
  })

  return ioInstance
}

export function emitRedFlagAlert(payload) {
  if (ioInstance) {
    ioInstance.emit('alert:red_flag', {
      ...payload,
      timestamp: new Date().toISOString()
    })
    console.log(`[WebSocket Broadcast] Red Flag Alert emitted for patient: ${payload.patientId}`)
  }
}

export function emitQueueUpdate(hospitalId, payload) {
  if (ioInstance) {
    ioInstance.to(`hospital_${hospitalId}`).emit('update:opd_queue', payload)
    ioInstance.emit('update:opd_queue', payload)
  }
}

export function emitVerificationUpdate(payload) {
  if (ioInstance) {
    ioInstance.emit('update:verification_queue', payload)
  }
}

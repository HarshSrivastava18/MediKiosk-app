import jwt from 'jsonwebtoken'
import { config } from '../config/index.js'
import { db } from '../db/store.js'

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please provide a valid Bearer token.'
    })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, config.jwtSecret)
    const user = db.users.find((u) => u.id === decoded.id)

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User session expired or user not found.'
      })
    }

    req.user = {
      id: user.id,
      role: user.role,
      name: user.name,
      entityId: user.entityId,
      org: user.org,
      username: user.username
    }

    next()
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token. Please log in again.'
    })
  }
}

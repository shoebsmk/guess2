import { createClient } from 'redis'

let redisClient: any = null

// Create Redis client only if Redis is configured
if (process.env.REDIS_URL || process.env.NODE_ENV !== 'production') {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    })

    redisClient.on('error', (err: Error) => {
      console.warn('Redis Client Error (optional):', err.message)
    })

    redisClient.on('connect', () => {
      console.log('Connected to Redis')
    })

    // Attempt to connect
    redisClient.connect().catch((err: Error) => {
      console.warn('Redis connection failed (optional):', err.message)
    })
  } catch (error) {
    console.warn('Failed to initialize Redis client (optional):', error)
    redisClient = null
  }
}

export const connectRedis = async () => {
  if (!redisClient) {
    console.log('Redis not configured, using fallback')
    return
  }
  
  try {
    await redisClient.connect()
  } catch (error) {
    console.warn('Failed to connect to Redis (optional):', error)
  }
}

// Create a fallback Redis-like interface
const fallbackRedis = {
  get: async () => null,
  setEx: async () => {},
  del: async () => {},
}

export default redisClient || fallbackRedis
import express, { type Request, type Response, type NextFunction } from 'express'
import { supabase } from '../config/supabase.js'
import redisClient from '../config/redis.js'

const router = express.Router()

// Cache TTL in seconds (5 minutes)
const CACHE_TTL = 300

interface LeaderboardEntry {
  user_id: string
  username: string
  total_points: number
  games_played: number
  average_score: number
  rank: number
}

// Get global leaderboard
router.get('/global', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cacheKey = 'leaderboard:global'
    
    // Try to get from cache first
    const cachedData = await redisClient.get(cacheKey)
    if (cachedData) {
      return res.json({
        success: true,
        data: JSON.parse(cachedData),
        cached: true,
      })
    }

    // Fetch from database
    const { data, error } = await supabase
      .from('users')
      .select('id, username, total_points, games_played')
      .order('total_points', { ascending: false })
      .limit(100)

    if (error) throw error

    // Calculate ranks and format data
    const leaderboardData = data.map((user, index) => ({
      user_id: user.id,
      username: user.username,
      total_points: user.total_points,
      games_played: user.games_played,
      average_score: user.games_played > 0 ? Math.round(user.total_points / user.games_played) : 0,
      rank: index + 1,
    }))

    // Cache the result
    await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(leaderboardData))

    res.json({
      success: true,
      data: leaderboardData,
      cached: false,
    })
  } catch (error) {
    next(error)
  }
})

// Get weekly leaderboard
router.get('/weekly', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cacheKey = 'leaderboard:weekly'
    
    // Try to get from cache first
    const cachedData = await redisClient.get(cacheKey)
    if (cachedData) {
      return res.json({
        success: true,
        data: JSON.parse(cachedData),
        cached: true,
      })
    }

    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    // Fetch weekly scores from user_challenges
    const { data, error } = await supabase
      .from('user_challenges')
      .select(`
        user_id,
        score,
        completed_at,
        users!inner(username)
      `)
      .gte('completed_at', oneWeekAgo.toISOString())
      .not('score', 'is', null)

    if (error) throw error

    // Aggregate scores by user
    const userScores = data.reduce((acc: Record<string, any>, item: any) => {
      const userId = item.user_id
      if (!acc[userId]) {
        acc[userId] = {
          user_id: userId,
          username: item.users.username,
          total_score: 0,
          games_played: 0,
        }
      }
      acc[userId].total_score += item.score
      acc[userId].games_played += 1
      return acc
    }, {})

    // Convert to array and sort
    const leaderboardData = Object.values(userScores)
      .map((user: any) => ({
        user_id: user.user_id,
        username: user.username,
        total_score: user.total_score,
        games_played: user.games_played,
        average_score: Math.round(user.total_score / user.games_played),
      }))
      .sort((a, b) => b.total_score - a.total_score)
      .slice(0, 100)
      .map((user, index) => ({ ...user, rank: index + 1 }))

    // Cache the result
    await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(leaderboardData))

    res.json({
      success: true,
      data: leaderboardData,
      cached: false,
    })
  } catch (error) {
    next(error)
  }
})

// Get user rank
router.get('/user/:userId/rank', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params
    const cacheKey = `leaderboard:user:${userId}:rank`
    
    // Try to get from cache first
    const cachedData = await redisClient.get(cacheKey)
    if (cachedData) {
      return res.json({
        success: true,
        data: JSON.parse(cachedData),
        cached: true,
      })
    }

    // Get user stats
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('username, total_points, games_played')
      .eq('id', userId)
      .single()

    if (userError) throw userError
    if (!userData) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      })
    }

    // Get user's global rank
    const { count, error: rankError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gt('total_points', userData.total_points)

    if (rankError) throw rankError

    const userRankData = {
      user_id: userId,
      username: userData.username,
      total_points: userData.total_points,
      games_played: userData.games_played,
      average_score: userData.games_played > 0 ? Math.round(userData.total_points / userData.games_played) : 0,
      global_rank: (count || 0) + 1,
    }

    // Cache the result (shorter TTL for individual user data)
    await redisClient.setEx(cacheKey, 60, JSON.stringify(userRankData))

    res.json({
      success: true,
      data: userRankData,
      cached: false,
    })
  } catch (error) {
    next(error)
  }
})

// Refresh leaderboard cache (admin only - would need auth middleware)
router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Clear all leaderboard cache keys
    const keys = ['leaderboard:global', 'leaderboard:weekly']
    
    for (const key of keys) {
      await redisClient.del(key)
    }

    res.json({
      success: true,
      message: 'Leaderboard cache refreshed',
    })
  } catch (error) {
    next(error)
  }
})

export default router
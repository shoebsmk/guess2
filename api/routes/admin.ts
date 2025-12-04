import express, { type Request, type Response, type NextFunction } from 'express'
import { supabase } from '../config/supabase.js'

const router = express.Router()

// Middleware to check if user is admin (simplified for demo)
const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' })
    }

    // Verify token and check if user is admin
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return res.status(401).json({ success: false, error: 'Invalid token' })
    }

    // Check if user has admin role (you'd need to add this to your users table)
    const { data: userData } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!userData?.is_admin) {
      return res.status(403).json({ success: false, error: 'Admin access required' })
    }

    req.body.user = user
    next()
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' })
  }
}

// Get all challenges
router.get('/challenges', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabase
      .from('challenges')
      .select(`
        *,
        questions(*)
      `)
      .order('active_date', { ascending: false })

    if (error) throw error

    res.json({
      success: true,
      data: data,
    })
  } catch (error) {
    next(error)
  }
})

// Get single challenge
router.get('/challenges/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    
    const { data, error } = await supabase
      .from('challenges')
      .select(`
        *,
        questions(*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    res.json({
      success: true,
      data: data,
    })
  } catch (error) {
    next(error)
  }
})

// Create new challenge
router.post('/challenges', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, difficulty, time_limit, is_premium, active_date, questions } = req.body

    // Start transaction-like operation
    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .insert([{
        title,
        description,
        difficulty,
        time_limit,
        is_premium,
        active_date
      }])
      .select()
      .single()

    if (challengeError) throw challengeError

    // Add questions if provided
    if (questions && questions.length > 0) {
      const questionsWithChallengeId = questions.map((q: any) => ({
        ...q,
        challenge_id: challenge.id
      }))

      const { error: questionsError } = await supabase
        .from('questions')
        .insert(questionsWithChallengeId)

      if (questionsError) throw questionsError
    }

    // Fetch complete challenge with questions
    const { data: completeChallenge, error: fetchError } = await supabase
      .from('challenges')
      .select(`
        *,
        questions(*)
      `)
      .eq('id', challenge.id)
      .single()

    if (fetchError) throw fetchError

    res.json({
      success: true,
      data: completeChallenge,
      message: 'Challenge created successfully',
    })
  } catch (error) {
    next(error)
  }
})

// Update challenge
router.put('/challenges/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const { title, description, difficulty, time_limit, is_premium, active_date } = req.body

    const { data, error } = await supabase
      .from('challenges')
      .update({
        title,
        description,
        difficulty,
        time_limit,
        is_premium,
        active_date,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    res.json({
      success: true,
      data: data,
      message: 'Challenge updated successfully',
    })
  } catch (error) {
    next(error)
  }
})

// Delete challenge
router.delete('/challenges/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    // First delete related questions
    const { error: questionsError } = await supabase
      .from('questions')
      .delete()
      .eq('challenge_id', id)

    if (questionsError) throw questionsError

    // Then delete the challenge
    const { error: challengeError } = await supabase
      .from('challenges')
      .delete()
      .eq('id', id)

    if (challengeError) throw challengeError

    res.json({
      success: true,
      message: 'Challenge deleted successfully',
    })
  } catch (error) {
    next(error)
  }
})

// Get user statistics
router.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get total users
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    // Get active users (played in last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { count: activeUsers } = await supabase
      .from('user_challenges')
      .select('user_id', { count: 'exact', head: true })
      .gte('completed_at', thirtyDaysAgo.toISOString())

    // Get premium users
    const { count: premiumUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_premium', true)

    // Get total challenges
    const { count: totalChallenges } = await supabase
      .from('challenges')
      .select('*', { count: 'exact', head: true })

    // Get total games played
    const { count: totalGames } = await supabase
      .from('user_challenges')
      .select('*', { count: 'exact', head: true })

    res.json({
      success: true,
      data: {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        premiumUsers: premiumUsers || 0,
        totalChallenges: totalChallenges || 0,
        totalGames: totalGames || 0,
      },
    })
  } catch (error) {
    next(error)
  }
})

// Get recent user activity
router.get('/activity', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabase
      .from('user_challenges')
      .select(`
        id,
        score,
        completed_at,
        users(id, username),
        challenges(id, title)
      `)
      .order('completed_at', { ascending: false })
      .limit(50)

    if (error) throw error

    res.json({
      success: true,
      data: data,
    })
  } catch (error) {
    next(error)
  }
})

export default router
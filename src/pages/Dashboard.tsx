import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trophy, Star, Clock, Target, Zap, Crown, Play, TrendingUp, Award, Users, Medal } from 'lucide-react'
import { supabase } from '@/supabase/client'

interface Challenge {
  id: string
  title: string
  description: string
  difficulty: string
  time_limit: number
  is_premium: boolean
  active_date: string
}

interface UserStats {
  total_points: number
  current_streak: number
  best_streak: number
  games_played: number
  average_score: number
}

export default function Dashboard() {
  const [dailyChallenge, setDailyChallenge] = useState<Challenge | null>(null)
  const [userStats, setUserStats] = useState<UserStats>({
    total_points: 0,
    current_streak: 0,
    best_streak: 0,
    games_played: 0,
    average_score: 0
  })
  const [loading, setLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(true)
  const [displayName, setDisplayName] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchDailyChallenge()
    fetchUserStats()
    checkAuthStatus()
  }, [])

  useEffect(() => {
    fetchDailyChallenge()
  }, [isGuest])

  const checkAuthStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setIsGuest(!user)
    if (user) {
      const { data } = await supabase
        .from('users')
        .select('username, email')
        .eq('id', user.id)
        .maybeSingle()
      setDisplayName(data?.username || user.email || null)
    }
  }

  const fetchDailyChallenge = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const guest = !user
      const today = new Date().toISOString().split('T')[0]
      if (guest) {
        const { data: pool } = await supabase
          .from('challenges')
          .select('*')
          .eq('is_active', true)
          .eq('is_premium', false)
          .ilike('title', 'Sample%')
          .limit(20)
        if (pool && pool.length > 0) {
          const pick = pool[Math.floor(Math.random() * pool.length)]
          setDailyChallenge(pick)
          return
        }
      } else {
        const { data, error } = await supabase
          .from('challenges')
          .select('*')
          .eq('active_date', today)
          .eq('is_active', true)
          .single()
        if (!error && data) {
          setDailyChallenge(data)
          return
        }
      }

      // Fallback: get the most recent active non-premium challenge
      const { data: latest } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_active', true)
        .eq('is_premium', false)
        .order('active_date', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (latest) {
        setDailyChallenge(latest)
        return
      }

      // Fallback 2: upcoming active challenge
      const { data: upcoming } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_active', true)
        .order('active_date', { ascending: true })
        .limit(1)
        .maybeSingle()

      if (upcoming) setDailyChallenge(upcoming)
    } catch (error) {
      console.error('Error fetching daily challenge:', error)
    }
  }

  const fetchUserStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data, error } = await supabase
          .from('users')
          .select('total_points, current_streak, best_streak, games_played, average_score')
          .eq('id', user.id)
          .single()

        if (!error && data) {
          setUserStats(data)
        }
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500'
      case 'medium': return 'bg-yellow-500'
      case 'hard': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 hover:opacity-90">
            <Trophy className="h-8 w-8 text-yellow-400" />
            <span className="text-2xl font-bold text-white">Guess2</span>
          </Link>
          <div className="flex items-center space-x-6">
            <Link to="/leaderboard" className="text-white hover:text-purple-200 transition-colors">
              Leaderboard
            </Link>
            <Link to="/profile" className="text-white hover:text-purple-200 transition-colors">
              Profile
            </Link>
            {!isGuest && (
              <button 
                onClick={async () => {
                  await supabase.auth.signOut()
                  navigate('/auth/login')
                }}
                className="text-white hover:text-purple-200 transition-colors"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome {isGuest ? 'Guest' : (displayName || 'Back')}!
          </h1>
          <p className="text-purple-200 text-lg">
            {isGuest ? 'Play up to 3 challenges per day as a guest' : 'Ready for today\'s challenge?'}
          </p>
          {dailyChallenge && (
            <div className="my-20 flex justify-center">
              <Link
                to={`/challenge/${dailyChallenge.id}`}
                className="bg-yellow-500 hover:bg-yellow-600 text-purple-900 px-10 py-5 rounded-lg font-semibold text-xl transition-colors inline-flex items-center space-x-2"
              >
                <Play className="h-7 w-7" />
                <span>Start Challenge</span>
              </Link>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <div className="bg-yellow-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="h-6 w-6 text-purple-900" />
            </div>
            <h3 className="text-white font-semibold mb-2">Total Points</h3>
            <p className="text-2xl font-bold text-yellow-400">{userStats.total_points}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <div className="bg-orange-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">Current Streak</h3>
            <p className="text-2xl font-bold text-orange-400">{userStats.current_streak} days</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <div className="bg-green-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">Best Streak</h3>
            <p className="text-2xl font-bold text-green-400">{userStats.best_streak} days</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <div className="bg-purple-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">Games Played</h3>
            <p className="text-2xl font-bold text-purple-400">{userStats.games_played}</p>
          </div>
        </div>

        {/* Daily Challenge */}
        {dailyChallenge ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Today's Challenge</h2>
                <p className="text-purple-200">Complete today's trivia to maintain your streak!</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${getDifficultyColor(dailyChallenge.difficulty)}`}>
                {dailyChallenge.difficulty.toUpperCase()}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <Clock className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-purple-200 text-sm">Time Limit</p>
                <p className="text-white font-semibold">{Math.floor(dailyChallenge.time_limit / 60)} minutes</p>
              </div>
              <div className="text-center">
                <Target className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-purple-200 text-sm">Questions</p>
                <p className="text-white font-semibold">5 questions</p>
              </div>
              <div className="text-center">
                <Trophy className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-purple-200 text-sm">Points</p>
                <p className="text-white font-semibold">Up to 50 points</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">{dailyChallenge.title}</h3>
                <p className="text-purple-200">{dailyChallenge.description}</p>
              </div>
              <Link 
                to={`/challenge/${dailyChallenge.id}`}
                className="bg-yellow-500 hover:bg-yellow-600 text-purple-900 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
              >
                <Play className="h-5 w-5" />
                <span>Start Challenge</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 mb-8">
            <div className="mb-2">
              <h2 className="text-2xl font-bold text-white mb-2">No Challenge Found</h2>
              <p className="text-purple-200">We couldn't find today's challenge. Please check back later.</p>
            </div>
          </div>
        )}

        {/* Quick Leaderboard Preview */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Top Players</h2>
            <Link 
              to="/leaderboard" 
              className="text-purple-200 hover:text-white transition-colors flex items-center space-x-1"
            >
              <span>View Full Leaderboard</span>
              <Users className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg p-4 text-center text-white">
              <Crown className="h-8 w-8 mx-auto mb-2" />
              <h4 className="font-semibold mb-1">QuizMaster</h4>
              <p className="text-sm opacity-90">2,450 points</p>
            </div>
            <div className="bg-gradient-to-r from-gray-300 to-gray-400 rounded-lg p-4 text-center text-white">
              <Medal className="h-8 w-8 mx-auto mb-2" />
              <h4 className="font-semibold mb-1">TriviaPro</h4>
              <p className="text-sm opacity-90">2,320 points</p>
            </div>
            <div className="bg-gradient-to-r from-orange-400 to-orange-600 rounded-lg p-4 text-center text-white">
              <Medal className="h-8 w-8 mx-auto mb-2" />
              <h4 className="font-semibold mb-1">WordWizard</h4>
              <p className="text-sm opacity-90">2,180 points</p>
            </div>
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Recent Achievements</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <Award className="h-12 w-12 text-yellow-400 mx-auto mb-3" />
              <h4 className="text-white font-semibold mb-1">First Steps</h4>
              <p className="text-purple-200 text-sm">Complete your first challenge</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <TrendingUp className="h-12 w-12 text-green-400 mx-auto mb-3" />
              <h4 className="text-white font-semibold mb-1">Point Collector</h4>
              <p className="text-purple-200 text-sm">Earn 1000 points</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <Crown className="h-12 w-12 text-purple-400 mx-auto mb-3" />
              <h4 className="text-white font-semibold mb-1">Streak Starter</h4>
              <p className="text-purple-200 text-sm">Maintain a 3-day streak</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

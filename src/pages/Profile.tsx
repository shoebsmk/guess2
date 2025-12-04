import { useState, useEffect } from 'react'
import { Trophy, Star, Clock, Target, Zap, Crown, Award, TrendingUp, User, Calendar, Gamepad2, Settings } from 'lucide-react'
import { supabase } from '@/supabase/client'
import PremiumSubscription from '@/components/PremiumSubscription'
import { apiUrl } from '@/utils/api'

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  points_required: number
  is_unlocked: boolean
  unlocked_at: string | null
}

interface UserStats {
  total_points: number
  current_streak: number
  best_streak: number
  games_played: number
  average_score: number
  rank: number
}

interface UserProfile {
  id: string
  username: string
  email: string
  created_at: string
  is_premium: boolean
  avatar_url: string | null
}

export default function Profile() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [userStats, setUserStats] = useState<UserStats>({
    total_points: 0,
    current_streak: 0,
    best_streak: 0,
    games_played: 0,
    average_score: 0,
    rank: 0
  })
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'history' | 'subscription'>('overview')

  useEffect(() => {
    const init = async () => {
      await fetchUserProfile()
      await fetchUserStats()
      await fetchAchievements()
      setLoading(false)
    }
    init()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const { data, error } = await supabase
          .from('users')
          .select('id, username, email, created_at, is_premium, avatar_url')
          .eq('id', authUser.id)
          .single()

        if (error) {
          const payload = {
            id: authUser.id,
            email: authUser.email,
            username: (authUser.email || '').split('@')[0],
            is_premium: false,
            avatar_url: null
          }
          await supabase.from('users').upsert(payload, { onConflict: 'id' })
          const { data: created } = await supabase
            .from('users')
            .select('id, username, email, created_at, is_premium, avatar_url')
            .eq('id', authUser.id)
            .single()
          setUser(created)
        } else {
          setUser(data)
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const fetchUserStats = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        // Get user stats
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('total_points, current_streak, best_streak, games_played')
          .eq('id', authUser.id)
          .single()

        if (userError) throw userError

        // Get user rank
        const { count, error: rankError } = await supabase
          .from('users')
          .select('id', { count: 'exact' })
          .gt('total_points', userData?.total_points || 0)

        if (rankError) throw rankError

        setUserStats({
          total_points: userData?.total_points || 0,
          current_streak: userData?.current_streak || 0,
          best_streak: userData?.best_streak || 0,
          games_played: userData?.games_played || 0,
          average_score: userData?.games_played > 0 ? Math.round(userData.total_points / userData.games_played) : 0,
          rank: (count || 0) + 1
        })
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
      // Use mock data for demo
      setUserStats({
        total_points: 1250,
        current_streak: 7,
        best_streak: 14,
        games_played: 25,
        average_score: 50,
        rank: 42
      })
    }
  }

  const fetchAchievements = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const { data, error } = await supabase
          .from('user_achievements')
          .select(`
            achievement_id,
            earned_at,
            achievements(name, description, badge_url, points_required)
          `)
          .eq('user_id', authUser.id)

        if (error) throw error

        const formattedAchievements = data.map((item: any) => ({
          id: item.achievement_id,
          title: item.achievements.name,
          description: item.achievements.description,
          icon: item.achievements.badge_url,
          points_required: item.achievements.points_required,
          is_unlocked: true,
          unlocked_at: item.earned_at
        }))

        setAchievements(formattedAchievements)
      }
    } catch (error) {
      console.error('Error fetching achievements:', error)
      // Use mock data for demo
      setAchievements([
        {
          id: '1',
          title: 'First Steps',
          description: 'Complete your first challenge',
          icon: 'star',
          points_required: 0,
          is_unlocked: true,
          unlocked_at: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          title: 'Point Collector',
          description: 'Earn 1000 points',
          icon: 'trophy',
          points_required: 1000,
          is_unlocked: true,
          unlocked_at: '2024-01-20T15:45:00Z'
        },
        {
          id: '3',
          title: 'Streak Starter',
          description: 'Maintain a 7-day streak',
          icon: 'fire',
          points_required: 0,
          is_unlocked: true,
          unlocked_at: '2024-01-22T08:15:00Z'
        },
        {
          id: '4',
          title: 'Quiz Master',
          description: 'Complete 50 challenges',
          icon: 'crown',
          points_required: 0,
          is_unlocked: false,
          unlocked_at: null
        }
      ])
    } finally {
      // loading is finalized after init()
    }
  }

  const handleSubscribe = async (priceId: string) => {
    try {
      const response = await fetch(apiUrl('/api/payments/create-checkout-session'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          priceId: priceId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { data } = await response.json()
      
      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      alert('Failed to start subscription process. Please try again.')
    }
  }

  const getAchievementIcon = (icon: string) => {
    const iconMap: Record<string, any> = {
      star: Star,
      trophy: Trophy,
      fire: Zap,
      crown: Crown,
      target: Target,
      clock: Clock
    }
    
    const IconComponent = iconMap[icon] || Award
    return <IconComponent className="h-8 w-8" />
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Please log in to view your profile</h2>
          <p className="text-gray-500 mb-4">Sign in to track your progress and achievements</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-6">
              <div className="bg-purple-100 rounded-full p-4">
                <User className="h-16 w-16 text-purple-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-1">{user.username}</h1>
                <p className="text-gray-600">{user.email}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    user.is_premium 
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white' 
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    {user.is_premium ? '⭐ Premium' : 'Free Member'}
                  </span>
                  <span className="text-sm text-gray-500 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Joined {formatDate(user.created_at)}
                  </span>
                </div>
              </div>
            </div>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Edit Profile</span>
            </button>
          </div>

          {/* Stats Overview */}
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <Trophy className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-800">{userStats.total_points}</div>
              <div className="text-sm text-purple-600">Total Points</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <Zap className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-800">{userStats.current_streak}</div>
              <div className="text-sm text-orange-600">Current Streak</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <Gamepad2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-800">{userStats.games_played}</div>
              <div className="text-sm text-green-600">Games Played</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-800">#{userStats.rank}</div>
              <div className="text-sm text-blue-600">Global Rank</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'overview'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('achievements')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'achievements'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Achievements ({achievements.filter(a => a.is_unlocked).length})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'history'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Game History
              </button>
              <button
                onClick={() => setActiveTab('subscription')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'subscription'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Subscription
              </button>
            </nav>
          </div>

          <div className="p-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Streak Progress</h3>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-600">Current Streak</span>
                      <span className="text-lg font-bold text-orange-600">{userStats.current_streak} days</span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-600">Best Streak</span>
                      <span className="text-lg font-bold text-green-600">{userStats.best_streak} days</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((userStats.current_streak / 30) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Keep it up! 30-day milestone ahead</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance</h3>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-600">Average Score</span>
                      <span className="text-lg font-bold text-blue-600">{userStats.average_score}</span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-600">Win Rate</span>
                      <span className="text-lg font-bold text-green-600">68%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Playtime</span>
                      <span className="text-lg font-bold text-purple-600">3h 45m</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Achievements Tab */}
            {activeTab === 'achievements' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Achievement Gallery</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`rounded-lg p-6 transition-all duration-200 ${
                        achievement.is_unlocked
                          ? 'bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 shadow-md'
                          : 'bg-gray-100 border-2 border-gray-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-full ${
                          achievement.is_unlocked ? 'bg-purple-600 text-white' : 'bg-gray-300 text-gray-500'
                        }`}>
                          {getAchievementIcon(achievement.icon)}
                        </div>
                        {achievement.is_unlocked && (
                          <Star className="h-6 w-6 text-yellow-500" />
                        )}
                      </div>
                      <h4 className={`font-semibold mb-2 ${
                        achievement.is_unlocked ? 'text-purple-800' : 'text-gray-600'
                      }`}>
                        {achievement.title}
                      </h4>
                      <p className={`text-sm mb-3 ${
                        achievement.is_unlocked ? 'text-purple-600' : 'text-gray-500'
                      }`}>
                        {achievement.description}
                      </p>
                      {achievement.is_unlocked && achievement.unlocked_at && (
                        <p className="text-xs text-purple-500">
                          Unlocked on {formatDate(achievement.unlocked_at)}
                        </p>
                      )}
                      {!achievement.is_unlocked && achievement.points_required > 0 && (
                        <p className="text-xs text-gray-500">
                          Requires {achievement.points_required} points
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Recent Games</h3>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((game) => (
                    <div key={game} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-purple-100 rounded-full p-3">
                          <Gamepad2 className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">Daily Challenge #{game}</h4>
                          <p className="text-sm text-gray-600">Completed on January {25 - game}, 2024</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-purple-600">{55 - game * 2} pts</div>
                        <div className="text-sm text-gray-500">3m 45s</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Subscription Tab */}
            {activeTab === 'subscription' && user && (
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Subscription Management</h3>
                <PremiumSubscription
                  userId={user.id}
                  currentPlan={user.is_premium ? 'premium' : 'free'}
                  onSubscribe={handleSubscribe}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

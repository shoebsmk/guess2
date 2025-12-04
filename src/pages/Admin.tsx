import { useState, useEffect } from 'react'
import { Trophy, Users, Gamepad2, Star, Plus, Edit, Trash2, TrendingUp, Clock, Award } from 'lucide-react'
import { supabase } from '@/supabase/client'
import { apiUrl } from '@/utils/api'

interface Challenge {
  id: string
  title: string
  description: string
  difficulty: string
  time_limit: number
  is_premium: boolean
  active_date: string
  questions: Question[]
  created_at: string
}

interface Question {
  id: string
  question_text: string
  correct_answer: string
  incorrect_answers: string[]
  points: number
}

interface Stats {
  totalUsers: number
  activeUsers: number
  premiumUsers: number
  totalChallenges: number
  totalGames: number
}

interface Activity {
  id: string
  score: number
  completed_at: string
  users: { id: string; username: string }
  challenges: { id: string; title: string }
}

export default function Admin() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeUsers: 0,
    premiumUsers: 0,
    totalChallenges: 0,
    totalGames: 0
  })
  const [recentActivity, setRecentActivity] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null)

  useEffect(() => {
    checkAdmin().then((ok) => {
      if (ok) {
        fetchChallenges()
        fetchStats()
        fetchRecentActivity()
      }
    })
  }, [])

  const checkAdmin = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsAdmin(false)
        setLoading(false)
        return false
      }
      const { data, error } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', user.id)
        .single()
      if (error) {
        setIsAdmin(false)
        setLoading(false)
        return false
      }
      setIsAdmin(!!data?.is_admin)
      if (!data?.is_admin) setLoading(false)
      return !!data?.is_admin
    } catch (e) {
      setIsAdmin(false)
      setLoading(false)
      return false
    }
  }

  const fetchChallenges = async () => {
    try {
      const response = await fetch(apiUrl('/api/admin/challenges'))
      if (response.ok) {
        const data = await response.json()
        setChallenges(data.data)
      }
    } catch (error) {
      console.error('Error fetching challenges:', error)
      // Fallback to mock data
      setChallenges([
        {
          id: '1',
          title: 'Daily Trivia Challenge',
          description: 'Test your general knowledge with our daily trivia questions',
          difficulty: 'medium',
          time_limit: 300,
          is_premium: false,
          active_date: '2024-01-25',
          questions: [],
          created_at: '2024-01-20T10:00:00Z'
        },
        {
          id: '2',
          title: 'Premium Word Challenge',
          description: 'Advanced word puzzles for premium subscribers',
          difficulty: 'hard',
          time_limit: 600,
          is_premium: true,
          active_date: '2024-01-24',
          questions: [],
          created_at: '2024-01-19T10:00:00Z'
        }
      ])
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch(apiUrl('/api/admin/stats'))
      if (response.ok) {
        const data = await response.json()
        setStats(data.data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
      // Fallback to mock data
      setStats({
        totalUsers: 1250,
        activeUsers: 342,
        premiumUsers: 89,
        totalChallenges: 45,
        totalGames: 2156
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentActivity = async () => {
    try {
      const response = await fetch(apiUrl('/api/admin/activity'))
      if (response.ok) {
        const data = await response.json()
        setRecentActivity(data.data)
      }
    } catch (error) {
      console.error('Error fetching recent activity:', error)
      // Fallback to mock data
      setRecentActivity([
        {
          id: '1',
          score: 45,
          completed_at: '2024-01-25T10:30:00Z',
          users: { id: '1', username: 'QuizMaster' },
          challenges: { id: '1', title: 'Daily Trivia Challenge' }
        },
        {
          id: '2',
          score: 38,
          completed_at: '2024-01-25T10:25:00Z',
          users: { id: '2', username: 'WordWizard' },
          challenges: { id: '1', title: 'Daily Trivia Challenge' }
        }
      ])
    }
  }

  const handleDeleteChallenge = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this challenge?')) {
      try {
        const response = await fetch(apiUrl(`/api/admin/challenges/${id}`), {
          method: 'DELETE',
        })
        if (response.ok) {
          setChallenges(challenges.filter(c => c.id !== id))
        }
      } catch (error) {
        console.error('Error deleting challenge:', error)
      }
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'hard':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center max-w-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unauthorized</h2>
          <p className="text-gray-600">You must be an admin to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Trophy className="h-8 w-8 text-purple-600" />
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>New Challenge</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600 font-medium">+12%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeUsers.toLocaleString()}</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600 font-medium">+8%</span>
              <span className="text-gray-500 ml-1">from last week</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Premium Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats.premiumUsers.toLocaleString()}</p>
              </div>
              <div className="bg-yellow-100 rounded-full p-3">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600 font-medium">+15%</span>
              <span className="text-gray-500 ml-1">conversion rate</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Challenges</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalChallenges}</p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <Gamepad2 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600 font-medium">+5</span>
              <span className="text-gray-500 ml-1">this week</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Games Played</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalGames.toLocaleString()}</p>
              </div>
              <div className="bg-orange-100 rounded-full p-3">
                <Award className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600 font-medium">+234</span>
              <span className="text-gray-500 ml-1">today</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Challenges Management */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Challenge Management</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {challenges.map((challenge) => (
                  <div key={challenge.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-base font-medium text-gray-900">{challenge.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                            {challenge.difficulty}
                          </span>
                          {challenge.is_premium && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                              Premium
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{challenge.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {Math.floor(challenge.time_limit / 60)} min
                          </span>
                          <span>{formatDate(challenge.active_date)}</span>
                          <span>{challenge.questions.length} questions</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEditingChallenge(challenge)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteChallenge(challenge.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="bg-white rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="px-6 py-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{activity.users.username}</span>
                      <span className="text-sm font-bold text-purple-600">{activity.score} pts</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{activity.challenges.title}</p>
                    <p className="text-xs text-gray-500">{formatTimeAgo(activity.completed_at)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingChallenge) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingChallenge ? 'Edit Challenge' : 'Create New Challenge'}
              </h2>
            </div>
            <div className="px-6 py-4">
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Challenge title"
                    defaultValue={editingChallenge?.title || ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Challenge description"
                    defaultValue={editingChallenge?.description || ''}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      defaultValue={editingChallenge?.difficulty || 'medium'}
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time Limit (minutes)</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="300"
                      defaultValue={editingChallenge?.time_limit ? editingChallenge.time_limit / 60 : 5}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Active Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    defaultValue={editingChallenge?.active_date || ''}
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    defaultChecked={editingChallenge?.is_premium || false}
                  />
                  <label className="ml-2 block text-sm text-gray-700">Premium Challenge</label>
                </div>
              </form>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setEditingChallenge(null)
                }}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Handle form submission here
                  setShowCreateModal(false)
                  setEditingChallenge(null)
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                {editingChallenge ? 'Update Challenge' : 'Create Challenge'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

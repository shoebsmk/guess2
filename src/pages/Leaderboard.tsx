import { useState, useEffect } from 'react'
import { Trophy, Medal, Crown, Clock, Users } from 'lucide-react'
import { supabase } from '@/supabase/client'
import { apiUrl } from '@/utils/api'

interface LeaderboardEntry {
  user_id: string
  username: string
  total_points: number
  total_score?: number
  games_played: number
  average_score: number
  rank: number
}

interface UserRank {
  user_id: string
  username: string
  total_points: number
  games_played: number
  average_score: number
  global_rank: number
}

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState<'global' | 'weekly'>('global')
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [userRank, setUserRank] = useState<UserRank | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    fetchCurrentUser()
    fetchLeaderboard()
  }, [activeTab])

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setCurrentUser(user)
      fetchUserRank(user.id)
    }
  }

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      const endpoint = activeTab === 'global' ? '/api/leaderboard/global' : '/api/leaderboard/weekly'
      const response = await fetch(apiUrl(endpoint))
      
      if (!response.ok) throw new Error('Failed to fetch leaderboard')
      
      const data = await response.json()
      setLeaderboard(data.data)
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
      // Fallback to mock data for demo
      setLeaderboard(generateMockData())
    } finally {
      setLoading(false)
    }
  }

  const fetchUserRank = async (userId: string) => {
    try {
      const response = await fetch(apiUrl(`/api/leaderboard/user/${userId}/rank`))
      if (response.ok) {
        const data = await response.json()
        setUserRank(data.data)
      }
    } catch (error) {
      console.error('Error fetching user rank:', error)
    }
  }

  const generateMockData = (): LeaderboardEntry[] => {
    const mockUsers = [
      'QuizMaster', 'TriviaPro', 'WordWizard', 'BrainStorm', 'SmartPlayer',
      'QuickThinker', 'KnowledgeKing', 'PuzzleMaster', 'ChallengeChamp', 'TriviaTitan'
    ]
    
    return mockUsers.map((username, index) => ({
      user_id: `user_${index + 1}`,
      username,
      total_points: Math.floor(Math.random() * 5000) + 1000,
      games_played: Math.floor(Math.random() * 50) + 10,
      average_score: Math.floor(Math.random() * 100) + 50,
      rank: index + 1,
    }))
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Medal className="w-6 h-6 text-orange-600" />
      default:
        return <span className="text-lg font-bold text-gray-600">{rank}</span>
    }
  }

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-yellow-500'
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-400 text-white border-gray-500'
      case 3:
        return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white border-orange-500'
      default:
        return 'bg-white border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Trophy className="w-12 h-12 text-yellow-500 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">Leaderboard</h1>
          </div>
          <p className="text-gray-600 text-lg">Compete with players worldwide and climb the ranks!</p>
        </div>

        {/* User Rank Card */}
        {currentUser && userRank && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-3xl font-bold text-purple-600">
                  #{userRank.global_rank}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Your Ranking</h3>
                  <p className="text-gray-600">{userRank.username}</p>
                </div>
              </div>
              <div className="flex space-x-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">{userRank.total_points}</div>
                  <div className="text-sm text-gray-600">Total Points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">{userRank.games_played}</div>
                  <div className="text-sm text-gray-600">Games Played</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">{userRank.average_score}</div>
                  <div className="text-sm text-gray-600">Average Score</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-md p-1 inline-flex">
            <button
              onClick={() => setActiveTab('global')}
              className={`px-6 py-3 rounded-md font-medium transition-all duration-200 flex items-center space-x-2 ${
                activeTab === 'global'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Global</span>
            </button>
            <button
              onClick={() => setActiveTab('weekly')}
              className={`px-6 py-3 rounded-md font-medium transition-all duration-200 flex items-center space-x-2 ${
                activeTab === 'weekly'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <Clock className="w-5 h-5" />
              <span>Weekly</span>
            </button>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Trophy className="w-6 h-6 mr-2" />
              {activeTab === 'global' ? 'Global Rankings' : 'Weekly Rankings'}
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading leaderboard...</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.user_id}
                  className={`p-6 flex items-center justify-between transition-all duration-200 hover:shadow-md ${
                    getRankStyle(entry.rank)
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-12 h-12">
                      {getRankIcon(entry.rank)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">
                        {entry.username}
                      </h3>
                      <p className="text-sm opacity-75">
                        {entry.games_played} games played
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-8">
                    <div className="text-center">
                      <div className="text-xl font-bold">
                        {entry.total_points || entry.total_score}
                      </div>
                      <div className="text-sm opacity-75">
                        {activeTab === 'global' ? 'Total Points' : 'Weekly Score'}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold">{entry.average_score}</div>
                      <div className="text-sm opacity-75">Average</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Empty State */}
        {!loading && leaderboard.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No rankings available yet
            </h3>
            <p className="text-gray-500">
              Be the first to play and claim the top spot!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

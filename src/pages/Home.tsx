import { Link } from 'react-router-dom'
import { Trophy, Star, Clock, Target, Zap, Crown } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trophy className="h-8 w-8 text-yellow-400" />
            <span className="text-2xl font-bold text-white">Guess2</span>
          </div>
          <div className="flex items-center space-x-6">
            <Link to="/leaderboard" className="text-white hover:text-purple-200 transition-colors">
              Leaderboard
            </Link>
            <Link to="/auth/login" className="text-white hover:text-purple-200 transition-colors">
              Login
            </Link>
            <Link 
              to="/auth/signup" 
              className="bg-yellow-500 hover:bg-yellow-600 text-purple-900 px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-6xl font-bold text-white mb-6">
          Play Daily Trivia
          <span className="block text-yellow-400">Quick challenges. Real points.</span>
        </h1>
        <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
          Compete, earn, and build your streak.
        </p>
        <div className="flex justify-center space-x-4">
          <Link 
            to="/dashboard" 
            className="bg-yellow-500 hover:bg-yellow-600 text-purple-900 px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105"
          >
            Play
          </Link>
          <Link 
            to="/auth/signup" 
            className="border-2 border-white text-white hover:bg-white hover:text-purple-900 px-8 py-4 rounded-lg font-bold text-lg transition-all"
          >
            Create Account
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-white text-center mb-16">
          Why Choose Guess2?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center hover:bg-white/20 transition-all">
            <div className="bg-yellow-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="h-8 w-8 text-purple-900" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Daily Challenges</h3>
            <p className="text-purple-100">Fresh questions every day.</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center hover:bg-white/20 transition-all">
            <div className="bg-yellow-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Target className="h-8 w-8 text-purple-900" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Leaderboards</h3>
            <p className="text-purple-100">Climb the global rankings.</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center hover:bg-white/20 transition-all">
            <div className="bg-yellow-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Star className="h-8 w-8 text-purple-900" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Achievements</h3>
            <p className="text-purple-100">Unlock badges as you play.</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center hover:bg-white/20 transition-all">
            <div className="bg-yellow-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap className="h-8 w-8 text-purple-900" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Streaks</h3>
            <p className="text-purple-100">Play daily, earn bonuses.</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center hover:bg-white/20 transition-all">
            <div className="bg-yellow-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="h-8 w-8 text-purple-900" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Premium</h3>
            <p className="text-purple-100">Exclusive challenges and rewards.</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center hover:bg-white/20 transition-all">
            <div className="bg-yellow-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Crown className="h-8 w-8 text-purple-900" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Points</h3>
            <p className="text-purple-100">Earn more as you play.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Play?</h2>
          <p className="text-purple-100 mb-8 text-lg">Jump into today’s challenge.</p>
          <Link 
            to="/dashboard" 
            className="bg-yellow-500 hover:bg-yellow-600 text-purple-900 px-8 py-4 rounded-lg font-bold text-xl transition-all transform hover:scale-105 inline-block"
          >
            Play Now - It's Free!
          </Link>
          <p className="text-purple-200 mt-4 text-sm">No signup needed for guests.</p>
        </div>
      </section>

      <section className="container mx-auto px-6 text-center pb-6">
        <a
          href="https://shoebsmk.github.io"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white text-2xl font-semibold hover:text-yellow-400 transition-colors"
        >
          Designed by Shoeb Khan
        </a>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 border-t border-purple-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trophy className="h-6 w-6 text-yellow-400" />
            <span className="text-white font-semibold">Guess2</span>
          </div>
          <div className="flex space-x-6 text-purple-200">
            <Link to="/about" className="hover:text-white transition-colors">About</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

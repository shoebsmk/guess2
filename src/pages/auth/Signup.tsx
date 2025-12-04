import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trophy, Mail, Lock, User, ArrowRight } from 'lucide-react'
import { supabase } from '@/supabase/client'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error: signupError } = await supabase.auth.signUp({ email, password })
      if (signupError) {
        setError(signupError.message)
        return
      }

      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password })
      if (loginError) {
        setError(loginError.message)
        return
      }

      if (loginData.user) {
        const { error: updateError } = await supabase
          .from('users')
          .update({ username })
          .eq('id', loginData.user.id)
        if (updateError) {
          setError(updateError.message)
          return
        }
      }

      navigate('/dashboard')
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Trophy className="h-12 w-12 text-yellow-400" />
            <span className="text-3xl font-bold text-white">Guess2</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
          <p className="text-purple-200">Join the trivia community today</p>
        </div>

        {/* Signup Form */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
          <form onSubmit={handleSignup} className="space-y-6">
            {error && (
              <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 text-red-200 text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-purple-200 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-purple-300" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 bg-white/10 border border-purple-300 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Choose a username"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-purple-200 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-purple-300" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 bg-white/10 border border-purple-300 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-purple-200 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-purple-300" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 bg-white/10 border border-purple-300 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Create a password (min 6 characters)"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-purple-900 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-purple-200">
              Already have an account?{' '}
              <Link 
                to="/auth/login" 
                className="text-yellow-400 hover:text-yellow-300 font-semibold transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-purple-300">
            <p className="text-center text-purple-200 text-sm mb-4">Or continue as guest</p>
            <Link 
              to="/dashboard" 
              className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
            >
              <span>Play as Guest</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="text-xs text-purple-300 text-center mt-2">
              Limited to 3 challenges per day
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

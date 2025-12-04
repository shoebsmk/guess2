import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Trophy, Clock, CheckCircle, XCircle, Play } from 'lucide-react'
import { supabase } from '@/supabase/client'

interface Question {
  id: string
  question_text: string
  question_type: string
  order_index: number
  points_value: number
  answers: Answer[]
}

interface Answer {
  id: string
  answer_text: string
  is_correct: boolean
}

interface UserAnswer {
  questionId: string
  answerId: string
  isCorrect: boolean
  timeSpent: number
}

export default function Challenge() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [challenge, setChallenge] = useState<any>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([])
  const [timeRemaining, setTimeRemaining] = useState(300)
  const [startTime, setStartTime] = useState<number>(Date.now())
  const [isCompleted, setIsCompleted] = useState(false)
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchChallengeData()
  }, [id])

  useEffect(() => {
    if (timeRemaining > 0 && !isCompleted) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeRemaining === 0 && !isCompleted) {
      handleTimeUp()
    }
  }, [timeRemaining, isCompleted])

  const fetchChallengeData = async () => {
    try {
      // Fetch challenge details
      const { data: challengeData, error: challengeError } = await supabase
        .from('challenges')
        .select('*')
        .eq('id', id)
        .single()

      if (challengeError) throw challengeError
      setChallenge(challengeData)
      setTimeRemaining(challengeData.time_limit)

      // Fetch questions with answers
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select(`
          *,
          answers (*)
        `)
        .eq('challenge_id', id)
        .order('order_index', { ascending: true })

      if (questionsError) throw questionsError
      setQuestions(questionsData || [])
    } catch (error) {
      console.error('Error fetching challenge data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSelect = (answerId: string) => {
    setSelectedAnswer(answerId)
  }

  const handleNextQuestion = async () => {
    if (!selectedAnswer) return

    const currentQuestion = questions[currentQuestionIndex]
    const selectedAnswerObj = currentQuestion.answers.find(a => a.id === selectedAnswer)
    const isCorrect = selectedAnswerObj?.is_correct || false
    const timeSpent = Math.floor((Date.now() - startTime) / 1000)

    const userAnswer: UserAnswer = {
      questionId: currentQuestion.id,
      answerId: selectedAnswer,
      isCorrect,
      timeSpent
    }

    setUserAnswers([...userAnswers, userAnswer])

    if (isCorrect) {
      const basePoints = currentQuestion.points_value
      const speedBonus = timeSpent < 30 ? 5 : 0
      setScore(score + basePoints + speedBonus)
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer('')
      setStartTime(Date.now())
    } else {
      await completeChallenge()
    }
  }

  const handleTimeUp = async () => {
    await completeChallenge()
  }

  const completeChallenge = async () => {
    setIsCompleted(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const totalTime = challenge.time_limit - timeRemaining
        const correctAnswers = userAnswers.filter(a => a.isCorrect).length
        const streakMultiplier = 1.0 // Could be enhanced with actual streak logic

        // Create user challenge record
        const { data: userChallenge, error: userChallengeError } = await supabase
          .from('user_challenges')
          .insert([
            {
              user_id: user.id,
              challenge_id: id,
              score,
              completion_time: totalTime,
              streak_multiplier: streakMultiplier,
              correct_answers: correctAnswers,
              total_questions: questions.length
            }
          ])
          .select()
          .single()

        if (userChallengeError) throw userChallengeError

        // Store individual answers
        const userAnswersData = userAnswers.map(answer => ({
          user_challenge_id: userChallenge.id,
          question_id: answer.questionId,
          answer_id: answer.answerId,
          is_correct: answer.isCorrect,
          time_spent: answer.timeSpent
        }))

        await supabase.from('user_answers').insert(userAnswersData)

        // Update user stats
        await supabase.rpc('update_user_stats', {
          user_id: user.id,
          new_score: score,
          correct_answers: correctAnswers,
          total_questions: questions.length
        })
      }

      // Navigate to results after a short delay
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)
    } catch (error) {
      console.error('Error completing challenge:', error)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getTimeColor = () => {
    if (timeRemaining > 120) return 'text-green-400'
    if (timeRemaining > 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading challenge...</div>
      </div>
    )
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-12 text-center max-w-md">
          <Trophy className="h-16 w-16 text-yellow-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Challenge Complete!</h2>
          <div className="space-y-4 mb-8">
            <div className="text-center">
              <p className="text-purple-200 text-sm">Final Score</p>
              <p className="text-4xl font-bold text-yellow-400">{score}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-purple-200 text-sm">Correct</p>
                <p className="text-xl font-semibold text-green-400">
                  {userAnswers.filter(a => a.isCorrect).length}/{questions.length}
                </p>
              </div>
              <div>
                <p className="text-purple-200 text-sm">Time</p>
                <p className="text-xl font-semibold text-blue-400">
                  {formatTime(challenge.time_limit - timeRemaining)}
                </p>
              </div>
            </div>
          </div>
          <Link 
            to="/dashboard"
            className="bg-yellow-500 hover:bg-yellow-600 text-purple-900 px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">No questions available</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      {/* Header */}
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Trophy className="h-8 w-8 text-yellow-400" />
            <div>
              <h1 className="text-xl font-bold text-white">{challenge?.title}</h1>
              <p className="text-purple-200 text-sm">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <p className="text-purple-200 text-sm">Score</p>
              <p className="text-2xl font-bold text-yellow-400">{score}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className={`h-6 w-6 ${getTimeColor()}`} />
              <span className={`text-2xl font-bold ${getTimeColor()}`}>
                {formatTime(timeRemaining)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="container mx-auto px-6 mb-8">
        <div className="bg-white/10 rounded-full h-2">
          <div 
            className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <span className="bg-yellow-500 text-purple-900 px-3 py-1 rounded-full text-sm font-semibold">
                  +{currentQuestion.points_value} points
                </span>
                {currentQuestionIndex === 0 && (
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Speed bonus available!
                  </span>
                )}
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-8">
              {currentQuestion.question_text}
            </h2>

            <div className="space-y-4">
              {currentQuestion.answers.map((answer) => (
                <button
                  key={answer.id}
                  onClick={() => handleAnswerSelect(answer.id)}
                  className={`w-full p-4 rounded-lg text-left transition-all ${
                    selectedAnswer === answer.id
                      ? 'bg-yellow-500 text-purple-900 border-2 border-yellow-400'
                      : 'bg-white/10 text-white border border-purple-300 hover:bg-white/20'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedAnswer === answer.id
                        ? 'border-purple-900 bg-purple-900'
                        : 'border-purple-300'
                    }`}>
                      {selectedAnswer === answer.id && (
                        <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                      )}
                    </div>
                    <span className="font-medium">{answer.answer_text}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Exit Challenge
            </button>
            <button
              onClick={handleNextQuestion}
              disabled={!selectedAnswer}
              className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-purple-900 px-8 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
            >
              <span>{currentQuestionIndex === questions.length - 1 ? 'Complete Challenge' : 'Next Question'}</span>
              <Play className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

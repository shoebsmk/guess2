import { useState, useEffect } from 'react'
import { Star, Check, Crown, Zap, Trophy } from 'lucide-react'
import { supabase } from '@/supabase/client'
import { apiUrl } from '@/utils/api'

interface SubscriptionData {
  hasSubscription: boolean
  isPremium: boolean
  status?: string
  currentPeriodStart?: number
  currentPeriodEnd?: number
  cancelAtPeriodEnd?: boolean
}

export default function PremiumUpgrade() {
  const [isPremium, setIsPremium] = useState(false)
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  const STRIPE_PRICE_ID = 'price_1SaO6UPsmAyNGpWhlLjvqwUL' // Monthly subscription

  useEffect(() => {
    fetchUserSubscription()
  }, [])

  const fetchUserSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUser(user)
        
        // Fetch subscription data
        const response = await fetch(apiUrl(`/api/payments/subscription/${user.id}`))
        if (response.ok) {
          const data = await response.json()
          setSubscription(data.data)
          setIsPremium(data.data.isPremium)
        }
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async () => {
    if (!currentUser) return

    try {
      setProcessing(true)
      
      const response = await fetch(apiUrl('/api/payments/create-checkout-session'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id,
          priceId: STRIPE_PRICE_ID,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Redirect to Stripe Checkout
        window.location.href = data.data.url
      } else {
        console.error('Failed to create checkout session')
      }
    } catch (error) {
      console.error('Error upgrading to premium:', error)
    } finally {
      setProcessing(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!currentUser) return

    try {
      setProcessing(true)
      
      const response = await fetch(apiUrl('/api/payments/cancel-subscription'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        alert(data.message)
        fetchUserSubscription() // Refresh subscription data
      }
    } catch (error) {
      console.error('Error canceling subscription:', error)
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading subscription status...</p>
      </div>
    )
  }

  if (isPremium) {
    return (
      <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-center mb-4">
          <Crown className="h-12 w-12 text-yellow-400" />
        </div>
        <h2 className="text-2xl font-bold text-center mb-2">⭐ Premium Member</h2>
        <p className="text-center text-purple-100 mb-6">
          You're enjoying all premium features!
        </p>
        
        {subscription?.cancelAtPeriodEnd && (
          <div className="bg-white/10 rounded-lg p-4 mb-6">
            <p className="text-sm text-center">
              Your subscription will expire on {subscription.currentPeriodEnd && new Date(subscription.currentPeriodEnd * 1000).toLocaleDateString()}
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-400" />
            <h3 className="font-semibold">Premium Challenges</h3>
            <p className="text-sm text-purple-100">Access exclusive content</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <Zap className="h-8 w-8 mx-auto mb-2 text-yellow-400" />
            <h3 className="font-semibold">Bonus Points</h3>
            <p className="text-sm text-purple-100">Earn 2x loyalty points</p>
          </div>
        </div>
        
        {!subscription?.cancelAtPeriodEnd && (
          <button
            onClick={handleCancelSubscription}
            disabled={processing}
            className="w-full bg-white/20 hover:bg-white/30 text-white py-3 rounded-lg font-medium transition-colors"
          >
            {processing ? 'Processing...' : 'Cancel Subscription'}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl shadow-lg p-8 text-white">
      <div className="flex items-center justify-center mb-4">
        <Star className="h-12 w-12 text-yellow-400" />
      </div>
      <h2 className="text-2xl font-bold text-center mb-2">Upgrade to Premium</h2>
      <p className="text-center text-purple-100 mb-6">
        Unlock the full potential of Guess2 with premium features
      </p>
      
      <div className="bg-white/10 rounded-lg p-6 mb-6">
        <div className="text-center mb-4">
          <span className="text-4xl font-bold">$19.99</span>
          <span className="text-purple-100">/month</span>
        </div>
        
        <ul className="space-y-3">
          <li className="flex items-center">
            <Check className="h-5 w-5 text-green-400 mr-3" />
            <span>Access to premium daily challenges</span>
          </li>
          <li className="flex items-center">
            <Check className="h-5 w-5 text-green-400 mr-3" />
            <span>Unlock past premium challenges</span>
          </li>
          <li className="flex items-center">
            <Check className="h-5 w-5 text-green-400 mr-3" />
            <span>2x loyalty points multiplier</span>
          </li>
          <li className="flex items-center">
            <Check className="h-5 w-5 text-green-400 mr-3" />
            <span>Exclusive achievement badges</span>
          </li>
          <li className="flex items-center">
            <Check className="h-5 w-5 text-green-400 mr-3" />
            <span>Bonus rounds and special events</span>
          </li>
        </ul>
      </div>
      
      <button
        onClick={handleUpgrade}
        disabled={processing}
        className="w-full bg-yellow-500 hover:bg-yellow-600 text-purple-900 py-3 rounded-lg font-bold transition-colors transform hover:scale-105"
      >
        {processing ? 'Processing...' : 'Upgrade to Premium'}
      </button>
      
      <p className="text-center text-xs text-purple-200 mt-4">
        Secure payment powered by Stripe • Cancel anytime
      </p>
    </div>
  )
}

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Crown, Zap, Trophy, Target, Clock } from 'lucide-react'
import { STRIPE_CONFIG } from '@/config/stripe'

interface PremiumSubscriptionProps {
  userId: string
  currentPlan?: 'free' | 'premium'
  onSubscribe: (priceId: string) => Promise<void>
}

const PREMIUM_FEATURES = STRIPE_CONFIG.FEATURES.premium

export default function PremiumSubscription({ userId, currentPlan = 'free', onSubscribe }: PremiumSubscriptionProps) {
  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const handleSubscribe = async (priceId: string) => {
    setLoading(true)
    setSelectedPlan(priceId)
    
    try {
      await onSubscribe(priceId)
    } catch (error) {
      console.error('Subscription failed:', error)
    } finally {
      setLoading(false)
      setSelectedPlan(null)
    }
  }

  if (currentPlan === 'premium') {
    return (
      <Card className="border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-purple-800">Premium Member</CardTitle>
          <CardDescription className="text-purple-600">
            You're enjoying all premium features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-4 bg-white rounded-lg">
              <Trophy className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-800">∞</div>
              <div className="text-sm text-purple-600">Challenges</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <Target className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-800">Premium</div>
              <div className="text-sm text-purple-600">Access</div>
            </div>
          </div>
          <div className="text-center text-purple-600">
            <p className="text-sm">Thank you for supporting Guess2!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Free Plan Comparison */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Current Plan: Free
          </CardTitle>
          <CardDescription>
            Upgrade to unlock the full potential of Guess2
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-green-600">✓ What you have now:</h4>
              <ul className="space-y-2 text-sm">
                {STRIPE_CONFIG.FEATURES.free.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-purple-600">✨ What you get with Premium:</h4>
              <ul className="space-y-2 text-sm">
                {PREMIUM_FEATURES.slice(0, 4).map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-purple-500" />
                    {feature}
                  </li>
                ))}
                <li className="text-purple-500 font-medium">And much more...</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.values(STRIPE_CONFIG.PLANS).map((plan) => (
          <Card key={plan.id} className={`relative ${plan.popular ? 'border-purple-500 ring-2 ring-purple-500' : 'border-gray-200'}`}>
            {plan.popular && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-purple-500">
                Most Popular
              </Badge>
            )}
            {'savings' in plan && plan.savings ? (
              <Badge className="absolute -top-2 right-2 bg-green-500 text-xs">
                {plan.savings}
              </Badge>
            ) : null}
            <CardHeader className="text-center">
              <CardTitle className={plan.popular ? 'text-purple-800' : ''}>
                {plan.name}
              </CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-gray-500">{plan.period}</span>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => handleSubscribe(plan.priceId)}
                disabled={loading}
                className={`w-full ${plan.popular 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' 
                  : 'bg-gray-800 hover:bg-gray-900'
                }`}
              >
                {loading && selectedPlan === plan.priceId ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Upgrade to Premium'
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* All Premium Features */}
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="text-purple-800">Complete Premium Experience</CardTitle>
          <CardDescription className="text-purple-600">
            Everything you need to become a trivia master
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PREMIUM_FEATURES.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                <Crown className="w-5 h-5 text-purple-500 flex-shrink-0" />
                <span className="text-sm font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

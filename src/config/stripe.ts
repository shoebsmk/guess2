// Stripe configuration for Guess2
export const STRIPE_CONFIG = {
  // Price IDs for different subscription plans
  PRICES: {
    MONTHLY_PREMIUM: 'price_monthly_premium', // This would be your actual Stripe price ID
    YEARLY_PREMIUM: 'price_yearly_premium',   // This would be your actual Stripe price ID
  },
  
  // Subscription plans configuration
  PLANS: {
    monthly: {
      id: 'monthly',
      name: 'Monthly Premium',
      price: '$9.99',
      period: '/month',
      priceId: 'price_monthly_premium',
      popular: false
    },
    yearly: {
      id: 'yearly', 
      name: 'Yearly Premium',
      price: '$99.99',
      period: '/year',
      priceId: 'price_yearly_premium',
      popular: true,
      savings: 'Save 17%'
    }
  },

  // Feature lists for different plans
  FEATURES: {
    free: [
      '3 daily challenges',
      'Basic leaderboard access',
      'Basic achievements',
      'Streak tracking'
    ],
    premium: [
      'Unlimited daily challenges',
      'Access to premium challenge categories',
      'Advanced statistics and analytics',
      'Priority leaderboard ranking',
      'Exclusive achievement badges',
      'Ad-free experience',
      'Early access to new features',
      'Premium customer support'
    ]
  }
}

// Helper function to get price ID by plan ID
export const getPriceId = (planId: string): string => {
  const plan = Object.values(STRIPE_CONFIG.PLANS).find(p => p.id === planId)
  return plan?.priceId || STRIPE_CONFIG.PRICES.MONTHLY_PREMIUM
}

// Helper function to get plan by price ID
export const getPlanByPriceId = (priceId: string): any => {
  return Object.values(STRIPE_CONFIG.PLANS).find(p => p.priceId === priceId)
}
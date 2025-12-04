import express, { type Request, type Response, type NextFunction } from 'express'
import Stripe from 'stripe'
import { supabase } from '../config/supabase.js'

const router = express.Router()

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY')
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16',
})

// Create checkout session
router.post('/create-checkout-session', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, priceId } = req.body

    if (!userId || !priceId) {
      return res.status(400).json({
        success: false,
        error: 'User ID and Price ID are required',
      })
    }

    // Get user details from Supabase
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email, username')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      })
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5175'}/profile?success=true`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5175'}/profile?canceled=true`,
      metadata: {
        userId: userId,
      },
    })

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url,
      },
    })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    next(error)
  }
})

// Webhook endpoint for Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!sig || !webhookSecret) {
    return res.status(400).send('Missing signature or webhook secret')
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return res.status(400).send('Invalid signature')
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutSessionCompleted(session)
        break

      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(subscription)
        break

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(deletedSubscription)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    res.json({ received: true })
  } catch (error) {
    console.error('Error handling webhook event:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Handle checkout session completion
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  const subscriptionId = session.subscription as string

  if (!userId || !subscriptionId) {
    console.error('Missing userId or subscriptionId in session metadata')
    return
  }

  try {
    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    
    // Update user in Supabase
    const { error } = await supabase
      .from('users')
      .update({
        is_premium: true,
        stripe_subscription_id: subscriptionId,
        stripe_customer_id: subscription.customer as string,
        subscription_status: subscription.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) {
      console.error('Error updating user premium status:', error)
      return
    }

    // Create subscription record
    await supabase.from('subscriptions').insert([
      {
        user_id: userId,
        stripe_subscription_id: subscriptionId,
        stripe_customer_id: subscription.customer as string,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        created_at: new Date().toISOString(),
      },
    ])

    console.log(`User ${userId} upgraded to premium successfully`)
  } catch (error) {
    console.error('Error handling checkout session completion:', error)
  }
}

// Handle subscription updates
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        subscription_status: subscription.status,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id)

    if (error) {
      console.error('Error updating subscription status:', error)
      return
    }

    // Update subscription record
    await supabase
      .from('subscriptions')
      .update({
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id)

    console.log(`Subscription ${subscription.id} updated successfully`)
  } catch (error) {
    console.error('Error handling subscription update:', error)
  }
}

// Handle subscription deletion
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        is_premium: false,
        subscription_status: 'canceled',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id)

    if (error) {
      console.error('Error updating user subscription status:', error)
      return
    }

    // Update subscription record
    await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id)

    console.log(`Subscription ${subscription.id} canceled successfully`)
  } catch (error) {
    console.error('Error handling subscription deletion:', error)
  }
}

// Get subscription details for a user
router.get('/subscription/:userId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params

    const { data: user, error } = await supabase
      .from('users')
      .select('stripe_subscription_id, subscription_status, is_premium')
      .eq('id', userId)
      .single()

    if (error || !user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      })
    }

    if (!user.stripe_subscription_id) {
      return res.json({
        success: true,
        data: {
          hasSubscription: false,
          isPremium: user.is_premium,
        },
      })
    }

    // Get subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(user.stripe_subscription_id)

    res.json({
      success: true,
      data: {
        hasSubscription: true,
        isPremium: user.is_premium,
        status: subscription.status,
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
    })
  } catch (error) {
    next(error)
  }
})

// Cancel subscription
router.post('/cancel-subscription', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.body

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required',
      })
    }

    // Get user's subscription ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('stripe_subscription_id')
      .eq('id', userId)
      .single()

    if (userError || !user?.stripe_subscription_id) {
      return res.status(404).json({
        success: false,
        error: 'No active subscription found',
      })
    }

    // Cancel the subscription at period end
    const subscription = await stripe.subscriptions.update(
      user.stripe_subscription_id,
      {
        cancel_at_period_end: true,
      }
    )

    res.json({
      success: true,
      data: {
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        currentPeriodEnd: subscription.current_period_end,
      },
      message: 'Subscription will be canceled at the end of the current billing period',
    })
  } catch (error) {
    next(error)
  }
})

export default router

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { SUBSCRIPTION_PLANS, SubscriptionTier } from '@/lib/subscription'

// In a real implementation, you would initialize Stripe here:
// import Stripe from 'stripe'
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = session.user as any
    const userRole = user.role

    // Only owners and admins can create payment intents
    if (!['OWNER', 'ADMIN'].includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { targetTier, billingCycle = 'monthly' } = body

    // Validate inputs
    if (!Object.keys(SUBSCRIPTION_PLANS).includes(targetTier)) {
      return NextResponse.json({ error: 'Invalid subscription tier' }, { status: 400 })
    }

    if (!['monthly', 'yearly'].includes(billingCycle)) {
      return NextResponse.json({ error: 'Invalid billing cycle' }, { status: 400 })
    }

    const plan = SUBSCRIPTION_PLANS[targetTier as SubscriptionTier]
    const amount = billingCycle === 'yearly' ? plan.yearlyPrice : plan.price

    // In a real implementation, you would create a Stripe PaymentIntent:
    /*
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe uses cents
      currency: 'usd',
      metadata: {
        instituteId: user.instituteId,
        userId: user.id,
        targetTier,
        billingCycle
      },
      description: `${plan.name} Plan - ${billingCycle === 'yearly' ? 'Yearly' : 'Monthly'}`
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amount: amount,
      currency: 'usd'
    })
    */

    // Mock response for development
    const mockClientSecret = `pi_${Math.random().toString(36).substr(2, 9)}_secret_${Math.random().toString(36).substr(2, 9)}`

    return NextResponse.json({
      clientSecret: mockClientSecret,
      amount: amount,
      currency: 'usd',
      plan: {
        name: plan.name,
        tier: targetTier,
        billingCycle,
        features: plan.features
      },
      mock: true // Flag to indicate this is mock data
    })

  } catch (error) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Return Stripe publishable key for client-side
    // In a real implementation, you would return the actual Stripe publishable key
    return NextResponse.json({
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_mock_key',
      mock: !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    })

  } catch (error) {
    console.error('Error fetching Stripe config:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment configuration' },
      { status: 500 }
    )
  }
}
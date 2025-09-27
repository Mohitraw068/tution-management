import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { PrismaClient } from '@prisma/client'
import { SubscriptionTier, SUBSCRIPTION_PLANS } from '@/lib/subscription'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = session.user as any
    const instituteId = user.instituteId
    const userRole = user.role

    // Only owners and admins can upgrade subscriptions
    if (!['OWNER', 'ADMIN'].includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    if (!instituteId) {
      return NextResponse.json({ error: 'Institute not found' }, { status: 400 })
    }

    const body = await request.json()
    const { targetTier, billingCycle = 'monthly', paymentMethodId } = body

    // Validate target tier
    if (!Object.keys(SUBSCRIPTION_PLANS).includes(targetTier)) {
      return NextResponse.json({ error: 'Invalid subscription tier' }, { status: 400 })
    }

    // Get current institute
    const institute = await prisma.institute.findUnique({
      where: { id: instituteId },
      select: {
        id: true,
        subscription: true,
        name: true
      }
    })

    if (!institute) {
      return NextResponse.json({ error: 'Institute not found' }, { status: 404 })
    }

    const currentTier = (institute.subscription as SubscriptionTier) || 'BASIC'
    const targetPlan = SUBSCRIPTION_PLANS[targetTier]

    // Check if this is actually an upgrade
    const tierHierarchy: Record<SubscriptionTier, number> = {
      BASIC: 1,
      PRO: 2,
      ENTERPRISE: 3
    }

    if (tierHierarchy[targetTier] <= tierHierarchy[currentTier]) {
      return NextResponse.json({ error: 'Can only upgrade to higher tiers' }, { status: 400 })
    }

    // In a real implementation, you would:
    // 1. Create a Stripe customer if not exists
    // 2. Create a Stripe subscription
    // 3. Handle payment processing
    // 4. Update the database only after successful payment

    // Mock Stripe integration
    const mockStripeResponse = {
      id: 'sub_' + Math.random().toString(36).substr(2, 9),
      status: 'active',
      current_period_start: Math.floor(Date.now() / 1000),
      current_period_end: Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000),
      latest_invoice: {
        payment_intent: {
          status: 'succeeded'
        }
      }
    }

    // Update institute subscription
    await prisma.institute.update({
      where: { id: instituteId },
      data: {
        subscription: targetTier,
        studentLimit: targetPlan.studentLimit === -1 ? 9999 : targetPlan.studentLimit
      }
    })

    // Log the subscription change (in real app, store in a subscriptions table)
    console.log(`Institute ${instituteId} upgraded from ${currentTier} to ${targetTier}`)

    return NextResponse.json({
      success: true,
      subscription: {
        id: mockStripeResponse.id,
        tier: targetTier,
        status: 'active',
        currentPeriodStart: new Date(mockStripeResponse.current_period_start * 1000).toISOString(),
        currentPeriodEnd: new Date(mockStripeResponse.current_period_end * 1000).toISOString(),
        billingCycle
      },
      plan: targetPlan,
      message: `Successfully upgraded to ${targetPlan.name} plan`
    })

  } catch (error) {
    console.error('Error upgrading subscription:', error)
    return NextResponse.json(
      { error: 'Failed to upgrade subscription' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = session.user as any
    const instituteId = user.instituteId
    const userRole = user.role

    // Only owners can cancel subscriptions
    if (userRole !== 'OWNER') {
      return NextResponse.json({ error: 'Only owners can cancel subscriptions' }, { status: 403 })
    }

    if (!instituteId) {
      return NextResponse.json({ error: 'Institute not found' }, { status: 400 })
    }

    // In a real implementation, you would:
    // 1. Cancel the Stripe subscription
    // 2. Set it to cancel at period end
    // 3. Update the database

    // For now, just update to BASIC (free tier)
    await prisma.institute.update({
      where: { id: instituteId },
      data: {
        subscription: 'BASIC',
        studentLimit: 100 // Basic tier limit
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled. You will retain access until the end of your current billing period.'
    })

  } catch (error) {
    console.error('Error cancelling subscription:', error)
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { PrismaClient } from '@prisma/client'
import { SubscriptionStatus, SubscriptionTier, SubscriptionUsage, SUBSCRIPTION_PLANS } from '@/lib/subscription'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = session.user as any
    const instituteId = user.instituteId

    if (!instituteId) {
      return NextResponse.json({ error: 'Institute not found' }, { status: 400 })
    }

    // Get institute with subscription info
    const institute = await prisma.institute.findUnique({
      where: { id: instituteId },
      select: {
        id: true,
        name: true,
        subscription: true,
        studentLimit: true,
        primaryColor: true,
        createdAt: true,
        users: {
          select: {
            id: true,
            role: true
          }
        },
        classes: {
          select: {
            id: true
          }
        }
      }
    })

    if (!institute) {
      return NextResponse.json({ error: 'Institute not found' }, { status: 404 })
    }

    // Calculate usage metrics
    const studentsUsed = institute.users.filter(u => u.role === 'STUDENT').length
    const classesCreated = institute.classes.length

    // Mock data for other usage metrics
    const usage: SubscriptionUsage = {
      studentsUsed,
      classesCreated,
      reportsGenerated: 45, // Mock data
      storageUsed: 1250 // Mock data in MB
    }

    // Get subscription tier (default to BASIC if not set)
    const currentTier = (institute.subscription as SubscriptionTier) || 'BASIC'
    const plan = SUBSCRIPTION_PLANS[currentTier]

    // Mock subscription status - in real app, this would come from Stripe
    const subscriptionStatus: SubscriptionStatus = {
      tier: currentTier,
      status: 'active',
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      usage,
      billingCycle: 'monthly'
    }

    // Mock billing history
    const billingHistory = [
      {
        id: 'inv_001',
        date: '2024-01-01',
        amount: plan.price,
        status: 'paid',
        description: `${plan.name} Plan - Monthly`,
        invoice_url: '#'
      },
      {
        id: 'inv_002',
        date: '2023-12-01',
        amount: plan.price,
        status: 'paid',
        description: `${plan.name} Plan - Monthly`,
        invoice_url: '#'
      },
      {
        id: 'inv_003',
        date: '2023-11-01',
        amount: plan.price,
        status: 'paid',
        description: `${plan.name} Plan - Monthly`,
        invoice_url: '#'
      }
    ]

    // Check limits and restrictions
    const isOverStudentLimit = plan.studentLimit !== -1 && studentsUsed > plan.studentLimit
    const utilizationRate = plan.studentLimit === -1 ? 0 : (studentsUsed / plan.studentLimit) * 100

    return NextResponse.json({
      subscription: subscriptionStatus,
      plan: plan,
      institute: {
        id: institute.id,
        name: institute.name,
        createdAt: institute.createdAt,
        primaryColor: institute.primaryColor
      },
      limits: {
        isOverStudentLimit,
        utilizationRate: Math.round(utilizationRate),
        studentsUsed,
        studentLimit: plan.studentLimit,
        studentsRemaining: plan.studentLimit === -1 ? -1 : Math.max(0, plan.studentLimit - studentsUsed)
      },
      billing: {
        nextBillingDate: subscriptionStatus.currentPeriodEnd,
        amount: plan.price,
        cycle: subscriptionStatus.billingCycle,
        history: billingHistory
      },
      features: {
        available: plan.features,
        analytics: currentTier !== 'BASIC',
        aiFeatures: ['PRO', 'ENTERPRISE'].includes(currentTier),
        customBranding: ['PRO', 'ENTERPRISE'].includes(currentTier),
        apiAccess: ['PRO', 'ENTERPRISE'].includes(currentTier),
        prioritySupport: ['PRO', 'ENTERPRISE'].includes(currentTier),
        whiteLabel: currentTier === 'ENTERPRISE',
        multiCampus: currentTier === 'ENTERPRISE'
      }
    })

  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription details' },
      { status: 500 }
    )
  }
}
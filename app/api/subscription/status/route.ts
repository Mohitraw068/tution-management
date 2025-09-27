import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { checkSubscriptionTier } from '@/lib/subscription';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const subscription = await checkSubscriptionTier(session.user.email);

    if (!subscription) {
      // Return default BASIC tier if no subscription found
      return NextResponse.json({
        tier: 'BASIC',
        status: 'active',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        usage: {
          studentsUsed: 0,
          classesCreated: 0,
          reportsGenerated: 0,
          storageUsed: 0
        },
        billingCycle: 'monthly'
      });
    }

    return NextResponse.json(subscription);

  } catch (error) {
    console.error('Error checking subscription status:', error);
    return NextResponse.json(
      { error: 'Failed to check subscription status' },
      { status: 500 }
    );
  }
}
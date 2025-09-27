'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { useSubscription } from '@/hooks/useSubscription'
import { SubscriptionTier, SUBSCRIPTION_PLANS } from '@/lib/subscription'

interface FeatureGateProps {
  requiredTier: SubscriptionTier
  feature?: string
  children: ReactNode
  fallback?: ReactNode
  showUpgrade?: boolean
}

export function FeatureGate({
  requiredTier,
  feature,
  children,
  fallback,
  showUpgrade = true
}: FeatureGateProps) {
  const { canAccess, plan, loading } = useSubscription()

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="bg-gray-200 rounded h-20 w-full"></div>
      </div>
    )
  }

  if (canAccess(requiredTier)) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  if (!showUpgrade) {
    return null
  }

  const requiredPlan = SUBSCRIPTION_PLANS[requiredTier]

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-dashed border-blue-200 rounded-xl p-8 text-center">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {feature ? `${feature} - Premium Feature` : 'Premium Feature'}
      </h3>

      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {feature
          ? `Access to ${feature} requires the ${requiredPlan.name} plan or higher.`
          : `This feature requires the ${requiredPlan.name} plan or higher.`
        }
        {plan && (
          <span className="block mt-2">
            You're currently on the {plan.name} plan.
          </span>
        )}
      </p>

      <div className="space-y-3">
        <Link
          href="/subscription/upgrade"
          className="inline-flex px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all transform hover:scale-105 shadow-lg"
        >
          Upgrade to {requiredPlan.name}
        </Link>

        <div>
          <Link
            href="/pricing"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View all plans →
          </Link>
        </div>
      </div>
    </div>
  )
}

interface UsageLimitGateProps {
  type: 'students' | 'classes' | 'storage'
  children: ReactNode
  customMessage?: string
}

export function UsageLimitGate({ type, children, customMessage }: UsageLimitGateProps) {
  const { isOverLimit, limits, plan } = useSubscription()

  if (!isOverLimit(type)) {
    return <>{children}</>
  }

  const getDefaultMessage = () => {
    switch (type) {
      case 'students':
        return `You've reached your student limit of ${limits?.studentLimit || 0}. Upgrade your plan to add more students.`
      case 'classes':
        return 'You\'ve reached your class limit. Upgrade your plan to create more classes.'
      case 'storage':
        return 'You\'ve reached your storage limit. Upgrade your plan for more storage space.'
      default:
        return 'You\'ve reached a usage limit. Please upgrade your plan.'
    }
  }

  return (
    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 text-center">
      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">Usage Limit Reached</h3>

      <p className="text-gray-600 mb-6">
        {customMessage || getDefaultMessage()}
      </p>

      <div className="space-y-3">
        <Link
          href="/subscription/upgrade"
          className="inline-flex px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors"
        >
          Upgrade Plan
        </Link>

        <div>
          <Link
            href="/subscription"
            className="text-yellow-600 hover:text-yellow-700 text-sm font-medium"
          >
            View current usage →
          </Link>
        </div>
      </div>
    </div>
  )
}
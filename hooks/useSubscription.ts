import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { SubscriptionTier, canAccessFeature, getStudentLimit } from '@/lib/subscription'

interface SubscriptionHook {
  subscription: any
  plan: any
  limits: any
  features: any
  loading: boolean
  canAccess: (requiredTier: SubscriptionTier) => boolean
  isOverLimit: (type: 'students' | 'classes' | 'storage') => boolean
  showUpgradePrompt: (feature: string) => void
  refreshSubscription: () => void
}

export function useSubscription(): SubscriptionHook {
  const { data: session } = useSession()
  const [subscriptionData, setSubscriptionData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session) {
      fetchSubscription()
    }
  }, [session])

  const fetchSubscription = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/subscription/current')
      if (response.ok) {
        const data = await response.json()
        setSubscriptionData(data)
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const canAccess = (requiredTier: SubscriptionTier): boolean => {
    if (!subscriptionData?.subscription?.tier) return false
    return canAccessFeature(subscriptionData.subscription.tier, requiredTier)
  }

  const isOverLimit = (type: 'students' | 'classes' | 'storage'): boolean => {
    if (!subscriptionData?.limits) return false

    switch (type) {
      case 'students':
        return subscriptionData.limits.isOverStudentLimit
      case 'classes':
        // Mock limit check for classes
        return subscriptionData.subscription?.usage?.classesCreated > 50
      case 'storage':
        // Mock limit check for storage (in MB)
        return subscriptionData.subscription?.usage?.storageUsed > 5000
      default:
        return false
    }
  }

  const showUpgradePrompt = (feature: string) => {
    // This could show a modal or redirect to upgrade page
    const upgradeUrl = `/subscription/upgrade?feature=${encodeURIComponent(feature)}`
    window.location.href = upgradeUrl
  }

  return {
    subscription: subscriptionData?.subscription,
    plan: subscriptionData?.plan,
    limits: subscriptionData?.limits,
    features: subscriptionData?.features,
    loading,
    canAccess,
    isOverLimit,
    showUpgradePrompt,
    refreshSubscription: fetchSubscription
  }
}
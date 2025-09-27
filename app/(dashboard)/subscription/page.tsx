'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { formatPrice, getUpgradeOptions, SUBSCRIPTION_PLANS } from '@/lib/subscription'

interface SubscriptionData {
  subscription: any
  plan: any
  institute: any
  limits: any
  billing: any
  features: any
}

export default function SubscriptionPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const userRole = session?.user?.role

  // Only owners and admins can access subscription settings
  const canManageSubscription = ['OWNER', 'ADMIN'].includes(userRole || '')

  useEffect(() => {
    if (session) {
      fetchSubscriptionData()
    }
  }, [session])

  const fetchSubscriptionData = async () => {
    try {
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

  const handleCancelSubscription = async () => {
    try {
      setCancelling(true)
      const response = await fetch('/api/subscription/upgrade', {
        method: 'DELETE'
      })

      if (response.ok) {
        setShowCancelModal(false)
        fetchSubscriptionData() // Refresh data
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error)
    } finally {
      setCancelling(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getUtilizationColor = (rate: number) => {
    if (rate >= 90) return 'text-red-600 bg-red-100'
    if (rate >= 75) return 'text-yellow-600 bg-yellow-100'
    return 'text-green-600 bg-green-100'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'cancelled': return 'text-gray-600 bg-gray-100'
      case 'past_due': return 'text-yellow-600 bg-yellow-100'
      case 'unpaid': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!subscriptionData) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Unable to load subscription details</h2>
        <p className="text-gray-600">Please try refreshing the page</p>
      </div>
    )
  }

  const { subscription, plan, institute, limits, billing, features } = subscriptionData
  const upgradeOptions = getUpgradeOptions(subscription.tier)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscription</h1>
          <p className="text-gray-600">Manage your plan and billing</p>
        </div>
        {canManageSubscription && upgradeOptions.length > 0 && (
          <button
            onClick={() => router.push('/subscription/upgrade')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Upgrade Plan
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Plan */}
        <div className="lg:col-span-2 space-y-6">
          {/* Plan Overview */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Current Plan</h2>
                <p className="text-gray-600">Your subscription details and usage</p>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription.status)}`}>
                {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900">{plan.name}</h3>
                    <p className="text-blue-700 text-sm">{plan.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-900">{formatPrice(plan.price)}</p>
                    <p className="text-blue-700 text-sm">per month</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Student Usage</span>
                    <span className="text-sm font-medium text-gray-900">
                      {limits.studentsUsed} / {limits.studentLimit === -1 ? '∞' : limits.studentLimit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${limits.utilizationRate >= 90 ? 'bg-red-500' : limits.utilizationRate >= 75 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${Math.min(limits.utilizationRate, 100)}%` }}
                    ></div>
                  </div>
                  <p className={`text-xs mt-1 px-2 py-1 rounded-full inline-flex ${getUtilizationColor(limits.utilizationRate)}`}>
                    {limits.utilizationRate}% utilized
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Classes</span>
                    <p className="font-medium">{subscription.usage.classesCreated}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Reports</span>
                    <p className="font-medium">{subscription.usage.reportsGenerated}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Features List */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Plan Features</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {plan.features.map((feature: string, index: number) => (
                  <div key={index} className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Usage Alerts */}
          {limits.utilizationRate >= 80 && (
            <div className={`rounded-lg p-4 ${limits.utilizationRate >= 90 ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'}`}>
              <div className="flex">
                <svg className={`w-5 h-5 ${limits.utilizationRate >= 90 ? 'text-red-400' : 'text-yellow-400'} mt-0.5 mr-3 flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h3 className={`text-sm font-medium ${limits.utilizationRate >= 90 ? 'text-red-800' : 'text-yellow-800'}`}>
                    {limits.utilizationRate >= 90 ? 'Student Limit Approaching' : 'High Usage Warning'}
                  </h3>
                  <p className={`text-sm ${limits.utilizationRate >= 90 ? 'text-red-700' : 'text-yellow-700'} mt-1`}>
                    You're using {limits.utilizationRate}% of your student limit.
                    {limits.utilizationRate >= 90 ? ' Consider upgrading your plan to avoid service interruption.' : ' Monitor your usage to avoid hitting limits.'}
                  </p>
                  {upgradeOptions.length > 0 && (
                    <button
                      onClick={() => router.push('/subscription/upgrade')}
                      className={`mt-2 text-sm font-medium ${limits.utilizationRate >= 90 ? 'text-red-800 hover:text-red-900' : 'text-yellow-800 hover:text-yellow-900'}`}
                    >
                      Upgrade Plan →
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Billing History */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Billing History</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {billing.history.map((invoice: any) => (
                    <tr key={invoice.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(invoice.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {invoice.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPrice(invoice.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <a href={invoice.invoice_url} className="text-blue-600 hover:text-blue-700">
                          Download
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Next Billing */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Billing</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Date</span>
                <span className="font-medium">{formatDate(billing.nextBillingDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount</span>
                <span className="font-medium">{formatPrice(billing.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cycle</span>
                <span className="font-medium capitalize">{billing.cycle}</span>
              </div>
            </div>
          </div>

          {/* Upgrade Options */}
          {upgradeOptions.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upgrade Options</h3>
              <div className="space-y-4">
                {upgradeOptions.map((option) => (
                  <div key={option.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">{option.name}</h4>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{formatPrice(option.price)}</p>
                        <p className="text-xs text-gray-600">per month</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{option.description}</p>
                    <button
                      onClick={() => router.push('/subscription/upgrade')}
                      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition-colors"
                    >
                      Upgrade to {option.name}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cancel Subscription */}
          {canManageSubscription && userRole === 'OWNER' && subscription.tier !== 'BASIC' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancel Subscription</h3>
              <p className="text-sm text-gray-600 mb-4">
                Cancel your subscription and downgrade to the Basic plan. You'll retain access until the end of your billing period.
              </p>
              <button
                onClick={() => setShowCancelModal(true)}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg font-medium transition-colors"
              >
                Cancel Subscription
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancel Subscription</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel your {plan.name} subscription? You'll lose access to premium features
              at the end of your current billing period ({formatDate(billing.nextBillingDate)}).
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-medium transition-colors"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={cancelling}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
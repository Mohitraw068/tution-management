'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'
import {
  SUBSCRIPTION_PLANS,
  formatPrice,
  calculateSavings,
  getUpgradeOptions,
  SubscriptionTier
} from '@/lib/subscription'

// This would be loaded from environment variable in production
let stripePromise: any = null

interface PaymentFormProps {
  selectedPlan: any
  billingCycle: 'monthly' | 'yearly'
  onSuccess: () => void
}

function PaymentForm({ selectedPlan, billingCycle, onSuccess }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setProcessing(true)
    setErrorMessage('')

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      setErrorMessage('Card element not found')
      setProcessing(false)
      return
    }

    try {
      // Create payment intent
      const paymentIntentResponse = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          targetTier: selectedPlan.id,
          billingCycle
        })
      })

      if (!paymentIntentResponse.ok) {
        throw new Error('Failed to create payment intent')
      }

      const { clientSecret, mock } = await paymentIntentResponse.json()

      if (mock) {
        // Mock payment success for development
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Upgrade subscription
        const upgradeResponse = await fetch('/api/subscription/upgrade', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            targetTier: selectedPlan.id,
            billingCycle,
            paymentMethodId: 'pm_mock_' + Date.now()
          })
        })

        if (upgradeResponse.ok) {
          onSuccess()
        } else {
          throw new Error('Failed to upgrade subscription')
        }
      } else {
        // Real Stripe payment processing
        const result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: 'Customer Name' // In real app, get from form
            }
          }
        })

        if (result.error) {
          setErrorMessage(result.error.message || 'Payment failed')
        } else if (result.paymentIntent?.status === 'succeeded') {
          // Upgrade subscription
          const upgradeResponse = await fetch('/api/subscription/upgrade', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              targetTier: selectedPlan.id,
              billingCycle,
              paymentMethodId: result.paymentIntent.payment_method
            })
          })

          if (upgradeResponse.ok) {
            onSuccess()
          } else {
            throw new Error('Payment succeeded but subscription upgrade failed')
          }
        }
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Payment Information
        </label>
        <div className="border border-gray-300 rounded-lg p-4 bg-white">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
              },
            }}
          />
        </div>
        {errorMessage && (
          <p className="text-red-600 text-sm mt-2">{errorMessage}</p>
        )}
      </div>

      {/* Mock payment notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <svg className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-blue-800">Demo Mode</h3>
            <p className="text-sm text-blue-700 mt-1">
              This is a demo. Use any test card number (e.g., 4242 4242 4242 4242) with any future expiry date and CVC.
            </p>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
      >
        {processing ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
              <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
            </svg>
            Processing Payment...
          </>
        ) : (
          `Upgrade to ${selectedPlan.name} Plan`
        )}
      </button>
    </form>
  )
}

export default function UpgradePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [currentTier, setCurrentTier] = useState<SubscriptionTier>('BASIC')
  const [selectedPlanId, setSelectedPlanId] = useState<SubscriptionTier | null>(null)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [upgradeSuccess, setUpgradeSuccess] = useState(false)
  const [loading, setLoading] = useState(true)

  const userRole = session?.user?.role

  // Only owners and admins can upgrade subscriptions
  const canUpgrade = ['OWNER', 'ADMIN'].includes(userRole || '')

  useEffect(() => {
    if (session && canUpgrade) {
      fetchCurrentSubscription()
      initializeStripe()
    } else if (session && !canUpgrade) {
      router.push('/subscription')
    }
  }, [session, canUpgrade, router])

  const initializeStripe = async () => {
    try {
      const response = await fetch('/api/payments/create-intent')
      if (response.ok) {
        const { publishableKey } = await response.json()
        stripePromise = loadStripe(publishableKey)
      }
    } catch (error) {
      console.error('Failed to initialize Stripe:', error)
    }
  }

  const fetchCurrentSubscription = async () => {
    try {
      const response = await fetch('/api/subscription/current')
      if (response.ok) {
        const data = await response.json()
        setCurrentTier(data.subscription.tier)
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgradeSuccess = () => {
    setUpgradeSuccess(true)
    setShowPaymentForm(false)
    setTimeout(() => {
      router.push('/subscription?upgraded=true')
    }, 3000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!canUpgrade) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Access Denied</h2>
        <p className="text-gray-600">Only owners and admins can upgrade subscriptions.</p>
      </div>
    )
  }

  const upgradeOptions = getUpgradeOptions(currentTier)
  const selectedPlan = selectedPlanId ? SUBSCRIPTION_PLANS[selectedPlanId] : null

  if (upgradeSuccess) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Upgrade Successful!</h2>
          <p className="text-gray-600 mb-6">
            Your subscription has been upgraded to the {selectedPlan?.name} plan. You now have access to all premium features.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to subscription dashboard...
          </p>
        </div>
      </div>
    )
  }

  if (showPaymentForm && selectedPlan && stripePromise) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8">
          <div className="mb-8">
            <button
              onClick={() => setShowPaymentForm(false)}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to plan selection
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Complete Your Upgrade</h1>
            <p className="text-gray-600 mt-2">
              Upgrading to {selectedPlan.name} plan - {billingCycle === 'yearly' ? 'Annual' : 'Monthly'} billing
            </p>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Plan</span>
                <span className="font-medium">{selectedPlan.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Billing</span>
                <span className="font-medium capitalize">{billingCycle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Student Limit</span>
                <span className="font-medium">
                  {selectedPlan.studentLimit === -1 ? 'Unlimited' : selectedPlan.studentLimit.toLocaleString()}
                </span>
              </div>
              {billingCycle === 'yearly' && (
                <div className="flex justify-between text-green-600">
                  <span>Annual Savings</span>
                  <span className="font-medium">
                    {Math.round(calculateSavings(selectedPlan.price, selectedPlan.yearlyPrice))}% off
                  </span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-semibold text-gray-900">
                <span>Total</span>
                <span>
                  {formatPrice(billingCycle === 'yearly' ? selectedPlan.yearlyPrice : selectedPlan.price)}
                  /{billingCycle === 'yearly' ? 'year' : 'month'}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <Elements stripe={stripePromise}>
            <PaymentForm
              selectedPlan={selectedPlan}
              billingCycle={billingCycle}
              onSuccess={handleUpgradeSuccess}
            />
          </Elements>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Upgrade Your Plan</h1>
        <p className="text-gray-600">Choose a plan that fits your institution's needs</p>
      </div>

      {upgradeOptions.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">You're on the highest plan!</h2>
          <p className="text-gray-600">
            You're currently on the {SUBSCRIPTION_PLANS[currentTier].name} plan, which includes all available features.
          </p>
        </div>
      ) : (
        <>
          {/* Billing Toggle */}
          <div className="flex justify-center">
            <div className="bg-white rounded-lg p-1 shadow border border-gray-200">
              <div className="flex items-center">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    billingCycle === 'monthly'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-6 py-2 rounded-lg font-medium transition-all relative ${
                    billingCycle === 'yearly'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Yearly
                  <span className="absolute -top-2 -right-1 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                    Save 17%
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Plans */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {upgradeOptions.map((plan) => {
              const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.price
              const monthlyPrice = billingCycle === 'yearly' ? plan.yearlyPrice / 12 : plan.price
              const savings = billingCycle === 'yearly' ? calculateSavings(plan.price, plan.yearlyPrice) : 0

              return (
                <div
                  key={plan.id}
                  className={`bg-white rounded-xl shadow-lg border-2 transition-all hover:shadow-xl ${
                    selectedPlanId === plan.id
                      ? 'border-blue-500 ring-4 ring-blue-100'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${plan.popular ? 'relative' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium shadow-lg">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="p-8">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                      <p className="text-gray-600 mb-4">{plan.description}</p>

                      <div className="mb-4">
                        <div className="flex items-baseline justify-center">
                          <span className="text-4xl font-bold text-gray-900">
                            {formatPrice(Math.round(monthlyPrice))}
                          </span>
                          <span className="text-gray-600 ml-2">/month</span>
                        </div>

                        {billingCycle === 'yearly' && savings > 0 && (
                          <div className="mt-2">
                            <span className="text-sm text-green-600 font-medium">
                              Save {Math.round(savings)}% annually
                            </span>
                            <div className="text-sm text-gray-500">
                              Billed {formatPrice(price)} yearly
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <div className="text-lg font-semibold text-gray-900">
                          {plan.studentLimit === -1 ? 'Unlimited' : `Up to ${plan.studentLimit}`} Students
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-8">
                      {plan.features.slice(0, 6).map((feature, index) => (
                        <div key={index} className="flex items-start">
                          <svg
                            className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span className="text-gray-700 text-sm">{feature}</span>
                        </div>
                      ))}
                      {plan.features.length > 6 && (
                        <div className="text-sm text-gray-500">
                          And {plan.features.length - 6} more features...
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setSelectedPlanId(plan.id)
                        setShowPaymentForm(true)
                      }}
                      className={`w-full px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                        plan.popular
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg'
                          : 'bg-gray-900 hover:bg-gray-800 text-white'
                      }`}
                    >
                      Upgrade to {plan.name}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
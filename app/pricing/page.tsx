'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SUBSCRIPTION_PLANS, formatPrice, calculateSavings } from '@/lib/subscription'

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  const plans = Object.values(SUBSCRIPTION_PLANS)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600">
                EduPlatform
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="py-16 bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Choose the perfect plan for your educational institution. Start with our free trial and upgrade as you grow.
          </p>
        </div>
      </div>

      {/* Billing Toggle */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center mb-12">
            <div className="bg-white rounded-lg p-1 shadow-lg border border-gray-200">
              <div className="flex items-center">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    billingCycle === 'monthly'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all relative ${
                    billingCycle === 'yearly'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Yearly
                  <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    Save 17%
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => {
              const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.price
              const originalMonthlyPrice = billingCycle === 'yearly' ? plan.yearlyPrice / 12 : plan.price
              const savings = billingCycle === 'yearly' ? calculateSavings(plan.price, plan.yearlyPrice) : 0

              return (
                <div
                  key={plan.id}
                  className={`bg-white rounded-2xl shadow-xl border-2 transform transition-all hover:scale-105 ${
                    plan.popular
                      ? 'border-blue-500 ring-4 ring-blue-100'
                      : 'border-gray-200 hover:border-gray-300'
                  } relative`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium shadow-lg">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="p-8">
                    {/* Plan Header */}
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                      <p className="text-gray-600 mb-6">{plan.description}</p>

                      <div className="mb-4">
                        <div className="flex items-baseline justify-center">
                          <span className="text-5xl font-bold text-gray-900">
                            {formatPrice(Math.round(originalMonthlyPrice))}
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

                      {/* Student Limit */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <div className="text-lg font-semibold text-gray-900">
                          {plan.studentLimit === -1 ? 'Unlimited' : `Up to ${plan.studentLimit}`} Students
                        </div>
                        <div className="text-sm text-gray-600">
                          Perfect for {plan.studentLimit === -1 ? 'large institutions' :
                                    plan.studentLimit <= 100 ? 'small schools' : 'growing institutions'}
                        </div>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-4 mb-8">
                      {plan.features.map((feature, index) => (
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
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <div className="text-center">
                      <Link
                        href="/register"
                        className={`w-full inline-flex justify-center px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 ${
                          plan.popular
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg'
                            : 'bg-gray-900 hover:bg-gray-800 text-white'
                        }`}
                      >
                        Start Free Trial
                      </Link>
                      <p className="text-sm text-gray-500 mt-3">
                        14-day free trial • No credit card required
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Feature Comparison Table */}
          <div className="mt-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Compare Plans</h2>
              <p className="text-xl text-gray-600">See what's included in each plan</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Features</th>
                      {plans.map((plan) => (
                        <th key={plan.id} className="px-6 py-4 text-center text-sm font-medium text-gray-900">
                          {plan.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">Student Limit</td>
                      {plans.map((plan) => (
                        <td key={plan.id} className="px-6 py-4 text-center text-sm text-gray-600">
                          {plan.studentLimit === -1 ? 'Unlimited' : plan.studentLimit.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-gray-25">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">Class Management</td>
                      {plans.map((plan) => (
                        <td key={plan.id} className="px-6 py-4 text-center">
                          <svg className="w-5 h-5 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">Advanced Analytics</td>
                      <td className="px-6 py-4 text-center">
                        <svg className="w-5 h-5 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <svg className="w-5 h-5 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <svg className="w-5 h-5 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </td>
                    </tr>
                    <tr className="bg-gray-25">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">AI Features</td>
                      <td className="px-6 py-4 text-center">
                        <svg className="w-5 h-5 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <svg className="w-5 h-5 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <svg className="w-5 h-5 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">Custom Branding</td>
                      <td className="px-6 py-4 text-center">
                        <svg className="w-5 h-5 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <svg className="w-5 h-5 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <svg className="w-5 h-5 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </td>
                    </tr>
                    <tr className="bg-gray-25">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">Support</td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">Email</td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">Priority</td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">24/7 Phone</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            </div>

            <div className="max-w-3xl mx-auto space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I change plans at any time?</h3>
                <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate your billing accordingly.</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Is there a free trial?</h3>
                <p className="text-gray-600">Yes! We offer a 14-day free trial for all plans. No credit card required to get started.</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">What happens if I exceed my student limit?</h3>
                <p className="text-gray-600">You'll receive notifications as you approach your limit. We'll work with you to upgrade your plan to accommodate your growing needs.</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Do you offer discounts for annual billing?</h3>
                <p className="text-gray-600">Yes! You'll save approximately 17% when you choose annual billing over monthly payments.</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of educational institutions already using our platform to streamline their operations.
            </p>
            <Link
              href="/register"
              className="inline-flex px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors transform hover:scale-105"
            >
              Start Your Free Trial
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400">© 2024 EduPlatform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
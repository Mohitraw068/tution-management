'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function SetupPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const subdomain = searchParams.get('subdomain')

  const [formData, setFormData] = useState({
    name: '',
    subdomain: subdomain || '',
    instituteCode: '',
    primaryColor: '#3B82F6',
    subscription: 'BASIC',
    studentLimit: 100
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (subdomain) {
      setFormData(prev => ({
        ...prev,
        subdomain: subdomain,
        name: subdomain.charAt(0).toUpperCase() + subdomain.slice(1).replace(/-/g, ' ') + ' Institute',
        instituteCode: subdomain.toUpperCase().replace(/-/g, '')
      }))
    }
  }, [subdomain])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/institutes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create institute')
      } else {
        setSuccess('Institute created successfully!')
        setTimeout(() => {
          // Redirect to the institute's subdomain
          window.location.href = `http://${formData.subdomain}.localhost:3000`
        }, 2000)
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Setup Your Institute
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create a new institute for subdomain: <strong>{subdomain}</strong>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {success && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="text-sm text-green-700">{success}</div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Institute Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter institute name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="subdomain" className="block text-sm font-medium text-gray-700">
                Subdomain
              </label>
              <input
                id="subdomain"
                name="subdomain"
                type="text"
                required
                disabled
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-gray-100"
                value={formData.subdomain}
              />
              <p className="mt-1 text-sm text-gray-500">
                Your institute will be accessible at: {formData.subdomain}.localhost:3000
              </p>
            </div>

            <div>
              <label htmlFor="instituteCode" className="block text-sm font-medium text-gray-700">
                Institute Code
              </label>
              <input
                id="instituteCode"
                name="instituteCode"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter unique institute code"
                value={formData.instituteCode}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700">
                Primary Color
              </label>
              <input
                id="primaryColor"
                name="primaryColor"
                type="color"
                className="mt-1 appearance-none relative block w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10"
                value={formData.primaryColor}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="subscription" className="block text-sm font-medium text-gray-700">
                Subscription Plan
              </label>
              <select
                id="subscription"
                name="subscription"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                value={formData.subscription}
                onChange={handleChange}
              >
                <option value="BASIC">Basic</option>
                <option value="PREMIUM">Premium</option>
                <option value="ENTERPRISE">Enterprise</option>
              </select>
            </div>

            <div>
              <label htmlFor="studentLimit" className="block text-sm font-medium text-gray-700">
                Student Limit
              </label>
              <input
                id="studentLimit"
                name="studentLimit"
                type="number"
                min="1"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                value={formData.studentLimit}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Institute...' : 'Create Institute'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
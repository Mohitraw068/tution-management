'use client'

import { useSearchParams } from 'next/navigation'

export default function InstituteNotFoundPage() {
  const searchParams = useSearchParams()
  const subdomain = searchParams.get('subdomain')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Institute Not Found
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            The institute "{subdomain}" could not be found.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Institute Not Registered
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    This subdomain is not associated with any registered institute.
                    Please contact the institute administrator or check the URL.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              If you're an institute owner looking to set up your platform,
              please contact our support team.
            </p>
            <div className="mt-4">
              <a
                href="mailto:support@etution.com"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
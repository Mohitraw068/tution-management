'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useInstitute, useInstituteBranding } from '@/components/providers/InstituteProvider'
import { Sidebar } from '@/components/layout/Sidebar'
import { ClassForm } from '@/components/classes/ClassForm'

export default function NewClassPage() {
  const { data: session, status } = useSession()
  const { institute, loading: instituteLoading } = useInstitute()
  const { cssVariables } = useInstituteBranding()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }

    // Check if user has permission to create classes
    if (!['OWNER', 'ADMIN'].includes(session.user.role)) {
      router.push('/dashboard/classes')
      return
    }
  }, [session, status, router])

  if (status === 'loading' || instituteLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const handleSuccess = (classData: any) => {
    router.push(`/classes/${classData.id}`)
  }

  const handleCancel = () => {
    router.push('/classes')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex" style={cssVariables}>
      {/* Sidebar */}
      <div className="w-64 fixed inset-y-0 left-0 z-50">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        <main className="p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-6">
              <button
                onClick={handleCancel}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Classes
              </button>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Class</h1>
              <p className="text-gray-600 mt-1">Set up a new class with students and schedule</p>
            </div>
          </div>

          {/* Form */}
          <div className="max-w-4xl">
            <ClassForm
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </div>
        </main>
      </div>
    </div>
  )
}
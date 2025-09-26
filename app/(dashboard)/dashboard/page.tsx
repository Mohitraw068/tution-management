'use client'

import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useInstitute, useInstituteBranding } from '@/components/providers/InstituteProvider'
import { Sidebar } from '@/components/layout/Sidebar'
import { OwnerDashboard } from '@/components/dashboards/OwnerDashboard'
import { TeacherDashboard } from '@/components/dashboards/TeacherDashboard'
import { StudentDashboard } from '@/components/dashboards/StudentDashboard'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const { institute, loading: instituteLoading } = useInstitute()
  const { cssVariables } = useInstituteBranding()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Still loading
    if (!session) {
      router.push('/login')
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
    return null // Will redirect to login
  }

  const renderDashboardContent = () => {
    const userRole = session.user.role

    switch (userRole) {
      case 'OWNER':
      case 'ADMIN':
        return <OwnerDashboard />
      case 'TEACHER':
        return <TeacherDashboard />
      case 'STUDENT':
      case 'PARENT':
        return <StudentDashboard />
      default:
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Welcome to your dashboard!
            </h2>
            <p className="text-gray-600 mt-2">
              Your role-specific dashboard is being prepared.
            </p>
          </div>
        )
    }
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
          {renderDashboardContent()}
        </main>
      </div>
    </div>
  )
}
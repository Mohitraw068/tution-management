'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useInstitute, useInstituteBranding } from '@/components/providers/InstituteProvider'
import { Sidebar } from '@/components/layout/Sidebar'
import { QRGenerator } from '@/components/attendance/QRGenerator'

interface Class {
  id: string
  name: string
  subject: string
  teacher: {
    name: string
  }
  _count: {
    students: number
  }
}

export default function QRAttendancePage() {
  const { data: session, status } = useSession()
  const { institute, loading: instituteLoading } = useInstitute()
  const { cssVariables } = useInstituteBranding()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [classData, setClassData] = useState<Class | null>(null)
  const [duration, setDuration] = useState(30) // minutes
  const [loading, setLoading] = useState(true)
  const classId = searchParams.get('classId')

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }

    // Check permissions
    if (!['OWNER', 'ADMIN', 'TEACHER'].includes(session.user.role)) {
      router.push('/dashboard')
      return
    }

    if (!classId) {
      router.push('/attendance')
      return
    }
  }, [session, status, router, classId])

  useEffect(() => {
    if (session && classId) {
      fetchClassData()
    }
  }, [session, classId])

  const fetchClassData = async () => {
    if (!classId) return

    try {
      setLoading(true)
      const response = await fetch(`/api/classes/${classId}`)
      if (response.ok) {
        const data = await response.json()
        setClassData(data)
      } else {
        router.push('/attendance')
      }
    } catch (error) {
      console.error('Error fetching class data:', error)
      router.push('/attendance')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || instituteLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!session || !classData) {
    return null
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
                onClick={() => router.push('/attendance')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Attendance
              </button>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">QR Code Attendance</h1>
              <p className="text-gray-600 mt-1">Generate QR code for students to scan and mark attendance</p>
            </div>
          </div>

          {/* Class Info Card */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{classData.name}</h2>
                <p className="text-gray-600 mb-1">Subject: {classData.subject}</p>
                <p className="text-gray-600 mb-1">Teacher: {classData.teacher.name}</p>
                <p className="text-gray-600">Students: {classData._count.students}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Session Date</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Duration Setting */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Duration</h3>
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">
                QR Code expires after:
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
              </select>
            </div>
          </div>

          {/* QR Generator */}
          <QRGenerator
            classId={classData.id}
            className={classData.name}
            duration={duration}
            onBack={() => router.push('/attendance')}
          />
        </main>
      </div>
    </div>
  )
}
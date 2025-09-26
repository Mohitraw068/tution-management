'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useInstitute, useInstituteBranding } from '@/components/providers/InstituteProvider'
import { Sidebar } from '@/components/layout/Sidebar'

interface Homework {
  id: string
  title: string
  description: string
  dueDate: string
  totalPoints: number
  status: string
  class: {
    name: string
    subject: string
  }
  createdAt: string
  _count: {
    submissions: number
  }
  isSubmitted?: boolean
  submission?: {
    id: string
    status: string
    grade?: number
    submittedAt: string
  }
}

export default function HomeworkPage() {
  const { data: session, status } = useSession()
  const { institute, loading: instituteLoading } = useInstitute()
  const { cssVariables, primaryColor } = useInstituteBranding()
  const router = useRouter()

  const [homework, setHomework] = useState<Homework[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [dueDateFilter, setDueDateFilter] = useState('all')

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
  }, [session, status, router])

  useEffect(() => {
    if (session && institute) {
      fetchHomework()
    }
  }, [session, institute])

  const fetchHomework = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/homework')
      if (response.ok) {
        const data = await response.json()
        setHomework(data)
      }
    } catch (error) {
      console.error('Error fetching homework:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredHomework = homework.filter(hw => {
    if (statusFilter !== 'all') {
      if (session?.user.role === 'STUDENT') {
        if (statusFilter === 'submitted' && !hw.isSubmitted) return false
        if (statusFilter === 'pending' && hw.isSubmitted) return false
        if (statusFilter === 'graded' && (!hw.submission?.grade && hw.submission?.grade !== 0)) return false
      } else {
        if (statusFilter !== hw.status.toLowerCase()) return false
      }
    }

    if (dueDateFilter !== 'all') {
      const dueDate = new Date(hw.dueDate)
      const now = new Date()
      const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      if (dueDateFilter === 'overdue' && diffDays >= 0) return false
      if (dueDateFilter === 'today' && Math.abs(diffDays) > 0) return false
      if (dueDateFilter === 'week' && (diffDays < 0 || diffDays > 7)) return false
    }

    return true
  })

  const getStatusColor = (status: string, isOverdue = false) => {
    if (isOverdue) return 'bg-red-100 text-red-800'

    switch (status.toLowerCase()) {
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'published':
        return 'bg-blue-100 text-blue-800'
      case 'closed':
        return 'bg-gray-100 text-gray-800'
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800'
      case 'graded':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date()
  }

  const formatDueDate = (dueDate: string) => {
    const date = new Date(dueDate)
    const now = new Date()
    const diffMs = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'}`
    } else if (diffDays === 0) {
      return 'Due today'
    } else if (diffDays === 1) {
      return 'Due tomorrow'
    } else {
      return `Due in ${diffDays} days`
    }
  }

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

  const isTeacher = ['OWNER', 'ADMIN', 'TEACHER'].includes(session.user.role)

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
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Homework</h1>
                <p className="text-gray-600 mt-1">
                  {isTeacher
                    ? 'Manage homework assignments for your classes'
                    : 'View and submit your homework assignments'
                  }
                </p>
              </div>
              {isTeacher && (
                <button
                  onClick={() => router.push('/homework/create')}
                  className="px-4 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center space-x-2"
                  style={{ backgroundColor: primaryColor }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Create Homework</span>
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 text-gray-900"
                    style={{ '--tw-ring-color': primaryColor } as any}
                  >
                    <option value="all">All Status</option>
                    {isTeacher ? (
                      <>
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="closed">Closed</option>
                      </>
                    ) : (
                      <>
                        <option value="pending">Pending</option>
                        <option value="submitted">Submitted</option>
                        <option value="graded">Graded</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <select
                    value={dueDateFilter}
                    onChange={(e) => setDueDateFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 text-gray-900"
                    style={{ '--tw-ring-color': primaryColor } as any}
                  >
                    <option value="all">All Dates</option>
                    <option value="overdue">Overdue</option>
                    <option value="today">Due Today</option>
                    <option value="week">Due This Week</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setStatusFilter('all')
                      setDueDateFilter('all')
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <div className="text-lg text-gray-600">Loading homework...</div>
            </div>
          ) : filteredHomework.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {homework.length === 0 ? 'No Homework Yet' : 'No Matching Homework'}
              </h3>
              <p className="text-gray-600">
                {homework.length === 0
                  ? isTeacher
                    ? 'Start by creating your first homework assignment.'
                    : 'Your teachers haven\'t assigned any homework yet.'
                  : 'Try adjusting your filters to see more homework.'
                }
              </p>
              {isTeacher && homework.length === 0 && (
                <button
                  onClick={() => router.push('/homework/create')}
                  className="mt-4 px-4 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: primaryColor }}
                >
                  Create First Homework
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHomework.map((hw) => {
                const overdue = isOverdue(hw.dueDate)
                const studentSubmission = hw.submission

                return (
                  <div
                    key={hw.id}
                    className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{hw.title}</h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                              isTeacher ? hw.status : (studentSubmission?.status || 'pending'),
                              overdue && !isTeacher && !hw.isSubmitted
                            )}`}>
                              {isTeacher
                                ? hw.status.charAt(0) + hw.status.slice(1).toLowerCase()
                                : studentSubmission?.status
                                  ? studentSubmission.status.charAt(0) + studentSubmission.status.slice(1).toLowerCase()
                                  : overdue ? 'Overdue' : 'Pending'
                              }
                            </span>
                          </div>
                          <p className="text-gray-600 mb-3">{hw.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8h1m-1-4h1m4 4h1m-1-4h1" />
                              </svg>
                              {hw.class.name} - {hw.class.subject}
                            </span>
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                              </svg>
                              {hw.totalPoints} points
                            </span>
                            {isTeacher && (
                              <span className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                {hw._count.submissions} submission{hw._count.submissions !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className={`text-sm font-medium ${overdue && !isTeacher && !hw.isSubmitted ? 'text-red-600' : 'text-gray-900'}`}>
                            {formatDueDate(hw.dueDate)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(hw.dueDate).toLocaleDateString('en-US', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                          {!isTeacher && studentSubmission?.grade !== undefined && (
                            <div className="mt-2 text-sm">
                              <span className="font-medium text-green-600">
                                {studentSubmission.grade}/{hw.totalPoints}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                        <div className="text-xs text-gray-500">
                          Created {new Date(hw.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex space-x-2">
                          {isTeacher ? (
                            <>
                              <button
                                onClick={() => router.push(`/homework/${hw.id}/submissions`)}
                                className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                              >
                                View Submissions
                              </button>
                              <button
                                onClick={() => router.push(`/homework/${hw.id}/edit`)}
                                className="px-3 py-1 text-sm border rounded transition-colors"
                                style={{
                                  color: primaryColor,
                                  borderColor: primaryColor,
                                  backgroundColor: 'transparent'
                                }}
                              >
                                Edit
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => router.push(`/homework/${hw.id}`)}
                                className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                              >
                                View Details
                              </button>
                              {!hw.isSubmitted && !overdue ? (
                                <button
                                  onClick={() => router.push(`/homework/${hw.id}/submit`)}
                                  className="px-3 py-1 text-sm text-white rounded transition-colors"
                                  style={{ backgroundColor: primaryColor }}
                                >
                                  Submit
                                </button>
                              ) : hw.isSubmitted ? (
                                <button
                                  onClick={() => router.push(`/homework/${hw.id}/submit`)}
                                  className="px-3 py-1 text-sm border rounded transition-colors"
                                  style={{
                                    color: primaryColor,
                                    borderColor: primaryColor,
                                    backgroundColor: 'transparent'
                                  }}
                                >
                                  View Submission
                                </button>
                              ) : (
                                <span className="px-3 py-1 text-sm text-red-600 bg-red-50 rounded">
                                  Overdue
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
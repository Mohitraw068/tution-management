'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { useInstitute, useInstituteBranding } from '@/components/providers/InstituteProvider'
import { Sidebar } from '@/components/layout/Sidebar'

interface Homework {
  id: string
  title: string
  description: string
  instructions?: string
  dueDate: string
  totalPoints: number
  status: string
  class: {
    name: string
    subject: string
  }
  createdAt: string
}

interface Submission {
  id: string
  answer?: string
  submittedAt: string
  status: string
  grade?: number
  feedback?: string
  gradedAt?: string
  isLate: boolean
}

export default function SubmitHomeworkPage() {
  const { data: session, status } = useSession()
  const { institute, loading: instituteLoading } = useInstitute()
  const { cssVariables, primaryColor } = useInstituteBranding()
  const router = useRouter()
  const params = useParams()
  const homeworkId = params.id as string

  const [homework, setHomework] = useState<Homework | null>(null)
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [answer, setAnswer] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
  }, [session, status, router])

  useEffect(() => {
    if (session && homeworkId) {
      fetchHomeworkAndSubmission()
    }
  }, [session, homeworkId])

  const fetchHomeworkAndSubmission = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/homework/${homeworkId}`)
      if (response.ok) {
        const data = await response.json()
        setHomework(data.homework)
        setSubmission(data.submission)
        if (data.submission?.answer) {
          setAnswer(data.submission.answer)
        }
      } else if (response.status === 404) {
        router.push('/homework')
      }
    } catch (error) {
      console.error('Error fetching homework:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!answer.trim()) {
      alert('Please provide an answer before submitting')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/homework/${homeworkId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answer: answer.trim()
        })
      })

      if (response.ok) {
        const result = await response.json()
        setSubmission(result.submission)
        alert('Homework submitted successfully!')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to submit homework')
      }
    } catch (error) {
      console.error('Error submitting homework:', error)
      alert('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const isOverdue = homework ? new Date(homework.dueDate) < new Date() : false
  const canSubmit = homework?.status === 'PUBLISHED' && !isOverdue
  const hasSubmitted = !!submission

  if (status === 'loading' || instituteLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!session || !homework) {
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
                onClick={() => router.push('/homework')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Homework
              </button>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{homework.title}</h1>
              <p className="text-gray-600 mt-1">{homework.class.name} - {homework.class.subject}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Homework Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{homework.description}</p>
              </div>

              {/* Instructions */}
              {homework.instructions && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Instructions</h2>
                  <div className="text-gray-700 whitespace-pre-wrap">{homework.instructions}</div>
                </div>
              )}

              {/* Submission Form */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Your Answer</h2>
                  {hasSubmitted && (
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                      submission?.status === 'GRADED'
                        ? 'bg-green-100 text-green-800'
                        : submission?.isLate
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {submission?.status === 'GRADED' ? 'Graded' : submission?.isLate ? 'Submitted Late' : 'Submitted'}
                    </span>
                  )}
                </div>

                {!canSubmit && !hasSubmitted ? (
                  <div className={`p-4 rounded-lg ${isOverdue ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                    <div className="flex items-center space-x-2">
                      <svg className={`w-5 h-5 ${isOverdue ? 'text-red-600' : 'text-yellow-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <span className={`font-medium ${isOverdue ? 'text-red-800' : 'text-yellow-800'}`}>
                        {isOverdue ? 'This homework is overdue' : 'This homework is not yet available for submission'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <textarea
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder={hasSubmitted ? "Your submitted answer..." : "Write your answer here..."}
                        rows={12}
                        disabled={hasSubmitted}
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 text-gray-900 ${
                          hasSubmitted ? 'bg-gray-50' : ''
                        }`}
                        style={{ '--tw-ring-color': primaryColor } as any}
                        required
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        {hasSubmitted
                          ? `Submitted on ${new Date(submission!.submittedAt).toLocaleString()}`
                          : 'Provide a detailed answer to the homework question'
                        }
                      </p>
                    </div>

                    {/* Future: File attachments */}
                    <div className="border-t border-gray-200 pt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Attachments (Coming Soon)
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500">
                        <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        <p className="text-xs">File uploads coming soon</p>
                      </div>
                    </div>

                    {!hasSubmitted && canSubmit && (
                      <div className="flex justify-end space-x-4 pt-4">
                        <button
                          type="button"
                          onClick={() => router.push('/homework')}
                          className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Save Draft & Exit
                        </button>
                        <button
                          type="submit"
                          disabled={submitting}
                          className="px-6 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                          style={{ backgroundColor: primaryColor }}
                        >
                          {submitting ? (
                            <>
                              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              <span>Submitting...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                              </svg>
                              <span>Submit Homework</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </form>
                )}

                {/* Feedback */}
                {submission?.feedback && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-3">Teacher Feedback</h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-blue-900 whitespace-pre-wrap">{submission.feedback}</p>
                      {submission.gradedAt && (
                        <p className="text-sm text-blue-700 mt-2">
                          Graded on {new Date(submission.gradedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Due Date Info */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Assignment Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Due Date:</span>
                    <span className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                      {new Date(homework.dueDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Points:</span>
                    <span className="font-medium text-gray-900">{homework.totalPoints}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${isOverdue ? 'text-red-600' : 'text-green-600'}`}>
                      {isOverdue ? 'Overdue' : 'Active'}
                    </span>
                  </div>
                  {submission?.grade !== undefined && (
                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-gray-600">Your Grade:</span>
                      <span className="font-medium text-green-600">
                        {submission.grade}/{homework.totalPoints}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Time Remaining */}
              {!isOverdue && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="font-semibold text-green-900 mb-2">Time Remaining</h3>
                  <p className="text-green-800 text-sm">
                    {(() => {
                      const now = new Date()
                      const due = new Date(homework.dueDate)
                      const diffMs = due.getTime() - now.getTime()
                      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
                      const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

                      if (diffDays > 0) {
                        return `${diffDays} day${diffDays !== 1 ? 's' : ''}, ${diffHours} hour${diffHours !== 1 ? 's' : ''}`
                      } else if (diffHours > 0) {
                        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} remaining`
                      } else {
                        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
                        return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} remaining`
                      }
                    })()}
                  </p>
                </div>
              )}

              {/* Submission Status */}
              {hasSubmitted && (
                <div className={`border rounded-lg p-6 ${
                  submission?.status === 'GRADED'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-blue-50 border-blue-200'
                }`}>
                  <h3 className={`font-semibold mb-2 ${
                    submission?.status === 'GRADED' ? 'text-green-900' : 'text-blue-900'
                  }`}>
                    Submission Status
                  </h3>
                  <div className={`text-sm ${
                    submission?.status === 'GRADED' ? 'text-green-800' : 'text-blue-800'
                  }`}>
                    <p>✓ Submitted successfully</p>
                    <p className="mt-1">
                      {new Date(submission!.submittedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    {submission?.isLate && (
                      <p className="mt-1 text-yellow-700">⚠ Submitted after deadline</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
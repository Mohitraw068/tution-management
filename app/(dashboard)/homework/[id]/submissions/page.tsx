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
  dueDate: string
  totalPoints: number
  class: {
    name: string
    subject: string
  }
  _count: {
    submissions: number
  }
}

interface Submission {
  id: string
  studentId: string
  student: {
    name: string
    email: string
  }
  answer?: string
  submittedAt: string
  status: string
  grade?: number
  feedback?: string
  gradedAt?: string
  isLate: boolean
}

export default function SubmissionsPage() {
  const { data: session, status } = useSession()
  const { institute, loading: instituteLoading } = useInstitute()
  const { cssVariables, primaryColor } = useInstituteBranding()
  const router = useRouter()
  const params = useParams()
  const homeworkId = params.id as string

  const [homework, setHomework] = useState<Homework | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [grading, setGrading] = useState(false)
  const [grade, setGrade] = useState('')
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }

    // Check permissions
    if (!['OWNER', 'ADMIN', 'TEACHER'].includes(session.user.role)) {
      router.push('/homework')
      return
    }
  }, [session, status, router])

  useEffect(() => {
    if (session && homeworkId) {
      fetchHomeworkAndSubmissions()
    }
  }, [session, homeworkId])

  const fetchHomeworkAndSubmissions = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/homework/${homeworkId}/submissions`)
      if (response.ok) {
        const data = await response.json()
        setHomework(data.homework)
        setSubmissions(data.submissions)
      } else if (response.status === 404) {
        router.push('/homework')
      }
    } catch (error) {
      console.error('Error fetching submissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const openGradingModal = (submission: Submission) => {
    setSelectedSubmission(submission)
    setGrade(submission.grade?.toString() || '')
    setFeedback(submission.feedback || '')
  }

  const closeGradingModal = () => {
    setSelectedSubmission(null)
    setGrade('')
    setFeedback('')
  }

  const handleGradeSubmission = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedSubmission) return

    const gradeValue = parseInt(grade)
    if (isNaN(gradeValue) || gradeValue < 0 || gradeValue > homework!.totalPoints) {
      alert(`Grade must be between 0 and ${homework!.totalPoints}`)
      return
    }

    setGrading(true)
    try {
      const response = await fetch(`/api/homework/${homeworkId}/grade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionId: selectedSubmission.id,
          grade: gradeValue,
          feedback: feedback.trim()
        })
      })

      if (response.ok) {
        const result = await response.json()
        // Update submissions list
        setSubmissions(prev =>
          prev.map(sub =>
            sub.id === selectedSubmission.id
              ? {
                  ...sub,
                  grade: gradeValue,
                  feedback: feedback.trim(),
                  status: 'GRADED',
                  gradedAt: new Date().toISOString()
                }
              : sub
          )
        )
        closeGradingModal()
        alert('Submission graded successfully!')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to grade submission')
      }
    } catch (error) {
      console.error('Error grading submission:', error)
      alert('Network error. Please try again.')
    } finally {
      setGrading(false)
    }
  }

  const getStatusColor = (status: string, isLate = false) => {
    if (isLate) return 'bg-yellow-100 text-yellow-800'

    switch (status.toLowerCase()) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800'
      case 'graded':
        return 'bg-green-100 text-green-800'
      case 'returned':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

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

  const gradedCount = submissions.filter(s => s.status === 'GRADED').length
  const averageGrade = gradedCount > 0
    ? submissions
        .filter(s => s.grade !== undefined)
        .reduce((sum, s) => sum + s.grade!, 0) / gradedCount
    : 0

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

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                  <p className="text-2xl font-bold text-gray-900">{submissions.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Graded</p>
                  <p className="text-2xl font-bold text-green-600">{gradedCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{submissions.length - gradedCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average Grade</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {gradedCount > 0 ? averageGrade.toFixed(1) : '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Submissions List */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Student Submissions</h2>
            </div>

            {submissions.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Submissions Yet</h3>
                <p className="text-gray-600">Students haven't submitted their homework yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submitted At
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Grade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {submissions.map((submission) => (
                      <tr key={submission.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {submission.student.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {submission.student.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(submission.submittedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            submission.status,
                            submission.isLate
                          )}`}>
                            {submission.isLate ? 'Late' : submission.status.charAt(0) + submission.status.slice(1).toLowerCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {submission.grade !== undefined
                            ? `${submission.grade}/${homework.totalPoints}`
                            : '—'
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => openGradingModal(submission)}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors"
                          >
                            {submission.status === 'GRADED' ? 'Re-grade' : 'Grade'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Grading Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Grade Submission - {selectedSubmission.student.name}
                </h2>
                <button
                  onClick={closeGradingModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Submission Details */}
              <div className="mb-6">
                <div className="text-sm text-gray-500 mb-2">
                  Submitted on {new Date(selectedSubmission.submittedAt).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                  {selectedSubmission.isLate && (
                    <span className="ml-2 text-yellow-600 font-medium">(Late Submission)</span>
                  )}
                </div>
                <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <h3 className="font-medium text-gray-900 mb-2">Student Answer:</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedSubmission.answer || 'No answer provided'}
                  </p>
                </div>
              </div>

              {/* Grading Form */}
              <form onSubmit={handleGradeSubmission} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grade (out of {homework.totalPoints})
                  </label>
                  <input
                    type="number"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    min="0"
                    max={homework.totalPoints}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 text-gray-900"
                    style={{ '--tw-ring-color': primaryColor } as any}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Feedback (Optional)
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Provide feedback to the student..."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 text-gray-900"
                    style={{ '--tw-ring-color': primaryColor } as any}
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={closeGradingModal}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={grading}
                    className="px-4 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {grading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Grade</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
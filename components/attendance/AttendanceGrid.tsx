'use client'

import { useState } from 'react'
import { useInstituteBranding } from '@/components/providers/InstituteProvider'

interface Student {
  id: string
  name: string
  email: string
  rollNumber?: string
}

interface AttendanceRecord {
  id: string
  studentId: string
  status: string
  markedAt: string
}

interface AttendanceGridProps {
  students: Student[]
  attendanceData: AttendanceRecord[]
  classId: string
  date: string
  onUpdate: () => void
  canEdit: boolean
}

export function AttendanceGrid({
  students,
  attendanceData,
  classId,
  date,
  onUpdate,
  canEdit
}: AttendanceGridProps) {
  const { primaryColor } = useInstituteBranding()
  const [loading, setLoading] = useState(false)
  const [localAttendance, setLocalAttendance] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    attendanceData.forEach(record => {
      initial[record.studentId] = record.status
    })
    return initial
  })

  const updateAttendance = (studentId: string, status: string) => {
    setLocalAttendance(prev => ({
      ...prev,
      [studentId]: status
    }))
  }

  const saveAttendance = async () => {
    if (!canEdit) return

    setLoading(true)
    try {
      const attendanceRecords = Object.entries(localAttendance).map(([studentId, status]) => ({
        studentId,
        status
      }))

      const response = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classId,
          date,
          attendanceRecords
        })
      })

      if (response.ok) {
        onUpdate()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save attendance')
      }
    } catch (error) {
      console.error('Error saving attendance:', error)
      alert('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'ABSENT':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'LATE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      case 'ABSENT':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
      case 'LATE':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }

  if (students.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
        <p className="text-gray-600">This class has no enrolled students yet.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Attendance Grid</h2>
            <p className="text-sm text-gray-600 mt-1">
              Mark attendance for {students.length} student{students.length !== 1 ? 's' : ''}
            </p>
          </div>
          {canEdit && (
            <button
              onClick={saveAttendance}
              disabled={loading}
              className="px-4 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              style={{ backgroundColor: primaryColor }}
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  <span>Save Attendance</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="p-6">
        <div className="space-y-4">
          {students.map((student) => {
            const currentStatus = localAttendance[student.id] || 'NOT_MARKED'
            const attendanceRecord = attendanceData.find(record => record.studentId === student.id)

            return (
              <div
                key={student.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {student.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{student.name}</h4>
                      <p className="text-sm text-gray-600">
                        {student.rollNumber || student.email}
                      </p>
                      {attendanceRecord && (
                        <p className="text-xs text-gray-500">
                          Marked at: {new Date(attendanceRecord.markedAt).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Current Status Badge */}
                  <div className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center space-x-1 ${getStatusColor(currentStatus)}`}>
                    {getStatusIcon(currentStatus)}
                    <span>
                      {currentStatus === 'NOT_MARKED' ? 'Not Marked' :
                       currentStatus === 'PRESENT' ? 'Present' :
                       currentStatus === 'ABSENT' ? 'Absent' :
                       currentStatus === 'LATE' ? 'Late' : currentStatus}
                    </span>
                  </div>

                  {/* Status Buttons */}
                  {canEdit && (
                    <div className="flex space-x-1">
                      <button
                        onClick={() => updateAttendance(student.id, 'PRESENT')}
                        className={`p-2 rounded-lg border-2 transition-colors ${
                          currentStatus === 'PRESENT'
                            ? 'bg-green-600 text-white border-green-600'
                            : 'bg-white text-green-600 border-green-200 hover:bg-green-50'
                        }`}
                        title="Mark Present"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => updateAttendance(student.id, 'LATE')}
                        className={`p-2 rounded-lg border-2 transition-colors ${
                          currentStatus === 'LATE'
                            ? 'bg-yellow-600 text-white border-yellow-600'
                            : 'bg-white text-yellow-600 border-yellow-200 hover:bg-yellow-50'
                        }`}
                        title="Mark Late"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => updateAttendance(student.id, 'ABSENT')}
                        className={`p-2 rounded-lg border-2 transition-colors ${
                          currentStatus === 'ABSENT'
                            ? 'bg-red-600 text-white border-red-600'
                            : 'bg-white text-red-600 border-red-200 hover:bg-red-50'
                        }`}
                        title="Mark Absent"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 rounded-b-lg border-t border-gray-200">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <div>
            Total Students: <span className="font-medium text-gray-900">{students.length}</span>
          </div>
          <div className="flex space-x-4">
            <span>
              Present: <span className="font-medium text-green-600">
                {Object.values(localAttendance).filter(status => status === 'PRESENT').length}
              </span>
            </span>
            <span>
              Late: <span className="font-medium text-yellow-600">
                {Object.values(localAttendance).filter(status => status === 'LATE').length}
              </span>
            </span>
            <span>
              Absent: <span className="font-medium text-red-600">
                {Object.values(localAttendance).filter(status => status === 'ABSENT').length}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
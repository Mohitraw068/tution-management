'use client'

import { useState } from 'react'
import { useInstituteBranding } from '@/components/providers/InstituteProvider'

interface Student {
  id: string
  userId: string
  user: {
    id: string
    name: string
    email: string
  }
}

interface StudentsListProps {
  students: Student[]
  canManage: boolean
  onUpdate: () => void
  classId: string
}

export function StudentsList({ students, canManage, onUpdate, classId }: StudentsListProps) {
  const { primaryColor } = useInstituteBranding()
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState('')

  const filteredStudents = students.filter(student =>
    student.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleRemoveStudent = async (studentId: string) => {
    if (!confirm('Are you sure you want to remove this student from the class?')) {
      return
    }

    setLoading(studentId)
    try {
      const response = await fetch(`/api/classes/${classId}/students`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentId })
      })

      if (response.ok) {
        onUpdate()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to remove student')
      }
    } catch (error) {
      console.error('Error removing student:', error)
      alert('Failed to remove student')
    } finally {
      setLoading('')
    }
  }

  return (
    <div className="bg-white rounded-lg border">
      {/* Search */}
      <div className="p-4 border-b">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 text-gray-900"
              style={{ '--tw-ring-color': primaryColor } as any}
            />
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="p-4">
        {filteredStudents.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {students.length === 0 ? 'No students enrolled' : 'No students found'}
            </h3>
            <p className="text-gray-600">
              {students.length === 0
                ? 'Students will appear here once they are added to the class'
                : 'Try adjusting your search terms'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {student.user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{student.user.name}</p>
                    <p className="text-sm text-gray-500">{student.user.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Student Actions */}
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Student</span>
                  </div>

                  {canManage && (
                    <button
                      onClick={() => handleRemoveStudent(student.id)}
                      disabled={loading === student.id}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Remove from class"
                    >
                      {loading === student.id ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer with count */}
      {students.length > 0 && (
        <div className="px-4 py-3 border-t bg-gray-50 text-sm text-gray-600">
          Showing {filteredStudents.length} of {students.length} students
        </div>
      )}
    </div>
  )
}
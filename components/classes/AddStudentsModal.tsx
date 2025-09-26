'use client'

import { useState, useEffect } from 'react'
import { useInstituteBranding } from '@/components/providers/InstituteProvider'

interface User {
  id: string
  name: string
  email: string
}

interface AddStudentsModalProps {
  classId: string
  onClose: () => void
  onSuccess: () => void
}

export function AddStudentsModal({ classId, onClose, onSuccess }: AddStudentsModalProps) {
  const { primaryColor } = useInstituteBranding()
  const [availableStudents, setAvailableStudents] = useState<User[]>([])
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchingStudents, setFetchingStudents] = useState(true)

  useEffect(() => {
    fetchAvailableStudents()
  }, [classId])

  const fetchAvailableStudents = async () => {
    try {
      setFetchingStudents(true)
      const response = await fetch(`/api/classes/${classId}/available-students`)
      if (response.ok) {
        const data = await response.json()
        setAvailableStudents(data)
      }
    } catch (error) {
      console.error('Error fetching available students:', error)
    } finally {
      setFetchingStudents(false)
    }
  }

  const filteredStudents = availableStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleToggleStudent = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([])
    } else {
      setSelectedStudents(filteredStudents.map(s => s.id))
    }
  }

  const handleAddStudents = async () => {
    if (selectedStudents.length === 0) {
      alert('Please select at least one student')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/classes/${classId}/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentIds: selectedStudents })
      })

      if (response.ok) {
        onSuccess()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to add students')
      }
    } catch (error) {
      console.error('Error adding students:', error)
      alert('Failed to add students')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Add Students to Class</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search and Select All */}
        <div className="p-6 border-b space-y-4">
          <div>
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 text-gray-900"
              style={{ '--tw-ring-color': primaryColor } as any}
            />
          </div>
          {!fetchingStudents && filteredStudents.length > 0 && (
            <div className="flex justify-between items-center">
              <button
                onClick={handleSelectAll}
                className="text-sm font-medium hover:underline"
                style={{ color: primaryColor }}
              >
                {selectedStudents.length === filteredStudents.length ? 'Deselect All' : 'Select All'}
              </button>
              <span className="text-sm text-gray-600">
                {selectedStudents.length} of {filteredStudents.length} selected
              </span>
            </div>
          )}
        </div>

        {/* Students List */}
        <div className="flex-1 overflow-y-auto p-6">
          {fetchingStudents ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-gray-600">Loading available students...</div>
            </div>
          ) : availableStudents.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No students available</h3>
              <p className="text-gray-600">
                All students in your institute are already enrolled in this class.
              </p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
              <p className="text-gray-600">Try adjusting your search terms.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredStudents.map((student) => (
                <label
                  key={student.id}
                  className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student.id)}
                    onChange={() => handleToggleStudent(student.id)}
                    className="mr-3"
                  />
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {student.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{student.name}</p>
                      <p className="text-sm text-gray-500">{student.email}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-4 p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAddStudents}
            disabled={loading || selectedStudents.length === 0}
            className="px-4 py-2 text-white rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            style={{ backgroundColor: primaryColor }}
          >
            {loading ? 'Adding...' : `Add ${selectedStudents.length} Student${selectedStudents.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  )
}
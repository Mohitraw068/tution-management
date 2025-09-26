'use client'

import { useState, useEffect } from 'react'
import { useInstituteBranding } from '@/components/providers/InstituteProvider'

interface Teacher {
  id: string
  name: string
  email: string
}

interface ClassFormData {
  name: string
  subject: string
  description: string
  teacherId: string
  capacity: number
  schedule: { [key: string]: string }
  isVirtual: boolean
  meetingLink: string
  location: string
  startDate: string
  endDate: string
}

interface ClassFormProps {
  initialData?: Partial<ClassFormData>
  onSuccess: (data: any) => void
  onCancel: () => void
  isEditing?: boolean
}

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
]

const COMMON_SUBJECTS = [
  'Mathematics',
  'Science',
  'English',
  'History',
  'Geography',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'Art',
  'Music',
  'Physical Education'
]

export function ClassForm({ initialData, onSuccess, onCancel, isEditing = false }: ClassFormProps) {
  const { primaryColor } = useInstituteBranding()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [teachers, setTeachers] = useState<Teacher[]>([])

  const [formData, setFormData] = useState<ClassFormData>({
    name: '',
    subject: '',
    description: '',
    teacherId: '',
    capacity: 30,
    schedule: {},
    isVirtual: false,
    meetingLink: '',
    location: '',
    startDate: '',
    endDate: '',
    ...initialData
  })

  useEffect(() => {
    fetchTeachers()
  }, [])

  const fetchTeachers = async () => {
    try {
      const response = await fetch('/api/users?role=TEACHER')
      if (response.ok) {
        const data = await response.json()
        setTeachers(data)
      }
    } catch (error) {
      console.error('Error fetching teachers:', error)
    }
  }

  const handleChange = (field: keyof ClassFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setError('')
  }

  const handleScheduleChange = (day: string, time: string) => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: time
      }
    }))
  }

  const removeScheduleDay = (day: string) => {
    setFormData(prev => {
      const newSchedule = { ...prev.schedule }
      delete newSchedule[day]
      return {
        ...prev,
        schedule: newSchedule
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validation
      if (!formData.name.trim()) {
        throw new Error('Class name is required')
      }
      if (!formData.subject.trim()) {
        throw new Error('Subject is required')
      }
      if (!formData.teacherId) {
        throw new Error('Teacher selection is required')
      }
      if (formData.capacity < 1) {
        throw new Error('Capacity must be at least 1')
      }
      if (formData.isVirtual && !formData.meetingLink.trim()) {
        throw new Error('Meeting link is required for virtual classes')
      }
      if (!formData.isVirtual && !formData.location.trim()) {
        throw new Error('Location is required for physical classes')
      }

      const url = isEditing ? `/api/classes/${(initialData as any)?.id}` : '/api/classes'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save class')
      }

      const classData = await response.json()
      onSuccess(classData)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 text-gray-900"
              style={{ '--tw-ring-color': primaryColor } as any}
              placeholder="e.g., Grade 10 Mathematics"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject *
            </label>
            <input
              type="text"
              list="subjects"
              value={formData.subject}
              onChange={(e) => handleChange('subject', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 text-gray-900"
              style={{ '--tw-ring-color': primaryColor } as any}
              placeholder="Select or type subject"
              required
            />
            <datalist id="subjects">
              {COMMON_SUBJECTS.map(subject => (
                <option key={subject} value={subject} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 text-gray-900"
              style={{ '--tw-ring-color': primaryColor } as any}
              placeholder="Brief description of the class"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teacher *
            </label>
            <select
              value={formData.teacherId}
              onChange={(e) => handleChange('teacherId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 text-gray-900"
              style={{ '--tw-ring-color': primaryColor } as any}
              required
            >
              <option value="">Select a teacher</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name} ({teacher.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capacity *
            </label>
            <input
              type="number"
              min="1"
              max="200"
              value={formData.capacity}
              onChange={(e) => handleChange('capacity', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 text-gray-900"
              style={{ '--tw-ring-color': primaryColor } as any}
              required
            />
          </div>
        </div>

        {/* Settings & Schedule */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Settings</h3>

          {/* Virtual/Physical Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class Type
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={!formData.isVirtual}
                  onChange={() => handleChange('isVirtual', false)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Physical</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={formData.isVirtual}
                  onChange={() => handleChange('isVirtual', true)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Virtual</span>
              </label>
            </div>
          </div>

          {/* Location or Meeting Link */}
          {formData.isVirtual ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meeting Link *
              </label>
              <input
                type="url"
                value={formData.meetingLink}
                onChange={(e) => handleChange('meetingLink', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 text-gray-900"
                style={{ '--tw-ring-color': primaryColor } as any}
                placeholder="https://meet.google.com/..."
                required={formData.isVirtual}
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 text-gray-900"
                style={{ '--tw-ring-color': primaryColor } as any}
                placeholder="Room 101, Building A"
                required={!formData.isVirtual}
              />
            </div>
          )}

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 text-gray-900"
                style={{ '--tw-ring-color': primaryColor } as any}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 text-gray-900"
                style={{ '--tw-ring-color': primaryColor } as any}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Schedule */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Schedule</h3>
        <div className="space-y-3">
          {Object.entries(formData.schedule).map(([day, time]) => (
            <div key={day} className="flex items-center space-x-3">
              <div className="w-24 text-sm font-medium text-gray-700">
                {day}
              </div>
              <input
                type="time"
                value={time}
                onChange={(e) => handleScheduleChange(day, e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{ '--tw-ring-color': primaryColor } as any}
              />
              <button
                type="button"
                onClick={() => removeScheduleDay(day)}
                className="text-red-600 hover:text-red-800"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
          <div>
            <select
              onChange={(e) => {
                if (e.target.value && !formData.schedule[e.target.value]) {
                  handleScheduleChange(e.target.value, '09:00')
                }
                e.target.value = ''
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style={{ '--tw-ring-color': primaryColor } as any}
            >
              <option value="">+ Add a day</option>
              {DAYS_OF_WEEK.filter(day => !formData.schedule[day]).map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-white rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          style={{ backgroundColor: primaryColor }}
        >
          {loading ? 'Saving...' : (isEditing ? 'Update Class' : 'Create Class')}
        </button>
      </div>
    </form>
  )
}
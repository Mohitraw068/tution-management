'use client'

import Link from 'next/link'
import { useInstituteBranding } from '@/components/providers/InstituteProvider'

interface ClassData {
  id: string
  name: string
  subject: string
  description?: string
  teacherId: string
  teacher: {
    id: string
    name: string
  }
  capacity: number
  schedule: string
  isVirtual: boolean
  meetingLink?: string
  location?: string
  startDate?: string
  endDate?: string
  _count: {
    students: number
  }
}

interface ClassCardProps {
  classData: ClassData
}

export function ClassCard({ classData }: ClassCardProps) {
  const { primaryColor } = useInstituteBranding()

  const parseSchedule = (schedule: string) => {
    try {
      return JSON.parse(schedule)
    } catch {
      return {}
    }
  }

  const schedule = parseSchedule(classData.schedule)
  const scheduleText = Object.keys(schedule).length > 0
    ? Object.entries(schedule).map(([day, time]) => `${day}: ${time}`).join(', ')
    : 'Schedule not set'

  const studentPercentage = (classData._count.students / classData.capacity) * 100

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900 mb-1">
              {classData.name}
            </h3>
            <p className="text-sm font-medium" style={{ color: primaryColor }}>
              {classData.subject}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {classData.isVirtual ? (
              <div className="flex items-center text-green-600">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="text-sm">Virtual</span>
              </div>
            ) : (
              <div className="flex items-center text-blue-600">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm">Physical</span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {classData.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {classData.description}
          </p>
        )}

        {/* Teacher */}
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
            <span className="text-sm font-medium text-gray-600">
              {classData.teacher.name.charAt(0)}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {classData.teacher.name}
            </p>
            <p className="text-xs text-gray-500">Teacher</p>
          </div>
        </div>

        {/* Schedule */}
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-gray-700">Schedule</span>
          </div>
          <p className="text-sm text-gray-600 truncate">
            {scheduleText}
          </p>
        </div>

        {/* Location/Link */}
        {classData.isVirtual ? (
          classData.meetingLink && (
            <div className="mb-4">
              <div className="flex items-center mb-1">
                <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span className="text-sm font-medium text-gray-700">Meeting Link</span>
              </div>
              <a
                href={classData.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 truncate block"
              >
                {classData.meetingLink}
              </a>
            </div>
          )
        ) : (
          classData.location && (
            <div className="mb-4">
              <div className="flex items-center mb-1">
                <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">Location</span>
              </div>
              <p className="text-sm text-gray-600">
                {classData.location}
              </p>
            </div>
          )
        )}

        {/* Students Count & Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Students</span>
            <span className="text-sm text-gray-600">
              {classData._count.students} / {classData.capacity}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(studentPercentage, 100)}%`,
                backgroundColor: studentPercentage >= 100 ? '#EF4444' : primaryColor
              }}
            />
          </div>
          {studentPercentage >= 100 && (
            <p className="text-xs text-red-600 mt-1">Class is full</p>
          )}
        </div>

        {/* Action Button */}
        <Link
          href={`/classes/${classData.id}`}
          className="block w-full text-center py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  )
}
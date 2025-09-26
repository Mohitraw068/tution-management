'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useInstitute, useInstituteBranding } from '@/components/providers/InstituteProvider'
import { Sidebar } from '@/components/layout/Sidebar'
import { ClassCard } from '@/components/classes/ClassCard'
import Link from 'next/link'

interface Class {
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

export default function ClassesPage() {
  const { data: session, status } = useSession()
  const { institute, loading: instituteLoading } = useInstitute()
  const { cssVariables, primaryColor } = useInstituteBranding()
  const router = useRouter()
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [subjectFilter, setSubjectFilter] = useState('')
  const [teacherFilter, setTeacherFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [teachers, setTeachers] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
  }, [session, status, router])

  useEffect(() => {
    if (session && institute) {
      fetchClasses()
      fetchTeachers()
    }
  }, [session, institute])

  const fetchClasses = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/classes')
      if (response.ok) {
        const data = await response.json()
        setClasses(data)
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
    } finally {
      setLoading(false)
    }
  }

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

  const filteredClasses = classes.filter(cls => {
    const matchesSearch = cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cls.subject.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubject = !subjectFilter || cls.subject === subjectFilter
    const matchesTeacher = !teacherFilter || cls.teacherId === teacherFilter

    return matchesSearch && matchesSubject && matchesTeacher
  })

  const uniqueSubjects = Array.from(new Set(classes.map(cls => cls.subject)))

  const canCreateClass = ['OWNER', 'ADMIN'].includes(session.user.role)

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
                <h1 className="text-3xl font-bold text-gray-900">Classes</h1>
                <p className="text-gray-600 mt-1">Manage your classes and schedules</p>
              </div>
              {canCreateClass && (
                <Link
                  href="/classes/new"
                  className="px-4 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: primaryColor }}
                >
                  + Create New Class
                </Link>
              )}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search
                  </label>
                  <input
                    type="text"
                    placeholder="Search classes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 text-gray-900"
                    style={{ focusRing: primaryColor }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <select
                    value={subjectFilter}
                    onChange={(e) => setSubjectFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 text-gray-900"
                    style={{ focusRing: primaryColor }}
                  >
                    <option value="">All Subjects</option>
                    {uniqueSubjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teacher
                  </label>
                  <select
                    value={teacherFilter}
                    onChange={(e) => setTeacherFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 text-gray-900"
                    style={{ focusRing: primaryColor }}
                  >
                    <option value="">All Teachers</option>
                    {teachers.map(teacher => (
                      <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setSubjectFilter('')
                      setTeacherFilter('')
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Classes Grid */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-lg text-gray-600">Loading classes...</div>
            </div>
          ) : filteredClasses.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No classes found</h3>
              <p className="text-gray-600 mb-4">
                {classes.length === 0
                  ? "Get started by creating your first class"
                  : "Try adjusting your filters"
                }
              </p>
              {canCreateClass && classes.length === 0 && (
                <Link
                  href="/classes/new"
                  className="inline-flex items-center px-4 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: primaryColor }}
                >
                  + Create First Class
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClasses.map((cls) => (
                <ClassCard key={cls.id} classData={cls} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
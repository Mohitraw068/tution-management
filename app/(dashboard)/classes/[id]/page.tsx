'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useInstitute, useInstituteBranding } from '@/components/providers/InstituteProvider'
import { Sidebar } from '@/components/layout/Sidebar'
import { StudentsList } from '@/components/classes/StudentsList'
import { AddStudentsModal } from '@/components/classes/AddStudentsModal'

interface ClassData {
  id: string
  name: string
  subject: string
  description?: string
  teacherId: string
  teacher: {
    id: string
    name: string
    email: string
  }
  capacity: number
  schedule: string
  isVirtual: boolean
  meetingLink?: string
  location?: string
  startDate?: string
  endDate?: string
  students: Array<{
    id: string
    userId: string
    user: {
      id: string
      name: string
      email: string
    }
  }>
  materials: Array<{
    id: string
    title: string
    description?: string
    fileUrl: string
    fileName: string
    fileSize: number
    fileType: string
    uploadedAt: string
  }>
  _count: {
    students: number
    attendance: number
    materials: number
  }
}

export default function ClassDetailsPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const { institute, loading: instituteLoading } = useInstitute()
  const { cssVariables, primaryColor } = useInstituteBranding()
  const router = useRouter()
  const [classData, setClassData] = useState<ClassData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showAddStudentsModal, setShowAddStudentsModal] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
  }, [session, status, router])

  useEffect(() => {
    if (session && params.id) {
      fetchClassData()
    }
  }, [session, params.id])

  const fetchClassData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/classes/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setClassData(data)
      } else if (response.status === 404) {
        router.push('/dashboard/classes')
      }
    } catch (error) {
      console.error('Error fetching class data:', error)
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

  const parseSchedule = (schedule: string) => {
    try {
      return JSON.parse(schedule)
    } catch {
      return {}
    }
  }

  const schedule = parseSchedule(classData.schedule)
  const canManageClass = ['OWNER', 'ADMIN'].includes(session.user.role) ||
                        (session.user.role === 'TEACHER' && session.user.id === classData.teacherId)

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'students', name: 'Students', icon: '👥' },
    { id: 'attendance', name: 'Attendance', icon: '✅' },
    { id: 'materials', name: 'Materials', icon: '📚' }
  ]

  const handleStudentsUpdate = () => {
    fetchClassData()
    setShowAddStudentsModal(false)
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Class Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border">
                <div className="text-2xl font-bold" style={{ color: primaryColor }}>
                  {classData._count.students}
                </div>
                <div className="text-sm text-gray-600">Students Enrolled</div>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <div className="text-2xl font-bold text-gray-900">
                  {classData.capacity}
                </div>
                <div className="text-sm text-gray-600">Total Capacity</div>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <div className="text-2xl font-bold text-gray-900">
                  {classData._count.attendance}
                </div>
                <div className="text-sm text-gray-600">Attendance Records</div>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <div className="text-2xl font-bold text-gray-900">
                  {classData._count.materials}
                </div>
                <div className="text-sm text-gray-600">Materials Uploaded</div>
              </div>
            </div>

            {/* Class Details */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Class Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subject</label>
                    <p className="text-gray-900">{classData.subject}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Teacher</label>
                    <p className="text-gray-900">{classData.teacher.name}</p>
                    <p className="text-sm text-gray-500">{classData.teacher.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Capacity</label>
                    <p className="text-gray-900">{classData.capacity} students</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <p className="text-gray-900">{classData.isVirtual ? 'Virtual' : 'Physical'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {classData.description && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <p className="text-gray-900">{classData.description}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {classData.isVirtual ? 'Meeting Link' : 'Location'}
                    </label>
                    {classData.isVirtual ? (
                      <a
                        href={classData.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        {classData.meetingLink}
                      </a>
                    ) : (
                      <p className="text-gray-900">{classData.location}</p>
                    )}
                  </div>
                  {(classData.startDate || classData.endDate) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Duration</label>
                      <p className="text-gray-900">
                        {classData.startDate && new Date(classData.startDate).toLocaleDateString()} - {' '}
                        {classData.endDate && new Date(classData.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Weekly Schedule */}
            {Object.keys(schedule).length > 0 && (
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Schedule</h3>
                <div className="space-y-2">
                  {Object.entries(schedule).map(([day, time]) => (
                    <div key={day} className="flex justify-between items-center py-2 border-b last:border-b-0">
                      <span className="font-medium text-gray-900">{day}</span>
                      <span className="text-gray-600">{time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case 'students':
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Students ({classData._count.students}/{classData.capacity})
              </h3>
              {canManageClass && (
                <button
                  onClick={() => setShowAddStudentsModal(true)}
                  className="px-4 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: primaryColor }}
                >
                  + Add Students
                </button>
              )}
            </div>
            <StudentsList
              students={classData.students}
              canManage={canManageClass}
              onUpdate={handleStudentsUpdate}
              classId={classData.id}
            />
          </div>
        )

      case 'attendance':
        return (
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance</h3>
            <p className="text-gray-600">Attendance management coming soon...</p>
          </div>
        )

      case 'materials':
        return (
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Study Materials</h3>
            {classData.materials.length === 0 ? (
              <p className="text-gray-600">No materials uploaded yet.</p>
            ) : (
              <div className="space-y-4">
                {classData.materials.map((material) => (
                  <div key={material.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{material.title}</h4>
                        {material.description && (
                          <p className="text-sm text-gray-600 mt-1">{material.description}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>{material.fileName}</span>
                          <span>{(material.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                          <span>{new Date(material.uploadedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <a
                        href={material.fileUrl}
                        download
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      default:
        return null
    }
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
                onClick={() => router.push('/classes')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Classes
              </button>
            </div>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{classData.name}</h1>
                <p className="text-gray-600 mt-1">{classData.subject}</p>
                <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                  <span>👨‍🏫 {classData.teacher.name}</span>
                  <span>{classData.isVirtual ? '💻 Virtual' : '🏢 Physical'}</span>
                  <span>👥 {classData._count.students}/{classData.capacity}</span>
                </div>
              </div>
              {canManageClass && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => router.push(`/classes/${classData.id}/edit`)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 font-medium transition-colors"
                  >
                    Edit Class
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-current text-current'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    style={activeTab === tab.id ? { color: primaryColor, borderColor: primaryColor } : {}}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {renderTabContent()}
        </main>
      </div>

      {/* Modals */}
      {showAddStudentsModal && (
        <AddStudentsModal
          classId={classData.id}
          onClose={() => setShowAddStudentsModal(false)}
          onSuccess={handleStudentsUpdate}
        />
      )}
    </div>
  )
}
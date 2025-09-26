'use client'

import { StatsCard } from '@/components/widgets/StatsCard'
import { QuickActions } from '@/components/widgets/QuickActions'
import { RecentActivity } from '@/components/widgets/RecentActivity'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function StudentDashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [attendanceStats, setAttendanceStats] = useState<any>(null)
  const [todaysClasses, setTodaysClasses] = useState<any[]>([])

  useEffect(() => {
    if (session?.user) {
      fetchStudentData()
    }
  }, [session])

  const fetchStudentData = async () => {
    try {
      // Fetch student's classes and attendance data
      const today = new Date().toISOString().split('T')[0]

      // You could create specific endpoints for student dashboard data
      // For now, we'll use mock data with some real structure
      setAttendanceStats({
        totalClasses: 15,
        present: 13,
        absent: 1,
        late: 1,
        attendanceRate: 87
      })
    } catch (error) {
      console.error('Error fetching student data:', error)
    }
  }

  // Mock data - in real app, fetch from API
  const stats = {
    todaysClasses: todaysClasses.length || 5,
    pendingAssignments: 3,
    attendancePercentage: attendanceStats?.attendanceRate || 89,
    averageGrade: 85,
    completedAssignments: 12,
    upcomingExams: 2
  }

  const todaysSchedule = [
    { time: '8:00 AM', subject: 'Mathematics', teacher: 'Mr. Johnson', room: 'Room 101' },
    { time: '9:30 AM', subject: 'Physics', teacher: 'Dr. Smith', room: 'Lab 1' },
    { time: '11:00 AM', subject: 'Chemistry', teacher: 'Mrs. Brown', room: 'Lab 2' },
    { time: '1:00 PM', subject: 'English', teacher: 'Ms. Davis', room: 'Room 203' },
    { time: '2:30 PM', subject: 'History', teacher: 'Mr. Wilson', room: 'Room 105' }
  ]

  const pendingAssignments = [
    { subject: 'Mathematics', title: 'Calculus Problem Set', dueDate: '2 days', priority: 'high' },
    { subject: 'Physics', title: 'Lab Report - Motion', dueDate: '4 days', priority: 'medium' },
    { subject: 'English', title: 'Essay - Literature Review', dueDate: '1 week', priority: 'low' }
  ]

  const quickActions = [
    {
      title: 'Scan QR for Attendance',
      description: 'Mark your attendance by scanning QR code',
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
      ),
      onClick: () => router.push('/attendance/scan'),
      color: 'blue' as const
    },
    {
      title: 'Submit Assignment',
      description: 'Upload your completed assignments',
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
      onClick: () => alert('Submit Assignment clicked'),
      color: 'green' as const
    },
    {
      title: 'View Grades',
      description: 'Check your latest grades and feedback',
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      onClick: () => alert('View Grades clicked'),
      color: 'blue' as const
    },
    {
      title: 'Download Resources',
      description: 'Access study materials and notes',
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      onClick: () => alert('Download Resources clicked'),
      color: 'purple' as const
    },
    {
      title: 'Ask Question',
      description: 'Submit questions to your teachers',
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      onClick: () => alert('Ask Question clicked'),
      color: 'yellow' as const
    }
  ]

  const recentActivities = [
    {
      id: '1',
      type: 'success' as const,
      title: 'Assignment graded',
      description: 'Received A+ on Math assignment',
      time: '2 hours ago'
    },
    {
      id: '2',
      type: 'info' as const,
      title: 'New resource uploaded',
      description: 'Physics notes for Chapter 5 available',
      time: '4 hours ago'
    },
    {
      id: '3',
      type: 'warning' as const,
      title: 'Assignment due soon',
      description: 'Chemistry lab report due in 2 days',
      time: '1 day ago'
    },
    {
      id: '4',
      type: 'success' as const,
      title: 'Perfect attendance',
      description: 'Maintained 100% attendance this week',
      time: '2 days ago'
    }
  ]

  const priorityColors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800'
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome back, {session?.user.name}!</h2>
        <p className="text-purple-100">
          You have {stats.todaysClasses} classes and {stats.pendingAssignments} pending assignments today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard
          title="Today's Classes"
          value={stats.todaysClasses}
          icon={
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1M8 7h8v14l-4-2-4 2V7z" />
            </svg>
          }
          color="blue"
        />

        <StatsCard
          title="Attendance Rate"
          value={`${stats.attendancePercentage}%`}
          change={{ value: '+2% this month', type: 'increase' }}
          icon={
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="green"
        />

        <StatsCard
          title="Average Grade"
          value={`${stats.averageGrade}%`}
          change={{ value: '+5% from last term', type: 'increase' }}
          icon={
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          }
          color="yellow"
        />

        <StatsCard
          title="Pending Assignments"
          value={stats.pendingAssignments}
          change={{ value: '2 due this week', type: 'warning' }}
          icon={
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="red"
        />

        <StatsCard
          title="Completed Assignments"
          value={stats.completedAssignments}
          change={{ value: '3 this week', type: 'increase' }}
          icon={
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="green"
        />

        <StatsCard
          title="Upcoming Exams"
          value={stats.upcomingExams}
          change={{ value: 'Next week', type: 'neutral' }}
          icon={
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          }
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h3>
          <div className="space-y-3">
            {todaysSchedule.map((item, index) => (
              <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-16 text-sm font-medium text-gray-600">{item.time}</div>
                </div>
                <div className="ml-4 flex-1">
                  <h4 className="text-sm font-medium text-gray-900">{item.subject}</h4>
                  <p className="text-sm text-gray-600">{item.teacher} • {item.room}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Assignments */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Assignments</h3>
          <div className="space-y-4">
            {pendingAssignments.map((assignment, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900">{assignment.title}</h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityColors[assignment.priority]}`}>
                    {assignment.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{assignment.subject}</p>
                <p className="text-xs text-gray-500">Due in {assignment.dueDate}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <QuickActions title="Quick Actions" actions={quickActions} />

        {/* Attendance Overview */}
        {attendanceStats && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Overview</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Overall Attendance Rate</span>
                <span className="text-lg font-semibold text-blue-600">{attendanceStats.attendanceRate}%</span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full"
                  style={{ width: `${attendanceStats.attendanceRate}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-semibold text-green-600">{attendanceStats.present}</div>
                  <div className="text-xs text-green-700">Present</div>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <div className="text-lg font-semibold text-yellow-600">{attendanceStats.late}</div>
                  <div className="text-xs text-yellow-700">Late</div>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <div className="text-lg font-semibold text-red-600">{attendanceStats.absent}</div>
                  <div className="text-xs text-red-700">Absent</div>
                </div>
              </div>

              <button
                onClick={() => router.push('/attendance/scan')}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Mark Today's Attendance
              </button>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <RecentActivity title="Recent Activity" activities={recentActivities} />
      </div>
    </div>
  )
}
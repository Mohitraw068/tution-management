'use client'

import { StatsCard } from '@/components/widgets/StatsCard'
import { QuickActions } from '@/components/widgets/QuickActions'
import { RecentActivity } from '@/components/widgets/RecentActivity'
import { useSession } from 'next-auth/react'

export function TeacherDashboard() {
  const { data: session } = useSession()

  // Mock data - in real app, fetch from API
  const stats = {
    todaysClasses: 4,
    totalStudents: 65,
    pendingGrading: 8,
    attendanceToMark: 3,
    upcomingAssignments: 2,
    averageAttendance: 92
  }

  const todaysSchedule = [
    { time: '9:00 AM', subject: 'Mathematics', class: 'Grade 10A', room: 'Room 101' },
    { time: '11:00 AM', subject: 'Physics', class: 'Grade 11B', room: 'Lab 1' },
    { time: '1:00 PM', subject: 'Mathematics', class: 'Grade 9C', room: 'Room 101' },
    { time: '3:00 PM', subject: 'Advanced Math', class: 'Grade 12A', room: 'Room 102' }
  ]

  const quickActions = [
    {
      title: 'Mark Attendance',
      description: 'Mark attendance for today\'s classes',
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      onClick: () => alert('Mark Attendance clicked'),
      color: 'green' as const
    },
    {
      title: 'Grade Assignments',
      description: 'Review and grade pending assignments',
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      onClick: () => alert('Grade Assignments clicked'),
      color: 'yellow' as const
    },
    {
      title: 'Create Assignment',
      description: 'Create a new assignment for your classes',
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      onClick: () => alert('Create Assignment clicked'),
      color: 'blue' as const
    },
    {
      title: 'Send Announcement',
      description: 'Send announcement to your students',
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      ),
      onClick: () => alert('Send Announcement clicked'),
      color: 'purple' as const
    }
  ]

  const recentActivities = [
    {
      id: '1',
      type: 'success' as const,
      title: 'Assignment submitted',
      description: 'John Doe submitted Math homework',
      time: '30 minutes ago'
    },
    {
      id: '2',
      type: 'info' as const,
      title: 'Class completed',
      description: 'Grade 10A Mathematics class finished',
      time: '2 hours ago'
    },
    {
      id: '3',
      type: 'warning' as const,
      title: 'Late submission',
      description: 'Sarah missed Physics assignment deadline',
      time: '5 hours ago'
    },
    {
      id: '4',
      type: 'success' as const,
      title: 'Perfect attendance',
      description: 'Grade 11B had 100% attendance today',
      time: '1 day ago'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Good morning, {session?.user.name}!</h2>
        <p className="text-green-100">
          You have {stats.todaysClasses} classes scheduled for today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard
          title="Today's Classes"
          value={stats.todaysClasses}
          icon={
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
          color="blue"
        />

        <StatsCard
          title="Total Students"
          value={stats.totalStudents}
          icon={
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
          }
          color="green"
        />

        <StatsCard
          title="Pending Grading"
          value={stats.pendingGrading}
          change={{ value: 'Due this week', type: 'warning' }}
          icon={
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          color="yellow"
        />

        <StatsCard
          title="Attendance to Mark"
          value={stats.attendanceToMark}
          icon={
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          }
          color="purple"
        />

        <StatsCard
          title="Average Attendance"
          value={`${stats.averageAttendance}%`}
          change={{ value: '+3% from last month', type: 'increase' }}
          icon={
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
          color="green"
        />

        <StatsCard
          title="Upcoming Assignments"
          value={stats.upcomingAssignments}
          change={{ value: 'Due next week', type: 'neutral' }}
          icon={
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1M8 7h8v14l-4-2-4 2V7z" />
            </svg>
          }
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h3>
          <div className="space-y-4">
            {todaysSchedule.map((item, index) => (
              <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-16 text-sm font-medium text-gray-600">{item.time}</div>
                </div>
                <div className="ml-4 flex-1">
                  <h4 className="text-sm font-medium text-gray-900">{item.subject}</h4>
                  <p className="text-sm text-gray-600">{item.class} • {item.room}</p>
                </div>
                <div className="flex-shrink-0">
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <QuickActions title="Quick Actions" actions={quickActions} />
      </div>

      {/* Recent Activity */}
      <RecentActivity title="Recent Activity" activities={recentActivities} />
    </div>
  )
}
'use client'

import { StatsCard } from '@/components/widgets/StatsCard'
import { QuickActions } from '@/components/widgets/QuickActions'
import { RecentActivity } from '@/components/widgets/RecentActivity'
import { useInstitute } from '@/components/providers/InstituteProvider'

export function OwnerDashboard() {
  const { institute } = useInstitute()

  // Mock data - in real app, fetch from API
  const stats = {
    totalStudents: 245,
    totalTeachers: 18,
    monthlyRevenue: 45000,
    activeClasses: 32,
    pendingPayments: 12,
    attendanceRate: 87
  }

  const quickActions = [
    {
      title: 'Add New Teacher',
      description: 'Invite a teacher to join your institute',
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      onClick: () => alert('Add Teacher clicked'),
      color: 'green' as const
    },
    {
      title: 'Invite Students',
      description: 'Send bulk invitations to students',
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      onClick: () => alert('Invite Students clicked'),
      color: 'blue' as const
    },
    {
      title: 'View Reports',
      description: 'Check detailed analytics and reports',
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      onClick: () => alert('View Reports clicked'),
      color: 'purple' as const
    },
    {
      title: 'Institute Settings',
      description: 'Manage institute configuration',
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      onClick: () => alert('Institute Settings clicked'),
      color: 'yellow' as const
    }
  ]

  const recentActivities = [
    {
      id: '1',
      type: 'success' as const,
      title: 'New teacher registered',
      description: 'Sarah Johnson joined as Math teacher',
      time: '2 hours ago',
      user: 'System'
    },
    {
      id: '2',
      type: 'info' as const,
      title: 'Monthly report generated',
      description: 'October attendance and performance report ready',
      time: '5 hours ago',
      user: 'Auto-generated'
    },
    {
      id: '3',
      type: 'warning' as const,
      title: 'Payment reminder sent',
      description: '12 students have pending fee payments',
      time: '1 day ago',
      user: 'Finance System'
    },
    {
      id: '4',
      type: 'success' as const,
      title: 'Bulk student enrollment',
      description: '15 new students enrolled in Science batch',
      time: '2 days ago',
      user: 'Admin'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Institute Overview */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 lg:p-6 text-white">
        <h2 className="text-xl lg:text-2xl font-bold mb-2">Welcome back, Owner!</h2>
        <p className="text-blue-100 text-sm lg:text-base">
          {institute?.name} • {institute?.subscription} Plan • {stats.totalStudents}/{institute?.studentLimit} Students
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6">
        <StatsCard
          title="Total Students"
          value={stats.totalStudents}
          change={{ value: '+12% from last month', type: 'increase' }}
          icon={
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
          }
          color="blue"
        />

        <StatsCard
          title="Active Teachers"
          value={stats.totalTeachers}
          change={{ value: '+2 this month', type: 'increase' }}
          icon={
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
          color="green"
        />

        <StatsCard
          title="Monthly Revenue"
          value={`₹${stats.monthlyRevenue.toLocaleString()}`}
          change={{ value: '+8% from last month', type: 'increase' }}
          icon={
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          }
          color="purple"
        />

        <StatsCard
          title="Active Classes"
          value={stats.activeClasses}
          change={{ value: '4 new classes', type: 'increase' }}
          icon={
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
          color="yellow"
        />

        <StatsCard
          title="Pending Payments"
          value={stats.pendingPayments}
          change={{ value: '-3 from yesterday', type: 'decrease' }}
          icon={
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="red"
        />

        <StatsCard
          title="Attendance Rate"
          value={`${stats.attendanceRate}%`}
          change={{ value: '+2% from last week', type: 'increase' }}
          icon={
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="green"
        />
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <QuickActions title="Quick Actions" actions={quickActions} />
        <RecentActivity title="Recent Activity" activities={recentActivities} />
      </div>
    </div>
  )
}
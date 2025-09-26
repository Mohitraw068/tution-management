'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar
} from 'recharts'

interface AnalyticsData {
  personalProgress?: any
  classPerformance?: any
  instituteOverview?: any
}

interface AttendanceData {
  personalAttendance?: any
  classAttendance?: any
  instituteAttendance?: any
}

export default function AnalyticsPage() {
  const { data: session } = useSession()
  const [performanceData, setPerformanceData] = useState<AnalyticsData>({})
  const [attendanceData, setAttendanceData] = useState<AttendanceData>({})
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('month')
  const [activeTab, setActiveTab] = useState('performance')

  const userRole = session?.user?.role

  useEffect(() => {
    if (session) {
      fetchAnalyticsData()
    }
  }, [session, timeRange])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      const [performanceRes, attendanceRes] = await Promise.all([
        fetch(`/api/analytics/performance?timeRange=${timeRange}`),
        fetch(`/api/analytics/attendance?timeRange=${timeRange}`)
      ])

      if (performanceRes.ok && attendanceRes.ok) {
        const performanceData = await performanceRes.json()
        const attendanceData = await attendanceRes.json()
        setPerformanceData(performanceData)
        setAttendanceData(attendanceData)
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderStudentDashboard = () => {
    const { personalProgress } = performanceData
    const { personalAttendance } = attendanceData

    if (!personalProgress || !personalAttendance) return null

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

    return (
      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overall Grade</p>
                <p className="text-2xl font-bold text-gray-900">{personalProgress.overallGrade}%</p>
              </div>
              <div className={`p-3 rounded-full ${
                personalProgress.trendDirection === 'up' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d={personalProgress.trendDirection === 'up' ? 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' : 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6'} />
                </svg>
              </div>
            </div>
            <p className={`text-xs mt-2 ${
              personalProgress.trendDirection === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {personalProgress.trendDirection === 'up' ? '+' : ''}{personalProgress.improvement}% from last period
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Attendance</p>
                <p className="text-2xl font-bold text-gray-900">{personalAttendance.overallRate}%</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {personalAttendance.presentDays}/{personalAttendance.totalDays} days present
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Assignments</p>
                <p className="text-2xl font-bold text-gray-900">{personalProgress.assignmentScores?.length || 0}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2">Submitted this period</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rank</p>
                <p className="text-2xl font-bold text-gray-900">#8</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2">out of 45 students</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Grade History Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Grade History</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={personalProgress.gradeHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="mathematics" stroke="#8884d8" strokeWidth={2} />
                <Line type="monotone" dataKey="physics" stroke="#82ca9d" strokeWidth={2} />
                <Line type="monotone" dataKey="chemistry" stroke="#ffc658" strokeWidth={2} />
                <Line type="monotone" dataKey="english" stroke="#ff7300" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Subject Performance */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={personalProgress.subjectPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="currentGrade" fill="#8884d8" />
                <Bar dataKey="previousGrade" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Assignment Scores */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Assignment Scores</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={personalProgress.assignmentScores?.slice(-10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="title" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="score" stroke="#8884d8" fill="#8884d8" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Attendance Trend */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={personalAttendance.weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="rate" stroke="#82ca9d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject-wise Attendance */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject-wise Attendance</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {personalAttendance.subjectWiseAttendance?.map((subject: any, index: number) => (
              <div key={subject.subject} className="text-center">
                <ResponsiveContainer width="100%" height={120}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Present', value: subject.present },
                        { name: 'Absent', value: subject.absent },
                        { name: 'Late', value: subject.late }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={20}
                      outerRadius={40}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {[
                        { name: 'Present', value: subject.present },
                        { name: 'Absent', value: subject.absent },
                        { name: 'Late', value: subject.late }
                      ].map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={COLORS[idx]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <p className="text-sm font-medium text-gray-900">{subject.subject}</p>
                <p className="text-xs text-gray-600">{subject.rate}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderTeacherDashboard = () => {
    const { classPerformance } = performanceData
    const { classAttendance } = attendanceData

    if (!classPerformance || !classAttendance) return null

    return (
      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{classPerformance.totalStudents}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Grade</p>
                <p className="text-2xl font-bold text-gray-900">{classPerformance.averageGrade}%</p>
              </div>
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-green-600 mt-2">+{classPerformance.improvementRate}% improvement</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                <p className="text-2xl font-bold text-gray-900">{classAttendance.overallRate}%</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Homework</p>
                <p className="text-2xl font-bold text-gray-900">{classPerformance.homeworkStats?.totalAssigned || 0}</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2">Assignments this period</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Grade Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Grade Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={classPerformance.gradeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({grade, percentage}) => `${grade} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {classPerformance.gradeDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'][index % 6]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Progress */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Progress</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={classPerformance.monthlyProgress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="averageGrade" stroke="#8884d8" strokeWidth={2} />
                <Line type="monotone" dataKey="attendanceRate" stroke="#82ca9d" strokeWidth={2} />
                <Line type="monotone" dataKey="submissionRate" stroke="#ffc658" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Class Performance Comparison */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Class Performance Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={classPerformance.classes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="averageGrade" fill="#8884d8" />
                <Bar dataKey="attendanceRate" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Daily Attendance Trends */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Attendance Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={classAttendance.dailyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="class1Rate" stroke="#8884d8" strokeWidth={2} />
                <Line type="monotone" dataKey="class2Rate" stroke="#82ca9d" strokeWidth={2} />
                <Line type="monotone" dataKey="class3Rate" stroke="#ffc658" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    )
  }

  const renderOwnerDashboard = () => {
    const { instituteOverview } = performanceData
    const { instituteAttendance } = attendanceData

    if (!instituteOverview || !instituteAttendance) return null

    return (
      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Students</p>
                <p className="text-2xl font-bold text-gray-900">{instituteOverview.totalStudents}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-green-600 mt-2">+{instituteOverview.studentGrowth?.growthRate}% growth</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Teachers</p>
                <p className="text-2xl font-bold text-gray-900">{instituteOverview.totalTeachers}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Classes</p>
                <p className="text-2xl font-bold text-gray-900">{instituteOverview.totalClasses}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Performance</p>
                <p className="text-2xl font-bold text-gray-900">{instituteOverview.overallPerformance}%</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Attendance</p>
                <p className="text-2xl font-bold text-gray-900">{instituteAttendance.overallRate}%</p>
              </div>
              <div className="p-3 rounded-full bg-red-100 text-red-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Grade-wise Performance */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Grade-wise Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={instituteOverview.performanceByGrade}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="grade" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="averageScore" fill="#8884d8" />
                <Bar dataKey="attendanceRate" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Institute Metrics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Institute Metrics</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={instituteOverview.monthlyMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="studentsEnrolled" stroke="#8884d8" strokeWidth={2} />
                <Line type="monotone" dataKey="averagePerformance" stroke="#82ca9d" strokeWidth={2} />
                <Line type="monotone" dataKey="attendanceRate" stroke="#ffc658" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Teacher Effectiveness */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Teacher Effectiveness</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={instituteOverview.teacherEffectiveness} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="averageStudentScore" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Attendance Trends by Grade */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Attendance Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={instituteAttendance.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="grade8" stroke="#8884d8" strokeWidth={2} />
                <Line type="monotone" dataKey="grade9" stroke="#82ca9d" strokeWidth={2} />
                <Line type="monotone" dataKey="grade10" stroke="#ffc658" strokeWidth={2} />
                <Line type="monotone" dataKey="grade11" stroke="#ff7300" strokeWidth={2} />
                <Line type="monotone" dataKey="grade12" stroke="#413ea0" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive performance and attendance analytics</p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="semester">This Semester</option>
            <option value="year">This Year</option>
          </select>

          {/* Tab Selector */}
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            <button
              onClick={() => setActiveTab('performance')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'performance'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Performance
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'attendance'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Attendance
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      {activeTab === 'performance' && (
        <>
          {userRole === 'STUDENT' && renderStudentDashboard()}
          {userRole === 'TEACHER' && renderTeacherDashboard()}
          {(['OWNER', 'ADMIN'].includes(userRole || '')) && renderOwnerDashboard()}
        </>
      )}

      {activeTab === 'attendance' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Analytics</h3>
          <p className="text-gray-600">
            Detailed attendance analytics view would be rendered here based on user role.
          </p>
          {/* Additional attendance-specific charts would go here */}
        </div>
      )}
    </div>
  )
}
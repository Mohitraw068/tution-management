import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = session.user as any
    const userRole = user.role
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || 'month' // week, month, semester, year
    const classId = searchParams.get('classId')

    // Generate mock attendance data based on role and time range
    const generateAttendanceData = () => {
      const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : timeRange === 'semester' ? 90 : 365

      if (userRole === 'STUDENT') {
        return {
          personalAttendance: {
            overallRate: 92.5,
            totalDays: days,
            presentDays: Math.round(days * 0.925),
            absentDays: Math.round(days * 0.05),
            lateDays: Math.round(days * 0.025),
            trend: 'stable',
            dailyAttendance: Array.from({ length: Math.min(days, 30) }, (_, i) => {
              const date = new Date(Date.now() - (Math.min(days, 30) - 1 - i) * 24 * 60 * 60 * 1000)
              const dayOfWeek = date.getDay()
              // Skip weekends
              if (dayOfWeek === 0 || dayOfWeek === 6) return null

              const random = Math.random()
              return {
                date: date.toISOString().split('T')[0],
                status: random > 0.95 ? 'absent' : random > 0.90 ? 'late' : 'present',
                subjects: [
                  { name: 'Mathematics', status: random > 0.97 ? 'absent' : random > 0.92 ? 'late' : 'present' },
                  { name: 'Physics', status: random > 0.96 ? 'absent' : random > 0.91 ? 'late' : 'present' },
                  { name: 'Chemistry', status: random > 0.98 ? 'absent' : random > 0.93 ? 'late' : 'present' },
                  { name: 'English', status: random > 0.95 ? 'absent' : random > 0.90 ? 'late' : 'present' }
                ]
              }
            }).filter(Boolean),
            subjectWiseAttendance: [
              { subject: 'Mathematics', rate: 94.2, present: 29, absent: 1, late: 1 },
              { subject: 'Physics', rate: 96.8, present: 30, absent: 1, late: 0 },
              { subject: 'Chemistry', rate: 90.3, present: 28, absent: 2, late: 1 },
              { subject: 'English', rate: 93.5, present: 29, absent: 1, late: 1 },
              { subject: 'History', rate: 87.1, present: 27, absent: 3, late: 1 }
            ],
            weeklyTrend: Array.from({ length: Math.min(Math.ceil(days / 7), 12) }, (_, i) => ({
              week: `Week ${i + 1}`,
              rate: Math.round(85 + Math.sin(i * 0.3) * 10 + Math.random() * 5),
              present: Math.round(4 + Math.random() * 1),
              absent: Math.round(Math.random() * 0.5),
              late: Math.round(Math.random() * 0.3)
            }))
          }
        }
      } else if (userRole === 'TEACHER') {
        return {
          classAttendance: {
            overallRate: 91.8,
            classes: [
              {
                id: 'class1',
                name: 'Grade 10A - Mathematics',
                students: 25,
                attendanceRate: 94.2,
                presentToday: 24,
                absentToday: 1,
                lateToday: 0,
                trend: 'up'
              },
              {
                id: 'class2',
                name: 'Grade 11B - Physics',
                students: 22,
                attendanceRate: 96.1,
                presentToday: 22,
                absentToday: 0,
                lateToday: 0,
                trend: 'stable'
              },
              {
                id: 'class3',
                name: 'Grade 9C - Mathematics',
                students: 18,
                attendanceRate: 88.9,
                presentToday: 16,
                absentToday: 1,
                lateToday: 1,
                trend: 'down'
              }
            ],
            dailyTrends: Array.from({ length: Math.min(days, 30) }, (_, i) => {
              const date = new Date(Date.now() - (Math.min(days, 30) - 1 - i) * 24 * 60 * 60 * 1000)
              const dayOfWeek = date.getDay()
              if (dayOfWeek === 0 || dayOfWeek === 6) return null

              return {
                date: date.toISOString().split('T')[0],
                class1Rate: Math.round(88 + Math.sin(i * 0.2) * 8 + Math.random() * 4),
                class2Rate: Math.round(92 + Math.cos(i * 0.3) * 6 + Math.random() * 3),
                class3Rate: Math.round(84 + Math.sin(i * 0.4) * 10 + Math.random() * 5)
              }
            }).filter(Boolean),
            monthlyComparison: Array.from({ length: 6 }, (_, i) => ({
              month: new Date(2024, 5 - i, 1).toLocaleDateString('en-US', { month: 'short' }),
              class1: Math.round(88 + Math.sin(i * 0.5) * 8 + Math.random() * 4),
              class2: Math.round(92 + Math.cos(i * 0.3) * 6 + Math.random() * 3),
              class3: Math.round(84 + Math.sin(i * 0.7) * 10 + Math.random() * 5)
            })).reverse(),
            attendancePatterns: {
              mondayRate: 89.2,
              tuesdayRate: 92.1,
              wednesdayRate: 94.5,
              thursdayRate: 93.8,
              fridayRate: 88.7
            }
          }
        }
      } else if (['OWNER', 'ADMIN'].includes(userRole)) {
        return {
          instituteAttendance: {
            overallRate: 91.3,
            totalStudents: 245,
            presentToday: 224,
            absentToday: 15,
            lateToday: 6,
            gradeWiseAttendance: [
              { grade: 'Grade 12', students: 45, rate: 94.2, present: 42, absent: 2, late: 1 },
              { grade: 'Grade 11', students: 52, rate: 92.8, present: 48, absent: 3, late: 1 },
              { grade: 'Grade 10', students: 48, rate: 91.7, present: 44, absent: 3, late: 1 },
              { grade: 'Grade 9', students: 51, rate: 89.4, present: 46, absent: 4, late: 1 },
              { grade: 'Grade 8', students: 49, rate: 88.1, present: 43, absent: 4, late: 2 }
            ],
            monthlyTrends: Array.from({ length: 12 }, (_, i) => ({
              month: new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'short' }),
              overallRate: Math.round(85 + Math.sin(i * 0.4) * 8 + Math.random() * 4),
              grade8: Math.round(83 + Math.sin(i * 0.3) * 7 + Math.random() * 3),
              grade9: Math.round(85 + Math.cos(i * 0.2) * 6 + Math.random() * 4),
              grade10: Math.round(87 + Math.sin(i * 0.5) * 8 + Math.random() * 3),
              grade11: Math.round(89 + Math.cos(i * 0.4) * 7 + Math.random() * 4),
              grade12: Math.round(91 + Math.sin(i * 0.6) * 6 + Math.random() * 3)
            })),
            topPerformingClasses: [
              { name: 'Grade 12A - Physics', rate: 97.2, teacher: 'Dr. Smith' },
              { name: 'Grade 11B - Mathematics', rate: 96.8, teacher: 'Prof. Johnson' },
              { name: 'Grade 10C - Chemistry', rate: 95.9, teacher: 'Ms. Wilson' }
            ],
            attendanceByDay: {
              monday: 89.2,
              tuesday: 92.1,
              wednesday: 94.5,
              thursday: 93.8,
              friday: 88.7
            },
            chronicallyAbsent: [
              { studentName: 'John Doe', grade: 'Grade 10', rate: 67.3, daysAbsent: 22 },
              { studentName: 'Jane Smith', grade: 'Grade 9', rate: 71.2, daysAbsent: 19 },
              { studentName: 'Mike Johnson', grade: 'Grade 11', rate: 74.8, daysAbsent: 17 }
            ],
            seasonalPatterns: Array.from({ length: Math.min(days, 90) }, (_, i) => {
              const date = new Date(Date.now() - (Math.min(days, 90) - 1 - i) * 24 * 60 * 60 * 1000)
              const dayOfWeek = date.getDay()
              if (dayOfWeek === 0 || dayOfWeek === 6) return null

              // Simulate seasonal effects (lower attendance in winter/exam periods)
              const month = date.getMonth()
              let baseRate = 91
              if (month === 11 || month === 0 || month === 1) baseRate -= 5 // Winter
              if (month === 4 || month === 9) baseRate -= 3 // Exam periods

              return {
                date: date.toISOString().split('T')[0],
                rate: Math.round(baseRate + Math.sin(i * 0.1) * 5 + Math.random() * 3)
              }
            }).filter(Boolean)
          }
        }
      }

      return { error: 'No data available for this role' }
    }

    const data = generateAttendanceData()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error fetching attendance analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch attendance data' },
      { status: 500 }
    )
  }
}
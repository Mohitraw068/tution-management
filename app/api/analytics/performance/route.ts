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

    // Generate mock data based on role and time range
    const generateMockData = () => {
      const dataPoints = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : timeRange === 'semester' ? 90 : 365

      if (userRole === 'STUDENT') {
        return {
          personalProgress: {
            overallGrade: 85.2,
            trendDirection: 'up',
            improvement: 5.3,
            subjectPerformance: [
              { subject: 'Mathematics', currentGrade: 88, previousGrade: 82, trend: 'up' },
              { subject: 'Physics', currentGrade: 91, previousGrade: 89, trend: 'up' },
              { subject: 'Chemistry', currentGrade: 83, previousGrade: 85, trend: 'down' },
              { subject: 'English', currentGrade: 87, previousGrade: 84, trend: 'up' },
              { subject: 'History', currentGrade: 79, previousGrade: 78, trend: 'up' }
            ],
            gradeHistory: Array.from({ length: Math.min(dataPoints, 30) }, (_, i) => ({
              date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              mathematics: Math.round(80 + Math.sin(i * 0.3) * 10 + Math.random() * 5),
              physics: Math.round(85 + Math.cos(i * 0.2) * 8 + Math.random() * 4),
              chemistry: Math.round(82 + Math.sin(i * 0.4) * 6 + Math.random() * 3),
              english: Math.round(84 + Math.cos(i * 0.3) * 5 + Math.random() * 4),
              history: Math.round(78 + Math.sin(i * 0.2) * 7 + Math.random() * 3)
            })),
            assignmentScores: Array.from({ length: 15 }, (_, i) => ({
              id: `hw-${i + 1}`,
              title: `Assignment ${i + 1}`,
              subject: ['Mathematics', 'Physics', 'Chemistry', 'English', 'History'][i % 5],
              score: Math.round(70 + Math.random() * 30),
              maxScore: 100,
              submittedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            })),
            attendanceRate: 92.5,
            attendanceTrend: Array.from({ length: Math.min(dataPoints, 30) }, (_, i) => ({
              date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              present: Math.random() > 0.1,
              rate: Math.round(85 + Math.sin(i * 0.1) * 10 + Math.random() * 5)
            }))
          }
        }
      } else if (userRole === 'TEACHER') {
        return {
          classPerformance: {
            averageGrade: 82.4,
            totalStudents: 65,
            improvementRate: 7.2,
            classes: [
              {
                name: 'Grade 10A - Mathematics',
                students: 25,
                averageGrade: 84.2,
                attendanceRate: 94.5,
                submissionRate: 89.3,
                improvementTrend: 'up'
              },
              {
                name: 'Grade 11B - Physics',
                students: 22,
                averageGrade: 87.1,
                attendanceRate: 96.2,
                submissionRate: 92.1,
                improvementTrend: 'up'
              },
              {
                name: 'Grade 9C - Mathematics',
                students: 18,
                averageGrade: 76.8,
                attendanceRate: 91.3,
                submissionRate: 84.7,
                improvementTrend: 'stable'
              }
            ],
            gradeDistribution: [
              { grade: 'A+', count: 8, percentage: 12.3 },
              { grade: 'A', count: 15, percentage: 23.1 },
              { grade: 'B+', count: 18, percentage: 27.7 },
              { grade: 'B', count: 14, percentage: 21.5 },
              { grade: 'C+', count: 7, percentage: 10.8 },
              { grade: 'C', count: 3, percentage: 4.6 }
            ],
            monthlyProgress: Array.from({ length: Math.min(dataPoints / 7, 12) }, (_, i) => ({
              month: new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'short' }),
              averageGrade: Math.round(75 + Math.sin(i * 0.5) * 10 + Math.random() * 5),
              attendanceRate: Math.round(88 + Math.cos(i * 0.3) * 8 + Math.random() * 3),
              submissionRate: Math.round(82 + Math.sin(i * 0.4) * 12 + Math.random() * 4)
            })),
            homeworkStats: {
              totalAssigned: 45,
              totalSubmitted: 38,
              averageScore: 82.4,
              onTimeSubmissions: 34,
              lateSubmissions: 4
            }
          }
        }
      } else if (['OWNER', 'ADMIN'].includes(userRole)) {
        return {
          instituteOverview: {
            totalStudents: 245,
            totalTeachers: 18,
            totalClasses: 32,
            overallPerformance: 83.7,
            studentGrowth: {
              thisMonth: 12,
              lastMonth: 8,
              growthRate: 50
            },
            performanceByGrade: [
              { grade: 'Grade 12', students: 45, averageScore: 87.2, attendanceRate: 95.1 },
              { grade: 'Grade 11', students: 52, averageScore: 85.8, attendanceRate: 93.7 },
              { grade: 'Grade 10', students: 48, averageScore: 82.4, attendanceRate: 92.3 },
              { grade: 'Grade 9', students: 51, averageScore: 80.1, attendanceRate: 90.8 },
              { grade: 'Grade 8', students: 49, averageScore: 78.9, attendanceRate: 89.5 }
            ],
            monthlyMetrics: Array.from({ length: 12 }, (_, i) => ({
              month: new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'short' }),
              studentsEnrolled: Math.round(200 + i * 5 + Math.random() * 10),
              averagePerformance: Math.round(78 + Math.sin(i * 0.4) * 8 + Math.random() * 4),
              attendanceRate: Math.round(87 + Math.cos(i * 0.3) * 6 + Math.random() * 3),
              teacherSatisfaction: Math.round(82 + Math.sin(i * 0.2) * 5 + Math.random() * 3)
            })),
            topPerformingClasses: [
              { name: 'Grade 12A - Physics', teacher: 'Dr. Smith', averageScore: 91.2, students: 22 },
              { name: 'Grade 11B - Mathematics', teacher: 'Prof. Johnson', averageScore: 89.7, students: 25 },
              { name: 'Grade 10C - Chemistry', teacher: 'Ms. Wilson', averageScore: 87.8, students: 24 }
            ],
            teacherEffectiveness: [
              { name: 'Dr. Smith', subjects: ['Physics'], averageStudentScore: 89.2, attendanceRate: 96.1, rating: 4.8 },
              { name: 'Prof. Johnson', subjects: ['Mathematics'], averageStudentScore: 87.4, attendanceRate: 94.7, rating: 4.7 },
              { name: 'Ms. Wilson', subjects: ['Chemistry'], averageStudentScore: 85.9, attendanceRate: 93.2, rating: 4.6 }
            ]
          }
        }
      }

      return { error: 'No data available for this role' }
    }

    const data = generateMockData()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error fetching performance analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch performance data' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = session.user as any
    const instituteId = user.instituteId

    if (!instituteId) {
      return NextResponse.json({ error: 'Institute not found' }, { status: 400 })
    }

    // Check permissions
    if (!['OWNER', 'ADMIN', 'TEACHER'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { classId, date, attendanceRecords } = body

    if (!classId || !date || !Array.isArray(attendanceRecords)) {
      return NextResponse.json(
        { error: 'Class ID, date, and attendance records are required' },
        { status: 400 }
      )
    }

    // Verify class belongs to the institute
    const classData = await prisma.class.findFirst({
      where: {
        id: classId,
        instituteId: instituteId
      }
    })

    if (!classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })
    }

    // Check if user can manage this class
    const canManage = ['OWNER', 'ADMIN'].includes(user.role) ||
                     (user.role === 'TEACHER' && user.id === classData.teacherId)

    if (!canManage) {
      return NextResponse.json({ error: 'Cannot manage this class' }, { status: 403 })
    }

    const attendanceDate = new Date(date)
    const results = []

    // Process each attendance record
    for (const record of attendanceRecords) {
      const { studentId, status } = record

      if (!studentId || !status || !['PRESENT', 'ABSENT', 'LATE'].includes(status)) {
        continue
      }

      try {
        // Upsert attendance record
        const attendance = await prisma.attendance.upsert({
          where: {
            studentId_classId_date: {
              studentId,
              classId,
              date: attendanceDate
            }
          },
          update: {
            status,
            markedBy: user.id,
            markedAt: new Date()
          },
          create: {
            studentId,
            classId,
            date: attendanceDate,
            status,
            markedBy: user.id
          }
        })

        results.push({
          studentId,
          status: 'success',
          attendanceId: attendance.id
        })
      } catch (error) {
        console.error(`Error marking attendance for student ${studentId}:`, error)
        results.push({
          studentId,
          status: 'error',
          error: 'Failed to mark attendance'
        })
      }
    }

    return NextResponse.json({
      message: 'Attendance marked successfully',
      results,
      totalProcessed: attendanceRecords.length,
      successCount: results.filter(r => r.status === 'success').length
    })
  } catch (error) {
    console.error('Error marking attendance:', error)
    return NextResponse.json(
      { error: 'Failed to mark attendance' },
      { status: 500 }
    )
  }
}
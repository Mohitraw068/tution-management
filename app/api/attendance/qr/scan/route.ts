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

    // Only students can scan QR codes (teachers/admins mark manually)
    if (!['STUDENT'].includes(user.role)) {
      return NextResponse.json({ error: 'Only students can scan QR codes' }, { status: 403 })
    }

    const body = await request.json()
    const { sessionCode, studentId } = body

    if (!sessionCode || !studentId) {
      return NextResponse.json({ error: 'Session code and student ID are required' }, { status: 400 })
    }

    // Verify the student ID matches the logged-in user
    if (studentId !== user.id) {
      return NextResponse.json({ error: 'Invalid student ID' }, { status: 403 })
    }

    // Find active QR session
    const qrSession = await prisma.qRSession.findFirst({
      where: {
        sessionCode: sessionCode,
        isActive: true,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            subject: true,
            instituteId: true
          }
        }
      }
    })

    if (!qrSession) {
      return NextResponse.json({ error: 'Invalid or expired QR code' }, { status: 404 })
    }

    // Verify class belongs to same institute
    if (qrSession.class.instituteId !== instituteId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Check if student is enrolled in this class
    const enrollment = await prisma.classEnrollment.findFirst({
      where: {
        studentId: studentId,
        classId: qrSession.classId
      }
    })

    if (!enrollment) {
      return NextResponse.json({ error: 'You are not enrolled in this class' }, { status: 403 })
    }

    const today = new Date()
    const attendanceDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())

    // Check if attendance already marked for today
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        studentId: studentId,
        classId: qrSession.classId,
        date: attendanceDate
      }
    })

    let attendance
    if (existingAttendance) {
      // Update existing attendance
      attendance = await prisma.attendance.update({
        where: {
          id: existingAttendance.id
        },
        data: {
          status: 'PRESENT',
          markedAt: new Date(),
          qrSessionId: qrSession.id
        }
      })
    } else {
      // Create new attendance record
      attendance = await prisma.attendance.create({
        data: {
          studentId: studentId,
          classId: qrSession.classId,
          date: attendanceDate,
          status: 'PRESENT',
          markedAt: new Date(),
          qrSessionId: qrSession.id
        }
      })
    }

    return NextResponse.json({
      message: existingAttendance
        ? 'Attendance updated successfully'
        : 'Attendance marked successfully',
      classData: {
        name: qrSession.class.name,
        subject: qrSession.class.subject
      },
      attendanceId: attendance.id,
      timestamp: attendance.markedAt
    })
  } catch (error) {
    console.error('Error scanning QR code:', error)
    return NextResponse.json(
      { error: 'Failed to mark attendance' },
      { status: 500 }
    )
  }
}

// Get QR session status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sessionCode = searchParams.get('sessionCode')

    if (!sessionCode) {
      return NextResponse.json({ error: 'Session code is required' }, { status: 400 })
    }

    const qrSession = await prisma.qRSession.findFirst({
      where: {
        sessionCode: sessionCode
      },
      include: {
        class: {
          select: {
            name: true,
            subject: true
          }
        }
      }
    })

    if (!qrSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const isActive = qrSession.isActive && new Date() < qrSession.expiresAt
    const timeRemaining = isActive
      ? Math.max(0, Math.floor((qrSession.expiresAt.getTime() - Date.now()) / 1000))
      : 0

    return NextResponse.json({
      session: {
        id: qrSession.id,
        isActive,
        expiresAt: qrSession.expiresAt,
        timeRemaining,
        classData: {
          name: qrSession.class.name,
          subject: qrSession.class.subject
        }
      }
    })
  } catch (error) {
    console.error('Error fetching QR session status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch session status' },
      { status: 500 }
    )
  }
}
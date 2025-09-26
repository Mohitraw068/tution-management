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
    const { classId, duration = 30 } = body

    if (!classId) {
      return NextResponse.json({ error: 'Class ID is required' }, { status: 400 })
    }

    // Verify class belongs to the institute and user can manage it
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

    // Invalidate any existing active sessions for this class
    await prisma.qRSession.updateMany({
      where: {
        classId: classId,
        isActive: true,
        expiresAt: {
          gt: new Date()
        }
      },
      data: {
        isActive: false
      }
    })

    // Generate unique session code
    const sessionCode = Math.random().toString(36).substring(2, 15) +
                       Math.random().toString(36).substring(2, 15)

    const expiresAt = new Date(Date.now() + duration * 60 * 1000) // duration in minutes

    // Create new QR session
    const qrSession = await prisma.qRSession.create({
      data: {
        sessionCode,
        classId,
        createdBy: user.id,
        expiresAt,
        duration,
        isActive: true
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

    return NextResponse.json({
      message: 'QR session created successfully',
      session: {
        id: qrSession.id,
        sessionCode: qrSession.sessionCode,
        expiresAt: qrSession.expiresAt,
        duration: qrSession.duration,
        classData: {
          name: qrSession.class.name,
          subject: qrSession.class.subject
        }
      }
    })
  } catch (error) {
    console.error('Error creating QR session:', error)
    return NextResponse.json(
      { error: 'Failed to create QR session' },
      { status: 500 }
    )
  }
}

// Get active session for a class
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = session.user as any
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')

    if (!classId) {
      return NextResponse.json({ error: 'Class ID is required' }, { status: 400 })
    }

    // Get active session
    const activeSession = await prisma.qRSession.findFirst({
      where: {
        classId: classId,
        isActive: true,
        expiresAt: {
          gt: new Date()
        }
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

    if (!activeSession) {
      return NextResponse.json({ error: 'No active session found' }, { status: 404 })
    }

    return NextResponse.json({
      session: {
        id: activeSession.id,
        sessionCode: activeSession.sessionCode,
        expiresAt: activeSession.expiresAt,
        duration: activeSession.duration,
        classData: {
          name: activeSession.class.name,
          subject: activeSession.class.subject
        }
      }
    })
  } catch (error) {
    console.error('Error fetching active session:', error)
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    )
  }
}
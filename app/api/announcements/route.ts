import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = session.user as any
    const instituteId = user.instituteId
    const userRole = user.role

    if (!instituteId) {
      return NextResponse.json({ error: 'Institute not found' }, { status: 400 })
    }

    // Get announcements based on user role and targeting
    const announcements = await prisma.announcement.findMany({
      where: {
        instituteId: instituteId,
        OR: [
          { targetRole: null }, // Announcements for all users
          { targetRole: userRole }, // Announcements for user's role
        ]
      },
      include: {
        creator: {
          select: {
            name: true,
            role: true
          }
        },
        readBy: {
          where: {
            userId: user.id
          },
          select: {
            userId: true,
            readAt: true
          }
        }
      },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(announcements)
  } catch (error) {
    console.error('Error fetching announcements:', error)
    return NextResponse.json(
      { error: 'Failed to fetch announcements' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = session.user as any
    const instituteId = user.instituteId
    const userRole = user.role

    // Check permissions - only teachers, admins, and owners can create announcements
    if (!['OWNER', 'ADMIN', 'TEACHER'].includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    if (!instituteId) {
      return NextResponse.json({ error: 'Institute not found' }, { status: 400 })
    }

    const body = await request.json()
    const { title, content, priority = 'MEDIUM', isPinned = false, targetRole, classIds } = body

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    // Validate priority
    if (!['LOW', 'MEDIUM', 'HIGH'].includes(priority)) {
      return NextResponse.json({ error: 'Invalid priority level' }, { status: 400 })
    }

    // Validate targetRole if provided
    if (targetRole && !['STUDENT', 'TEACHER', 'PARENT'].includes(targetRole)) {
      return NextResponse.json({ error: 'Invalid target role' }, { status: 400 })
    }

    // Create the announcement
    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        priority,
        isPinned,
        targetRole,
        classIds,
        instituteId,
        createdBy: user.id
      },
      include: {
        creator: {
          select: {
            name: true,
            role: true
          }
        },
        readBy: true
      }
    })

    return NextResponse.json(announcement, { status: 201 })
  } catch (error) {
    console.error('Error creating announcement:', error)
    return NextResponse.json(
      { error: 'Failed to create announcement' },
      { status: 500 }
    )
  }
}
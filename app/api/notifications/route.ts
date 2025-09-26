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

    if (!instituteId) {
      return NextResponse.json({ error: 'Institute not found' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const unreadOnly = searchParams.get('unread') === 'true'

    const whereClause: any = {
      userId: user.id,
      instituteId: instituteId
    }

    if (unreadOnly) {
      whereClause.isRead = false
    }

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })

    return NextResponse.json(notifications)
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
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

    const body = await request.json()
    const { markAllAsRead = false, notificationIds = [] } = body

    if (markAllAsRead) {
      // Mark all notifications as read for the user
      await prisma.notification.updateMany({
        where: {
          userId: user.id,
          instituteId: instituteId,
          isRead: false
        },
        data: {
          isRead: true
        }
      })

      return NextResponse.json({ message: 'All notifications marked as read' })
    } else if (notificationIds.length > 0) {
      // Mark specific notifications as read
      await prisma.notification.updateMany({
        where: {
          id: {
            in: notificationIds
          },
          userId: user.id,
          instituteId: instituteId
        },
        data: {
          isRead: true
        }
      })

      return NextResponse.json({ message: 'Notifications marked as read' })
    } else {
      return NextResponse.json({ error: 'No action specified' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error updating notifications:', error)
    return NextResponse.json(
      { error: 'Failed to update notifications' },
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

    // Only allow admins and teachers to create system notifications
    if (!['OWNER', 'ADMIN', 'TEACHER'].includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    if (!instituteId) {
      return NextResponse.json({ error: 'Institute not found' }, { status: 400 })
    }

    const body = await request.json()
    const { title, message, type = 'SYSTEM', relatedId, userIds = [] } = body

    // Validate required fields
    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 })
    }

    // Validate type
    if (!['ANNOUNCEMENT', 'MESSAGE', 'HOMEWORK', 'ATTENDANCE', 'SYSTEM'].includes(type)) {
      return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 })
    }

    // If no specific users provided, create for all users in institute (except sender)
    let targetUserIds = userIds
    if (targetUserIds.length === 0) {
      const allUsers = await prisma.user.findMany({
        where: {
          instituteId: instituteId,
          NOT: {
            id: user.id
          }
        },
        select: {
          id: true
        }
      })
      targetUserIds = allUsers.map(u => u.id)
    }

    // Create notifications for all target users
    const notifications = await prisma.notification.createMany({
      data: targetUserIds.map((userId: string) => ({
        title,
        message,
        type,
        relatedId,
        userId,
        instituteId
      }))
    })

    return NextResponse.json({
      message: `Created ${notifications.count} notifications`,
      count: notifications.count
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = session.user as any
    const instituteId = user.instituteId
    const announcementId = params.id

    if (!instituteId) {
      return NextResponse.json({ error: 'Institute not found' }, { status: 400 })
    }

    // Verify the announcement exists and belongs to the user's institute
    const announcement = await prisma.announcement.findFirst({
      where: {
        id: announcementId,
        instituteId: instituteId
      }
    })

    if (!announcement) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 })
    }

    // Check if already marked as read
    const existingRead = await prisma.announcementRead.findUnique({
      where: {
        announcementId_userId: {
          announcementId: announcementId,
          userId: user.id
        }
      }
    })

    if (existingRead) {
      return NextResponse.json({ message: 'Already marked as read' })
    }

    // Mark as read
    const announcementRead = await prisma.announcementRead.create({
      data: {
        announcementId: announcementId,
        userId: user.id
      }
    })

    return NextResponse.json({
      message: 'Marked as read',
      readRecord: announcementRead
    })
  } catch (error) {
    console.error('Error marking announcement as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark announcement as read' },
      { status: 500 }
    )
  }
}
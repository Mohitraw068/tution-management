import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PATCH(
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
    const userRole = user.role
    const announcementId = params.id

    // Check permissions - only creators, admins, and owners can update announcements
    if (!['OWNER', 'ADMIN', 'TEACHER'].includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    if (!instituteId) {
      return NextResponse.json({ error: 'Institute not found' }, { status: 400 })
    }

    // Get the announcement to check permissions
    const existingAnnouncement = await prisma.announcement.findFirst({
      where: {
        id: announcementId,
        instituteId: instituteId
      }
    })

    if (!existingAnnouncement) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 })
    }

    // Check if user can update this announcement
    const canUpdate = ['OWNER', 'ADMIN'].includes(userRole) ||
                      (userRole === 'TEACHER' && user.id === existingAnnouncement.createdBy)

    if (!canUpdate) {
      return NextResponse.json({ error: 'Cannot update this announcement' }, { status: 403 })
    }

    const body = await request.json()
    const updateData: any = {}

    // Only allow specific fields to be updated
    if (body.hasOwnProperty('title')) updateData.title = body.title
    if (body.hasOwnProperty('content')) updateData.content = body.content
    if (body.hasOwnProperty('priority')) {
      if (!['LOW', 'MEDIUM', 'HIGH'].includes(body.priority)) {
        return NextResponse.json({ error: 'Invalid priority level' }, { status: 400 })
      }
      updateData.priority = body.priority
    }
    if (body.hasOwnProperty('isPinned')) updateData.isPinned = body.isPinned
    if (body.hasOwnProperty('targetRole')) {
      if (body.targetRole && !['STUDENT', 'TEACHER', 'PARENT'].includes(body.targetRole)) {
        return NextResponse.json({ error: 'Invalid target role' }, { status: 400 })
      }
      updateData.targetRole = body.targetRole
    }
    if (body.hasOwnProperty('classIds')) updateData.classIds = body.classIds

    // Update the announcement
    const updatedAnnouncement = await prisma.announcement.update({
      where: {
        id: announcementId
      },
      data: updateData,
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

    return NextResponse.json(updatedAnnouncement)
  } catch (error) {
    console.error('Error updating announcement:', error)
    return NextResponse.json(
      { error: 'Failed to update announcement' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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
    const userRole = user.role
    const announcementId = params.id

    // Check permissions - only creators, admins, and owners can delete announcements
    if (!['OWNER', 'ADMIN', 'TEACHER'].includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    if (!instituteId) {
      return NextResponse.json({ error: 'Institute not found' }, { status: 400 })
    }

    // Get the announcement to check permissions
    const existingAnnouncement = await prisma.announcement.findFirst({
      where: {
        id: announcementId,
        instituteId: instituteId
      }
    })

    if (!existingAnnouncement) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 })
    }

    // Check if user can delete this announcement
    const canDelete = ['OWNER', 'ADMIN'].includes(userRole) ||
                      (userRole === 'TEACHER' && user.id === existingAnnouncement.createdBy)

    if (!canDelete) {
      return NextResponse.json({ error: 'Cannot delete this announcement' }, { status: 403 })
    }

    // Delete the announcement (this will cascade delete related records)
    await prisma.announcement.delete({
      where: {
        id: announcementId
      }
    })

    return NextResponse.json({ message: 'Announcement deleted successfully' })
  } catch (error) {
    console.error('Error deleting announcement:', error)
    return NextResponse.json(
      { error: 'Failed to delete announcement' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
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
    const classId = params.id

    if (!instituteId) {
      return NextResponse.json({ error: 'Institute not found' }, { status: 400 })
    }

    const classData = await prisma.class.findFirst({
      where: {
        id: classId,
        instituteId: instituteId
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        students: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        materials: {
          orderBy: {
            uploadedAt: 'desc'
          }
        },
        _count: {
          select: {
            students: true,
            attendance: true,
            materials: true
          }
        }
      }
    })

    if (!classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })
    }

    return NextResponse.json(classData)
  } catch (error) {
    console.error('Error fetching class:', error)
    return NextResponse.json(
      { error: 'Failed to fetch class' },
      { status: 500 }
    )
  }
}

export async function PUT(
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
    const classId = params.id

    if (!instituteId) {
      return NextResponse.json({ error: 'Institute not found' }, { status: 400 })
    }

    // Check if user has permission to update classes
    if (!['OWNER', 'ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Verify class exists and belongs to the same institute
    const existingClass = await prisma.class.findFirst({
      where: {
        id: classId,
        instituteId: instituteId
      }
    })

    if (!existingClass) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })
    }

    const body = await request.json()
    const {
      name,
      subject,
      description,
      teacherId,
      capacity,
      schedule,
      isVirtual,
      meetingLink,
      location,
      startDate,
      endDate
    } = body

    // If teacherId is provided, verify teacher exists and belongs to the same institute
    if (teacherId) {
      const teacher = await prisma.user.findFirst({
        where: {
          id: teacherId,
          instituteId: instituteId,
          role: 'TEACHER'
        }
      })

      if (!teacher) {
        return NextResponse.json(
          { error: 'Invalid teacher selected' },
          { status: 400 }
        )
      }
    }

    // Update the class
    const updatedClass = await prisma.class.update({
      where: {
        id: classId
      },
      data: {
        ...(name && { name }),
        ...(subject && { subject }),
        ...(description !== undefined && { description }),
        ...(teacherId && { teacherId }),
        ...(capacity && { capacity }),
        ...(schedule && { schedule: JSON.stringify(schedule) }),
        ...(isVirtual !== undefined && { isVirtual }),
        ...(meetingLink !== undefined && { meetingLink: isVirtual ? meetingLink : null }),
        ...(location !== undefined && { location: !isVirtual ? location : null }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) })
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            students: true
          }
        }
      }
    })

    return NextResponse.json(updatedClass)
  } catch (error) {
    console.error('Error updating class:', error)
    return NextResponse.json(
      { error: 'Failed to update class' },
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
    const classId = params.id

    if (!instituteId) {
      return NextResponse.json({ error: 'Institute not found' }, { status: 400 })
    }

    // Check if user has permission to delete classes
    if (!['OWNER', 'ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Verify class exists and belongs to the same institute
    const existingClass = await prisma.class.findFirst({
      where: {
        id: classId,
        instituteId: instituteId
      }
    })

    if (!existingClass) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })
    }

    // Delete related records first (due to foreign key constraints)
    await prisma.attendance.deleteMany({
      where: { classId }
    })

    await prisma.material.deleteMany({
      where: { classId }
    })

    await prisma.student.deleteMany({
      where: { classId }
    })

    // Delete the class
    await prisma.class.delete({
      where: { id: classId }
    })

    return NextResponse.json({ message: 'Class deleted successfully' })
  } catch (error) {
    console.error('Error deleting class:', error)
    return NextResponse.json(
      { error: 'Failed to delete class' },
      { status: 500 }
    )
  }
}
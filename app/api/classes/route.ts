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

    const classes = await prisma.class.findMany({
      where: {
        instituteId: instituteId
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(classes)
  } catch (error) {
    console.error('Error fetching classes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch classes' },
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

    if (!instituteId) {
      return NextResponse.json({ error: 'Institute not found' }, { status: 400 })
    }

    // Check if user has permission to create classes
    if (!['OWNER', 'ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
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

    // Validate required fields
    if (!name || !subject || !teacherId) {
      return NextResponse.json(
        { error: 'Name, subject, and teacher are required' },
        { status: 400 }
      )
    }

    // Verify teacher exists and belongs to the same institute
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

    // Create the class
    const newClass = await prisma.class.create({
      data: {
        name,
        subject,
        description,
        teacherId,
        capacity: capacity || 30,
        schedule: JSON.stringify(schedule || {}),
        isVirtual: isVirtual || false,
        meetingLink: isVirtual ? meetingLink : null,
        location: !isVirtual ? location : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        instituteId
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

    return NextResponse.json(newClass, { status: 201 })
  } catch (error) {
    console.error('Error creating class:', error)
    return NextResponse.json(
      { error: 'Failed to create class' },
      { status: 500 }
    )
  }
}
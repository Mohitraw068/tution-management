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

    const isTeacher = ['OWNER', 'ADMIN', 'TEACHER'].includes(user.role)
    let homework

    if (isTeacher) {
      // Teachers see homework they created
      homework = await prisma.homework.findMany({
        where: {
          class: {
            instituteId: instituteId
          },
          // If teacher role, only show their own homework
          ...(user.role === 'TEACHER' ? { createdBy: user.id } : {})
        },
        include: {
          class: {
            select: {
              name: true,
              subject: true
            }
          },
          _count: {
            select: {
              submissions: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    } else {
      // Students see homework assigned to their classes
      const studentEnrollments = await prisma.student.findMany({
        where: {
          userId: user.id
        },
        select: {
          classId: true
        }
      })

      const enrolledClassIds = studentEnrollments.map(e => e.classId)

      homework = await prisma.homework.findMany({
        where: {
          classId: {
            in: enrolledClassIds
          },
          status: 'PUBLISHED' // Students only see published homework
        },
        include: {
          class: {
            select: {
              name: true,
              subject: true
            }
          },
          submissions: {
            where: {
              studentId: user.id
            },
            select: {
              id: true,
              status: true,
              grade: true,
              submittedAt: true
            }
          }
        },
        orderBy: {
          dueDate: 'asc'
        }
      })

      // Add submission info for students
      homework = homework.map(hw => ({
        ...hw,
        isSubmitted: hw.submissions.length > 0,
        submission: hw.submissions[0] || null,
        submissions: undefined // Remove submissions array from response
      }))
    }

    return NextResponse.json(homework)
  } catch (error) {
    console.error('Error fetching homework:', error)
    return NextResponse.json(
      { error: 'Failed to fetch homework' },
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

    // Check permissions - only teachers can create homework
    if (!['OWNER', 'ADMIN', 'TEACHER'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const {
      title,
      description,
      instructions,
      dueDate,
      totalPoints,
      classId,
      status = 'DRAFT'
    } = body

    if (!title || !description || !dueDate || !classId || totalPoints <= 0) {
      return NextResponse.json(
        { error: 'Title, description, due date, class, and total points are required' },
        { status: 400 }
      )
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

    // Validate due date is in the future
    if (new Date(dueDate) <= new Date()) {
      return NextResponse.json({ error: 'Due date must be in the future' }, { status: 400 })
    }

    // Create homework
    const homework = await prisma.homework.create({
      data: {
        title,
        description,
        instructions,
        dueDate: new Date(dueDate),
        totalPoints,
        classId,
        status,
        createdBy: user.id
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
      message: 'Homework created successfully',
      homework
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating homework:', error)
    return NextResponse.json(
      { error: 'Failed to create homework' },
      { status: 500 }
    )
  }
}
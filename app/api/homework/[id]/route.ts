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
    const homeworkId = params.id

    if (!instituteId) {
      return NextResponse.json({ error: 'Institute not found' }, { status: 400 })
    }

    // Get homework with class info
    const homework = await prisma.homework.findFirst({
      where: {
        id: homeworkId,
        class: {
          instituteId: instituteId
        }
      },
      include: {
        class: {
          select: {
            name: true,
            subject: true,
            teacherId: true
          }
        }
      }
    })

    if (!homework) {
      return NextResponse.json({ error: 'Homework not found' }, { status: 404 })
    }

    const isTeacher = ['OWNER', 'ADMIN', 'TEACHER'].includes(user.role)
    const isClassTeacher = user.id === homework.class.teacherId

    // Check permissions
    if (!isTeacher && !isClassTeacher) {
      // For students, check if they are enrolled in the class
      const enrollment = await prisma.student.findFirst({
        where: {
          userId: user.id,
          classId: homework.classId
        }
      })

      if (!enrollment) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }

      // Students can only see published homework
      if (homework.status !== 'PUBLISHED') {
        return NextResponse.json({ error: 'Homework not available' }, { status: 404 })
      }
    }

    // Get user's submission if they are a student
    let submission = null
    if (!isTeacher || user.role === 'STUDENT') {
      submission = await prisma.homeworkSubmission.findFirst({
        where: {
          homeworkId: homework.id,
          studentId: user.id
        }
      })
    }

    return NextResponse.json({
      homework,
      submission
    })
  } catch (error) {
    console.error('Error fetching homework:', error)
    return NextResponse.json(
      { error: 'Failed to fetch homework' },
      { status: 500 }
    )
  }
}
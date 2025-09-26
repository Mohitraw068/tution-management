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

    // Check permissions - only teachers can view submissions
    if (!['OWNER', 'ADMIN', 'TEACHER'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get homework and verify permissions
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
        },
        _count: {
          select: {
            submissions: true
          }
        }
      }
    })

    if (!homework) {
      return NextResponse.json({ error: 'Homework not found' }, { status: 404 })
    }

    // Check if user can view this homework's submissions
    const canView = ['OWNER', 'ADMIN'].includes(user.role) ||
                    (user.role === 'TEACHER' && user.id === homework.class.teacherId)

    if (!canView) {
      return NextResponse.json({ error: 'Cannot view submissions for this homework' }, { status: 403 })
    }

    // Get submissions with student info
    const submissions = await prisma.homeworkSubmission.findMany({
      where: {
        homeworkId: homework.id
      },
      include: {
        student: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      }
    })

    // Transform the data to include student info from User table
    const submissionsWithStudentInfo = await Promise.all(
      submissions.map(async (submission) => {
        const studentUser = await prisma.user.findUnique({
          where: {
            id: submission.studentId
          },
          select: {
            name: true,
            email: true
          }
        })

        return {
          ...submission,
          student: studentUser || { name: 'Unknown Student', email: '' }
        }
      })
    )

    return NextResponse.json({
      homework,
      submissions: submissionsWithStudentInfo
    })
  } catch (error) {
    console.error('Error fetching submissions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    )
  }
}
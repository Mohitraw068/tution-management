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
    const homeworkId = params.id

    if (!instituteId) {
      return NextResponse.json({ error: 'Institute not found' }, { status: 400 })
    }

    // Check permissions - only teachers can grade
    if (!['OWNER', 'ADMIN', 'TEACHER'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { submissionId, grade, feedback = '' } = body

    if (!submissionId || grade === undefined) {
      return NextResponse.json(
        { error: 'Submission ID and grade are required' },
        { status: 400 }
      )
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
            teacherId: true
          }
        }
      }
    })

    if (!homework) {
      return NextResponse.json({ error: 'Homework not found' }, { status: 404 })
    }

    // Check if user can grade this homework
    const canGrade = ['OWNER', 'ADMIN'].includes(user.role) ||
                     (user.role === 'TEACHER' && user.id === homework.class.teacherId)

    if (!canGrade) {
      return NextResponse.json({ error: 'Cannot grade this homework' }, { status: 403 })
    }

    // Validate grade
    if (grade < 0 || grade > homework.totalPoints) {
      return NextResponse.json(
        { error: `Grade must be between 0 and ${homework.totalPoints}` },
        { status: 400 }
      )
    }

    // Get submission and verify it belongs to this homework
    const submission = await prisma.homeworkSubmission.findFirst({
      where: {
        id: submissionId,
        homeworkId: homework.id
      }
    })

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    // Update submission with grade
    const gradedSubmission = await prisma.homeworkSubmission.update({
      where: {
        id: submissionId
      },
      data: {
        grade: parseInt(grade),
        feedback: feedback.trim(),
        status: 'GRADED',
        gradedBy: user.id,
        gradedAt: new Date()
      }
    })

    return NextResponse.json({
      message: 'Submission graded successfully',
      submission: gradedSubmission
    })
  } catch (error) {
    console.error('Error grading submission:', error)
    return NextResponse.json(
      { error: 'Failed to grade submission' },
      { status: 500 }
    )
  }
}
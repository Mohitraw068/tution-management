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

    // Only students can submit homework
    if (user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Only students can submit homework' }, { status: 403 })
    }

    const body = await request.json()
    const { answer } = body

    if (!answer || !answer.trim()) {
      return NextResponse.json({ error: 'Answer is required' }, { status: 400 })
    }

    // Get homework and verify it exists and is accessible
    const homework = await prisma.homework.findFirst({
      where: {
        id: homeworkId,
        class: {
          instituteId: instituteId
        },
        status: 'PUBLISHED'
      }
    })

    if (!homework) {
      return NextResponse.json({ error: 'Homework not found or not available' }, { status: 404 })
    }

    // Check if student is enrolled in the class
    const enrollment = await prisma.student.findFirst({
      where: {
        userId: user.id,
        classId: homework.classId
      }
    })

    if (!enrollment) {
      return NextResponse.json({ error: 'You are not enrolled in this class' }, { status: 403 })
    }

    // Check if submission is late
    const now = new Date()
    const isLate = now > homework.dueDate

    // Check if already submitted
    const existingSubmission = await prisma.homeworkSubmission.findFirst({
      where: {
        homeworkId: homework.id,
        studentId: user.id
      }
    })

    if (existingSubmission) {
      // Update existing submission if not graded yet
      if (existingSubmission.status === 'GRADED') {
        return NextResponse.json({ error: 'Submission already graded, cannot resubmit' }, { status: 400 })
      }

      const updatedSubmission = await prisma.homeworkSubmission.update({
        where: {
          id: existingSubmission.id
        },
        data: {
          answer: answer.trim(),
          submittedAt: now,
          isLate,
          status: 'SUBMITTED'
        }
      })

      return NextResponse.json({
        message: 'Homework submission updated successfully',
        submission: updatedSubmission
      })
    } else {
      // Create new submission
      const submission = await prisma.homeworkSubmission.create({
        data: {
          homeworkId: homework.id,
          studentId: user.id,
          answer: answer.trim(),
          isLate,
          status: 'SUBMITTED',
          maxGrade: homework.totalPoints
        }
      })

      return NextResponse.json({
        message: 'Homework submitted successfully',
        submission
      }, { status: 201 })
    }
  } catch (error) {
    console.error('Error submitting homework:', error)
    return NextResponse.json(
      { error: 'Failed to submit homework' },
      { status: 500 }
    )
  }
}
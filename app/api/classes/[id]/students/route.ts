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
    const classId = params.id

    if (!instituteId) {
      return NextResponse.json({ error: 'Institute not found' }, { status: 400 })
    }

    // Check if user has permission to manage students
    const classData = await prisma.class.findFirst({
      where: {
        id: classId,
        instituteId: instituteId
      }
    })

    if (!classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })
    }

    const canManage = ['OWNER', 'ADMIN'].includes(user.role) ||
                     (user.role === 'TEACHER' && user.id === classData.teacherId)

    if (!canManage) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { studentIds } = body

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json(
        { error: 'Student IDs array is required' },
        { status: 400 }
      )
    }

    // Verify all student IDs exist and belong to the same institute
    const students = await prisma.user.findMany({
      where: {
        id: { in: studentIds },
        instituteId: instituteId,
        role: 'STUDENT'
      }
    })

    if (students.length !== studentIds.length) {
      return NextResponse.json(
        { error: 'Some student IDs are invalid' },
        { status: 400 }
      )
    }

    // Check if class is already full
    const currentStudentCount = await prisma.student.count({
      where: { classId }
    })

    if (currentStudentCount + studentIds.length > classData.capacity) {
      return NextResponse.json(
        { error: `Adding these students would exceed class capacity (${classData.capacity})` },
        { status: 400 }
      )
    }

    // Check for already enrolled students
    const existingEnrollments = await prisma.student.findMany({
      where: {
        classId,
        userId: { in: studentIds }
      }
    })

    if (existingEnrollments.length > 0) {
      return NextResponse.json(
        { error: 'Some students are already enrolled in this class' },
        { status: 400 }
      )
    }

    // Add students to the class
    const newEnrollments = await prisma.student.createMany({
      data: studentIds.map(studentId => ({
        userId: studentId,
        classId
      }))
    })

    return NextResponse.json({
      message: `Successfully added ${newEnrollments.count} students to the class`,
      count: newEnrollments.count
    })
  } catch (error) {
    console.error('Error adding students to class:', error)
    return NextResponse.json(
      { error: 'Failed to add students to class' },
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

    // Check if user has permission to manage students
    const classData = await prisma.class.findFirst({
      where: {
        id: classId,
        instituteId: instituteId
      }
    })

    if (!classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })
    }

    const canManage = ['OWNER', 'ADMIN'].includes(user.role) ||
                     (user.role === 'TEACHER' && user.id === classData.teacherId)

    if (!canManage) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { studentId } = body

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      )
    }

    // Verify the student enrollment exists
    const enrollment = await prisma.student.findFirst({
      where: {
        classId,
        userId: studentId
      }
    })

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Student is not enrolled in this class' },
        { status: 404 }
      )
    }

    // Remove the student from the class
    await prisma.student.delete({
      where: {
        id: enrollment.id
      }
    })

    // Also remove related attendance records
    await prisma.attendance.deleteMany({
      where: {
        classId,
        studentId
      }
    })

    return NextResponse.json({
      message: 'Student successfully removed from class'
    })
  } catch (error) {
    console.error('Error removing student from class:', error)
    return NextResponse.json(
      { error: 'Failed to remove student from class' },
      { status: 500 }
    )
  }
}
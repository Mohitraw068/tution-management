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

    // Verify class exists and belongs to the institute
    const classData = await prisma.class.findFirst({
      where: {
        id: classId,
        instituteId: instituteId
      }
    })

    if (!classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })
    }

    // Check if user has permission to manage students
    const canManage = ['OWNER', 'ADMIN'].includes(user.role) ||
                     (user.role === 'TEACHER' && user.id === classData.teacherId)

    if (!canManage) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get students who are already enrolled in this class
    const enrolledStudents = await prisma.student.findMany({
      where: { classId },
      select: { userId: true }
    })

    const enrolledStudentIds = enrolledStudents.map(s => s.userId)

    // Get all students from the institute who are NOT enrolled in this class
    const availableStudents = await prisma.user.findMany({
      where: {
        instituteId: instituteId,
        role: 'STUDENT',
        id: {
          notIn: enrolledStudentIds
        }
      },
      select: {
        id: true,
        name: true,
        email: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(availableStudents)
  } catch (error) {
    console.error('Error fetching available students:', error)
    return NextResponse.json(
      { error: 'Failed to fetch available students' },
      { status: 500 }
    )
  }
}
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
    const userRole = user.role

    if (!instituteId) {
      return NextResponse.json({ error: 'Institute not found' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const forMessaging = searchParams.get('messaging') === 'true'

    let whereClause: any = {
      instituteId: instituteId
    }

    if (role) {
      whereClause.role = role
    }

    // Apply messaging permissions if requested
    if (forMessaging) {
      whereClause.NOT = {
        id: user.id // Exclude current user
      }

      // Role-based messaging permissions
      switch (userRole) {
        case 'OWNER':
        case 'ADMIN':
          // Can message everyone
          break
        case 'TEACHER':
          // Can message other teachers, students, and parents
          whereClause.role = {
            in: ['TEACHER', 'STUDENT', 'PARENT', 'ADMIN', 'OWNER']
          }
          break
        case 'STUDENT':
          // Can message teachers and parents
          whereClause.role = {
            in: ['TEACHER', 'PARENT', 'ADMIN', 'OWNER']
          }
          break
        case 'PARENT':
          // Can message teachers and admin
          whereClause.role = {
            in: ['TEACHER', 'ADMIN', 'OWNER']
          }
          break
        default:
          // Unknown role, restrict to admins only
          whereClause.role = {
            in: ['ADMIN', 'OWNER']
          }
      }
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      },
      orderBy: forMessaging ? [
        { role: 'asc' },
        { name: 'asc' }
      ] : {
        name: 'asc'
      }
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
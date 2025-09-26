import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { instituteCode, name, email, password, role } = await request.json()

    // Validate required fields
    if (!instituteCode || !name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ['OWNER', 'ADMIN', 'TEACHER', 'STUDENT', 'PARENT']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    // Check if institute exists
    const institute = await prisma.institute.findUnique({
      where: {
        instituteCode: instituteCode
      }
    })

    if (!institute) {
      return NextResponse.json(
        { error: 'Invalid institute code. Please check with your institution.' },
        { status: 400 }
      )
    }

    // Check if user already exists with this email in this institute
    const existingUser = await prisma.user.findUnique({
      where: {
        email_instituteId: {
          email: email,
          instituteId: institute.id
        }
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists in this institute' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        instituteId: institute.id
      },
      include: {
        institute: {
          select: {
            name: true,
            instituteCode: true
          }
        }
      }
    })

    // Return success response (don't include password)
    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        institute: user.institute
      }
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
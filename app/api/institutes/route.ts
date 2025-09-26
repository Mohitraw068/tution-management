import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { getInstituteBySubdomain, getInstituteById, createInstitute } from '@/lib/institute'

export async function GET(request: NextRequest) {
  try {
    // Get institute from headers (set by middleware)
    const instituteId = request.headers.get('x-institute-id')
    const subdomain = request.headers.get('x-subdomain')

    // If we have institute ID from headers, return it
    if (instituteId) {
      const institute = await getInstituteById(instituteId)
      if (institute) {
        return NextResponse.json({
          institute: {
            id: institute.id,
            name: institute.name,
            subdomain: institute.subdomain,
            instituteCode: institute.instituteCode,
            logo: institute.logo,
            primaryColor: institute.primaryColor,
            subscription: institute.subscription,
            studentLimit: institute.studentLimit
          }
        })
      }
    }

    // If we have subdomain but no institute ID, try to find by subdomain
    if (subdomain) {
      const institute = await getInstituteBySubdomain(subdomain)
      if (institute) {
        return NextResponse.json({
          institute: {
            id: institute.id,
            name: institute.name,
            subdomain: institute.subdomain,
            instituteCode: institute.instituteCode,
            logo: institute.logo,
            primaryColor: institute.primaryColor,
            subscription: institute.subscription,
            studentLimit: institute.studentLimit
          }
        })
      }
    }

    return NextResponse.json(
      { error: 'Institute not found' },
      { status: 404 }
    )

  } catch (error) {
    console.error('Error fetching institute:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin privileges
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Only allow OWNER or ADMIN to create institutes
    const userRole = (session.user as any).role
    if (!['OWNER', 'ADMIN'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient privileges' },
        { status: 403 }
      )
    }

    const {
      name,
      subdomain,
      instituteCode,
      logo,
      primaryColor,
      subscription,
      studentLimit
    } = await request.json()

    // Validate required fields
    if (!name || !subdomain || !instituteCode) {
      return NextResponse.json(
        { error: 'Name, subdomain, and institute code are required' },
        { status: 400 }
      )
    }

    // Validate subdomain format (lowercase, alphanumeric, hyphens)
    const subdomainRegex = /^[a-z0-9-]+$/
    if (!subdomainRegex.test(subdomain)) {
      return NextResponse.json(
        { error: 'Subdomain must contain only lowercase letters, numbers, and hyphens' },
        { status: 400 }
      )
    }

    // Validate institute code format (uppercase, alphanumeric)
    const codeRegex = /^[A-Z0-9-]+$/
    if (!codeRegex.test(instituteCode)) {
      return NextResponse.json(
        { error: 'Institute code must contain only uppercase letters, numbers, and hyphens' },
        { status: 400 }
      )
    }

    // Check if subdomain or institute code already exists
    const existingBySubdomain = await getInstituteBySubdomain(subdomain)
    if (existingBySubdomain) {
      return NextResponse.json(
        { error: 'Subdomain already exists' },
        { status: 400 }
      )
    }

    const institute = await createInstitute({
      name,
      subdomain: subdomain.toLowerCase(),
      instituteCode: instituteCode.toUpperCase(),
      logo,
      primaryColor,
      subscription,
      studentLimit
    })

    return NextResponse.json({
      message: 'Institute created successfully',
      institute: {
        id: institute.id,
        name: institute.name,
        subdomain: institute.subdomain,
        instituteCode: institute.instituteCode,
        logo: institute.logo,
        primaryColor: institute.primaryColor,
        subscription: institute.subscription,
        studentLimit: institute.studentLimit
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error creating institute:', error)

    // Handle unique constraint violations
    if (error.code === 'P2002') {
      const target = error.meta?.target
      if (target?.includes('subdomain')) {
        return NextResponse.json(
          { error: 'Subdomain already exists' },
          { status: 400 }
        )
      }
      if (target?.includes('instituteCode')) {
        return NextResponse.json(
          { error: 'Institute code already exists' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
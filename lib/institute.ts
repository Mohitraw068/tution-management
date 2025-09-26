import { prisma } from './prisma'

export interface Institute {
  id: string
  name: string
  subdomain: string
  instituteCode: string
  logo: string | null
  primaryColor: string
  subscription: string
  studentLimit: number
  createdAt: Date
}

export async function getInstituteBySubdomain(subdomain: string): Promise<Institute | null> {
  try {
    const institute = await prisma.institute.findUnique({
      where: {
        subdomain: subdomain
      }
    })
    return institute
  } catch (error) {
    console.error('Error fetching institute by subdomain:', error)
    return null
  }
}

export async function getInstituteByCode(instituteCode: string): Promise<Institute | null> {
  try {
    const institute = await prisma.institute.findUnique({
      where: {
        instituteCode: instituteCode
      }
    })
    return institute
  } catch (error) {
    console.error('Error fetching institute by code:', error)
    return null
  }
}

export async function getInstituteById(id: string): Promise<Institute | null> {
  try {
    const institute = await prisma.institute.findUnique({
      where: {
        id: id
      }
    })
    return institute
  } catch (error) {
    console.error('Error fetching institute by ID:', error)
    return null
  }
}

export async function validateInstituteAccess(userId: string, instituteId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId
      }
    })

    return user?.instituteId === instituteId
  } catch (error) {
    console.error('Error validating institute access:', error)
    return false
  }
}

export function extractSubdomain(hostname: string): string | null {
  // Handle localhost development
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    // Extract subdomain from patterns like: demo.localhost:3000
    const parts = hostname.split('.')
    if (parts.length >= 2 && parts[0] !== 'www' && parts[0] !== 'localhost') {
      return parts[0]
    }
    return null
  }

  // Handle production domains like: demo.etution.com
  const parts = hostname.split('.')
  if (parts.length >= 3 && parts[0] !== 'www') {
    return parts[0]
  }

  return null
}

export async function createInstitute(data: {
  name: string
  subdomain: string
  instituteCode: string
  logo?: string
  primaryColor?: string
  subscription?: string
  studentLimit?: number
}): Promise<Institute> {
  const institute = await prisma.institute.create({
    data: {
      name: data.name,
      subdomain: data.subdomain.toLowerCase(),
      instituteCode: data.instituteCode.toUpperCase(),
      logo: data.logo || null,
      primaryColor: data.primaryColor || '#3B82F6',
      subscription: data.subscription || 'BASIC',
      studentLimit: data.studentLimit || 100
    }
  })

  return institute
}

export async function updateInstitute(id: string, data: Partial<Institute>): Promise<Institute | null> {
  try {
    const institute = await prisma.institute.update({
      where: { id },
      data
    })
    return institute
  } catch (error) {
    console.error('Error updating institute:', error)
    return null
  }
}
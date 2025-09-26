import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding demo data...')

  // Create a demo institute
  const institute = await prisma.institute.create({
    data: {
      name: 'Demo Educational Institute',
      subdomain: 'demo',
      instituteCode: 'DEMO001',
      logo: null,
      primaryColor: '#3B82F6',
      subscription: 'BASIC',
      studentLimit: 100
    }
  })

  console.log('✅ Created demo institute')

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 12)

  // Create owner
  const owner = await prisma.user.create({
    data: {
      email: 'owner@demo.com',
      password: hashedPassword,
      name: 'John Owner',
      role: 'OWNER',
      instituteId: institute.id
    }
  })

  // Create admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@demo.com',
      password: hashedPassword,
      name: 'Jane Admin',
      role: 'ADMIN',
      instituteId: institute.id
    }
  })

  // Create teachers
  const teachers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'math.teacher@demo.com',
        password: hashedPassword,
        name: 'Robert Mathematics',
        role: 'TEACHER',
        instituteId: institute.id
      }
    }),
    prisma.user.create({
      data: {
        email: 'science.teacher@demo.com',
        password: hashedPassword,
        name: 'Sarah Science',
        role: 'TEACHER',
        instituteId: institute.id
      }
    }),
    prisma.user.create({
      data: {
        email: 'english.teacher@demo.com',
        password: hashedPassword,
        name: 'Emily English',
        role: 'TEACHER',
        instituteId: institute.id
      }
    })
  ])

  console.log('✅ Created users (owner, admin, 3 teachers)')

  // Create students
  const students = await Promise.all([
    prisma.user.create({
      data: {
        email: 'alice.student@demo.com',
        password: hashedPassword,
        name: 'Alice Johnson',
        role: 'STUDENT',
        instituteId: institute.id
      }
    }),
    prisma.user.create({
      data: {
        email: 'bob.student@demo.com',
        password: hashedPassword,
        name: 'Bob Smith',
        role: 'STUDENT',
        instituteId: institute.id
      }
    }),
    prisma.user.create({
      data: {
        email: 'charlie.student@demo.com',
        password: hashedPassword,
        name: 'Charlie Brown',
        role: 'STUDENT',
        instituteId: institute.id
      }
    }),
    prisma.user.create({
      data: {
        email: 'diana.student@demo.com',
        password: hashedPassword,
        name: 'Diana Wilson',
        role: 'STUDENT',
        instituteId: institute.id
      }
    }),
    prisma.user.create({
      data: {
        email: 'evan.student@demo.com',
        password: hashedPassword,
        name: 'Evan Davis',
        role: 'STUDENT',
        instituteId: institute.id
      }
    })
  ])

  console.log('✅ Created 5 students')

  // Create classes
  const mathClass = await prisma.class.create({
    data: {
      name: 'Advanced Mathematics',
      subject: 'Mathematics',
      description: 'Advanced mathematics course covering calculus and algebra',
      teacherId: teachers[0].id,
      capacity: 25,
      schedule: JSON.stringify({
        'Monday': '09:00',
        'Wednesday': '09:00',
        'Friday': '09:00'
      }),
      isVirtual: false,
      location: 'Room 101, Math Building',
      instituteId: institute.id,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-05-15')
    }
  })

  const scienceClass = await prisma.class.create({
    data: {
      name: 'Physics Laboratory',
      subject: 'Physics',
      description: 'Hands-on physics experiments and theory',
      teacherId: teachers[1].id,
      capacity: 20,
      schedule: JSON.stringify({
        'Tuesday': '14:00',
        'Thursday': '14:00'
      }),
      isVirtual: false,
      location: 'Science Lab 1',
      instituteId: institute.id,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-05-15')
    }
  })

  const englishClass = await prisma.class.create({
    data: {
      name: 'Creative Writing Workshop',
      subject: 'English',
      description: 'Online creative writing workshop for advanced students',
      teacherId: teachers[2].id,
      capacity: 15,
      schedule: JSON.stringify({
        'Monday': '16:00',
        'Thursday': '16:00'
      }),
      isVirtual: true,
      meetingLink: 'https://meet.google.com/creative-writing-demo',
      instituteId: institute.id,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-05-15')
    }
  })

  console.log('✅ Created 3 classes')

  // Enroll students in classes
  // Math class - 3 students
  await Promise.all([
    prisma.student.create({
      data: {
        userId: students[0].id,
        classId: mathClass.id
      }
    }),
    prisma.student.create({
      data: {
        userId: students[1].id,
        classId: mathClass.id
      }
    }),
    prisma.student.create({
      data: {
        userId: students[2].id,
        classId: mathClass.id
      }
    })
  ])

  // Science class - 2 students
  await Promise.all([
    prisma.student.create({
      data: {
        userId: students[1].id,
        classId: scienceClass.id
      }
    }),
    prisma.student.create({
      data: {
        userId: students[3].id,
        classId: scienceClass.id
      }
    })
  ])

  // English class - 4 students
  await Promise.all([
    prisma.student.create({
      data: {
        userId: students[0].id,
        classId: englishClass.id
      }
    }),
    prisma.student.create({
      data: {
        userId: students[2].id,
        classId: englishClass.id
      }
    }),
    prisma.student.create({
      data: {
        userId: students[3].id,
        classId: englishClass.id
      }
    }),
    prisma.student.create({
      data: {
        userId: students[4].id,
        classId: englishClass.id
      }
    })
  ])

  console.log('✅ Enrolled students in classes')

  console.log('🎉 Demo data seeding completed!')
  console.log('\n📋 Login Credentials:')
  console.log('Institute Code: DEMO001')
  console.log('Owner: owner@demo.com / password123')
  console.log('Admin: admin@demo.com / password123')
  console.log('Teachers: math.teacher@demo.com, science.teacher@demo.com, english.teacher@demo.com / password123')
  console.log('Students: alice.student@demo.com, bob.student@demo.com, etc. / password123')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
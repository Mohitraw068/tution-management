import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data (in reverse order of dependencies)
  console.log('🧹 Cleaning existing data...');
  await prisma.attendance.deleteMany({});
  await prisma.homework.deleteMany({});
  await prisma.class.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.institute.deleteMany({});

  // Create demo institutes
  console.log('🏛️ Creating demo institutes...');

  const institutes = await Promise.all([
    prisma.institute.create({
      data: {
        name: 'Greenwood Academy',
        code: 'GWA',
        domain: 'greenwood',
        description: 'A premier educational institution focused on holistic development',
        subscription: 'ENTERPRISE',
        studentLimit: 500,
        settings: {
          primaryColor: '#059669',
          secondaryColor: '#10B981',
          logo: 'https://via.placeholder.com/150/059669/FFFFFF?text=GWA'
        }
      }
    }),
    prisma.institute.create({
      data: {
        name: 'Tech Valley Institute',
        code: 'TVI',
        domain: 'techvalley',
        description: 'Innovation-driven education for the digital age',
        subscription: 'PRO',
        studentLimit: 300,
        settings: {
          primaryColor: '#3B82F6',
          secondaryColor: '#60A5FA',
          logo: 'https://via.placeholder.com/150/3B82F6/FFFFFF?text=TVI'
        }
      }
    }),
    prisma.institute.create({
      data: {
        name: 'Sunrise Learning Center',
        code: 'SLC',
        domain: 'sunrise',
        description: 'Nurturing young minds with personalized learning',
        subscription: 'BASIC',
        studentLimit: 100,
        settings: {
          primaryColor: '#F59E0B',
          secondaryColor: '#FBBF24',
          logo: 'https://via.placeholder.com/150/F59E0B/FFFFFF?text=SLC'
        }
      }
    })
  ]);

  console.log(`✅ Created ${institutes.length} institutes`);

  // Create demo users for each institute
  console.log('👥 Creating demo users...');

  const password = await bcrypt.hash('password123', 12);
  const users = [];

  for (const institute of institutes) {
    // Create Owner/Admin
    const owner = await prisma.user.create({
      data: {
        name: `${institute.name} Admin`,
        email: `admin@${institute.domain}.edu`,
        password,
        role: 'OWNER',
        instituteId: institute.id
      }
    });
    users.push(owner);

    // Create Teachers
    const teachers = await Promise.all([
      prisma.user.create({
        data: {
          name: 'Dr. Sarah Johnson',
          email: `sarah.johnson@${institute.domain}.edu`,
          password,
          role: 'TEACHER',
          instituteId: institute.id
        }
      }),
      prisma.user.create({
        data: {
          name: 'Prof. Michael Chen',
          email: `michael.chen@${institute.domain}.edu`,
          password,
          role: 'TEACHER',
          instituteId: institute.id
        }
      }),
      prisma.user.create({
        data: {
          name: 'Ms. Emily Rodriguez',
          email: `emily.rodriguez@${institute.domain}.edu`,
          password,
          role: 'TEACHER',
          instituteId: institute.id
        }
      })
    ]);
    users.push(...teachers);

    // Create Students
    const students = await Promise.all([
      prisma.user.create({
        data: {
          name: 'Alex Thompson',
          email: `alex.thompson@${institute.domain}.edu`,
          password,
          role: 'STUDENT',
          instituteId: institute.id
        }
      }),
      prisma.user.create({
        data: {
          name: 'Emma Wilson',
          email: `emma.wilson@${institute.domain}.edu`,
          password,
          role: 'STUDENT',
          instituteId: institute.id
        }
      }),
      prisma.user.create({
        data: {
          name: 'Jordan Davis',
          email: `jordan.davis@${institute.domain}.edu`,
          password,
          role: 'STUDENT',
          instituteId: institute.id
        }
      }),
      prisma.user.create({
        data: {
          name: 'Maya Patel',
          email: `maya.patel@${institute.domain}.edu`,
          password,
          role: 'STUDENT',
          instituteId: institute.id
        }
      }),
      prisma.user.create({
        data: {
          name: 'Chris Martinez',
          email: `chris.martinez@${institute.domain}.edu`,
          password,
          role: 'STUDENT',
          instituteId: institute.id
        }
      })
    ]);
    users.push(...students);

    // Create Parents
    const parents = await Promise.all([
      prisma.user.create({
        data: {
          name: 'Robert Thompson',
          email: `robert.thompson@gmail.com`,
          password,
          role: 'PARENT',
          instituteId: institute.id
        }
      }),
      prisma.user.create({
        data: {
          name: 'Linda Wilson',
          email: `linda.wilson@gmail.com`,
          password,
          role: 'PARENT',
          instituteId: institute.id
        }
      })
    ]);
    users.push(...parents);

    // Create Classes for this institute
    console.log(`📚 Creating classes for ${institute.name}...`);

    const classes = await Promise.all([
      prisma.class.create({
        data: {
          name: 'Mathematics Grade 10',
          description: 'Advanced mathematics covering algebra, geometry, and trigonometry',
          subject: 'Mathematics',
          grade: '10',
          teacherId: teachers[0].id,
          instituteId: institute.id,
          code: `MATH10-${institute.code}`,
          maxStudents: 30
        }
      }),
      prisma.class.create({
        data: {
          name: 'Physics Grade 11',
          description: 'Comprehensive physics course covering mechanics, thermodynamics, and optics',
          subject: 'Physics',
          grade: '11',
          teacherId: teachers[1].id,
          instituteId: institute.id,
          code: `PHY11-${institute.code}`,
          maxStudents: 25
        }
      }),
      prisma.class.create({
        data: {
          name: 'English Literature Grade 9',
          description: 'Exploring classic and contemporary literature with critical analysis',
          subject: 'English',
          grade: '9',
          teacherId: teachers[2].id,
          instituteId: institute.id,
          code: `ENG9-${institute.code}`,
          maxStudents: 35
        }
      })
    ]);

    // Create Homework assignments
    console.log(`📝 Creating homework for ${institute.name}...`);

    for (const classItem of classes) {
      await Promise.all([
        prisma.homework.create({
          data: {
            title: `${classItem.subject} Assignment #1`,
            description: `Complete the exercises from Chapter 1 of your ${classItem.subject} textbook. Focus on understanding the fundamental concepts and practice problems 1-20.`,
            instructions: 'Please show all your work and submit neat, organized solutions. Pay attention to units and significant figures where applicable.',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            classId: classItem.id,
            teacherId: classItem.teacherId,
            totalPoints: 100,
            status: 'ACTIVE'
          }
        }),
        prisma.homework.create({
          data: {
            title: `${classItem.subject} Quiz Preparation`,
            description: `Prepare for the upcoming quiz on fundamental concepts. Review chapters 1-3 and complete the practice questions.`,
            instructions: 'Create summary notes and practice solving similar problems. The quiz will cover all major topics discussed in class.',
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
            classId: classItem.id,
            teacherId: classItem.teacherId,
            totalPoints: 50,
            status: 'ACTIVE'
          }
        })
      ]);
    }

    // Create Attendance records (last 7 days)
    console.log(`📋 Creating attendance records for ${institute.name}...`);

    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      // Skip weekends for attendance
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      for (const classItem of classes) {
        for (const student of students) {
          const status = Math.random() > 0.1 ? 'PRESENT' : Math.random() > 0.5 ? 'LATE' : 'ABSENT';

          await prisma.attendance.create({
            data: {
              date: date.toISOString().split('T')[0],
              status,
              studentId: student.id,
              classId: classItem.id,
              teacherId: classItem.teacherId,
              notes: status === 'LATE' ? 'Arrived 10 minutes late' : status === 'ABSENT' ? 'Unexcused absence' : null
            }
          });
        }
      }
    }
  }

  console.log(`✅ Created ${users.length} users across all institutes`);
  console.log('🎉 Database seeding completed successfully!');

  // Print login credentials
  console.log('\n📋 Demo Login Credentials:');
  console.log('=========================');

  for (const institute of institutes) {
    console.log(`\n🏛️ ${institute.name} (${institute.code})`);
    console.log(`   Admin: admin@${institute.domain}.edu / password123`);
    console.log(`   Teacher: sarah.johnson@${institute.domain}.edu / password123`);
    console.log(`   Student: alex.thompson@${institute.domain}.edu / password123`);
    console.log(`   Parent: robert.thompson@gmail.com / password123`);
  }

  console.log('\n💡 All users have the same password: password123');
  console.log('🔗 Access the app at: http://localhost:3000/login');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
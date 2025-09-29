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

  // Create the main demo institute with requested credentials
  const demoInstitute = await prisma.institute.create({
    data: {
      name: 'Demo Academy 2024',
      subdomain: 'demo',
      instituteCode: 'DEMO-2024',
      description: 'Demo institute for testing and showcasing the ETution platform',
      subscription: 'ENTERPRISE',
      studentLimit: 500,
      primaryColor: '#059669',
      logo: 'https://via.placeholder.com/150/059669/FFFFFF?text=DEMO'
    }
  });

  // Create additional sample institutes
  const institutes = [
    demoInstitute,
    await prisma.institute.create({
      data: {
        name: 'Tech Valley Institute',
        subdomain: 'techvalley',
        instituteCode: 'TVI-2024',
        description: 'Innovation-driven education for the digital age',
        subscription: 'PRO',
        studentLimit: 300,
        primaryColor: '#3B82F6',
        logo: 'https://via.placeholder.com/150/3B82F6/FFFFFF?text=TVI'
      }
    }),
    await prisma.institute.create({
      data: {
        name: 'Sunrise Learning Center',
        subdomain: 'sunrise',
        instituteCode: 'SLC-2024',
        description: 'Nurturing young minds with personalized learning',
        subscription: 'BASIC',
        studentLimit: 100,
        primaryColor: '#F59E0B',
        logo: 'https://via.placeholder.com/150/F59E0B/FFFFFF?text=SLC'
      }
    })
  ];

  console.log(`✅ Created ${institutes.length} institutes`);

  // Create demo users for each institute
  console.log('👥 Creating demo users...');

  const password = await bcrypt.hash('password123', 12);
  const users = [];

  for (const [index, institute] of institutes.entries()) {
    // Create specific demo users for the first institute (Demo Academy)
    if (index === 0) {
      // Create Owner with specific demo credentials
      const owner = await prisma.user.create({
        data: {
          name: 'Demo Owner',
          email: 'owner@demo.com',
          password,
          role: 'OWNER',
          instituteId: institute.id
        }
      });
      users.push(owner);

      // Create Teacher with specific demo credentials
      const teacher = await prisma.user.create({
        data: {
          name: 'Demo Teacher',
          email: 'teacher@demo.com',
          password,
          role: 'TEACHER',
          instituteId: institute.id
        }
      });

      // Create additional teachers
      const teachers = [
        teacher,
        await prisma.user.create({
          data: {
            name: 'Dr. Sarah Johnson',
            email: 'sarah.johnson@demo.com',
            password,
            role: 'TEACHER',
            instituteId: institute.id
          }
        }),
        await prisma.user.create({
          data: {
            name: 'Prof. Michael Chen',
            email: 'michael.chen@demo.com',
            password,
            role: 'TEACHER',
            instituteId: institute.id
          }
        })
      ];
      users.push(...teachers);

      // Create Student with specific demo credentials
      const student = await prisma.user.create({
        data: {
          name: 'Demo Student',
          email: 'student@demo.com',
          password,
          role: 'STUDENT',
          instituteId: institute.id
        }
      });

      // Create additional students
      const students = [
        student,
        await prisma.user.create({
          data: {
            name: 'Alex Thompson',
            email: 'alex.thompson@demo.com',
            password,
            role: 'STUDENT',
            instituteId: institute.id
          }
        }),
        await prisma.user.create({
          data: {
            name: 'Emma Wilson',
            email: 'emma.wilson@demo.com',
            password,
            role: 'STUDENT',
            instituteId: institute.id
          }
        }),
        await prisma.user.create({
          data: {
            name: 'Jordan Davis',
            email: 'jordan.davis@demo.com',
            password,
            role: 'STUDENT',
            instituteId: institute.id
          }
        }),
        await prisma.user.create({
          data: {
            name: 'Maya Patel',
            email: 'maya.patel@demo.com',
            password,
            role: 'STUDENT',
            instituteId: institute.id
          }
        })
      ];
      users.push(...students);

      // Create Parents
      const parents = await Promise.all([
        prisma.user.create({
          data: {
            name: 'Robert Thompson',
            email: 'parent@demo.com',
            password,
            role: 'PARENT',
            instituteId: institute.id
          }
        }),
        prisma.user.create({
          data: {
            name: 'Linda Wilson',
            email: 'linda.wilson@demo.com',
            password,
            role: 'PARENT',
            instituteId: institute.id
          }
        })
      ]);
      users.push(...parents);
    } else {
      // Create regular users for other institutes
      const owner = await prisma.user.create({
        data: {
          name: `${institute.name} Admin`,
          email: `admin@${institute.subdomain}.edu`,
          password,
          role: 'OWNER',
          instituteId: institute.id
        }
      });
      users.push(owner);

      const teachers = await Promise.all([
        prisma.user.create({
          data: {
            name: 'Dr. Sarah Johnson',
            email: `sarah.johnson@${institute.subdomain}.edu`,
            password,
            role: 'TEACHER',
            instituteId: institute.id
          }
        }),
        prisma.user.create({
          data: {
            name: 'Prof. Michael Chen',
            email: `michael.chen@${institute.subdomain}.edu`,
            password,
            role: 'TEACHER',
            instituteId: institute.id
          }
        })
      ]);
      users.push(...teachers);

      const students = await Promise.all([
        prisma.user.create({
          data: {
            name: 'Alex Thompson',
            email: `alex.thompson@${institute.subdomain}.edu`,
            password,
            role: 'STUDENT',
            instituteId: institute.id
          }
        }),
        prisma.user.create({
          data: {
            name: 'Emma Wilson',
            email: `emma.wilson@${institute.subdomain}.edu`,
            password,
            role: 'STUDENT',
            instituteId: institute.id
          }
        })
      ]);
      users.push(...students);

      const parents = await Promise.all([
        prisma.user.create({
          data: {
            name: 'Robert Thompson',
            email: `robert.thompson@${institute.subdomain}.edu`,
            password,
            role: 'PARENT',
            instituteId: institute.id
          }
        })
      ]);
      users.push(...parents);
    }

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

  console.log('\n🎯 PRIMARY DEMO CREDENTIALS (Institute Code: DEMO-2024):');
  console.log('   Owner:   owner@demo.com / password123');
  console.log('   Teacher: teacher@demo.com / password123');
  console.log('   Student: student@demo.com / password123');
  console.log('   Parent:  parent@demo.com / password123');

  console.log('\n🏛️ Additional Sample Institutes:');
  for (const [index, institute] of institutes.entries()) {
    if (index === 0) continue; // Skip demo institute (already shown above)
    console.log(`\n   ${institute.name} (${institute.instituteCode})`);
    console.log(`   Admin: admin@${institute.subdomain}.edu / password123`);
    console.log(`   Teacher: sarah.johnson@${institute.subdomain}.edu / password123`);
    console.log(`   Student: alex.thompson@${institute.subdomain}.edu / password123`);
  }

  console.log('\n💡 All users have the same password: password123');
  console.log('🔗 Access the app at: http://localhost:3000/login');
  console.log('🌐 Use Institute Code "DEMO-2024" for demo credentials');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
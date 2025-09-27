const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('Checking database content...');

    // Check institutes
    const institutes = await prisma.institute.findMany();
    console.log(`Found ${institutes.length} institutes:`);
    institutes.forEach(institute => {
      console.log(`- ${institute.name} (${institute.instituteCode}) - subdomain: ${institute.subdomain}`);
    });

    // Check users
    const users = await prisma.user.findMany();
    console.log(`\nFound ${users.length} users:`);
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
    });

    if (institutes.length === 0) {
      console.log('\nNo institutes found. Creating demo institute...');

      // Create demo institute
      const institute = await prisma.institute.create({
        data: {
          name: 'Demo Academy',
          subdomain: 'demo',
          instituteCode: 'DEMO001',
          primaryColor: '#3B82F6',
          subscription: 'PRO',
          studentLimit: 500
        }
      });

      console.log(`Created institute: ${institute.name} (${institute.instituteCode})`);

      // Create admin user
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);

      const adminUser = await prisma.user.create({
        data: {
          name: 'Admin User',
          email: 'admin@demo.com',
          password: hashedPassword,
          role: 'ADMIN',
          instituteId: institute.id
        }
      });

      console.log(`Created admin user: ${adminUser.email}`);
      console.log('Login credentials:');
      console.log('Institute Code: DEMO001');
      console.log('Email: admin@demo.com');
      console.log('Password: admin123');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
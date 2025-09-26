import { prisma } from '../lib/prisma'

async function seedDemoInstitutes() {
  try {
    console.log('Creating demo institutes...')

    // Demo Institute 1
    const demo1 = await prisma.institute.upsert({
      where: { subdomain: 'demo' },
      update: {},
      create: {
        name: 'Demo Academy',
        subdomain: 'demo',
        instituteCode: 'DEMO001',
        logo: null,
        primaryColor: '#3B82F6',
        subscription: 'PREMIUM',
        studentLimit: 500
      }
    })
    console.log('✓ Created Demo Academy:', demo1.subdomain)

    // ABC Tuition
    const abc = await prisma.institute.upsert({
      where: { subdomain: 'abc-tuition' },
      update: {},
      create: {
        name: 'ABC Tuition Center',
        subdomain: 'abc-tuition',
        instituteCode: 'ABC001',
        logo: null,
        primaryColor: '#10B981',
        subscription: 'BASIC',
        studentLimit: 200
      }
    })
    console.log('✓ Created ABC Tuition Center:', abc.subdomain)

    // Science Hub
    const science = await prisma.institute.upsert({
      where: { subdomain: 'science-hub' },
      update: {},
      create: {
        name: 'Science Hub Institute',
        subdomain: 'science-hub',
        instituteCode: 'SCI001',
        logo: null,
        primaryColor: '#8B5CF6',
        subscription: 'ENTERPRISE',
        studentLimit: 1000
      }
    })
    console.log('✓ Created Science Hub Institute:', science.subdomain)

    console.log('\n🎉 Demo institutes created successfully!')
    console.log('\nYou can now test with these URLs:')
    console.log('- http://demo.localhost:3000')
    console.log('- http://abc-tuition.localhost:3000')
    console.log('- http://science-hub.localhost:3000')

  } catch (error) {
    console.error('❌ Error seeding demo institutes:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedDemoInstitutes()
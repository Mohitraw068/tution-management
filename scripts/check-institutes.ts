import { prisma } from '../lib/prisma'

async function checkInstitutes() {
  try {
    console.log('Checking existing institutes...')

    const institutes = await prisma.institute.findMany({
      select: {
        id: true,
        name: true,
        subdomain: true,
        instituteCode: true,
        primaryColor: true,
        subscription: true
      }
    })

    if (institutes.length === 0) {
      console.log('❌ No institutes found in database!')
    } else {
      console.log(`✅ Found ${institutes.length} institutes:`)
      institutes.forEach((institute, index) => {
        console.log(`${index + 1}. ${institute.name}`)
        console.log(`   - Subdomain: ${institute.subdomain}`)
        console.log(`   - Code: ${institute.instituteCode}`)
        console.log(`   - Color: ${institute.primaryColor}`)
        console.log(`   - Plan: ${institute.subscription}`)
        console.log('')
      })
    }

    // Check users too
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        institute: {
          select: {
            name: true,
            subdomain: true
          }
        }
      }
    })

    console.log(`\n👥 Found ${users.length} users in database`)
    if (users.length > 0) {
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.role})`)
        console.log(`   - Email: ${user.email}`)
        console.log(`   - Institute: ${user.institute.name}`)
        console.log('')
      })
    }

  } catch (error) {
    console.error('❌ Error checking institutes:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkInstitutes()
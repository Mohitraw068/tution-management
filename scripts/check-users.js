const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking database users...')

  const institutes = await prisma.institute.findMany()
  console.log('\n📋 Institutes:')
  institutes.forEach(inst => {
    console.log(`- ${inst.name} (Code: ${inst.instituteCode}, ID: ${inst.id})`)
  })

  const users = await prisma.user.findMany({
    include: {
      institute: true
    }
  })

  console.log('\n👥 Users:')
  users.forEach(user => {
    console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`)
    console.log(`  Institute: ${user.institute.name} (${user.institute.instituteCode})`)
  })

  if (users.length > 0) {
    const owner = users.find(u => u.role === 'OWNER')
    if (owner) {
      console.log('\n🔑 LOGIN CREDENTIALS:')
      console.log(`Institute Code: ${owner.institute.instituteCode}`)
      console.log(`Email: ${owner.email}`)
      console.log(`Password: password123`)
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('Error:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
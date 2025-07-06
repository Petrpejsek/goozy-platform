const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function resetAccount() {
  try {
    console.log('🔄 Resetování účtu...')
    
    // Smazání starého účtu
    await prisma.influencer.deleteMany({
      where: { email: 'petr@1234567.cz' }
    })
    
    console.log('✅ Starý účet smazán')
    
    // Vytvoření nového hesla
    const hashedPassword = await bcrypt.hash('noveheslo123', 12)
    
    // Vytvoření nového účtu
    const influencer = await prisma.influencer.create({
      data: {
        email: 'petr@1234567.cz',
        name: 'Petr Liesner',
        password: hashedPassword,
        slug: 'petr-liesner-new',
        isApproved: true,
        isActive: true,
        commissionRate: 10.0,
        originType: 'manual',
        onboardingStatus: 'completed',
        verificationStatus: 'verified'
      }
    })
    
    console.log('✅ Nový účet vytvořen!')
    console.log('📧 Email: petr@1234567.cz')
    console.log('🔑 Heslo: noveheslo123')
    console.log('🆔 ID:', influencer.id)
    
    // Test hesla
    const isValid = await bcrypt.compare('noveheslo123', influencer.password)
    console.log('✅ Test hesla:', isValid ? 'ÚSPĚŠNÝ' : 'NEÚSPĚŠNÝ')
    
  } catch (error) {
    console.error('❌ Chyba:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetAccount() 
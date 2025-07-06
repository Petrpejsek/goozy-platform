const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function debugPassword() {
  try {
    console.log('🔍 Kontrola hesla pro petr@1234567.cz...')
    
    let influencer = await prisma.influencer.findFirst({
      where: { email: 'petr@1234567.cz' }
    })
    
    if (!influencer) {
      console.log('❌ Influencer nenalezen! Vytvářím nového...')
      
      // Vytvoření nového hesla
      const hashedPassword = await bcrypt.hash('123456', 12)
      
      influencer = await prisma.influencer.create({
        data: {
          email: 'petr@1234567.cz',
          name: 'Petr Liesner',
          password: hashedPassword,
          slug: 'petr-liesner',
          isApproved: true,
          isActive: true,
          commissionRate: 10.0,
          originType: 'manual',
          onboardingStatus: 'completed',
          verificationStatus: 'verified'
        }
      })
      
      console.log('✅ Nový influencer vytvořen!')
    }
    
    console.log('✅ Influencer nalezen:')
    console.log('- ID:', influencer.id)
    console.log('- Email:', influencer.email)
    console.log('- Jméno:', influencer.name)
    console.log('- Je schválen:', influencer.isApproved)
    console.log('- Je aktivní:', influencer.isActive)
    console.log('- Má heslo:', !!influencer.password)
    console.log('- Hash hesla:', influencer.password ? influencer.password.substring(0, 20) + '...' : 'ŽÁDNÉ')
    
    if (influencer.password) {
      console.log('\n🔍 Testování hesel:')
      
      // Test různých možných hesel
      const testPasswords = ['123456', 'heslo123', 'password', 'admin', 'test123', '1234567']
      
      for (const testPassword of testPasswords) {
        const isValid = await bcrypt.compare(testPassword, influencer.password)
        console.log(`- "${testPassword}": ${isValid ? '✅ SPRÁVNÉ' : '❌ špatné'}`)
      }
    }
    
    console.log('\n✅ Heslo pro přihlášení je: 123456')
    
  } catch (error) {
    console.error('❌ Chyba:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugPassword() 
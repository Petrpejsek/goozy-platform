const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function setCorrectPassword() {
  try {
    console.log('🔧 Nastavování správného hesla...')
    
    // Smazání všech účtů s tímto emailem
    await prisma.influencer.deleteMany({
      where: { email: 'petr@1234567.cz' }
    })
    
    console.log('✅ Staré účty smazány')
    
    // Vytvoření hesla 1234567 (vaše původní heslo)
    const hashedPassword = await bcrypt.hash('1234567', 12)
    
    // Vytvoření účtu s vaším původním heslem
    const influencer = await prisma.influencer.create({
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
    
    console.log('✅ Účet vytvořen s vaším původním heslem!')
    console.log('📧 Email: petr@1234567.cz')
    console.log('🔑 Heslo: 1234567 (vaše původní heslo)')
    console.log('🆔 ID:', influencer.id)
    
    // Test obou hesel
    const isOldValid = await bcrypt.compare('1234567', influencer.password)
    const isNewValid = await bcrypt.compare('qwerty', influencer.password)
    
    console.log('✅ Test původního hesla (1234567):', isOldValid ? 'ÚSPĚŠNÝ' : 'NEÚSPĚŠNÝ')
    console.log('❌ Test nového hesla (qwerty):', isNewValid ? 'ÚSPĚŠNÝ' : 'NEÚSPĚŠNÝ')
    
    console.log('\n🎯 SHRNUTÍ:')
    console.log('- Přihlašte se s heslem: 1234567')
    console.log('- Po přihlášení můžete změnit heslo na qwerty v profilu')
    
  } catch (error) {
    console.error('❌ Chyba:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setCorrectPassword() 
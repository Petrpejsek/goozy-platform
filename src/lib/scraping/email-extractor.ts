import { prisma } from '../prisma'

// Regex pro nalezení emailu v textu - pokročilejší verze
const EMAIL_PATTERNS = [
  // Základní email regex
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  // Email s emoji nebo speciálními znaky kolem
  /[💌📧📩✉️]?\s*([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,})/g,
  // Email v závorkách nebo s dvojtečkou
  /(?:email|mail|contact)[:\s]*([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,})/gi
]

/**
 * Extrahuje email z textu pomocí různých vzorů
 */
export function extractEmailFromText(text: string): string | null {
  if (!text) return null
  
  for (const pattern of EMAIL_PATTERNS) {
    const matches = text.match(pattern)
    if (matches && matches.length > 0) {
      // Vyčisti email od emoji a dalších znaků
      const cleanEmail = matches[0].replace(/[💌📧📩✉️\s]/g, '').toLowerCase()
      
      // Validuj že je to skutečně email
      if (isValidEmail(cleanEmail)) {
        return cleanEmail
      }
    }
  }
  
  return null
}

/**
 * Základní validace emailu
 */
function isValidEmail(email: string): boolean {
  const basicEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return basicEmailRegex.test(email)
}

/**
 * Automaticky extrahuje emaily z bio polí pro všechny prospects
 */
export async function autoExtractEmailsFromBio(): Promise<{
  processed: number
  updated: number
  extracted: Array<{ name: string, email: string }>
}> {
  try {
    console.log('🔍 [EMAIL-EXTRACTOR] Spouštím automatickou extrakci emailů z bio polí...')
    
    // Najdi prospects s bio ale bez emailu
    const prospects = await prisma.influencerProspect.findMany({
      where: {
        AND: [
          { email: null },
          { bio: { not: null } },
          { bio: { not: '' } }
        ]
      }
    })
    
    console.log(`📊 [EMAIL-EXTRACTOR] Nalezeno ${prospects.length} prospects k zpracování`)
    
    const result = {
      processed: prospects.length,
      updated: 0,
      extracted: [] as Array<{ name: string, email: string }>
    }
    
    for (const prospect of prospects) {
      const extractedEmail = extractEmailFromText(prospect.bio!)
      
      if (extractedEmail) {
        console.log(`✉️  [EMAIL-EXTRACTOR] ${prospect.name}: ${extractedEmail}`)
        
        // Aktualizuj prospect
        await prisma.influencerProspect.update({
          where: { id: prospect.id },
          data: { email: extractedEmail }
        })
        
        result.updated++
        result.extracted.push({
          name: prospect.name,
          email: extractedEmail
        })
      }
    }
    
    console.log(`✅ [EMAIL-EXTRACTOR] Dokončeno: ${result.updated}/${result.processed} prospects aktualizováno`)
    
    return result
    
  } catch (error) {
    console.error('❌ [EMAIL-EXTRACTOR] Chyba při extrakci emailů:', error)
    throw error
  }
}

/**
 * Extrahuje email z konkrétního bio při scraping
 */
export function extractEmailFromScrapedBio(scrapedBio: string): string | null {
  return extractEmailFromText(scrapedBio)
} 
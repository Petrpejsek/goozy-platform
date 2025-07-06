import { prisma } from './prisma'

/**
 * Generuje unikátní slug pro kampaň
 * Formát: influencer-name-brand-name-timestamp-random
 * Příklad: aneta-goozy-demo-1719223456-a9b2c3
 */
export async function generateUniqueCampaignSlug(
  influencerName: string,
  brandName: string
): Promise<string> {
  const baseSlug = createBaseSlug(influencerName, brandName)
  
  // Zkusíme najít volný slug s postupně zvyšující se složitostí
  for (let attempt = 0; attempt < 10; attempt++) {
    const slug = attempt === 0 
      ? baseSlug 
      : `${baseSlug}-${generateRandomSuffix()}`
    
    // Kontrola, zda slug už neexistuje
    const existingCampaign = await prisma.campaigns.findUnique({
      where: { slug }
    }).catch(() => null) // Ignorujeme chyby, pokud tabulka nemá zatím slug pole
    
    if (!existingCampaign) {
      return slug
    }
  }
  
  // Fallback - pokud se nepodaří najít volný slug, použijeme timestamp + uuid
  return `${baseSlug}-${Date.now()}-${generateRandomSuffix()}`
}

/**
 * Vytvoří základní slug z jmen influencera a brandy
 */
function createBaseSlug(influencerName: string, brandName: string): string {
  const cleanInfluencer = cleanSlugPart(influencerName)
  const cleanBrand = cleanSlugPart(brandName)
  const timestamp = Math.floor(Date.now() / 1000) // Unix timestamp pro jedinečnost
  
  return `${cleanInfluencer}-${cleanBrand}-${timestamp}`
}

/**
 * Vyčistí text pro použití v URL slug
 */
function cleanSlugPart(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Odstraň speciální znaky
    .replace(/\s+/g, '-') // Mezery na pomlčky
    .replace(/-+/g, '-') // Více pomlček na jednu
    .replace(/^-+|-+$/g, '') // Odstraň pomlčky na začátku/konci
    .substring(0, 20) // Omez délku
}

/**
 * Vygeneruje náhodný suffix pro slug
 */
function generateRandomSuffix(): string {
  return Math.random().toString(36).substring(2, 8) // 6 náhodných znaků
}

/**
 * Validuje formát campaign slug
 */
export function validateCampaignSlug(slug: string): boolean {
  // Slug musí obsahovat pouze malá písmena, čísla a pomlčky
  // Délka 10-100 znaků
  const slugRegex = /^[a-z0-9-]{10,100}$/
  return slugRegex.test(slug)
}

/**
 * Extrahuje informace ze slug
 */
export function parseSlugInfo(slug: string): {
  influencerName?: string
  brandName?: string
  timestamp?: number
} {
  const parts = slug.split('-')
  
  if (parts.length >= 3) {
    return {
      influencerName: parts[0],
      brandName: parts[1], 
      timestamp: parseInt(parts[2]) || undefined
    }
  }
  
  return {}
} 
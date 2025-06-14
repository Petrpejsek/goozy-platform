import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Začínám seed databáze...')

  // Vytvoříme testovací značku
  const testBrand = await prisma.brand.upsert({
    where: { email: 'test@fashionbrand.com' },
    update: {},
    create: {
      name: 'Fashion Brand',
      email: 'test@fashionbrand.com',
      description: 'Moderní módní značka s trendy oblečením',
      website: 'https://fashionbrand.com',
      isApproved: true,
      isActive: true,
    },
  })

  console.log('✅ Značka vytvořena:', testBrand.name)

  // Vytvoříme testovací produkty
  const products = [
    {
      externalId: 'FB001',
      name: 'Elegantní černé šaty',
      description: 'Krásné černé šaty ideální pro večerní příležitosti. Vyrobeno z kvalitních materiálů.',
      price: 89.99,
      currency: 'EUR',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400',
        'https://images.unsplash.com/photo-1566479179817-c0b5b4b8b1c0?w=400'
      ]),
      category: 'Šaty',
      sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL']),
      colors: JSON.stringify(['Černá', 'Tmavě modrá']),
      sku: 'FB-DRESS-001',
      stockQuantity: 25,
      isAvailable: true,
    },
    {
      externalId: 'FB002',
      name: 'Stylová denim bunda',
      description: 'Trendy džínová bunda v moderním střihu. Perfektní pro casual outfity.',
      price: 65.50,
      currency: 'EUR',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400'
      ]),
      category: 'Bundy',
      sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
      colors: JSON.stringify(['Světle modrá', 'Tmavě modrá', 'Černá']),
      sku: 'FB-JACKET-002',
      stockQuantity: 15,
      isAvailable: true,
    },
    {
      externalId: 'FB003',
      name: 'Pohodlné tenisky',
      description: 'Moderní tenisky pro každodenní nošení. Kombinace stylu a pohodlí.',
      price: 79.99,
      currency: 'EUR',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400',
        'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400'
      ]),
      category: 'Obuv',
      sizes: JSON.stringify(['36', '37', '38', '39', '40', '41', '42']),
      colors: JSON.stringify(['Bílá', 'Černá', 'Růžová']),
      sku: 'FB-SHOES-003',
      stockQuantity: 30,
      isAvailable: true,
    },
    {
      externalId: 'FB004',
      name: 'Luxusní kožená kabelka',
      description: 'Elegantní kožená kabelka vyrobená z pravé kůže. Ideální doplněk k formálním outfitům.',
      price: 129.99,
      currency: 'EUR',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400'
      ]),
      category: 'Doplňky',
      sizes: JSON.stringify(['One Size']),
      colors: JSON.stringify(['Černá', 'Hnědá', 'Béžová']),
      sku: 'FB-BAG-004',
      stockQuantity: 12,
      isAvailable: true,
    },
    {
      externalId: 'FB005',
      name: 'Bavlněné tričko',
      description: 'Základní bavlněné tričko v různých barvách. Pohodlné a praktické.',
      price: 24.99,
      currency: 'EUR',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
        'https://images.unsplash.com/photo-1583743814966-8936f37f4036?w=400'
      ]),
      category: 'Trička',
      sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL', 'XXL']),
      colors: JSON.stringify(['Bílá', 'Černá', 'Šedá', 'Modrá', 'Růžová']),
      sku: 'FB-TSHIRT-005',
      stockQuantity: 50,
      isAvailable: true,
    }
  ]

  // Vytvoříme produkty
  for (const productData of products) {
    const product = await prisma.product.upsert({
      where: { 
        brandId_externalId: {
          brandId: testBrand.id,
          externalId: productData.externalId
        }
      },
      update: productData,
      create: {
        ...productData,
        brandId: testBrand.id,
      },
    })
    console.log('✅ Produkt vytvořen:', product.name)
  }

  console.log('🎉 Seed dokončen!')
}

main()
  .catch((e) => {
    console.error('❌ Chyba při seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 
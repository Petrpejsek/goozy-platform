import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create test brand
  const testBrand = await prisma.brands.upsert({
    where: { email: 'test@fashionbrand.com' },
    update: {},
    create: {
      name: 'Fashion Brand',
      email: 'test@fashionbrand.com',
      description: 'Modern fashion brand with trendy clothing',
      website: 'https://fashionbrand.com',
      isApproved: true,
      isActive: true,
    },
  })

  console.log('✅ Brand created:', testBrand.name)

  // Create test products
  const products = [
    {
      externalId: 'FB001',
      name: 'Elegant Red Dress',
      description: 'Beautiful red dress perfect for evening occasions. Made from quality materials.',
      price: 89.99,
      currency: 'EUR',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400',
        'https://images.unsplash.com/photo-1566479179817-c0b5b4b8b1c0?w=400'
      ]),
      category: 'Dresses',
      sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL']),
      colors: JSON.stringify(['Red', 'Black', 'Navy Blue']),
      sku: 'FB-DRESS-001',
      stockQuantity: 25,
      isAvailable: true,
    },
    {
      externalId: 'FB002',
      name: 'Stylish Denim Jacket',
      description: 'Trendy denim jacket in modern cut. Perfect for casual outfits.',
      price: 65.50,
      currency: 'EUR',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400'
      ]),
      category: 'Jackets',
      sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
      colors: JSON.stringify(['Light Blue', 'Dark Blue', 'Black']),
      sku: 'FB-JACKET-002',
      stockQuantity: 15,
      isAvailable: true,
    },
    {
      externalId: 'FB003',
      name: 'Comfortable Sneakers',
      description: 'Modern sneakers for everyday wear. Combination of style and comfort.',
      price: 79.99,
      currency: 'EUR',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400',
        'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400'
      ]),
      category: 'Shoes',
      sizes: JSON.stringify(['36', '37', '38', '39', '40', '41', '42']),
      colors: JSON.stringify(['White', 'Black', 'Pink']),
      sku: 'FB-SHOES-003',
      stockQuantity: 30,
      isAvailable: true,
    },
    {
      externalId: 'FB004',
      name: 'Luxury Leather Handbag',
      description: 'Elegant leather handbag made from genuine leather. Perfect accessory for formal outfits.',
      price: 129.99,
      currency: 'EUR',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400'
      ]),
      category: 'Accessories',
      sizes: JSON.stringify(['One Size']),
      colors: JSON.stringify(['Black', 'Brown', 'Beige']),
      sku: 'FB-BAG-004',
      stockQuantity: 12,
      isAvailable: true,
    },
    {
      externalId: 'FB005',
      name: 'Cotton T-Shirt',
      description: 'Basic cotton t-shirt in various colors. Comfortable and practical.',
      price: 24.99,
      currency: 'EUR',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
        'https://images.unsplash.com/photo-1583743814966-8936f37f4036?w=400'
      ]),
      category: 'T-Shirts',
      sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL', 'XXL']),
      colors: JSON.stringify(['White', 'Black', 'Gray', 'Blue', 'Pink']),
      sku: 'FB-TSHIRT-005',
      stockQuantity: 50,
      isAvailable: true,
    },
    {
      externalId: 'FB006',
      name: 'Wool Winter Coat',
      description: 'Warm wool coat for cold winter days. Elegant design with modern cut.',
      price: 159.99,
      currency: 'EUR',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400'
      ]),
      category: 'Coats',
      sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL']),
      colors: JSON.stringify(['Black', 'Gray', 'Camel', 'Navy']),
      sku: 'FB-COAT-006',
      stockQuantity: 18,
      isAvailable: true,
    },
    {
      externalId: 'FB007',
      name: 'Silk Blouse',
      description: 'Luxurious silk blouse perfect for business or formal occasions. Soft and comfortable.',
      price: 95.00,
      currency: 'EUR',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400',
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400'
      ]),
      category: 'Blouses',
      sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL']),
      colors: JSON.stringify(['White', 'Cream', 'Light Pink', 'Black']),
      sku: 'FB-BLOUSE-007',
      stockQuantity: 22,
      isAvailable: true,
    },
    {
      externalId: 'FB008',
      name: 'High-Waisted Jeans',
      description: 'Classic high-waisted jeans with perfect fit. Made from premium denim.',
      price: 69.99,
      currency: 'EUR',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=400',
        'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400'
      ]),
      category: 'Jeans',
      sizes: JSON.stringify(['24', '25', '26', '27', '28', '29', '30', '31', '32']),
      colors: JSON.stringify(['Dark Blue', 'Light Blue', 'Black', 'White']),
      sku: 'FB-JEANS-008',
      stockQuantity: 35,
      isAvailable: true,
    },
    {
      externalId: 'FB009',
      name: 'Leather Ankle Boots',
      description: 'Stylish leather ankle boots with comfortable heel. Perfect for autumn and winter.',
      price: 119.99,
      currency: 'EUR',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400',
        'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400'
      ]),
      category: 'Boots',
      sizes: JSON.stringify(['36', '37', '38', '39', '40', '41']),
      colors: JSON.stringify(['Black', 'Brown', 'Tan']),
      sku: 'FB-BOOTS-009',
      stockQuantity: 20,
      isAvailable: true,
    },
    {
      externalId: 'FB010',
      name: 'Cashmere Sweater',
      description: 'Soft cashmere sweater for ultimate comfort and luxury. Perfect for cooler days.',
      price: 149.99,
      currency: 'EUR',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400',
        'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400'
      ]),
      category: 'Sweaters',
      sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL']),
      colors: JSON.stringify(['Beige', 'Gray', 'Pink', 'White', 'Black']),
      sku: 'FB-SWEATER-010',
      stockQuantity: 16,
      isAvailable: true,
    },
    {
      externalId: 'FB011',
      name: 'Summer Maxi Dress',
      description: 'Flowing maxi dress perfect for summer occasions. Light and comfortable fabric.',
      price: 75.50,
      currency: 'EUR',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400',
        'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400'
      ]),
      category: 'Dresses',
      sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL']),
      colors: JSON.stringify(['Floral Print', 'Solid Blue', 'White', 'Yellow']),
      sku: 'FB-MAXIDRESS-011',
      stockQuantity: 28,
      isAvailable: true,
    },
    {
      externalId: 'FB012',
      name: 'Designer Sunglasses',
      description: 'Trendy designer sunglasses with UV protection. Perfect accessory for sunny days.',
      price: 89.00,
      currency: 'EUR',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400',
        'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400'
      ]),
      category: 'Accessories',
      sizes: JSON.stringify(['One Size']),
      colors: JSON.stringify(['Black', 'Tortoise', 'Gold', 'Silver']),
      sku: 'FB-SUNGLASSES-012',
      stockQuantity: 40,
      isAvailable: true,
    },
    {
      externalId: 'FB013',
      name: 'Athletic Leggings',
      description: 'High-performance athletic leggings for workout and casual wear. Moisture-wicking fabric.',
      price: 45.99,
      currency: 'EUR',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1506629905607-d9b1b2e3d3b1?w=400',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'
      ]),
      category: 'Activewear',
      sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL']),
      colors: JSON.stringify(['Black', 'Gray', 'Navy', 'Purple']),
      sku: 'FB-LEGGINGS-013',
      stockQuantity: 45,
      isAvailable: true,
    },
    {
      externalId: 'FB014',
      name: 'Vintage Leather Jacket',
      description: 'Classic vintage-style leather jacket. Timeless design that never goes out of style.',
      price: 199.99,
      currency: 'EUR',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
        'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=400'
      ]),
      category: 'Jackets',
      sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL']),
      colors: JSON.stringify(['Black', 'Brown', 'Burgundy']),
      sku: 'FB-LEATHER-014',
      stockQuantity: 12,
      isAvailable: true,
    }
  ]

  // Delete existing products to avoid duplicates
  await prisma.products.deleteMany({
    where: {
      brandId: testBrand.id
    }
  })

  // Create products
  for (const productData of products) {
    const product = await prisma.products.create({
      data: {
        ...productData,
        brandId: testBrand.id,
      },
    })
    console.log('✅ Product created:', product.name)
  }

  console.log('🎉 Database seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addTestProducts() {
  try {
    console.log('🔍 Hledám "Goozy Demo Brand"...');
    
    // Najdi Goozy Demo Brand
    const goozyBrand = await prisma.brands.findFirst({
      where: {
        name: 'Goozy Demo Brand'
      }
    });

    if (!goozyBrand) {
      console.log('❌ Goozy Demo Brand nenalezen!');
      return;
    }

    console.log('✅ Nalezen brand:', goozyBrand.name, 'ID:', goozyBrand.id);

    // Zkontroluj existující produkty
    const existingProducts = await prisma.products.findMany({
      where: {
        brandId: goozyBrand.id
      }
    });

    console.log('📦 Existující produkty:', existingProducts.length);

    if (existingProducts.length > 0) {
      console.log('✅ Brand už má produkty, odstraňuji je nejdřív...');
      await prisma.products.deleteMany({
        where: {
          brandId: goozyBrand.id
        }
      });
    }

    // Přidej testovací produkty
    const testProducts = [
      {
        id: `product-${Date.now()}-1`,
        brandId: goozyBrand.id,
        externalId: 'test-product-1',
        name: 'Elegant Black Dress',
        description: 'Perfect little black dress for any occasion',
        price: 89.99,
        currency: 'EUR',
        images: JSON.stringify(['/products/3457645_1750753415144_ap9wfk.jpeg']),
        category: 'Dresses',
        sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL']),
        colors: JSON.stringify(['Black', 'Navy']),
        sku: 'EBD001',
        stockQuantity: 50,
        isAvailable: true,
        brand_name: goozyBrand.name,
        gender: 'Women',
        material: 'Cotton blend',
        updatedAt: new Date()
      },
      {
        id: `product-${Date.now()}-2`,
        brandId: goozyBrand.id,
        externalId: 'test-product-2',
        name: 'Vintage Denim Jacket',
        description: 'Classic vintage-style denim jacket',
        price: 79.99,
        currency: 'EUR',
        images: JSON.stringify(['/products/484465456_1751198664122_ugp5da.webp']),
        category: 'Jackets',
        sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
        colors: JSON.stringify(['Blue', 'Light Blue']),
        sku: 'VDJ002',
        stockQuantity: 30,
        isAvailable: true,
        brand_name: goozyBrand.name,
        gender: 'Unisex',
        material: 'Denim',
        updatedAt: new Date()
      },
      {
        id: `product-${Date.now()}-3`,
        brandId: goozyBrand.id,
        externalId: 'test-product-3',
        name: 'Cozy Knit Sweater',
        description: 'Soft and warm knit sweater for cold days',
        price: 65.00,
        currency: 'EUR',
        images: JSON.stringify(['/products/3457645_1750753415144_ap9wfk.jpeg']),
        category: 'Sweaters',
        sizes: JSON.stringify(['XS', 'S', 'M', 'L']),
        colors: JSON.stringify(['Cream', 'Grey', 'Pink']),
        sku: 'CKS003',
        stockQuantity: 40,
        isAvailable: true,
        brand_name: goozyBrand.name,
        gender: 'Women',
        material: 'Wool blend',
        updatedAt: new Date()
      }
    ];

    console.log('📦 Přidávám testovací produkty...');
    
    for (const product of testProducts) {
      await prisma.products.create({
        data: product
      });
      console.log('✅ Přidán produkt:', product.name);
    }

    console.log('🎉 Úspěšně přidáno', testProducts.length, 'testovacích produktů!');

    // Zkontroluj výsledek
    const newProducts = await prisma.products.findMany({
      where: {
        brandId: goozyBrand.id
      }
    });

    console.log('📊 Celkem produktů pro brand:', newProducts.length);

  } catch (error) {
    console.error('❌ Chyba při přidávání produktů:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTestProducts(); 
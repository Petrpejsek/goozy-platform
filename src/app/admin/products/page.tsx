import { prisma } from '@/lib/prisma'
import ProductsContent from './ProductsContent'

interface SearchParams {
  brand?: string
  category?: string
  availability?: string
  search?: string
  page?: string
}

interface ProductsPageProps {
  searchParams: Promise<SearchParams>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  // Await searchParams pro Next.js 15
  const params = await searchParams
  
  const page = parseInt(params.page || '1')
  const limit = 25
  const offset = (page - 1) * limit

  // Sestavit WHERE klauzuli pro filtry
  const whereClause: any = {}
  
  if (params.brand) {
    whereClause.brandId = params.brand
  }
  
  if (params.category) {
    whereClause.category = { contains: params.category, mode: 'insensitive' }
  }
  
  if (params.availability === 'available') {
    whereClause.isAvailable = true
    whereClause.stockQuantity = { gt: 0 }
  } else if (params.availability === 'outofstock') {
    whereClause.OR = [
      { isAvailable: false },
      { stockQuantity: 0 }
    ]
  }
  
  if (params.search) {
    whereClause.OR = [
      { name: { contains: params.search, mode: 'insensitive' } },
      { sku: { contains: params.search, mode: 'insensitive' } },
      { brand_name: { contains: params.search, mode: 'insensitive' } }
    ]
  }

  // Načti data
  const [products, totalCount, brands, categories, totalProducts, totalBrands, outOfStock, totalValue] = await Promise.all([
    prisma.product.findMany({
      where: whereClause,
      include: {
        brand: {
          select: { 
            name: true, 
            id: true,
            _count: {
              select: {
                campaigns: {
                  where: {
                    isActive: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
          }),
      prisma.product.count({ where: whereClause }),
          prisma.brand.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    }),
    prisma.product.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' }
          }).then(results => results.filter(item => item.category && item.category.trim() !== '')),
      prisma.product.count({ where: whereClause }),
          prisma.brand.count({
      where: {
        isActive: true,
        products: {
          some: whereClause
        }
      }
    }),
    prisma.product.count({
      where: {
        ...whereClause,
        OR: [
          { isAvailable: false },
          { stockQuantity: 0 }
        ]
      }
    }),
    prisma.product.aggregate({
      where: whereClause,
      _sum: { price: true }
    })
  ])

  const totalPages = Math.ceil(totalCount / limit)

  return (
    <ProductsContent
      products={products}
      brands={brands}
      categories={categories}
      totalCount={totalCount}
      totalPages={totalPages}
      page={page}
      params={params}
      totalProducts={totalProducts}
      totalBrands={totalBrands}
      outOfStock={outOfStock}
      totalValue={totalValue}
    />
  )
} 
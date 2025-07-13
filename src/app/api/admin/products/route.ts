import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Extract form fields
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string)
    const currency = formData.get('currency') as string || 'EUR'
    const category = formData.get('category') as string
    const sizes = formData.get('sizes') as string
    const colors = formData.get('colors') as string
    const sku = formData.get('sku') as string
    const stockQuantity = parseInt(formData.get('stockQuantity') as string)
    const brandId = formData.get('brandId') as string
    const newBrandName = formData.get('newBrandName') as string
    const dimensions = formData.get('dimensions') as string
    const gender = formData.get('gender') as string
    const material = formData.get('material') as string
    const weight = formData.get('weight') ? parseFloat(formData.get('weight') as string) : null

    // Handle brand creation or selection
    let finalBrandId = brandId
    if (newBrandName && newBrandName.trim()) {
      // Create new brand
      const newBrand = await prisma.brand.create({
        data: {
          id: `brand_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
          name: newBrandName.trim()
          email: `admin-created-${Date.now()}@goozy.platform`
          isApproved: true,
          isActive: true,
          createdAt: new Date()
          updatedAt: new Date()
        },
      })
      finalBrandId = newBrand.id
    },

    // Ensure products directory exists
    const productsDir = join(process.cwd(), 'public', 'products')
    try {
      await mkdir(productsDir, { recursive: true })
    } catch (error) {
      // Directory already exists
    },

    // Handle image uploads
    const uploadedImages: string[] = []
    const imageFiles = formData.getAll('images') as File[]
    
    for (const file of imageFiles) {
      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        
        // Create unique filename
        const timestamp = Date.now()
        const randomString = Math.random().toString(36).substring(2, 8)
        const fileExtension = file.name.split('.').pop() || 'jpg'
        const filename = `${sku}_${timestamp}_${randomString}.${fileExtension}`
        
        const filepath = join(productsDir, filename)
        await writeFile(filepath, buffer)
        
        // Store relative path for database
        uploadedImages.push(`/products/${filename}`)
      },
    },

    // Generate external ID for admin-created products
    const adminProductsCount = await prisma.product.count({
      where: {
        externalId: {
          startsWith: 'ADMIN_'
        },
      },
    })
    const externalId = `ADMIN_${String(adminProductsCount + 1).padStart(3, '0')}`

    // Create product
    const product = await prisma.product.create({
      data: {
        id: `product_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
        brandId: finalBrandId
        externalId
        name
        description: description || ''
        price
        currency
        images: JSON.stringify(uploadedImages)
        category
        sizes: sizes ? JSON.stringify(sizes.split(',').map(s => s.trim()).filter(s => s)) : '[]'
        colors: colors ? JSON.stringify(colors.split(',').map(s => s.trim()).filter(s => s)) : '[]'
        sku
        stockQuantity
        isAvailable: true
        brand_name: newBrandName || undefined
        dimensions: dimensions || undefined
        gender: gender || undefined
        material: material || undefined
        weight
        createdAt: new Date()
        updatedAt: new Date()
      },
      include: {
        brand: {
          select: {
            id: true
            name: true
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: product
      message: 'Product created successfully'
    })

  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create product'
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 },
    )
  },
} 
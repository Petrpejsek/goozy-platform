import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyBrandAuth } from '@/lib/auth'

// GET - Načíst nastavení partner company
export async function GET() {
  try {
    console.log('🏢 [PARTNER-SETTINGS] Loading partner company settings...')
    
    const user = await verifyBrandAuth()
    if (!user) {
      return NextResponse.json({ error:  'Not authenticated' }, { status:  401 })
    }

    // Najít brand application - to je náš zdroj pravdy
    const brandApplication = await prisma.brandApplication.findUnique({
      where: { id: user.brandId }
    })

    if (!brandApplication) {
      return NextResponse.json({ error:  'Partner company not found' }, { status:  404 })
    }

    // Najít asociovaný brand v brands tabulce (pokud existuje)
    let brand = await prisma.brand.findFirst({
      where: { email: brandApplication.email }
    })

    // Pokud brand v brands tabulce neexistuje, vytvořme jeho záznam
    if (!brand) {
      brand = await prisma.brand.create({
        data: {
          id: `brand-${brandApplication.id}`
          name: brandApplication.brandName
          email: brandApplication.email
          phone: brandApplication.phone
          description: brandApplication.description
          website: brandApplication.website
          isApproved: true
          isActive: true,
          targetCountries: '[]'
          createdAt: new Date()
          updatedAt: new Date()
        }
      })
      console.log(`✅ [SETTINGS] Created new brand record for: ${brand.name}`)
    }

    // Parsovat target countries z JSON stringu
    let targetCountries: string[] = []
    try {
      targetCountries = brand.targetCountries ? JSON.parse(brand.targetCountries) : []
    } catch (error) {
      console.log('❌ [PARTNER-SETTINGS] Error parsing target countries:', error)
      targetCountries = []
    }

    console.log(`✅ [PARTNER-SETTINGS] Settings loaded for: ${brand.name}`)
    
    return NextResponse.json({
      success: true,
      settings: {
        id: brand.id
        name: brand.name
        email: brand.email
        phone: brand.phone
        website: brand.website
        description: brand.description
        targetCountries: targetCountries
        isActive: brand.isActive
        isApproved: brand.isApproved
        createdAt: brand.createdAt
        updatedAt: brand.updatedAt
      }
    })

  } catch (error) {
    console.error('❌ [PARTNER-SETTINGS] GET error:', error)
    return NextResponse.json(
      { error:  'Internal Server Error' }
      { status:  500 }
    )
  }
}

// PUT - Aktualizovat nastavení partner company
export async function PUT(request: NextRequest) {
  try {
    console.log('🏢 [PARTNER-SETTINGS] Updating partner company settings...')
    
    const user = await verifyBrandAuth()
    if (!user) {
      return NextResponse.json({ error:  'Not authenticated' }, { status:  401 })
    }

    const body = await request.json()
    const { 
      name, 
      email, 
      phone, 
      website, 
      description, 
      targetCountries 
    } = body

    console.log('📋 [PARTNER-SETTINGS] Received data:', { 
      name, 
      email, 
      phone, 
      website, 
      description, 
      targetCountries 
    })

    // Najít brand application - to je náš zdroj pravdy
    const brandApplication = await prisma.brandApplication.findUnique({
      where: { id: user.brandId }
    })

    if (!brandApplication) {
      return NextResponse.json({ error:  'Partner company not found' }, { status:  404 })
    }

    // Najít asociovaný brand v brands tabulce (pokud existuje)
    let brand = await prisma.brand.findFirst({
      where: { email: brandApplication.email }
    })

    // Pokud brand v brands tabulce neexistuje, vytvořme jeho záznam
    if (!brand) {
      brand = await prisma.brand.create({
        data: {
          id: `brand-${brandApplication.id}`
          name: brandApplication.brandName
          email: brandApplication.email
          phone: brandApplication.phone
          description: brandApplication.description
          website: brandApplication.website
          isApproved: true
          isActive: true,
          targetCountries: '[]'
          createdAt: new Date()
          updatedAt: new Date()
        }
      })
      console.log(`✅ [SETTINGS] Created new brand record for: ${brand.name}`)
    }

    // Připravit data pro update
    const updateData: any = {}
    
    if (name !== undefined) updateData.name = name
    if (email !== undefined) updateData.email = email
    if (phone !== undefined) updateData.phone = phone
    if (website !== undefined) updateData.website = website
    if (description !== undefined) updateData.description = description
    
    // Zpracovat target countries
    if (targetCountries !== undefined) {
      updateData.targetCountries = JSON.stringify(targetCountries)
      console.log('🌍 [PARTNER-SETTINGS] Saving target countries:', targetCountries)
    }

    updateData.updatedAt = new Date()

    // Aktualizovat brand v databázi pomocí správného ID
    const updatedBrand = await prisma.brand.update({
      where: { id: brand.id }
      data: updateData
    })

    console.log(`✅ [PARTNER-SETTINGS] Settings updated for: ${updatedBrand.name}`)

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully'
      settings: {
        id: updatedBrand.id
        name: updatedBrand.name
        email: updatedBrand.email
        phone: updatedBrand.phone
        website: updatedBrand.website
        description: updatedBrand.description
        targetCountries: targetCountries || JSON.parse(updatedBrand.targetCountries || '[]')
        updatedAt: updatedBrand.updatedAt
      }
    })

  } catch (error) {
    console.error('❌ [PARTNER-SETTINGS] PUT error:', error)
    return NextResponse.json(
      { error:  'Internal Server Error' }
      { status:  500 }
    )
  }
} 
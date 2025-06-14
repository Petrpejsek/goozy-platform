import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schéma pro validaci formuláře značky
const brandApplicationSchema = z.object({
  brandName: z.string().min(2, 'Název značky musí mít alespoň 2 znaky'),
  email: z.string().email('Neplatný email'),
  phone: z.string().optional(),
  description: z.string().min(10, 'Popis musí mít alespoň 10 znaků'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validace dat
    const validatedData = brandApplicationSchema.parse(body)
    
    // Kontrola, jestli už není email v databázi
    const existingApplication = await prisma.brandApplication.findFirst({
      where: { email: validatedData.email }
    })
    
    if (existingApplication) {
      return NextResponse.json(
        { error: 'S tímto emailem už byla podána poptávka' },
        { status: 400 }
      )
    }
    
    // Uložení poptávky do databáze
    const application = await prisma.brandApplication.create({
      data: {
        brandName: validatedData.brandName,
        email: validatedData.email,
        phone: validatedData.phone,
        description: validatedData.description,
        status: 'pending'
      }
    })
    
    // TODO: Odeslat notifikační email adminům
    
    return NextResponse.json(
      { 
        message: 'Poptávka byla úspěšně odeslána! Ozveme se vám do 24 hodin.',
        applicationId: application.id
      },
      { status: 201 }
    )
    
  } catch (error) {
    console.error('Chyba při zpracování poptávky značky:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Neplatné data formuláře', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Chyba serveru. Zkuste to prosím později.' },
      { status: 500 }
    )
  }
} 
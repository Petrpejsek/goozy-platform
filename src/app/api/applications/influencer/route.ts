import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

// Schéma pro validaci formuláře influencera
const influencerApplicationSchema = z.object({
  name: z.string().min(2, 'Jméno musí mít alespoň 2 znaky'),
  email: z.string().email('Neplatný email'),
  password: z.string().min(6, 'Heslo musí mít alespoň 6 znaků'),
  instagram: z.string().optional(),
  tiktok: z.string().optional(),
  youtube: z.string().optional(),
  followers: z.string().min(1, 'Vyberte počet followerů'),
  categories: z.array(z.string()).min(1, 'Vyberte alespoň jednu kategorii'),
  bio: z.string().optional(),
  collaborationTypes: z.array(z.string()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validace dat
    const validatedData = influencerApplicationSchema.parse(body)
    
    // Kontrola, jestli už není email v databázi
    const existingApplication = await prisma.influencerApplication.findFirst({
      where: { email: validatedData.email }
    })
    
    if (existingApplication) {
      return NextResponse.json(
        { error: 'S tímto emailem už byla podána přihláška' },
        { status: 400 }
      )
    }
    
    // Hashování hesla
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)
    
    // Uložení přihlášky do databáze
    const application = await prisma.influencerApplication.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        instagram: validatedData.instagram,
        tiktok: validatedData.tiktok,
        youtube: validatedData.youtube,
        followers: validatedData.followers,
        categories: JSON.stringify(validatedData.categories),
        bio: validatedData.bio,
        collaborationTypes: validatedData.collaborationTypes ? 
          JSON.stringify(validatedData.collaborationTypes) : null,
        status: 'pending'
      }
    })
    
    // TODO: Odeslat notifikační email adminům
    
    return NextResponse.json(
      { 
        message: 'Přihláška byla úspěšně odeslána! Ozveme se ti do 48 hodin.',
        applicationId: application.id
      },
      { status: 201 }
    )
    
  } catch (error) {
    console.error('Chyba při zpracování přihlášky influencera:', error)
    
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
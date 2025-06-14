import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateApplicationSchema = z.object({
  action: z.enum(['approve', 'reject']),
  notes: z.string().optional()
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { action, notes } = updateApplicationSchema.parse(body)
    
    // Najdeme poptávku
    const application = await prisma.brandApplication.findUnique({
      where: { id: params.id }
    })
    
    if (!application) {
      return NextResponse.json(
        { error: 'Poptávka nenalezena' },
        { status: 404 }
      )
    }
    
    // Aktualizujeme status
    const newStatus = action === 'approve' ? 'approved' : 'rejected'
    
    const updatedApplication = await prisma.brandApplication.update({
      where: { id: params.id },
      data: {
        status: newStatus,
        notes: notes
      }
    })
    
    // TODO: Pokud je schváleno, můžeme poslat email značce
    // TODO: Můžeme také vytvořit záznam v tabulce Brand
    
    return NextResponse.json({
      message: `Poptávka byla ${action === 'approve' ? 'schválena' : 'zamítnuta'}`,
      application: updatedApplication
    })
    
  } catch (error) {
    console.error('Chyba při aktualizaci poptávky:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Neplatné data', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Chyba serveru' },
      { status: 500 }
    )
  }
} 
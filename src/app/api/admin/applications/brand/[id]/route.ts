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
    
    // Find the application
    const resolvedParams = await params
    const application = await prisma.brandApplication.findUnique({ where: { id: resolvedParams.id } })
    
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }
    
    // Update status
    const newStatus = action === 'approve' ? 'approved' : 'rejected'
    
    const updatedApplication = await prisma.brandApplication.update({
      where: { id: params.id },
      data: {
        status: newStatus,
        notes: notes
      }
    })
    
    // TODO: If approved, we can send email to brand
    // TODO: We can also create a record in Brand table
    
    return NextResponse.json({
      message: `Application has been ${action === 'approve' ? 'approved' : 'rejected'}`,
      application: updatedApplication
    })
    
  } catch (error) {
    console.error('Error updating application:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
} 
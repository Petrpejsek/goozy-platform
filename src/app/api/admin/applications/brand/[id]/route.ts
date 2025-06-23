import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateApplicationSchema = z.object({
  action: z.enum(['approve', 'reject', 'add_notes']),
  notes: z.string().optional()
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { action, notes } = updateApplicationSchema.parse(body)
    
    // Resolve params first
    const resolvedParams = await params
    const applicationId = resolvedParams.id
    
    // Find the application
    const application = await prisma.brandApplication.findUnique({ 
      where: { id: applicationId } 
    })
    
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }
    
    let updateData: any = {}
    let message = ''
    
    if (action === 'add_notes') {
      // Just add notes without changing status
      updateData = {
        notes: notes || application.notes
      }
      message = 'Notes updated successfully'
    } else {
      // Update status and optionally notes
      const newStatus = action === 'approve' ? 'approved' : 'rejected'
      updateData = {
        status: newStatus,
        notes: notes || application.notes
      }
      message = `Application ${action === 'approve' ? 'approved' : 'rejected'} successfully`
    }
    
    const updatedApplication = await prisma.brandApplication.update({
      where: { id: applicationId },
      data: updateData
    })
    
    // TODO: If approved, we can send email to brand
    // TODO: We can also create a record in Brand table
    
    return NextResponse.json({
      message,
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Resolve params first
    const resolvedParams = await params
    const applicationId = resolvedParams.id
    
    // Check if the application exists
    const application = await prisma.brandApplication.findUnique({
      where: { id: applicationId }
    })
    
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }
    
    // Delete the application
    await prisma.brandApplication.delete({
      where: { id: applicationId }
    })
    
    return NextResponse.json({
      message: 'Application deleted successfully'
    })
    
  } catch (error) {
    console.error('Error deleting application:', error)
    
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
} 
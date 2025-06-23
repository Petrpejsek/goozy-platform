import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateApplicationSchema = z.object({
  action: z.enum(['approve', 'reject', 'add_notes', 'pending', 'approved', 'rejected']),
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
    const application = await prisma.influencerApplication.findUnique({ 
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
      // Add new note to history (stored as JSON array)
      if (!notes?.trim()) {
        return NextResponse.json(
          { error: 'Note content is required' },
          { status: 400 }
        )
      }
      
      let notesHistory = []
      try {
        // Parse existing notes if they exist
        if (application.notes) {
          const parsed = JSON.parse(application.notes)
          notesHistory = Array.isArray(parsed) ? parsed : [{ text: application.notes, timestamp: new Date(application.updatedAt).toISOString(), admin: 'admin' }]
        }
      } catch (error) {
        // If notes is not JSON, treat it as legacy single note
        if (application.notes) {
          notesHistory = [{ text: application.notes, timestamp: new Date(application.updatedAt).toISOString(), admin: 'admin' }]
        }
      }
      
      // Add new note to history
      notesHistory.unshift({
        text: notes.trim(),
        timestamp: new Date().toISOString(),
        admin: 'admin' // TODO: Use actual admin user when auth is implemented
      })
      
      updateData = {
        notes: JSON.stringify(notesHistory)
      }
      message = 'Note added successfully'
    } else if (action === 'approve' || action === 'reject') {
      // Legacy approve/reject actions
      const newStatus = action === 'approve' ? 'approved' : 'rejected'
      
      // Add status change note to history if notes provided
      let notesHistory = []
      try {
        if (application.notes) {
          const parsed = JSON.parse(application.notes)
          notesHistory = Array.isArray(parsed) ? parsed : [{ text: application.notes, timestamp: new Date(application.updatedAt).toISOString(), admin: 'admin' }]
        }
      } catch (error) {
        if (application.notes) {
          notesHistory = [{ text: application.notes, timestamp: new Date(application.updatedAt).toISOString(), admin: 'admin' }]
        }
      }
      
      // Add note about status change
      if (notes?.trim()) {
        notesHistory.unshift({
          text: `${action === 'approve' ? 'APPROVED' : 'REJECTED'}: ${notes.trim()}`,
          timestamp: new Date().toISOString(),
          admin: 'admin'
        })
      } else {
        notesHistory.unshift({
          text: `Application ${action === 'approve' ? 'approved' : 'rejected'}`,
          timestamp: new Date().toISOString(),
          admin: 'admin'
        })
      }
      
      updateData = {
        status: newStatus,
        notes: JSON.stringify(notesHistory)
      }
      message = `Application ${action === 'approve' ? 'approved' : 'rejected'} successfully`
    } else if (action === 'pending' || action === 'approved' || action === 'rejected') {
      // Direct status change
      let notesHistory = []
      try {
        if (application.notes) {
          const parsed = JSON.parse(application.notes)
          notesHistory = Array.isArray(parsed) ? parsed : [{ text: application.notes, timestamp: new Date(application.updatedAt).toISOString(), admin: 'admin' }]
        }
      } catch (error) {
        if (application.notes) {
          notesHistory = [{ text: application.notes, timestamp: new Date(application.updatedAt).toISOString(), admin: 'admin' }]
        }
      }
      
      // Add note about status change
      notesHistory.unshift({
        text: `Status changed to ${action}`,
        timestamp: new Date().toISOString(),
        admin: 'admin'
      })
      
      updateData = {
        status: action,
        notes: JSON.stringify(notesHistory)
      }
      message = `Application status changed to ${action} successfully`
    }
    
    const updatedApplication = await prisma.influencerApplication.update({
      where: { id: applicationId },
      data: updateData
    })
    
    // TODO: If approved, we can send email to influencer
    // TODO: We can also create a record in the Influencer table
    
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
    const application = await prisma.influencerApplication.findUnique({
      where: { id: applicationId }
    })
    
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }
    
    // Delete the application
    await prisma.influencerApplication.delete({
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
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params
    const prospectId = resolvedParams.id
    const body = await request.json()
    const { notes } = body
    
    // Najít prospect
    const prospect = await prisma.influencerProspect.findUnique({
      where: { id: prospectId }
    })
    
    if (!prospect) {
      return NextResponse.json({ error: 'Prospect not found' }, { status: 404 })
    }
    
    if (prospect.status !== 'pending') {
      return NextResponse.json({ error: 'Prospect already processed' }, { status: 400 })
    }
    
    // Označit prospect jako zamítnutý
    await prisma.influencerProspect.update({
      where: { id: prospectId },
      data: {
        status: 'rejected',
        notes: notes || 'Rejected by admin'
      }
    })
    
    return NextResponse.json({ 
      success: true,
      message: 'Prospect rejected successfully'
    })
    
  } catch (error) {
    console.error('Error rejecting prospect:', error)
    return NextResponse.json({ error: 'Failed to reject prospect' }, { status: 500 })
  }
} 
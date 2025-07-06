import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

// PATCH - Stop campaign (set end date to now and status to inactive)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Verify authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'No authorization token provided' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const secret = process.env.JWT_SECRET || 'fallback-secret-key'
    
    let influencerId: string
    try {
      const decoded = jwt.verify(token, secret) as { id?: string; influencerId?: string }
      // Support both field names for backward compatibility
      influencerId = decoded.id || decoded.influencerId || ''
      
      if (!influencerId) {
        console.error('❌ [STOP-CAMPAIGN] No influencer ID found in token')
        return NextResponse.json(
          { success: false, error: 'Invalid token - missing user ID' },
          { status: 401 }
        )
      }
      
      console.log('✅ [STOP-CAMPAIGN] Token authentication successful for:', decoded)
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Find campaign and verify ownership
    const campaign = await prisma.campaigns.findUnique({
      where: { id }
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Check if influencer owns this campaign
    if (campaign.influencerIds !== influencerId) {
      return NextResponse.json(
        { success: false, error: 'Access denied - not your campaign' },
        { status: 403 }
      )
    }

    // Check if campaign is currently active
    const now = new Date()
    const startDate = new Date(campaign.startDate)
    const endDate = new Date(campaign.endDate)
    
    if (now < startDate) {
      return NextResponse.json(
        { success: false, error: 'Cannot stop campaign that hasn\'t started yet' },
        { status: 400 }
      )
    }

    if (now > endDate) {
      return NextResponse.json(
        { success: false, error: 'Campaign has already ended' },
        { status: 400 }
      )
    }

    // Stop the campaign by setting end date to now and status to inactive
    const updatedCampaign = await prisma.campaigns.update({
      where: { id },
      data: {
        endDate: now,
        status: 'inactive',
        isActive: false,
        updatedAt: now
      }
    })

    console.log('✅ Campaign stopped successfully:', id)

    return NextResponse.json({
      success: true,
      campaign: {
        id: updatedCampaign.id,
        status: updatedCampaign.status,
        endDate: updatedCampaign.endDate.toISOString(),
        isActive: updatedCampaign.isActive
      }
    })

  } catch (error) {
    console.error('❌ Error stopping campaign:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to stop campaign' },
      { status: 500 }
    )
  }
} 
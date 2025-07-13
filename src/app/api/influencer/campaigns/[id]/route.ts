import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

// GET - Get single campaign details
export async function GET(
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
    
    console.log('🔍 [DEBUG-JWT] Token received:', token ? 'Present' : 'Missing')
    console.log('🔍 [DEBUG-JWT] Secret being used:', secret ? 'Present' : 'Missing')
    
    let influencerId: string
    try {
      const decoded = jwt.verify(token, secret) as { id: string, influencerId?: string, userId?: string, type: string }
      console.log('🔍 [DEBUG-JWT] Decoded token:', decoded)
      console.log('🔍 [DEBUG-JWT] Available keys in decoded:', Object.keys(decoded))
      
      // Support multiple possible field names for backward compatibility
      influencerId = (decoded.id || decoded.influencerId || decoded.userId) as string
      console.log('🔍 [DEBUG-JWT] Extracted influencerId:', influencerId)
      
      if (!influencerId || decoded.type !== 'influencer') {
        throw new Error('Invalid token structure')
      }
    } catch (error) {
      console.log('❌ [DEBUG-JWT] JWT verification failed:', error)
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Find campaign and verify ownership
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        brands: {
          select: {
            id: true,
            name: true,
            logo: true
          }
        }
      }
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Check if influencer owns this campaign
    console.log('🔍 [DEBUG] Checking campaign ownership:')
    console.log('  Campaign influencerIds:', campaign.influencerIds, typeof campaign.influencerIds)
    console.log('  Current influencerId:', influencerId, typeof influencerId)
    console.log('  Are they equal?:', campaign.influencerIds === influencerId)
    
    if (campaign.influencerIds !== influencerId) {
      console.log('❌ [DEBUG] Ownership check failed!')
      return NextResponse.json(
        { success: false, error: 'Access denied - not your campaign' },
        { status: 403 }
      )
    }

    console.log('✅ Campaign data retrieved:', id)

    return NextResponse.json({
      success: true,
      campaign: {
        id: campaign.id,
        name: campaign.name,
        description: campaign.description,
        startDate: campaign.startDate.toISOString(),
        endDate: campaign.endDate.toISOString(),
        status: campaign.status,
        isActive: campaign.isActive,
        slug: campaign.slug,
        brand: campaign.brands,
        expectedReach: campaign.expectedReach,
        budgetAllocated: campaign.budgetAllocated,
        currency: campaign.currency,
        createdAt: campaign.createdAt.toISOString(),
        updatedAt: campaign.updatedAt.toISOString()
      }
    })

  } catch (error) {
    console.error('❌ Error getting campaign:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get campaign' },
      { status: 500 }
    )
  }
}

// DELETE - Delete campaign (only if not active)
export async function DELETE(
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
        console.error('❌ [DELETE-CAMPAIGN] No influencer ID found in token')
        return NextResponse.json(
          { success: false, error: 'Invalid token - missing user ID' },
          { status: 401 }
        )
      }
      
      console.log('✅ [DELETE-CAMPAIGN] Token authentication successful for:', decoded)
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Find campaign and verify ownership
    const campaign = await prisma.campaign.findUnique({
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

    // Check if campaign is currently active - cannot delete active campaigns
    const now = new Date()
    const startDate = new Date(campaign.startDate)
    const endDate = new Date(campaign.endDate)
    
    if (now >= startDate && now <= endDate && campaign.isActive) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete active campaign. Please stop it first.' },
        { status: 400 }
      )
    }

    // Delete related data first (influencerProduct, commissions, etc.)
    // Delete influencer-product relationships for this campaign
    await prisma.influencerproducts.deleteMany({
      where: {
        influencerId: influencerId
        // Note: We might need a campaignId field in future for better filtering
      }
    })

    // Delete the campaign
    await prisma.campaign.delete({
      where: { id }
    })

    console.log('✅ Campaign deleted successfully:', id)

    return NextResponse.json({
      success: true,
      message: 'Campaign deleted successfully'
    })

  } catch (error) {
    console.error('❌ Error deleting campaign:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete campaign' },
      { status: 500 }
    )
  }
} 
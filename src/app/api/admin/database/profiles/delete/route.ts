import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: NextRequest) {
  try {
    const { profileIds } = await request.json()
    
    if (!profileIds || !Array.isArray(profileIds) || profileIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No profile IDs provided' },
        { status: 400 }
      )
    }

    // Delete profiles from database
    const deleteResult = await prisma.influencerDatabase.deleteMany({
      where: {
        id: {
          in: profileIds
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deleteResult.count} profiles`,
      deletedCount: deleteResult.count
    })

  } catch (error) {
    console.error('Error deleting profiles:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 
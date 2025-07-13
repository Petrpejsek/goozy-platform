import { NextResponse } from 'next/server'
import { verifyBrandAuth } from '@/lib/auth'

export async function GET() {
  try {
    console.log('🔍 [BRAND-VERIFY] Verifying authentication...')
    
    const user = await verifyBrandAuth()
    
    if (!user) {
      console.log('❌ [BRAND-VERIFY] No valid authentication found')
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    console.log(`✅ [BRAND-VERIFY] Authentication verified for: ${user.email} (${user.brandName})`)
    
    return NextResponse.json({ 
      success: true, 
      user: {
        brandId: user.brandId,
        email: user.email,
        brandName: user.brandName
      },
    })
    
  } catch (error) {
    console.error('❌ [BRAND-VERIFY] Verification error:', error)
    return NextResponse.json({ error: 'Authentication verification failed' }, { status: 500 })
  }
} 
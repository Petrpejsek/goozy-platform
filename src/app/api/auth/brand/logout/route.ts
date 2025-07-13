import { NextResponse } from 'next/server'

export async function POST() {
  try {
    console.log('🚪 [BRAND-LOGOUT] Processing logout request')
    
    // Vytvořit response s úspěšným statusem
    const response = NextResponse.json({ 
      success: true, 
      message: 'Successfully logged out' 
    })

    // Smazat authentication cookie
    // Nastavím cookie na prázdnou hodnotu a expirace v minulosti
    response.cookies.set('brand-auth', '', {
      httpOnly: true
      secure: process.env.NODE_ENV === 'production'
      sameSite: 'lax'
      path: '/'
      expires: new Date(0) // Expirace v minulosti = smazání
    })

    console.log('✅ [BRAND-LOGOUT] Authentication cookie cleared successfully')
    
    return response
    
  } catch (error) {
    console.error('❌ [BRAND-LOGOUT] Logout error:', error)
    
    // I v případě chyby je dobré vymazat cookies
    const response = NextResponse.json(
      { success: false, error: 'Logout failed' }
      { status: 500 }
    )
    
    // Pokusit se smazat cookie i při chybě
    response.cookies.set('brand-auth', '', {
      httpOnly: true
      secure: process.env.NODE_ENV === 'production'
      sameSite: 'lax'
      path: '/'
      expires: new Date(0)
    })
    
    return response
  }
} 
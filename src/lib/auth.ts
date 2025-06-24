import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

export interface BrandUser {
  brandId: string
  email: string
  brandName: string
}

// Ověří JWT token z cookies a vrátí user data
export async function verifyBrandAuth(): Promise<BrandUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('brand-auth')?.value

    if (!token) {
      return null
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key') as any
    
    return {
      brandId: decoded.brandId,
      email: decoded.email,
      brandName: decoded.brandName
    }
  } catch (error) {
    console.error('❌ [AUTH] Token verification failed:', error)
    return null
  }
}

// Ověří, jestli je uživatel přihlášený, pokud ne, vrátí redirect response
export async function requireBrandAuth() {
  const user = await verifyBrandAuth()
  
  if (!user) {
    return {
      redirect: {
        destination: '/brand/login',
        permanent: false,
      },
    }
  }
  
  return { user }
} 
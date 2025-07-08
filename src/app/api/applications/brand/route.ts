import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

// Schema for brand form validation
const brandApplicationSchema = z.object({
  contactName: z.string().min(1, 'Contact name is required'),
  brandName: z.string().min(2, 'Company name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  website: z.string().min(1, 'Website is required').refine((url) => {
    // Povoluje URL s HTTP/HTTPS, www. alebo len domain názov
    const urlPattern = /^(https?:\/\/)?(www\.)?[\w\-.]+(\.[\w]{2,})(\/.*)?$/;
    return urlPattern.test(url);
  }, 'Invalid website URL'),
  phone: z.string().optional(),
  description: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Data validation
    const validatedData = brandApplicationSchema.parse(body)
    
    // Check if email already exists in database
    const existingApplication = await prisma.brand_applications.findFirst({
      where: { email: validatedData.email }
    })
    
    if (existingApplication) {
      return NextResponse.json(
        { error: 'An application with this email has already been submitted' },
        { status: 400 }
      )
    }
    
    // Hash the password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(validatedData.password, saltRounds)
    
    // Save application to database
    const application = await prisma.brand_applications.create({
      data: {
        id: Date.now().toString() + Math.random().toString(),
        contactName: validatedData.contactName,
        brandName: validatedData.brandName,
        email: validatedData.email,
        password: hashedPassword,
        website: validatedData.website,
        phone: validatedData.phone,
        description: validatedData.description,
        status: 'pending',
        updatedAt: new Date(),
      }
    })
    
    console.log(`✅ [BRAND-APPLICATION] New application from ${validatedData.email} (${validatedData.brandName})`)
    
    // TODO: Send notification email to admins
    
    return NextResponse.json(
      { 
        message: 'Application submitted successfully! We will contact you within 48 hours.',
        applicationId: application.id
      },
      { status: 201 }
    )
    
  } catch (error) {
    console.error('❌ [BRAND-APPLICATION] Failed to process application:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid form data', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal Server Error. Please try again later.' },
      { status: 500 }
    )
  }
} 
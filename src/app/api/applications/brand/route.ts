import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema for brand form validation
const brandApplicationSchema = z.object({
  brandName: z.string().min(2, 'Brand name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Data validation
    const validatedData = brandApplicationSchema.parse(body)
    
    // Check if email already exists in database
    const existingApplication = await prisma.brandApplication.findFirst({
      where: { email: validatedData.email }
    })
    
    if (existingApplication) {
      return NextResponse.json(
        { error: 'An application with this email has already been submitted' },
        { status: 400 }
      )
    }
    
    // Save application to database
    const application = await prisma.brandApplication.create({
      data: {
        brandName: validatedData.brandName,
        email: validatedData.email,
        phone: validatedData.phone,
        description: validatedData.description,
        status: 'pending'
      }
    })
    
    // TODO: Send notification email to admins
    
    return NextResponse.json(
      { 
        message: 'Application submitted successfully! We will contact you within 24 hours.',
        applicationId: application.id
      },
      { status: 201 }
    )
    
  } catch (error) {
    console.error('Failed to process brand application:', error)
    
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
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

// Schema for influencer form validation
const influencerApplicationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  instagram: z.string().optional(),
  tiktok: z.string().optional(),
  youtube: z.string().optional(),
  followers: z.string().min(1, 'Please select follower count'),
  categories: z.array(z.string()).min(1, 'Please select at least one category'),
  bio: z.string().optional(),
  collaborationTypes: z.array(z.string()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Data validation
    const validatedData = influencerApplicationSchema.parse(body)
    
    // Check if email already exists in database
    const existingApplication = await prisma.influencerApplication.findFirst({
      where: { email: validatedData.email }
    })
    
    if (existingApplication) {
      return NextResponse.json(
        { error: 'An application with this email already exists.' },
        { status: 409 }
      )
    }
    
    // Password hashing
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)
    
    // Save application to database
    const application = await prisma.influencerApplication.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        instagram: validatedData.instagram,
        tiktok: validatedData.tiktok,
        youtube: validatedData.youtube,
        followers: validatedData.followers,
        categories: JSON.stringify(validatedData.categories),
        bio: validatedData.bio,
        collaborationTypes: validatedData.collaborationTypes ? 
          JSON.stringify(validatedData.collaborationTypes) : null,
        status: 'pending'
      }
    })
    
    // TODO: Send notification email to admins
    
    return NextResponse.json(
      { 
        message: 'Application submitted successfully! We will review it and get back to you soon.',
        applicationId: application.id
      },
      { status: 201 }
    )
    
  } catch (error) {
    console.error('Failed to create influencer application:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid form data', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 
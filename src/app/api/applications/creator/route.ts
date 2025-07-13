import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

// Utility function to find possible duplicates across all layers
async function findPossibleDuplicates(applicationData: any) {
  console.log('🔍 findPossibleDuplicates called with:', JSON.stringify(applicationData, null, 2))
  const duplicates = []
  
  // Build search conditions for social media platforms
  const searchConditions = []
  
  if (applicationData.instagram) {
    const instagramUsername = applicationData.instagram.replace(/[@\/]/g, '').toLowerCase()
    console.log('📱 Instagram search for:', instagramUsername)
    searchConditions.push(
      { instagramUsername: instagramUsername }
      { instagramUrl: { contains: instagramUsername } }
    )
  }
  
  if (applicationData.tiktok) {
    const tiktokUsername = applicationData.tiktok.replace(/[@\/]/g, '').toLowerCase()
    searchConditions.push(
      { tiktokUsername: tiktokUsername }
      { tiktokUrl: { contains: tiktokUsername } }
    )
  }
  
  if (applicationData.youtube) {
    const youtubeChannel = applicationData.youtube.toLowerCase()
    searchConditions.push(
      { youtubeChannel: { contains: youtubeChannel } }
      { youtubeUrl: { contains: youtubeChannel } }
    )
  }
  
  if (applicationData.email) {
    searchConditions.push({ email: applicationData.email })
  }
  
  // Search in InfluencerDatabase (Layer 1)
  console.log('🔍 Search conditions:', JSON.stringify(searchConditions, null, 2))
  if (searchConditions.length > 0) {
    console.log('🗄️  Searching in InfluencerDatabase...')
    const databaseMatches = await prisma.influencerDatabase.findMany({
      where: { OR: searchConditions }
      select: {
        id: true
        name: true
        instagramUsername: true
        email: true
        totalFollowers: true
        country: true
      }
    })
    console.log('📊 InfluencerDatabase matches:', databaseMatches.length, databaseMatches)
    
    duplicates.push(...databaseMatches.map(match => ({
      id: match.id
      type: 'database'
      name: match.name
      platform: match.instagramUsername ? 'Instagram' : 'Unknown'
      username: match.instagramUsername
      email: match.email
      followers: match.totalFollowers
      country: match.country
    })))
  }
  
  // Search in InfluencerProspect (Layer 2)
  if (searchConditions.length > 0) {
    const prospectMatches = await prisma.influencerProspect.findMany({
      where: { OR: searchConditions }
      select: {
        id: true
        name: true
        instagramUsername: true
        email: true
        totalFollowers: true
        country: true
        status: true
      }
    })
    
    duplicates.push(...prospectMatches.map(match => ({
      id: match.id
      type: 'prospect'
      name: match.name
      platform: match.instagramUsername ? 'Instagram' : 'Unknown'
      username: match.instagramUsername
      email: match.email
      followers: match.totalFollowers
      country: match.country
      status: match.status
    })))
  }
  
  // Search in existing InfluencerApplication (Layer 3)
  if (searchConditions.length > 0) {
    const applicationMatches = await prisma.influencerApplication.findMany({
      where: { 
        OR: [
          { email: applicationData.email }
          { instagram: applicationData.instagram }
          { tiktok: applicationData.tiktok }
          { youtube: applicationData.youtube }
          { facebook: applicationData.facebook }
        ].filter(condition => Object.values(condition)[0]) // Filter out empty conditions
      }
      select: {
        id: true
        name: true
        email: true
        instagram: true
        status: true
        createdAt: true
      }
    })
    
    duplicates.push(...applicationMatches.map(match => ({
      id: match.id
      type: 'application'
      name: match.name
      platform: match.instagram ? 'Instagram' : 'Unknown'
      username: match.instagram
      email: match.email
      status: match.status
      createdAt: match.createdAt
    })))
  }
  
  return duplicates
}

// Schema for creator form validation
const creatorApplicationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters')
  email: z.string().email('Invalid email')
  password: z.string().min(6, 'Password must be at least 6 characters')
  instagram: z.string().optional()
  tiktok: z.string().optional()
  youtube: z.string().optional()
  facebook: z.string().optional()
  categories: z.array(z.string()).min(1, 'Please select at least one category')
  bio: z.string().optional()
  collaborationTypes: z.array(z.string()).optional()
})
.refine((data) => {
  return data.instagram || data.tiktok || data.youtube || data.facebook;
}, {
  message: "Please provide at least one social media profile"
  path: ["socialMedia"]
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🔍 Received data:', JSON.stringify(body, null, 2))
    
    // Data validation
    const validatedData = creatorApplicationSchema.parse(body)
    console.log('✅ Validation passed:', JSON.stringify(validatedData, null, 2))
    
    // Check if email already exists in database
    const existingApplication = await prisma.influencerApplication.findFirst({
      where: { email: validatedData.email }
    })
    
    if (existingApplication) {
      return NextResponse.json(
        { error: 'An application with this email already exists.' }
        { status: 409 }
      )
    }
    
    // Password hashing
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)
    
    // Save application to database
    const application = await prisma.influencerApplication.create({
      data: {
        id: crypto.randomUUID()
        name: validatedData.name
        email: validatedData.email
        password: hashedPassword
        instagram: validatedData.instagram || ''
        tiktok: validatedData.tiktok || ''
        youtube: validatedData.youtube || ''
        facebook: validatedData.facebook || ''
        categories: JSON.stringify(validatedData.categories)
        bio: validatedData.bio || ''
        collaborationTypes: validatedData.collaborationTypes ? 
          JSON.stringify(validatedData.collaborationTypes) : null
        status: 'pending'
        createdAt: new Date()
        updatedAt: new Date()
      }
    })
    
    // STEP 2: Detect possible duplicates after creation (safe approach)
    console.log('🔍 Checking for possible duplicates...')
    try {
      const duplicates = await findPossibleDuplicates(validatedData)
      
      if (duplicates.length > 0) {
        console.log(`⚠️  Found ${duplicates.length} possible duplicates:`, duplicates)
        
        // Update application with duplicate detection results
        await prisma.influencerApplication.update({
          where: { id: application.id }
          data: {
            possibleDuplicateIds: JSON.stringify(duplicates.map(d => d.id))
            mergeStatus: 'detected'
            mergeData: JSON.stringify({
              detectedAt: new Date().toISOString()
              duplicates: duplicates
              autoDetected: true
            })
          }
        })
        
        console.log('✅ Duplicate detection completed and saved')
      } else {
        console.log('✅ No duplicates found')
      }
    } catch (duplicateError) {
      console.error('❌ Error during duplicate detection:', duplicateError)
      // Continue without failing the application - duplicate detection is not critical
    }
    
    // TODO: Send notification email to admins
    
    return NextResponse.json(
      { 
        message: 'Application submitted successfully! We will review it and get back to you soon.'
        applicationId: application.id
      }
      { status: 201 }
    )
    
  } catch (error) {
    console.error('❌ Failed to create creator application:', error)
    
    if (error instanceof z.ZodError) {
      console.error('📋 Validation errors:', error.errors)
      return NextResponse.json(
        { error: 'Invalid form data', details: error.errors }
        { status: 400 }
      )
    }
    
    console.error('💥 Unexpected error type:', typeof error)
    console.error('💥 Error details:', error)
    
    return NextResponse.json(
      { error: 'Internal Server Error', debug: process.env.NODE_ENV === 'development' ? String(error) : undefined }
      { status: 500 }
    )
  }
} 
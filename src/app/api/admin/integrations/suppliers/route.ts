import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { supplier, apiConnection } = body

    // Validace povinných polí
    if (!supplier.name || !supplier.email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    if (!apiConnection.connectionName || !apiConnection.baseUrl) {
      return NextResponse.json(
        { error: 'Connection name and base URL are required' },
        { status: 400 }
      )
    }

    // Kontrola autentifikace podle metody
    if (apiConnection.authMethod === 'api_key' && !apiConnection.apiKey) {
      return NextResponse.json(
        { error: 'API key is required for API key authentication' },
        { status: 400 }
      )
    }

    if (apiConnection.authMethod === 'basic_auth' && (!apiConnection.username || !apiConnection.password)) {
      return NextResponse.json(
        { error: 'Username and password are required for basic authentication' },
        { status: 400 }
      )
    }

    if (apiConnection.authMethod === 'oauth2' && (!apiConnection.apiKey || !apiConnection.apiSecret)) {
      return NextResponse.json(
        { error: 'Client ID and Client Secret are required for OAuth2' },
        { status: 400 }
      )
    }

    // Najít první aktivní brand (pro demo účely)
    // V reálné aplikaci by se brand vybíral nebo předával z formuláře
    const firstBrand = await prisma.brand.findFirst({
      where: { isActive: true }
    })

    if (!firstBrand) {
      return NextResponse.json(
        { error: 'No active brand found. Please create a brand first.' },
        { status: 400 }
      )
    }

    // Vytvoření dodavatele a API připojení v transakci
    const result = await prisma.$transaction(async (tx) => {
      // Vytvoření dodavatele
      const newSupplier = await tx.supplier.create({
        data: {
          brandId: firstBrand.id,
          name: supplier.name,
          email: supplier.email,
          phone: supplier.phone || null,
          website: supplier.website || null,
          description: supplier.description || null,
          isActive: true,
        }
      })

      // Příprava konfigurace API připojení
      const apiConfig: any = {
        baseUrl: apiConnection.baseUrl,
        authMethod: apiConnection.authMethod,
        capabilities: apiConnection.capabilities,
        syncFrequency: apiConnection.syncFrequency,
        timeout: 30000, // 30 sekund default timeout
        retryAttempts: 3,
        retryDelay: 1000,
      }

      // Přidání autentifikačních údajů podle metody
      if (apiConnection.authMethod === 'api_key') {
        apiConfig.apiKey = apiConnection.apiKey
      } else if (apiConnection.authMethod === 'bearer_token') {
        apiConfig.apiKey = apiConnection.apiKey
      } else if (apiConnection.authMethod === 'basic_auth') {
        apiConfig.username = apiConnection.username
        apiConfig.password = apiConnection.password
      } else if (apiConnection.authMethod === 'oauth2') {
        apiConfig.clientId = apiConnection.apiKey
        apiConfig.clientSecret = apiConnection.apiSecret
      }

      // Vytvoření API připojení
      const newApiConnection = await tx.supplierApiConnection.create({
        data: {
          supplierId: newSupplier.id,
          connectionName: apiConnection.connectionName,
          isActive: apiConnection.isActive,
          configuration: apiConfig,
          lastTestStatus: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      })

      return { supplier: newSupplier, apiConnection: newApiConnection }
    })

    // Zalogování úspěšného vytvoření
    await prisma.apiNotification.create({
      data: {
        supplierId: result.supplier.id,
        type: 'info',
        title: 'New Supplier Created',
        message: `Supplier "${result.supplier.name}" has been created with API connection "${result.apiConnection.connectionName}".`,
        isRead: false,
      }
    })

    return NextResponse.json({
      success: true,
      supplier: result.supplier,
      apiConnection: {
        id: result.apiConnection.id,
        connectionName: result.apiConnection.connectionName,
        isActive: result.apiConnection.isActive,
      }
    })

  } catch (error) {
    console.error('Error creating supplier:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const suppliers = await prisma.supplier.findMany({
      include: {
        brand: {
          select: { name: true }
        },
        apiConnections: {
          select: {
            id: true,
            connectionName: true,
            isActive: true,
            lastTestStatus: true,
            lastTestAt: true
          }
        },
        _count: {
          select: {
            inventoryLogs: true,
            orderSubmissions: true,
            apiNotifications: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ suppliers })
  } catch (error) {
    console.error('Error fetching suppliers:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
 
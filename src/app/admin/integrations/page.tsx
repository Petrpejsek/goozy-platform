import { prisma } from '@/lib/prisma'
import Link from 'next/link'

interface SearchParams {
  brand?: string
  status?: string
  search?: string
}

export default async function AdminIntegrationsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const { brand, status, search } = params

  // Statistiky
  const [
    totalSuppliers,
    activeConnections,
    failedConnections,
    totalNotifications,
    unreadNotifications,
    recentLogs
  ] = await Promise.all([
    // Celkový počet dodavatelů
    prisma.suppliers.count(),
    
    // Aktivní připojení
    prisma.supplier_api_connections.count({
      where: { 
        isActive: true,
        lastTestStatus: 'success'
      }
    }),
    
    // Neúspěšná připojení
    prisma.supplier_api_connections.count({
      where: { 
        OR: [
          { lastTestStatus: 'failed' },
          { lastTestStatus: 'timeout' }
        ]
      }
    }),
    
    // Celkový počet notifikací
    prisma.api_notifications.count(),
    
    // Nepřečtené notifikace
    prisma.api_notifications.count({
      where: { isRead: false }
    }),
    
    // Poslední logy synchronizace
    prisma.inventory_logs.findMany({
      take: 5,
      orderBy: { startedAt: 'desc' },
      include: {
        suppliers: {
          select: { name: true }
        },
        supplier_api_connections: {
          select: { connectionName: true }
        }
      }
    })
  ])

  // Dodavatelé s filtry
  const whereClause: any = {}
  
  if (brand) {
    whereClause.brandId = brand
  }
  
  if (search) {
    whereClause.OR = [
      { name: { contains: search } },
      { email: { contains: search } }
    ]
  }

  const suppliers = await prisma.suppliers.findMany({
    where: whereClause,
          include: {
        brands: {
          select: { name: true }
        },
        supplier_api_connections: {
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
            inventory_logs: true,
            order_submissions: true,
            api_notifications: true
          }
        }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Značky pro filtr
      const brands = await prisma.brands.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🔗 API Integrations</h1>
          <p className="text-gray-600 mt-2">
            Centrální správa všech API připojení a synchronizace s dodavateli
          </p>
        </div>
        <Link
          href="/admin/integrations/suppliers/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          ➕ Add Supplier
        </Link>
      </div>

      {/* Statistické karty */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">🏢</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Suppliers</p>
              <p className="text-2xl font-bold text-gray-900">{totalSuppliers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Connections</p>
              <p className="text-2xl font-bold text-green-600">{activeConnections}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <span className="text-2xl">❌</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Failed Connections</p>
              <p className="text-2xl font-bold text-red-600">{failedConnections}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-2xl">🔔</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Notifications</p>
              <p className="text-2xl font-bold text-gray-900">
                {unreadNotifications}/{totalNotifications}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">⚡</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Recent Syncs</p>
              <p className="text-2xl font-bold text-gray-900">{recentLogs.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtry */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Suppliers
            </label>
            <input
              type="text"
              placeholder="Name or email..."
              defaultValue={search}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand
            </label>
            <select
              defaultValue={brand}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Brands</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Connection Status
            </label>
            <select
              defaultValue={status}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="failed">Failed</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabulka dodavatelů */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Suppliers & Connections</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Brand
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Connections
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {suppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {supplier.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {supplier.email}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {supplier.brand.name}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {supplier.apiConnections.map((conn) => (
                        <div key={conn.id} className="flex items-center space-x-2">
                          <span className="text-sm text-gray-900">
                            {conn.connectionName}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            conn.lastTestStatus === 'success' 
                              ? 'bg-green-100 text-green-800'
                              : conn.lastTestStatus === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {conn.lastTestStatus || 'unknown'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      supplier.isActive 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {supplier.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="space-y-1">
                      <div>📊 {supplier._count.inventoryLogs} syncs</div>
                      <div>📦 {supplier._count.orderSubmissions} orders</div>
                      <div>🔔 {supplier._count.apiNotifications} alerts</div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Link
                      href={`/admin/integrations/suppliers/${supplier.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </Link>
                    <Link
                      href={`/admin/integrations/suppliers/${supplier.id}/edit`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Sync Activity</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <span className={`text-2xl ${
                    log.status === 'success' ? '✅' : 
                    log.status === 'failed' ? '❌' : '⏳'
                  }`}>
                  </span>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {log.supplier.name} - {log.connection.connectionName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {log.syncType} sync • {log.productsChecked} products checked • {log.productsUpdated} updated
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(log.startedAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 
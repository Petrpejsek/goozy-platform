'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Campaign {
  id: string
  name: string
  description?: string
  startDate: string
  endDate: string
  status: string
  brand: {
    id: string
    name: string
    logo?: string
  }
  expectedReach?: number
  budgetAllocated?: number
  currency: string
  influencerIds: string
  targetCountries: string
  createdAt: string
  updatedAt: string
}

interface CampaignStats {
  total: number
  active: number
  draft: number
  completed: number
  totalBudget: number
  totalReach: number
}

export default function AdminCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [stats, setStats] = useState<CampaignStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    loadCampaigns()
  }, [])

  const loadCampaigns = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/campaigns')
      const result = await response.json()

      if (result.success) {
        setCampaigns(result.campaigns)
        setStats(result.stats)
        console.log('📊 Admin: Loaded campaigns:', result.campaigns)
      } else {
        console.error('❌ Failed to load campaigns:', result.error)
      }
    } catch (error) {
      console.error('❌ Error loading campaigns:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateCampaignStatus = async (campaignId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/campaigns', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId,
          status: newStatus
        })
      })

      const result = await response.json()

      if (result.success) {
        // Update local state
        setCampaigns(prev => prev.map(campaign => 
          campaign.id === campaignId 
            ? { ...campaign, status: newStatus }
            : campaign
        ))
        console.log('✅ Campaign status updated:', result.campaign)
      } else {
        console.error('❌ Failed to update campaign:', result.error)
      }
    } catch (error) {
      console.error('❌ Error updating campaign:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'paused':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCampaignStatus = (campaign: Campaign) => {
    const now = new Date()
    const start = new Date(campaign.startDate)
    const end = new Date(campaign.endDate)

    if (campaign.status === 'draft') return 'draft'
    if (campaign.status === 'paused') return 'paused'
    if (now < start) return 'scheduled'
    if (now > end) return 'completed'
    return 'active'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const filteredCampaigns = campaigns.filter(campaign => {
    if (filter === 'all') return true
    return getCampaignStatus(campaign) === filter
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Načítání kampaní...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Správa kampaní</h1>
            <p className="text-gray-600 mt-1">Přehled všech kampaní influencerů</p>
          </div>
          
          <Link
            href="/admin"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Zpět na hlavní panel
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Celkem kampaní</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Aktivní kampaně</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Celkový dosah</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalReach.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Celkový rozpočet</p>
                <p className="text-2xl font-bold text-gray-900">€{stats.totalBudget.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Filtr:</span>
          
          {['all', 'active', 'scheduled', 'completed', 'draft'].map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === filterOption
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filterOption === 'all' ? 'Všechny' : 
               filterOption === 'active' ? 'Aktivní' :
               filterOption === 'scheduled' ? 'Naplánované' :
               filterOption === 'completed' ? 'Dokončené' : 'Koncepty'}
            </button>
          ))}
        </div>
      </div>

      {/* Campaigns List */}
      {filteredCampaigns.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Žádné kampaně</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {filter === 'all' ? 
              'Zatím nebyly vytvořeny žádné kampaně.' :
              `Žádné kampaně v kategorii "${filter}".`
            }
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">
              Kampaně ({filteredCampaigns.length})
            </h3>
          </div>
          
          <div className="divide-y divide-gray-100">
            {filteredCampaigns.map((campaign) => {
              const status = getCampaignStatus(campaign)
              return (
                <div key={campaign.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-medium text-gray-900">{campaign.name}</h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                          {status === 'active' ? 'Aktivní' :
                           status === 'scheduled' ? 'Naplánované' :
                           status === 'completed' ? 'Dokončené' :
                           status === 'draft' ? 'Koncept' : status}
                        </span>
                      </div>
                      
                      {campaign.description && (
                        <p className="text-sm text-gray-600 mb-3">{campaign.description}</p>
                      )}
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                        </span>
                        
                        {campaign.expectedReach && (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            {campaign.expectedReach.toLocaleString()} dosah
                          </span>
                        )}
                        
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          {campaign.brand.name}
                        </span>

                        {campaign.budgetAllocated && (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                            €{campaign.budgetAllocated.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {/* Status Update Dropdown */}
                      <select
                        value={campaign.status}
                        onChange={(e) => updateCampaignStatus(campaign.id, e.target.value)}
                        className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="draft">Koncept</option>
                        <option value="active">Aktivní</option>
                        <option value="paused">Pozastaveno</option>
                        <option value="completed">Dokončeno</option>
                      </select>
                      
                      <button
                        onClick={() => setSelectedCampaign(campaign)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Detail
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Campaign Details Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Detail kampaně</h3>
              <button
                onClick={() => setSelectedCampaign(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Název kampaně</label>
                <p className="mt-1 text-sm text-gray-900">{selectedCampaign.name}</p>
              </div>
              
              {selectedCampaign.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Popis</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedCampaign.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Začátek</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(selectedCampaign.startDate)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Konec</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(selectedCampaign.endDate)}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Partnerská značka</label>
                <p className="mt-1 text-sm text-gray-900">{selectedCampaign.brand.name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">ID kampaně</label>
                <p className="mt-1 text-sm text-gray-900 font-mono">{selectedCampaign.id}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Influencer ID</label>
                <p className="mt-1 text-sm text-gray-900 font-mono">{selectedCampaign.influencerIds}</p>
              </div>
              
              {selectedCampaign.expectedReach && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Očekávaný dosah</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedCampaign.expectedReach.toLocaleString()} lidí</p>
                </div>
              )}
              
              {selectedCampaign.budgetAllocated && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rozpočet</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedCampaign.budgetAllocated.toLocaleString()} {selectedCampaign.currency}</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(getCampaignStatus(selectedCampaign))}`}>
                  {getCampaignStatus(selectedCampaign) === 'active' ? 'Aktivní' :
                   getCampaignStatus(selectedCampaign) === 'scheduled' ? 'Naplánované' :
                   getCampaignStatus(selectedCampaign) === 'completed' ? 'Dokončené' :
                   getCampaignStatus(selectedCampaign) === 'draft' ? 'Koncept' : getCampaignStatus(selectedCampaign)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Vytvořeno</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(selectedCampaign.createdAt)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Aktualizováno</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(selectedCampaign.updatedAt)}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedCampaign(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Zavřít
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 
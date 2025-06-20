'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useCountryData } from '@/hooks/useCountryData'

interface CountryDetail {
  country: string
  countryName: string
  flag: string
  totalProfiles: number
  categories: {
    fashion: number
    beauty: number
    lifestyle: number
    fitness: number
    food: number
    travel: number
    parenting: number
    photography: number
  }
  geographicDistribution: {
    [city: string]: number
  }
  qualityMetrics: {
    active: number
    inactive: number
    avgFollowers: number
    avgEngagement: number
  }
  discoveryMethods: {
    googleSearch: number
    hashtags: number
    manual: number
    import: number
  }
  lastUpdate: string
  recentProfiles: Array<{
    id: string
    username: string
    displayName: string
    followers: number
    category: string
    isActive: boolean
    createdAt: string
  }>
}

interface CategoryCounts {
  all: number
  successfullyDownloaded: number
  failedDownload: number
}

export default function CountryDetailPage() {
  const params = useParams()
  const country = params.country as string
  
  const { 
    data, 
    loading, 
    error, 
    forceRefresh, 
    checkForUpdates,
    profiles,
    totalProfiles,
    isStale 
  } = useCountryData(country)
  
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([])
  const [isDeleting, setIsDeleting] = useState(false)
  const [categoryProfiles, setCategoryProfiles] = useState<any>(null)
  const [loadingCategoryProfiles, setLoadingCategoryProfiles] = useState(false)
  const [categoryCounts, setCategoryCounts] = useState<CategoryCounts>({
    all: 0,
    successfullyDownloaded: 0,
    failedDownload: 0
  })

  // Funkce pro refresh dat po smazání profilů
  const refreshAfterDelete = async () => {
    await forceRefresh()
    await loadCategoryCounts() // Refresh counts after delete
  }

  // Funkce pro načtení počtů podle kategorií
  const loadCategoryCounts = async () => {
    try {
      const [allResponse, successResponse, failedResponse] = await Promise.all([
        fetch(`/api/admin/database/${country}/profiles?category=all`),
        fetch(`/api/admin/database/${country}/profiles?category=successfully-downloaded`),
        fetch(`/api/admin/database/${country}/profiles?category=failed-download`)
      ])

      const [allData, successData, failedData] = await Promise.all([
        allResponse.ok ? allResponse.json() : { total: 0 },
        successResponse.ok ? successResponse.json() : { total: 0 },
        failedResponse.ok ? failedResponse.json() : { total: 0 }
      ])

      setCategoryCounts({
        all: allData.total || 0,
        successfullyDownloaded: successData.total || 0,
        failedDownload: failedData.total || 0
      })
    } catch (error) {
      console.error('Error loading category counts:', error)
    }
  }

  // Funkce pro načtení profilů podle kategorie
  const loadCategoryProfiles = async (category: string) => {
    setLoadingCategoryProfiles(true)
    try {
      const response = await fetch(`/api/admin/database/${country}/profiles?category=${category}`)
      if (response.ok) {
        const profilesData = await response.json()
        setCategoryProfiles(profilesData)
      } else {
        console.error('Failed to load category profiles')
      }
    } catch (error) {
      console.error('Error loading category profiles:', error)
    } finally {
      setLoadingCategoryProfiles(false)
    }
  }

  // Load category counts on mount and when data changes
  useEffect(() => {
    if (data && country) {
      loadCategoryCounts()
    }
  }, [data, country])

  // Načtení profilů podle kategorie při přepnutí záložky
  useEffect(() => {
    if (activeTab === 'successfully-downloaded' || activeTab === 'failed-download') {
      loadCategoryProfiles(activeTab)
    }
  }, [activeTab])

  const handleSelectProfile = (profileId: string) => {
    setSelectedProfiles(prev => 
      prev.includes(profileId) 
        ? prev.filter(id => id !== profileId)
        : [...prev, profileId]
    )
  }

  const handleSelectAll = () => {
    if (!profiles.length) return
    
    if (selectedProfiles.length === profiles.length) {
      setSelectedProfiles([])
    } else {
      setSelectedProfiles(profiles.map(p => p.id))
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedProfiles.length === 0 || !confirm(`Are you sure you want to delete ${selectedProfiles.length} profiles?`)) return
    
    setIsDeleting(true)
    try {
      const response = await fetch('/api/admin/database/profiles/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileIds: selectedProfiles })
      })
      
      if (response.ok) {
        const result = await response.json()
        setSelectedProfiles([])
        alert(`Successfully deleted ${result.deletedCount || selectedProfiles.length} profiles`)
        // Refresh data
        await refreshAfterDelete()
      } else {
        const error = await response.json()
        alert(`Failed to delete profiles: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error deleting profiles:', error)
      alert('Error deleting profiles. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteSingle = async (profileId: string, username: string) => {
    if (!confirm(`Are you sure you want to delete profile @${username}?`)) return
    
    try {
      const response = await fetch('/api/admin/database/profiles/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileIds: [profileId] })
      })
      
      if (response.ok) {
        alert(`Profile @${username} deleted successfully`)
        await refreshAfterDelete()
      } else {
        const error = await response.json()
        alert(`Failed to delete profile: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error deleting profile:', error)
      alert('Error deleting profile. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-900 mb-4">Error Loading Data</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-x-4">
            <button 
              onClick={forceRefresh}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              🔄 Retry
            </button>
            <Link href="/admin/database" className="text-blue-600 hover:text-blue-800">
              ← Back to Database Overview
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Country Not Found</h1>
          <p className="text-gray-600 mb-6">The country "{country}" was not found in the database.</p>
          <Link href="/admin/database" className="text-blue-600 hover:text-blue-800">
            ← Back to Database Overview
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Link href="/admin/database" className="text-blue-600 hover:text-blue-800">
            ← Back to Overview
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-4xl">{data.flag}</div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {data.countryName} Database
            </h1>
            <div className="flex items-center space-x-4">
              <p className="text-gray-600">
                {totalProfiles.toLocaleString()} influencer profiles • 
                Last update: {new Date(data.lastUpdate).toLocaleDateString()}
              </p>
              {isStale && (
                <span className="text-orange-600 text-sm">⚠️ Data might be outdated</span>
              )}
              <button 
                onClick={checkForUpdates}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                🔄 Check for updates
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-2xl font-bold text-blue-600">{totalProfiles}</div>
          <div className="text-gray-600">Total Profiles</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-2xl font-bold text-green-600">
            {Math.round((data.qualityMetrics.active / totalProfiles) * 100)}%
          </div>
          <div className="text-gray-600">Quality Score</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-2xl font-bold text-purple-600">
            {(data.qualityMetrics.avgFollowers / 1000).toFixed(1)}K
          </div>
          <div className="text-gray-600">Avg Followers</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-2xl font-bold text-orange-600">
            {Object.keys(data.categories).length}
          </div>
          <div className="text-gray-600">Categories</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: '📊', count: null },
              { id: 'profiles', name: 'All Profiles', icon: '👥', count: categoryCounts.all },
              { id: 'successfully-downloaded', name: 'Successfully Downloaded', icon: '✅', color: 'text-green-600 border-green-500', count: categoryCounts.successfullyDownloaded },
              { id: 'failed-download', name: 'Failed to Download', icon: '❌', color: 'text-red-600 border-red-500', count: categoryCounts.failedDownload }
            ].map((tab) => (
                              <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? tab.color || 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon} {tab.name}{tab.count !== null ? ` (${tab.count})` : ''}
                </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Categories Breakdown */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">🏷️ Category Breakdown</h3>
            <div className="space-y-3">
              {Object.entries(data.categories).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="capitalize text-gray-700">{category}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(count / data.totalProfiles) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Geographic Distribution */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">📍 Geographic Distribution</h3>
            <div className="space-y-3">
              {Object.entries(data.geographicDistribution).slice(0, 8).map(([city, count]) => (
                <div key={city} className="flex items-center justify-between">
                  <span className="text-gray-700">{city}</span>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quality Metrics */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">📊 Quality Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-lg font-bold text-green-600">{data.qualityMetrics.active}</div>
                <div className="text-sm text-gray-600">Active Profiles</div>
              </div>
              <div>
                <div className="text-lg font-bold text-red-600">{data.qualityMetrics.inactive}</div>
                <div className="text-sm text-gray-600">Inactive Profiles</div>
              </div>
            </div>
          </div>

          {/* Discovery Methods */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">🔄 Discovery Methods</h3>
            <div className="space-y-3">
              {Object.entries(data.discoveryMethods).map(([method, count]) => (
                <div key={method} className="flex items-center justify-between">
                  <span className="capitalize text-gray-700">
                    {method === 'googleSearch' ? 'Google Search' : method}
                  </span>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'profiles' && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">👥 All Profiles ({totalProfiles})</h3>
              <div className="flex items-center space-x-3">
                {selectedProfiles.length > 0 && (
                  <button
                    onClick={handleDeleteSelected}
                    disabled={isDeleting}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    {isDeleting ? 'Deleting...' : `Delete Selected (${selectedProfiles.length})`}
                  </button>
                )}
                <div className="text-sm text-gray-500">
                  Showing {profiles.length} of {totalProfiles} profiles
                </div>
              </div>
            </div>
          </div>
          
          {profiles.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">No Profiles Found</h3>
              <p className="text-gray-600">No influencer profiles have been discovered for this country yet.</p>
            </div>
          ) : (
            <>
              {/* Header with Select All */}
              <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center">
                <input
                  type="checkbox"
                  checked={selectedProfiles.length === profiles.length && profiles.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                />
                <span className="text-sm font-medium text-gray-700">
                  Select All ({selectedProfiles.length}/{profiles.length})
                </span>
              </div>

              {/* Profiles List */}
              <div className="divide-y divide-gray-200">
                {profiles.map((profile) => (
                  <div key={profile.id} className="p-2 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedProfiles.includes(profile.id)}
                          onChange={() => handleSelectProfile(profile.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 font-medium text-sm">
                            {(profile.displayName || profile.username || 'U').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            {profile.displayName || profile.username || 'Unknown User'}
                          </h4>
                          <p className="text-xs text-gray-600">@{profile.username || 'unknown'}</p>
                          <div className="flex items-center space-x-3 mt-0.5">
                            <span className="text-xs text-gray-500">
                              👥 {(profile.followers || 0).toLocaleString()}
                            </span>
                            <span className="text-xs text-gray-500">
                              🏷️ {profile.category || 'uncategorized'}
                            </span>
                            <span className="text-xs text-gray-500">
                              📅 {new Date(profile.createdAt).toLocaleDateString()}
                            </span>
                            {profile.updatedAt && profile.updatedAt !== profile.createdAt && (
                              <span className="text-xs text-blue-500">
                                🔄 Updated {new Date(profile.updatedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            profile.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {profile.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <button 
                          onClick={() => handleDeleteSingle(profile.id, profile.username)}
                          className="text-red-600 hover:text-red-800 text-xs font-medium px-2 py-1 hover:bg-red-50 rounded"
                          title="Delete Profile"
                        >
                          🗑️
                        </button>
                        <Link 
                          href={`/admin/database/${country}/${profile.id}`}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium px-2 py-1 hover:bg-blue-50 rounded"
                        >
                          View →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Successfully Downloaded Profiles Tab */}
      {activeTab === 'successfully-downloaded' && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-green-700">✅ Successfully Downloaded Profiles</h3>
              <div className="text-sm text-gray-500">
                {loadingCategoryProfiles ? 'Loading...' : `${categoryProfiles?.profiles?.length || 0} profiles`}
              </div>
            </div>
          </div>
          
          {loadingCategoryProfiles ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-gray-500">Loading profiles...</div>
            </div>
          ) : categoryProfiles?.profiles?.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {categoryProfiles.profiles.map((profile: any) => (
                <div key={profile.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-medium text-sm">
                          {(profile.displayName || profile.username || 'U').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {profile.displayName || profile.username || 'Unknown User'}
                        </h4>
                        <p className="text-xs text-gray-600">@{profile.username || 'unknown'}</p>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-xs text-gray-500">
                            👥 {(profile.followers || 0).toLocaleString()}
                          </span>
                          <span className="text-xs text-gray-500">
                            🏷️ {profile.category || 'uncategorized'}
                          </span>
                          <span className="text-xs text-green-600 font-medium">
                            ✅ Complete Instagram Data
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Link 
                        href={`/admin/database/${country}/${profile.id}`}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium px-3 py-1 hover:bg-blue-50 rounded"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-green-600 text-4xl mb-4">✅</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Successfully Downloaded Profiles</h3>
              <p className="text-gray-600">No profiles have been successfully scraped from Instagram yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Failed to Download Profiles Tab */}
      {activeTab === 'failed-download' && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-red-700">❌ Failed to Download Profiles</h3>
              <div className="text-sm text-gray-500">
                {loadingCategoryProfiles ? 'Loading...' : `${categoryProfiles?.profiles?.length || 0} profiles`}
              </div>
            </div>
          </div>
          
          {loadingCategoryProfiles ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-gray-500">Loading profiles...</div>
            </div>
          ) : categoryProfiles?.profiles?.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {categoryProfiles.profiles.map((profile: any) => (
                <div key={profile.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-red-600 font-medium text-sm">
                          {(profile.displayName || profile.username || 'U').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {profile.displayName || profile.username || 'Unknown User'}
                        </h4>
                        <p className="text-xs text-gray-600">@{profile.username || 'unknown'}</p>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-xs text-gray-500">
                            👥 {(profile.followers || 0).toLocaleString()}
                          </span>
                          <span className="text-xs text-gray-500">
                            🏷️ {profile.category || 'uncategorized'}
                          </span>
                          <span className="text-xs text-red-600 font-medium">
                            ❌ Failed Scraping
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Link 
                        href={`/admin/database/${country}/${profile.id}`}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium px-3 py-1 hover:bg-blue-50 rounded"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-red-600 text-4xl mb-4">❌</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Failed Downloads</h3>
              <p className="text-gray-600">No profiles have failed Instagram scraping attempts yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 
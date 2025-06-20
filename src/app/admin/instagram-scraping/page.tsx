'use client'

import { useState, useEffect } from 'react'

interface InstagramScrapingStats {
  totalProfiles: number
  profilesWithData: number
  profilesMissingData: number
  profilesWithFailedScraping: number
  profilesNeverAttempted: number
  lastScrapingRun?: {
    id: string
    status: string
    completedAt: string
    successRate: number
  }
}

interface ScrapingRun {
  id: string
  type: string
  status: string
  totalFound: number
  totalProcessed: number
  startedAt: string
  completedAt?: string
  sourceFilter?: any
  configName: string
  errors?: string
}

interface BatchConfig {
  country: string
  batchSize: number
  delayBetween: number
  maxRetries: number
  timeout: number
  skipPrivate: boolean
  onlyMissingData: boolean
}

interface RunDetails {
  id: string
  type: string
  status: string
  totalFound: number
  totalProcessed: number
  startedAt: string
  completedAt?: string
  sourceFilter?: any
  configName: string
  errors?: string
  attempts?: ScrapingAttempt[]
}

interface ScrapingAttempt {
  id: string
  username: string
  status: string
  errorMessage?: string
  scrapedData?: any
  createdAt: string
}

export default function InstagramScrapingPage() {
  const [stats, setStats] = useState<InstagramScrapingStats | null>(null)
  const [runs, setRuns] = useState<ScrapingRun[]>([])
  const [currentRun, setCurrentRun] = useState<ScrapingRun | null>(null)
  const [runDetails, setRunDetails] = useState<RunDetails | null>(null)
  const [showRunDetails, setShowRunDetails] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [batchConfig, setBatchConfig] = useState<BatchConfig>({
    country: 'CZ',
    batchSize: 20,
    delayBetween: 5000,
    maxRetries: 3,
    timeout: 30000,
    skipPrivate: true,
    onlyMissingData: true
  })

  // Load stats and runs on component mount
  useEffect(() => {
    loadStatsAndRuns()
  }, [])

  // Poll for updates when scraping is running
  useEffect(() => {
    if (currentRun && currentRun.status === 'running') {
      const interval = setInterval(() => {
        pollRunStatus(currentRun.id)
      }, 3000)
      
      return () => clearInterval(interval)
    }
  }, [currentRun])

  const loadStatsAndRuns = async () => {
    try {
      setIsLoading(true)
      const [statsRes, runsRes] = await Promise.all([
        fetch('/api/admin/instagram-scraping/stats'),
        fetch('/api/admin/instagram-scraping/runs')
      ])
      
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }
      
      if (runsRes.ok) {
        const runsData = await runsRes.json()
        setRuns(runsData.runs || [])
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const pollRunStatus = async (runId: string) => {
    try {
      const response = await fetch(`/api/admin/instagram-scraping/runs/${runId}/status`)
      if (response.ok) {
        const data = await response.json()
        setCurrentRun(data.run)
        
        if (data.run.status === 'completed' || data.run.status === 'failed') {
          loadStatsAndRuns() // Refresh stats and runs list
          setCurrentRun(null)
        }
      }
    } catch (error) {
      console.error('Failed to poll run status:', error)
    }
  }

  const startScraping = async () => {
    try {
      const response = await fetch('/api/admin/instagram-scraping/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(batchConfig),
      })
      
      if (response.ok) {
        const data = await response.json()
        setCurrentRun(data.run)
        loadStatsAndRuns()
      } else {
        const error = await response.json()
        alert(`Failed to start scraping: ${error.error}`)
      }
    } catch (error) {
      console.error('Failed to start scraping:', error)
      alert('Failed to start scraping')
    }
  }

  const loadRunDetails = async (runId: string) => {
    try {
      const response = await fetch(`/api/admin/instagram-scraping/runs/${runId}/status`)
      if (response.ok) {
        const data = await response.json()
        setRunDetails(data)
        setShowRunDetails(true)
      }
    } catch (error) {
      console.error('Failed to load run details:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('cs-CZ')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'running': return 'text-blue-600 bg-blue-100'
      case 'failed': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getAttemptStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100'
      case 'failed': return 'text-red-600 bg-red-100'
      case 'timeout': return 'text-yellow-600 bg-yellow-100'
      case 'not_found': return 'text-orange-600 bg-orange-100'
      case 'skipped_private': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="space-y-6">
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Loading...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Instagram Profile Scraping</h1>
            <p className="text-gray-600 mt-1">Scrape complete Instagram data for existing profiles in database</p>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Total Profiles</h3>
              <p className="text-3xl font-bold text-gray-900">{stats.totalProfiles}</p>
              <p className="text-sm text-gray-500 mt-1">Active with Instagram username</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Kompletně staženo</h3>
              <p className="text-3xl font-bold text-green-600">{stats.profilesWithData}</p>
              <p className="text-sm text-gray-500 mt-1">With complete Instagram data</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Nešlo stáhnout</h3>
              <p className="text-3xl font-bold text-red-600">{stats.profilesWithFailedScraping}</p>
              <p className="text-sm text-gray-500 mt-1">Failed scraping attempts</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Před full scrapingem</h3>
              <p className="text-3xl font-bold text-orange-600">{stats.profilesNeverAttempted}</p>
              <p className="text-sm text-gray-500 mt-1">Never attempted scraping</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Coverage</h3>
              <p className="text-3xl font-bold text-blue-600">
                {Math.round((stats.profilesWithData / stats.totalProfiles) * 100)}%
              </p>
              <p className="text-sm text-gray-500 mt-1">Successfully scraped</p>
            </div>
          </div>
        )}

        {/* Batch Configuration */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Batch Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={batchConfig.country}
                onChange={(e) => setBatchConfig({...batchConfig, country: e.target.value})}
              >
                <option value="CZ">Czech Republic</option>
                <option value="SK">Slovakia</option>
                <option value="">All Countries</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch Size</label>
              <input 
                type="number" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="1" 
                max="100" 
                value={batchConfig.batchSize}
                onChange={(e) => setBatchConfig({...batchConfig, batchSize: parseInt(e.target.value)})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delay Between (ms)</label>
              <input 
                type="number" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="1000" 
                max="30000" 
                step="1000" 
                value={batchConfig.delayBetween}
                onChange={(e) => setBatchConfig({...batchConfig, delayBetween: parseInt(e.target.value)})}
              />
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            <label className="flex items-center">
              <input 
                type="checkbox" 
                className="mr-2"
                checked={batchConfig.onlyMissingData}
                onChange={(e) => setBatchConfig({...batchConfig, onlyMissingData: e.target.checked})}
              />
              <span className="text-sm text-gray-700">Only profiles missing Instagram data</span>
            </label>
            
            <label className="flex items-center">
              <input 
                type="checkbox" 
                className="mr-2"
                checked={batchConfig.skipPrivate}
                onChange={(e) => setBatchConfig({...batchConfig, skipPrivate: e.target.checked})}
              />
              <span className="text-sm text-gray-700">Skip private accounts (faster)</span>
            </label>
          </div>
          
          <div className="mt-6">
            <button 
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              onClick={startScraping}
              disabled={currentRun?.status === 'running'}
            >
              {currentRun?.status === 'running' ? 'Running...' : 'Start Instagram Scraping'}
            </button>
          </div>
        </div>

        {/* Recent Instagram Scraping Runs */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Recent Instagram Scraping Runs</h2>
            <button 
              onClick={loadStatsAndRuns}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Refresh
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Run ID</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Status</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Processed</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Success Rate</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Started</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Completed</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => (
                  <tr key={run.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm font-mono">
                      {run.id.substring(0, 8)}...
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(run.status)}`}>
                        {run.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {run.totalProcessed} / {run.totalFound}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {run.totalFound > 0 ? Math.round((run.totalProcessed / run.totalFound) * 100) : 0}%
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {formatDate(run.startedAt)}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {run.completedAt ? formatDate(run.completedAt) : '-'}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => loadRunDetails(run.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
                {runs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      No Instagram scraping runs yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Run Details Modal */}
      {showRunDetails && runDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">
                  Run Details: {runDetails.id.substring(0, 12)}...
                </h3>
                <button
                  onClick={() => setShowRunDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Run Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(runDetails.status)}`}>
                    {runDetails.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Processed</p>
                  <p className="font-medium">{runDetails.totalProcessed} / {runDetails.totalFound}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Started</p>
                  <p className="font-medium">{formatDate(runDetails.startedAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Completed</p>
                  <p className="font-medium">
                    {runDetails.completedAt ? formatDate(runDetails.completedAt) : 'Still running'}
                  </p>
                </div>
              </div>

              {/* Configuration */}
              {runDetails.sourceFilter && (
                <div className="mb-6">
                  <h4 className="font-medium mb-2">Configuration</h4>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    <pre>{JSON.stringify(runDetails.sourceFilter, null, 2)}</pre>
                  </div>
                </div>
              )}

              {/* Scraping Attempts */}
              {runDetails.attempts && runDetails.attempts.length > 0 && (
                <div>
                  <h4 className="font-medium mb-4">Scraping Attempts ({runDetails.attempts.length})</h4>
                  <div className="space-y-3">
                    {runDetails.attempts.map((attempt) => (
                      <div key={attempt.id} className="border border-gray-200 rounded p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">@{attempt.username}</p>
                            <p className="text-sm text-gray-500">{formatDate(attempt.createdAt)}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAttemptStatusColor(attempt.status)}`}>
                            {attempt.status}
                          </span>
                        </div>
                        
                        {attempt.errorMessage && (
                          <div className="mb-2">
                            <p className="text-sm text-red-600">{attempt.errorMessage}</p>
                          </div>
                        )}
                        
                        {attempt.scrapedData && (
                          <details className="text-sm">
                            <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                              View scraped data
                            </summary>
                            <div className="mt-2 bg-gray-50 p-2 rounded">
                              <pre className="text-xs overflow-x-auto">
                                {JSON.stringify(JSON.parse(attempt.scrapedData), null, 2)}
                              </pre>
                            </div>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {(!runDetails.attempts || runDetails.attempts.length === 0) && (
                <div className="text-center text-gray-500 py-8">
                  No detailed attempts found for this run
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 
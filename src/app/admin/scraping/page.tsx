'use client'

import { useState, useEffect } from 'react'

interface ScrapingConfig {
  country: string
  hashtags: string[]
  maxPagesPerHashtag: number
  humanDelayMin: number
  humanDelayMax: number
  maxRunTime: number // v minutách
}

interface ScrapingResult {
  id: string
  status: 'running' | 'completed' | 'failed' | 'stopped'
  config: ScrapingConfig
  results: {
    discovered: number
    scraped: number
    saved: number
    failed: number
  }
  startTime: string
  endTime?: string
  progress: number
}

export default function ScrapingPage() {
  const [activeTab, setActiveTab] = useState<'scraping' | 'history'>('scraping')
  const [scrapingRuns, setScrapingRuns] = useState<ScrapingResult[]>([])
  const [isScrapingRunning, setIsScrapingRunning] = useState(false)
  const [currentHashtag, setCurrentHashtag] = useState('')
  const [buttonCooldownEnd, setButtonCooldownEnd] = useState<Date | null>(null)
  const [buttonCooldownRemaining, setButtonCooldownRemaining] = useState<string>('')
  
  const [config, setConfig] = useState<ScrapingConfig>({
    country: 'CZ',
    hashtags: [],
    maxPagesPerHashtag: 20,
    humanDelayMin: 2,
    humanDelayMax: 8,
    maxRunTime: 480 // 8 hodin
  })

  const countries = [
    { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿' },
    { code: 'SK', name: 'Slovakia', flag: '🇸🇰' },
    { code: 'PL', name: 'Poland', flag: '🇵🇱' },
    { code: 'HU', name: 'Hungary', flag: '🇭🇺' },
    { code: 'FR', name: 'France', flag: '🇫🇷' },
    { code: 'ES', name: 'Spain', flag: '🇪🇸' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪' },
    { code: 'AT', name: 'Austria', flag: '🇦🇹' },
  ]

  // Načíst poslední vybranou zemi z localStorage při načtení komponenty
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCountry = localStorage.getItem('last_selected_country')
      if (savedCountry) {
        setConfig(prev => ({
          ...prev,
          country: savedCountry
        }))
      }
      loadButtonCooldownFromStorage()
    }
  }, [])

  // Button cooldown timer effect (15 minutes)
  useEffect(() => {
    if (buttonCooldownEnd) {
      const interval = setInterval(() => {
        const now = new Date()
        const remaining = buttonCooldownEnd.getTime() - now.getTime()
        
        if (remaining <= 0) {
          setButtonCooldownEnd(null)
          setButtonCooldownRemaining('')
          localStorage.removeItem('google_scraping_button_cooldown_end')
        } else {
          const minutes = Math.floor(remaining / 60000)
          const seconds = Math.floor((remaining % 60000) / 1000)
          setButtonCooldownRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`)
        }
      }, 1000)
      
      return () => clearInterval(interval)
    }
  }, [buttonCooldownEnd])

  const loadButtonCooldownFromStorage = () => {
    if (typeof window !== 'undefined') {
      const storedButtonCooldownEnd = localStorage.getItem('google_scraping_button_cooldown_end')
      if (storedButtonCooldownEnd) {
        const cooldownDate = new Date(storedButtonCooldownEnd)
        if (cooldownDate > new Date()) {
          setButtonCooldownEnd(cooldownDate)
        } else {
          localStorage.removeItem('google_scraping_button_cooldown_end')
        }
      }
    }
  }

  const startButtonCooldown = () => {
    const cooldownDuration = 15 * 60 * 1000 // 15 minut v milisekundách (pokrývá i 429 retry 5-10min)
    const endTime = new Date(Date.now() + cooldownDuration)
    setButtonCooldownEnd(endTime)
    localStorage.setItem('google_scraping_button_cooldown_end', endTime.toISOString())
  }

  const startScraping = async () => {
    if (config.hashtags.length === 0) {
      console.log('Please add at least one hashtag')
      return
    }
    
    // Spustit 15minutový odpočet pro tlačítko (pokrývá i 429 retry 5-10min)
    startButtonCooldown()
    
    setIsScrapingRunning(true)
    try {
      // Zavoláme lehký endpoint, který jen vrátí seznam Instagram URL
      const response = await fetch('/api/admin/database/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hashtags: config.hashtags.join(','),
          country: config.country,
          maxResultsPerQuery: config.maxPagesPerHashtag * 10 // hrubý odhad
        })
      })

      if (response.ok) {
        const data = await response.json()
        const urls: string[] = data.profiles || []
        console.log(`Discovered ${urls.length} profiles`, urls)

        // Uložíme do databáze - pouze pokud máme nějaké URL
        let savedCount = 0
        let failedCount = 0
        let importResult: any = null

        if (urls.length > 0) {
          const importResponse = await fetch('/api/admin/database/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ urls, country: config.country })
          })
          
          if (!importResponse.ok) {
            const error = await importResponse.text()
            console.error('Import failed:', error)
            alert(`Import failed: ${error}`)
            failedCount = urls.length
          } else {
            importResult = await importResponse.json()
            console.log('Import successful:', importResult)
            
            savedCount = importResult.newProfilesCreated + importResult.existingProfilesUpdated
            failedCount = urls.length - savedCount
            
            // Zobrazit detailní report o duplicitách
            const report = [
              `🎯 Import Report for ${config.country}:`,
              `📥 URLs processed: ${importResult.processedUrls}`,
              `✅ New profiles created: ${importResult.newProfilesCreated}`,
              `🔄 Existing profiles updated: ${importResult.existingProfilesUpdated}`,
              `🔄 Batch duplicates skipped: ${importResult.batchDuplicatesSkipped}`,
              `⚠️ Database duplicates skipped: ${importResult.databaseDuplicatesSkipped}`,
              ``,
              `Total unique profiles: ${importResult.newProfilesCreated + importResult.existingProfilesUpdated}`
            ].join('\n')
            
            alert(report)
          }
        } else {
          console.warn('No profiles found to import')
          alert('No profiles found during scraping')
        }

        const newRun: ScrapingResult = {
          id: Date.now().toString(),
          status: 'completed',
          config: { ...config },
          results: {
            discovered: urls.length,
            scraped: urls.length,
            saved: savedCount,
            failed: failedCount
          },
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          progress: 100
        }
        setScrapingRuns([newRun, ...scrapingRuns])
      } else {
        console.error('Failed to fetch list of profiles')
      }
    } catch (error) {
      console.error('Error starting scraping', error)
    } finally {
      setIsScrapingRunning(false)
    }
  }

  const stopScraping = async (runId: string) => {
    try {
      const response = await fetch(`/api/admin/scraping/runs/${runId}/stop`, {
        method: 'POST'
      })
      
      if (response.ok) {
        console.log('Scraping stopped safely')
        loadScrapingRuns()
      } else {
        console.error('Failed to stop scraping')
      }
    } catch (error) {
      console.error('Error stopping scraping', error)
    }
  }

  const addHashtag = () => {
    if (currentHashtag.trim() && !config.hashtags.includes(currentHashtag.trim())) {
      setConfig({
        ...config,
        hashtags: [...config.hashtags, currentHashtag.trim()]
      })
      setCurrentHashtag('')
    }
  }

  const removeHashtag = (hashtag: string) => {
    setConfig({
      ...config,
      hashtags: config.hashtags.filter(h => h !== hashtag)
    })
  }

  const loadScrapingRuns = async () => {
    try {
      const response = await fetch('/api/admin/scraping/runs')
      
      if (!response.ok) {
        console.error('Failed to fetch scraping runs:', response.status)
        return
      }
      
      const text = await response.text()
      if (!text.trim()) {
        console.warn('Empty response from scraping runs API')
        return
      }
      
      const data = JSON.parse(text)
      
      // Transform data to match our interface
      const runs = Array.isArray(data) ? data : (data.runs || [])
      const transformedRuns = runs.map((run: any) => ({
        id: run.id,
        status: run.status,
        config: {
          country: 'CZ', // Default, protože v současné databázi nemáme config detaily
          hashtags: run.config?.hashtags || [],
          maxPagesPerHashtag: 20,
          humanDelayMin: 2,
          humanDelayMax: 8,
          maxRunTime: 480
        },
        results: {
          discovered: run.totalFound || 0,
          scraped: run.totalProcessed || 0,
          saved: run.totalProcessed || 0,
          failed: (run.totalFound || 0) - (run.totalProcessed || 0)
        },
        startTime: run.startedAt,
        endTime: run.completedAt,
        progress: run.status === 'completed' ? 100 : 
                 run.status === 'running' ? 50 : 0
      }))
      
      setScrapingRuns(transformedRuns)
    } catch (error) {
      console.error('Failed to load scraping runs:', error)
      setScrapingRuns([]) // Nastavit prázdné pole jako fallback
    }
  }

  useEffect(() => {
    loadScrapingRuns()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Instagram Scraping</h1>
          <p className="text-gray-600 mt-2">Discover influencers using hashtag-based Google Search with human-like behavior</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {[
                { id: 'scraping', name: 'Start Scraping', icon: '🚀' },
                { id: 'history', name: 'Scraping History', icon: '📊' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-green-600 text-green-600 bg-green-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'scraping' && (
              <div className="space-y-8">
                {/* Configuration Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Country Selection */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Target Country</h3>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {countries.map((country) => (
                        <button
                          key={country.code}
                          onClick={() => {
                            setConfig({ ...config, country: country.code })
                            localStorage.setItem('last_selected_country', country.code)
                          }}
                          className={`flex items-center p-3 rounded-lg border transition-colors ${
                            config.country === country.code
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span className="text-xl mr-3">{country.flag}</span>
                          <div className="text-left">
                            <div className="font-medium">{country.name}</div>
                            <div className="text-xs text-gray-500">{country.code}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hashtag Management & Safety Settings */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Hashtags & Safety</h3>
                    
                    {/* Hashtag Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Add Hashtags (without #)
                      </label>
                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          value={currentHashtag}
                          onChange={(e) => setCurrentHashtag(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addHashtag()}
                          placeholder="czechfashion, praguestyle..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                        <button
                          onClick={addHashtag}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          Add
                        </button>
                      </div>
                      
                      {/* Hashtag List */}
                      <div className="flex flex-wrap gap-2">
                        {config.hashtags.map((hashtag) => (
                          <span
                            key={hashtag}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                          >
                            #{hashtag}
                            <button
                              onClick={() => removeHashtag(hashtag)}
                              className="ml-2 text-green-600 hover:text-green-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Safety Settings */}
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">🛡️ Safety Settings</h4>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pages per hashtag (max 50)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={config.maxPagesPerHashtag || 1}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 1;
                              setConfig({ ...config, maxPagesPerHashtag: Math.min(Math.max(value, 1), 50) });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          />
                        </div>

                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="mr-2">🤖</span>
                            <span>Automatic human-like delays (3-8 seconds) and extended runtime limits (8 hours) are applied for maximum discovery</span>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="mr-2">🕐</span>
                            <span><strong>15-minute button cooldown</strong> - prevents accidental multiple runs & covers 429 retry delays (5-10min)</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Start Scraping */}
                    <div className="bg-green-50 rounded-lg p-6">
                      <h4 className="font-medium text-gray-900 mb-2">🚀 Start Instagram Scraping</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Will scrape {config.maxPagesPerHashtag} pages for each hashtag with automatic safety delays (2-8 seconds)
                      </p>
                      <button
                        onClick={startScraping}
                        disabled={isScrapingRunning || config.hashtags.length === 0 || buttonCooldownEnd !== null}
                        className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
                      >
                        {isScrapingRunning ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                            Starting...
                          </>
                        ) : buttonCooldownEnd !== null ? (
                          <>
                            <span className="mr-2">⏰</span>
                            Počkej {buttonCooldownRemaining}
                          </>
                        ) : (
                          <>
                            <span className="mr-2">🚀</span>
                            Start Scraping ({config.hashtags.length} hashtags)
                          </>
                        )}
                      </button>
                      
                      {/* Cooldown indikátor */}
                      {buttonCooldownEnd && (
                        <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-orange-600">
                          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Odpočet tlačítka: {buttonCooldownRemaining} zbývá</span>
                          <button
                            onClick={() => {
                              setButtonCooldownEnd(null)
                              setButtonCooldownRemaining('')
                              localStorage.removeItem('google_scraping_button_cooldown_end')
                            }}
                            className="text-red-600 hover:text-red-800 text-xs underline"
                          >
                            Přeskočit
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Scraping History</h3>
                {!Array.isArray(scrapingRuns) || scrapingRuns.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-4xl mb-4">📊</div>
                    <p className="text-gray-600">No scraping runs yet</p>
                    <p className="text-sm text-gray-500">Start your first scraping to see results here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {scrapingRuns.map((run) => (
                      <ScrapingRunCard key={run.id} run={run} onStop={stopScraping} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Scraping Run Card Component
const ScrapingRunCard = ({ run, onStop }: { run: ScrapingResult, onStop: (id: string) => void }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'running': return 'bg-blue-100 text-blue-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'stopped': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅'
      case 'running': return '⏳'
      case 'failed': return '❌'
      case 'stopped': return '⏸️'
      default: return '⏸️'
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-lg">{getStatusIcon(run.status)}</span>
          <div>
            <h4 className="font-medium text-gray-900">
              {run.config.country} Scraping
            </h4>
            <p className="text-sm text-gray-600">
              Started: {new Date(run.startTime).toLocaleString()}
            </p>
            {run.config.hashtags && run.config.hashtags.length > 0 && (
              <p className="text-xs text-gray-500">
                Hashtags: {run.config.hashtags.map(h => `#${h}`).join(', ')}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(run.status)}`}>
            {run.status}
          </span>
          {run.status === 'running' && (
            <button
              onClick={() => onStop(run.id)}
              className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
            >
              Stop Safely
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <p className="text-lg font-semibold text-blue-600">{run.results.discovered}</p>
          <p className="text-xs text-gray-600">Discovered</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-green-600">{run.results.scraped}</p>
          <p className="text-xs text-gray-600">Scraped</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-purple-600">{run.results.saved}</p>
          <p className="text-xs text-gray-600">Saved</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-red-600">{run.results.failed}</p>
          <p className="text-xs text-gray-600">Failed</p>
        </div>
      </div>

      {run.status === 'running' && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${run.progress}%` }}
          ></div>
        </div>
      )}
    </div>
  )
} 
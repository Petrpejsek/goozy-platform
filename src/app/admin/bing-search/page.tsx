'use client'

import { useState, useEffect } from 'react'

interface BingScrapingConfig {
  country: string
  hashtags: string[]
  maxPagesPerHashtag: number
  humanDelayMin: number
  humanDelayMax: number
  maxRunTime: number // v minutách
}

interface BingScrapingResult {
  id: string
  status: 'running' | 'completed' | 'failed' | 'stopped'
  config: BingScrapingConfig
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

export default function BingSearchPage() {
  const [activeTab, setActiveTab] = useState<'scraping' | 'history'>('scraping')
  const [scrapingRuns, setScrapingRuns] = useState<BingScrapingResult[]>([])
  const [isScrapingRunning, setIsScrapingRunning] = useState(false)
  const [currentHashtag, setCurrentHashtag] = useState('')
  const [buttonCooldownEnd, setButtonCooldownEnd] = useState<Date | null>(null)
  const [buttonCooldownRemaining, setButtonCooldownRemaining] = useState<string>('')
  
  const [config, setConfig] = useState<BingScrapingConfig>({
    country: 'CZ',
    hashtags: [],
    maxPagesPerHashtag: 20,
    humanDelayMin: 2, // Kratší pro Bing
    humanDelayMax: 6, // Kratší pro Bing
    maxRunTime: 240 // 4 hodiny (kratší než Google)
  })

  // Nové konfigurační stavy
  const [maxPagesPerHashtag, setMaxPagesPerHashtag] = useState(20)
  const [maxProfilesTotal, setMaxProfilesTotal] = useState(0) // 0 = bez omezení

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

  // Button cooldown timer effect (10 minutes - kratší než Google)
  useEffect(() => {
    if (buttonCooldownEnd) {
      const interval = setInterval(() => {
        const now = new Date()
        const remaining = buttonCooldownEnd.getTime() - now.getTime()
        
        if (remaining <= 0) {
          setButtonCooldownEnd(null)
          setButtonCooldownRemaining('')
          localStorage.removeItem('bing_scraping_button_cooldown_end')
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
      const storedButtonCooldownEnd = localStorage.getItem('bing_scraping_button_cooldown_end')
      if (storedButtonCooldownEnd) {
        const cooldownDate = new Date(storedButtonCooldownEnd)
        if (cooldownDate > new Date()) {
          setButtonCooldownEnd(cooldownDate)
        } else {
          localStorage.removeItem('bing_scraping_button_cooldown_end')
        }
      }
    }
  }

  const startButtonCooldown = () => {
    const cooldownDuration = 10 * 60 * 1000 // 10 minut (kratší než Google)
    const endTime = new Date(Date.now() + cooldownDuration)
    setButtonCooldownEnd(endTime)
    localStorage.setItem('bing_scraping_button_cooldown_end', endTime.toISOString())
  }

  const startBingScraping = async () => {
    if (config.hashtags.length === 0) {
      console.log('Please add at least one hashtag')
      return
    }
    
    // Uložit vybranou zemi
    localStorage.setItem('last_selected_country', config.country)
    
    // Spustit 10minutový odpočet pro tlačítko (kratší než Google)
    startButtonCooldown()
    
    setIsScrapingRunning(true)
    try {
      // Zavoláme Bing endpoint s novými konfiguračními parametry
      const response = await fetch('/api/admin/database/list-bing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hashtags: config.hashtags.join(','),
          country: config.country,
          maxPagesPerHashtag: maxPagesPerHashtag,
          maxProfilesTotal: maxProfilesTotal
        })
      })

      if (response.ok) {
        const data = await response.json()
        const urls: string[] = data.profiles || []
        console.log(`Discovered ${urls.length} profiles via Bing`, urls)

        // Uložíme do databáze - pouze pokud máme nějaké URL
        let savedCount = 0
        let failedCount = 0
        let importResult: any = null

        if (urls.length > 0) {
          const importResponse = await fetch('/api/admin/database/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              urls, 
              country: config.country,
              foundBy: 'bing-search' // Označení, že profily našel Bing
            })
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
              `🎯 Bing Search Report for ${config.country}:`,
              ``,
              `⚙️ Configuration:`,
              `📄 Pages per hashtag: ${maxPagesPerHashtag}`,
              `👥 Profile limit: ${maxProfilesTotal || 'unlimited'}`,
              `🏷️ Hashtags: ${config.hashtags.join(', ')}`,
              ``,
              `📊 Results:`,
              `📥 URLs processed: ${importResult.processedUrls}`,
              `✅ New profiles created: ${importResult.newProfilesCreated}`,
              `🔄 Existing profiles updated: ${importResult.existingProfilesUpdated}`,
              `🔄 Batch duplicates skipped: ${importResult.batchDuplicatesSkipped}`,
              `⚠️ Database duplicates skipped: ${importResult.databaseDuplicatesSkipped}`,
              ``,
              `🎉 Total unique profiles: ${importResult.newProfilesCreated + importResult.existingProfilesUpdated}`,
              ``,
              `🔍 Search Engine: Bing (Multi-page)`
            ].join('\n')
            
            alert(report)
          }
        } else {
          console.warn('No profiles found to import')
          alert('No profiles found during Bing scraping')
        }

        const newRun: BingScrapingResult = {
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
        console.error('Failed to fetch list of profiles from Bing')
        const errorText = await response.text()
        alert(`Bing scraping failed: ${errorText}`)
      }
    } catch (error) {
      console.error('Error during Bing scraping:', error)
      alert(`Error during Bing scraping: ${error}`)
    } finally {
      setIsScrapingRunning(false)
    }
  }

  const addHashtag = () => {
    if (currentHashtag.trim() && !config.hashtags.includes(currentHashtag.trim())) {
      setConfig(prev => ({
        ...prev,
        hashtags: [...prev.hashtags, currentHashtag.trim()]
      }))
      setCurrentHashtag('')
    }
  }

  const removeHashtag = (hashtag: string) => {
    setConfig(prev => ({
      ...prev,
      hashtags: prev.hashtags.filter(h => h !== hashtag)
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bing Search Discovery</h1>
          <p className="text-gray-600">
            Vyhledávání Instagram profilů pomocí Bing Search - optimalizováno pro rychlejší scraping
          </p>
        </div>

        {/* Instagram Hashtag Info Section */}
        <div className="mb-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">✅</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                🎉 Bing Search je nyní FUNKČNÍ!
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">🔍 Jak Bing hledá:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Optimalizované search query: <code className="bg-gray-100 px-1 rounded">instagram hashtag blogger country</code></li>
                    <li>• Podporuje vícestránkové vyhledávání (až 20 stránek)</li>
                    <li>• Bez omezení počtu profilů (nebo vlastní limit)</li>
                    <li>• Inteligentní filtrování neplatných odkazů</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">💡 Doporučené hashtags:</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">#fashion</span>
                    <span className="bg-pink-100 text-pink-800 px-2 py-1 rounded-full text-xs">#beauty</span>
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">#lifestyle</span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">#blogger</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>✅ Testováno:</strong> Bing Search úspěšně našel české profily jako 
                  <code className="bg-white px-1 mx-1 rounded">vogueczechoslovakia</code>, 
                  <code className="bg-white px-1 mx-1 rounded">_sslavkaa_</code>, 
                  <code className="bg-white px-1 mx-1 rounded">lucie_thehubs</code> a další!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('scraping')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'scraping'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Start Bing Search
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'history'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Scraping History
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'scraping' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Configuration Panel */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Bing Search Configuration</h2>
              
              {/* Country Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Country
                </label>
                <select
                  value={config.country}
                  onChange={(e) => {
                    const newCountry = e.target.value
                    setConfig(prev => ({ ...prev, country: newCountry }))
                    localStorage.setItem('last_selected_country', newCountry)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {countries.map(country => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Hashtags */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Terms / Hashtags
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={currentHashtag}
                    onChange={(e) => setCurrentHashtag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addHashtag()}
                    placeholder="např. fashion, beauty, lifestyle"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={addHashtag}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {config.hashtags.map((hashtag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {hashtag}
                      <button
                        onClick={() => removeHashtag(hashtag)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Advanced Configuration */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">🔧 Pokročilá konfigurace</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Stránek na hashtag
                      <span className="text-blue-600 ml-1" title="Kolik stránek Bing výsledků prohledat pro každý hashtag">ℹ️</span>
                    </label>
                    <input
                      type="number"
                      value={maxPagesPerHashtag}
                      onChange={(e) => setMaxPagesPerHashtag(parseInt(e.target.value) || 20)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                      min="1"
                      max="50"
                      placeholder="20"
                    />
                    <p className="text-xs text-gray-500 mt-1">Výchozí: 20 stránek</p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Limit profilů celkem
                      <span className="text-blue-600 ml-1" title="Maximální počet profilů celkem (0 = bez omezení)">ℹ️</span>
                    </label>
                    <input
                      type="number"
                      value={maxProfilesTotal}
                      onChange={(e) => setMaxProfilesTotal(parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                      min="0"
                      max="10000"
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">0 = bez omezení</p>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-500 text-sm">💡</span>
                    <div className="text-xs text-blue-800">
                      <p className="font-medium mb-1">Kalkulace výsledků:</p>
                      <p>
                        <strong>{maxPagesPerHashtag} stránek</strong> × <strong>{config.hashtags.length || 1} hashtags</strong> × 
                        <strong> ~50 profilů/stránka</strong> = 
                        <strong className="text-blue-900"> ~{maxPagesPerHashtag * (config.hashtags.length || 1) * 50} profilů max</strong>
                      </p>
                      {maxProfilesTotal > 0 && (
                        <p className="mt-1 text-orange-700">
                          ⚠️ Omezeno na <strong>{maxProfilesTotal}</strong> profilů
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bing Optimized Settings */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Bing Optimization Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Min Delay (sec)</label>
                    <input
                      type="number"
                      value={config.humanDelayMin}
                      onChange={(e) => setConfig(prev => ({ ...prev, humanDelayMin: parseInt(e.target.value) }))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                      min="1"
                      max="10"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Max Delay (sec)</label>
                    <input
                      type="number"
                      value={config.humanDelayMax}
                      onChange={(e) => setConfig(prev => ({ ...prev, humanDelayMax: parseInt(e.target.value) }))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                      min="2"
                      max="20"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Bing má kratší čekací doby než Google (optimalizováno pro rychlejší scraping)
                </p>
              </div>

              {/* Start Button */}
              <button
                onClick={startBingScraping}
                disabled={isScrapingRunning || config.hashtags.length === 0 || buttonCooldownEnd !== null}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  isScrapingRunning || config.hashtags.length === 0 || buttonCooldownEnd !== null
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-orange-600 text-white hover:bg-orange-700'
                }`}
              >
                {isScrapingRunning ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Bing Scraping Running...
                  </span>
                ) : buttonCooldownEnd !== null ? (
                  `Cooldown: ${buttonCooldownRemaining}`
                ) : config.hashtags.length === 0 ? (
                  'Add hashtags to start'
                ) : (
                  '🔍 Start Bing Search'
                )}
              </button>

              {buttonCooldownEnd && (
                <p className="text-xs text-orange-600 mt-2 text-center">
                  Cooldown aktivní - Bing má kratší cooldown než Google (10 min vs 15 min)
                </p>
              )}
            </div>

            {/* Info Panel */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Bing Search Advantages</h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 text-sm">⚡</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Rychlejší scraping</h3>
                    <p className="text-sm text-gray-600">Bing má mírnější rate limiting než Google - kratší čekací doby</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 text-sm">🔄</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Kratší cooldown</h3>
                    <p className="text-sm text-gray-600">10 minut místo 15 minut u Google</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 text-sm">🎯</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Jiné výsledky</h3>
                    <p className="text-sm text-gray-600">Bing může najít profily, které Google nezobrazuje</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 text-sm">📊</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Stejná databáze</h3>
                    <p className="text-sm text-gray-600">Výsledky se ukládají do stejné databáze jako Google</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-orange-50 rounded-lg">
                <h4 className="font-medium text-orange-900 mb-2">💡 Tip</h4>
                <p className="text-sm text-orange-800">
                  Kombinujte Google a Bing Search pro maximální pokrytí. Každý vyhledávač může najít jiné profily.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Bing Search History</h2>
            
            {scrapingRuns.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No Bing searches yet</h3>
                <p className="text-gray-600">Start your first Bing search to see results here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {scrapingRuns.map((run) => (
                  <BingScrapingRunCard key={run.id} run={run} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const BingScrapingRunCard = ({ run }: { run: BingScrapingResult }) => {
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
      case 'running': return '🔄'
      case 'failed': return '❌'
      case 'stopped': return '⏹️'
      default: return '❓'
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(run.status)}`}>
            {getStatusIcon(run.status)} {run.status}
          </span>
          <span className="text-sm text-gray-500">
            {new Date(run.startTime).toLocaleString()}
          </span>
        </div>
        <div className="text-sm text-orange-600 font-medium">
          🔍 Bing Search
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
        <div>
          <div className="text-xs text-gray-500">Discovered</div>
          <div className="font-medium">{run.results.discovered}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Saved</div>
          <div className="font-medium text-green-600">{run.results.saved}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Failed</div>
          <div className="font-medium text-red-600">{run.results.failed}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Country</div>
          <div className="font-medium">{run.config.country}</div>
        </div>
      </div>
      
      <div className="text-sm text-gray-600">
        <strong>Search terms:</strong> {run.config.hashtags.join(', ')}
      </div>
    </div>
  )
} 
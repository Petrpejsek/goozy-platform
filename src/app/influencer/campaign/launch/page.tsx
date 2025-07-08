'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LaunchCampaign() {
  const router = useRouter()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [campaignUrl, setCampaignUrl] = useState('')
  const [campaignSlug, setCampaignSlug] = useState('')
  const [isLaunching, setIsLaunching] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [influencerData, setInfluencerData] = useState<any>(null)

  // Load influencer data on mount
  useEffect(() => {
    const loadInfluencerData = async () => {
      try {
        // Get token from localStorage or sessionStorage
        const token = localStorage.getItem('influencer_token') || sessionStorage.getItem('influencer_token')
        if (!token) {
          console.log('❌ No authentication token found')
          return
        }

        const response = await fetch('/api/influencer/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          console.log('🔍 Full API response:', data) // Debug - celý objekt
          console.log('✅ Loaded influencer data:', data.influencer?.name)
          setInfluencerData(data.influencer)
        } else {
          console.error('❌ Failed to load influencer data:', response.status)
        }
      } catch (error) {
        console.error('❌ Error loading influencer data:', error)
      }
    }

    loadInfluencerData()
  }, [])

  // Initialize default times on component mount  
  useEffect(() => {
    // Set default start time if not set - use tomorrow as default
    if (!startDate) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(12, 0, 0, 0) // Set to noon
      const tomorrowStr = tomorrow.toISOString().slice(0,10)
      setStartDate(`${tomorrowStr}T12:00`)
    }
    // Set default end time if not set - use day after tomorrow as default
    if (!endDate) {
      const dayAfterTomorrow = new Date()
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)
      dayAfterTomorrow.setHours(18, 0, 0, 0) // Set to 6 PM
      const dayAfterTomorrowStr = dayAfterTomorrow.toISOString().slice(0,10)
      setEndDate(`${dayAfterTomorrowStr}T18:00`)
    }
  }, [])

  // Generate campaign URL when all data is ready
  const generateCampaignUrl = () => {
    if (!influencerData || !influencerData.name) {
      return
    }
    
    console.log('🚀 Generating campaign URL... (ONLY ONCE!)')
    console.log('📊 Current campaignSlug before generation:', campaignSlug)
    
    // Create slug based on influencer name and default brand
    const influencerName = influencerData.name
    const brandName = 'Goozy Demo Brand'
    const timestamp = Math.floor(Date.now() / 1000)
    
    // Clean names for URL
    const cleanInfluencer = influencerName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 20)
    
    const cleanBrand = brandName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 20)
    
    // Generate slug
    const slug = `${cleanInfluencer}-${cleanBrand}-${timestamp}`
    const url = `${window.location.origin}/campaign/${slug}`
    
    console.log('✅ Generated campaign slug:', slug)
    console.log('✅ Generated campaign URL:', url)
    
    setCampaignSlug(slug)
    setCampaignUrl(url)
  }

  // Auto-generate URL when all required data is available - BUT ONLY ONCE!
  useEffect(() => {
    // Only generate if we don't already have a slug
    if (campaignSlug) return
    
    // Check if all required data is available
    const now = new Date()
    const startDateTime = startDate ? new Date(startDate) : null
    const endDateTime = endDate ? new Date(endDate) : null
    
    const bothDatesValid = startDateTime && endDateTime && 
                          startDateTime > now && 
                          endDateTime > now &&
                          endDateTime > startDateTime
    
    // Generate URL when influencer data is loaded and dates are valid
    if (influencerData && influencerData.name && bothDatesValid) {
      generateCampaignUrl()
    }
    
  }, [influencerData, startDate, endDate, campaignSlug])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(campaignUrl)
      // Show toast notification
      const toast = document.createElement('div')
      toast.className = 'fixed top-5 right-5 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50'
      toast.textContent = 'URL copied to clipboard!'
      document.body.appendChild(toast)
      setTimeout(() => toast.remove(), 3000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleLaunchCampaign = async () => {
    // Validace základních údajů
    if (!startDate || !endDate || !termsAccepted || !influencerData) return
    
    // Validace dat - musí být v budoucnosti
    const now = new Date()
    const startDateTime = new Date(startDate)
    const endDateTime = new Date(endDate)
    
    if (startDateTime <= now || endDateTime <= now || endDateTime <= startDateTime) {
      console.error('❌ Invalid campaign dates - dates must be in future')
      // Show error message to user
      const errorMessage = startDateTime <= now && endDateTime <= now 
        ? 'Both campaign dates must be in the future'
        : startDateTime <= now 
        ? 'Campaign start date must be in the future'
        : endDateTime <= now 
        ? 'Campaign end date must be in the future'
        : 'Campaign end date must be after start date'
      
      alert('❌ ' + errorMessage)
      return
    }
    
    setIsLaunching(true)
    
    try {
      // Get token from localStorage or sessionStorage
      const token = localStorage.getItem('influencer_token') || sessionStorage.getItem('influencer_token')
      if (!token) {
        console.log('❌ No authentication token found for campaign launch')
        setIsLaunching(false)
        return
      }

      // Ensure we have a slug - if not, generate one last time
      let finalSlug = campaignSlug
      if (!finalSlug) {
        console.log('⚠️ No campaignSlug available, generating emergency slug...')
        const timestamp = Math.floor(Date.now() / 1000)
        const cleanInfluencer = influencerData.name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-+|-+$/g, '')
          .substring(0, 20)
        finalSlug = `${cleanInfluencer}-goozy-demo-brand-${timestamp}`
        setCampaignSlug(finalSlug)
      }

      console.log('🔗 Using slug for API call:', finalSlug)

      // Save campaign data to database via API - use pre-generated slug
      const response = await fetch('/api/influencer/campaigns', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${influencerData.name}'s Campaign ${new Date().toLocaleDateString()}`,
          description: `Personal product recommendations campaign by ${influencerData.name}`,
          startDate,
          endDate,
          expectedReach: 125000, // Based on follower count
          budgetAllocated: 2000,
          slug: finalSlug // Use pre-generated slug
        })
      })

      const result = await response.json()
      
      console.log('🔍 Launch API Response:', result)
      console.log('🔍 Response status:', response.status)

      if (result.success) {
        console.log('✅ Campaign saved to database:', result.campaign)
        console.log('🔗 Campaign URL confirmed:', result.campaign.url)
        console.log('🏷️ Campaign slug confirmed:', result.campaign.slug)
        
        // URL should already be correct, but confirm it matches
        if (result.campaign.url !== campaignUrl) {
          console.log('⚠️ URL mismatch, updating:', result.campaign.url)
          setCampaignUrl(result.campaign.url)
        }
        
        // Also keep localStorage for backward compatibility
        const campaignData = {
          id: result.campaign.id,
          startDate,
          endDate,
          campaignUrl: result.campaign.url,
          launchedAt: new Date().toISOString(),
          slug: result.campaign.slug
        }
        localStorage.setItem('activeCampaign', JSON.stringify(campaignData))
        
        setIsLaunching(false)
        setShowSuccess(true)
        
        // Redirect to live campaign page using the confirmed slug
        setTimeout(() => {
          router.push(`/campaign/${result.campaign.slug}`)
        }, 2000)
      } else {
        throw new Error(result.error || 'Failed to save campaign')
      }
      
    } catch (error) {
      console.error('❌ Error launching campaign:', error)
      setIsLaunching(false)
      
      // Fallback to localStorage only
      const campaignData = {
        startDate,
        endDate,
        campaignUrl,
        launchedAt: new Date().toISOString()
      }
      localStorage.setItem('activeCampaign', JSON.stringify(campaignData))
      
      setShowSuccess(true)
      setTimeout(() => {
        // Fallback to a default slug if API failed
        router.push(`/campaign/fallback-campaign-${Date.now()}`)
      }, 2000)
    }
  }

  // Form validation - all basic fields required + dates must be in future
  const isFormValid = (() => {
    // Check if all basic fields are filled
    if (!startDate || !endDate || !termsAccepted || !influencerData) return false
    
    // Check if dates are in the future
    const now = new Date()
    const startDateTime = new Date(startDate)
    const endDateTime = new Date(endDate)
    
    return startDateTime > now && endDateTime > now && endDateTime > startDateTime
  })()

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Campaign Launched!</h2>
          <p className="text-gray-600 mb-4">Your campaign is now live and ready for customers.</p>
          <div className="animate-spin w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Redirecting to your live campaign...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Launch Your Campaign</h1>
              <p className="text-sm text-gray-500">Set up your campaign schedule and go live</p>
            </div>
            
            <Link
              href="/influencer/campaign/preview"
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              ← Back to Preview
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Progress Bar */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-2"></div>
          
          <div className="p-8">
            {/* Step 1: Campaign Schedule */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Campaign Schedule</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-11">
                {/* Start DateTime */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Start (date & time)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={startDate.split('T')[0] || ''}
                      onChange={(e) => {
                        const timeValue = startDate.split('T')[1] || '12:00'
                        const newDateTime = e.target.value ? `${e.target.value}T${timeValue}` : ''
                        setStartDate(newDateTime)
                      }}
                      min={new Date().toISOString().slice(0,10)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                    <input
                      type="time"
                      value={startDate.split('T')[1] || '12:00'}
                      onChange={(e) => {
                        const dateValue = startDate.split('T')[0] || new Date().toISOString().slice(0,10)
                        const newDateTime = `${dateValue}T${e.target.value}`
                        setStartDate(newDateTime)
                      }}
                      className="w-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
                {/* End DateTime */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign End (date & time)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={endDate.split('T')[0] || ''}
                      onChange={(e) => {
                        const timeValue = endDate.split('T')[1] || '18:00'
                        const newDateTime = e.target.value ? `${e.target.value}T${timeValue}` : ''
                        setEndDate(newDateTime)
                      }}
                      min={startDate ? startDate.split('T')[0] : new Date().toISOString().slice(0,10)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                    <input
                      type="time"
                      value={endDate.split('T')[1] || '18:00'}
                      onChange={(e) => {
                        const dateValue = endDate.split('T')[0] || (startDate ? startDate.split('T')[0] : new Date().toISOString().slice(0,10))
                        const newDateTime = `${dateValue}T${e.target.value}`
                        setEndDate(newDateTime)
                      }}
                      className="w-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
              
              {startDate && endDate && (
                <div className="ml-11 mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Campaign Duration:</strong> {(() => {
                      const start = new Date(startDate)
                      const end = new Date(endDate)
                      const diffMs = end.getTime() - start.getTime()
                      
                      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
                      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
                      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
                      
                      let duration = ''
                      if (days > 0) duration += `${days} ${days === 1 ? 'day' : 'days'}`
                      if (hours > 0) {
                        if (duration) duration += ', '
                        duration += `${hours} ${hours === 1 ? 'hour' : 'hours'}`
                      }
                      if (minutes > 0 && days === 0) {
                        if (duration) duration += ', '
                        duration += `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`
                      }
                      
                      return duration || '0 minutes'
                    })()}
                  </p>
                </div>
              )}
            </div>

            {/* Step 2: Campaign URL */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  campaignUrl ? 'bg-green-600 text-white' : (() => {
                    // Check if dates are set and in future for step status
                    const now = new Date()
                    const startDateTime = startDate ? new Date(startDate) : null
                    const endDateTime = endDate ? new Date(endDate) : null
                    const bothDatesInFuture = startDateTime && endDateTime && 
                                              startDateTime > now && 
                                              endDateTime > now &&
                                              endDateTime > startDateTime
                    return (influencerData && bothDatesInFuture) ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                  })()
                }`}>
                  2
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Campaign URL</h2>
              </div>
              
              <div className="ml-11">
                {campaignUrl ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-800 mb-2">
                        <strong>✅ Campaign URL Generated!</strong>
                      </p>
                      <p className="text-xs text-green-600 mb-3">
                        Your campaign URL is ready! You can copy it now and it will be active after you launch the campaign.
                      </p>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={campaignUrl}
                          readOnly
                          className="flex-1 px-3 py-2 bg-white border border-green-300 rounded text-sm font-mono"
                        />
                        <button
                          onClick={copyToClipboard}
                          className="px-4 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>Campaign URL will be generated automatically</strong>
                    </p>
                    <p className="text-xs text-blue-600 mt-2">
                      Your unique campaign URL will be generated automatically when you set valid campaign dates.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Step 3: Terms & Launch */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  termsAccepted ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  3
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Terms & Launch</h2>
              </div>
              
              <div className="ml-11 space-y-6">
                {/* Terms Checkbox */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    I agree to the{' '}
                    <a href="#" className="text-blue-600 hover:underline">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-blue-600 hover:underline">
                      Campaign Guidelines
                    </a>
                    . I understand that once launched, the campaign will be live and accessible to customers.
                  </span>
                </label>

                {/* Launch Info or Error */}
                {startDate && endDate && (() => {
                  const now = new Date()
                  const startDateTime = new Date(startDate)
                  const endDateTime = new Date(endDate)
                  
                  // Show error if dates are invalid
                  if (startDateTime <= now || endDateTime <= now || endDateTime <= startDateTime) {
                    return (
                      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L3.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <p className="text-sm text-red-800 font-semibold">
                            Campaign Schedule Error
                          </p>
                        </div>
                        <p className="text-sm text-red-700">
                          {startDateTime <= now && endDateTime <= now
                            ? "Both campaign dates must be set in the future. Please choose dates after today."
                            : startDateTime <= now
                            ? "Campaign start date must be in the future. Please choose a start date after today."
                            : endDateTime <= now
                            ? "Campaign end date must be in the future. Please choose an end date after today."
                            : endDateTime <= startDateTime
                            ? "Campaign end date must be after the start date. Please adjust your schedule."
                            : "Please check your campaign dates."
                          }
                        </p>
                      </div>
                    )
                  }
                  
                  // Show success info if dates are valid
                  return (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <strong>Campaign will launch:</strong> {startDateTime.toLocaleString('en-US', {
                          weekday: 'long',
                          year: 'numeric', 
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )
                })()}

                {/* Launch Button */}
                <button
                  onClick={handleLaunchCampaign}
                  disabled={!isFormValid || isLaunching}
                  className={`w-full py-4 px-6 rounded-xl text-lg font-semibold ${
                    isFormValid && !isLaunching
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isLaunching ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                      Launching Campaign...
                    </div>
                  ) : (
                    'Launch Campaign'
                  )}
                </button>

                {!isFormValid && (
                  <div className="text-sm text-center">
                    {!startDate || !endDate ? (
                      <span className="text-red-600">❌ Please set both campaign start and end dates</span>
                    ) : !influencerData ? (
                      <span className="text-gray-500">Loading influencer data...</span>
                    ) : (() => {
                      // Check specific date validation issues FIRST (before terms)
                      const now = new Date()
                      const startDateTime = new Date(startDate)
                      const endDateTime = new Date(endDate)
                      
                      if (startDateTime <= now && endDateTime <= now) {
                        return <span className="text-red-600">❌ Both campaign dates must be in the future</span>
                      } else if (startDateTime <= now) {
                        return <span className="text-red-600">❌ Campaign start date must be in the future</span>
                      } else if (endDateTime <= now) {
                        return <span className="text-red-600">❌ Campaign end date must be in the future</span>
                      } else if (endDateTime <= startDateTime) {
                        return <span className="text-red-600">❌ Campaign end date must be after start date</span>
                      } else if (!termsAccepted) {
                        return <span className="text-red-600">❌ Please accept the terms to continue</span>
                      }
                      return <span className="text-gray-500">Campaign validation...</span>
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 
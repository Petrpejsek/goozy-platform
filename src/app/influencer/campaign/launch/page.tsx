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
  const [isLaunching, setIsLaunching] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)


  // Initialize default times on component mount  
  useEffect(() => {
    // Set default start time if not set
    if (!startDate) {
      const today = new Date().toISOString().slice(0,10)
      setStartDate(`${today}T12:00`)
    }
    // Set default end time if not set
    if (!endDate) {
      const today = new Date().toISOString().slice(0,10)
      setEndDate(`${today}T18:00`)
    }
  }, [])

  // Auto-generate URL when end date changes
  useEffect(() => {
    if (endDate) {
      handleGenerateUrl()
    }
  }, [endDate])

  // Generate campaign URL based on influencer name (můžete později použít data z databáze)
  const generateCampaignUrl = () => {
    const influencerSlug = 'aneta' // Můžete získat z authentication/databáze
    const campaignId = Math.random().toString(36).substr(2, 9)
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
    return `${origin}/campaign/${influencerSlug}-${campaignId}`
  }

  const handleGenerateUrl = () => {
    console.log('handleGenerateUrl called', { startDate, endDate }) // Debug
    // Generate URL when end date is set and campaign is in the future
    if (!endDate) {
      console.log('No end date set')
      return
    }
    
    const endDateOnly = endDate.split('T')[0]
    const today = new Date().toISOString().slice(0,10)
    
    console.log('Comparing dates:', { endDateOnly, today }) // Debug
    
    if (endDateOnly && endDateOnly > today) {
      const url = generateCampaignUrl()
      setCampaignUrl(url)
      console.log('Generated URL:', url) // Pro debugging
    } else {
      console.log('End date not in future:', { endDateOnly, today }) // Debug
      setCampaignUrl('') // Clear URL if not valid
    }
  }

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
    if (!startDate || !endDate || !termsAccepted || !campaignUrl) return
    
    setIsLaunching(true)
    
    // Simulate campaign launch process
    setTimeout(() => {
      setIsLaunching(false)
      setShowSuccess(true)
      
      // Redirect to live campaign page
      setTimeout(() => {
        const urlParts = campaignUrl.split('/')
        const campaignSlug = urlParts[urlParts.length - 1]
        router.push(`/campaign/${campaignSlug}`)
      }, 2000)
    }, 1500) // Simple 1.5s launch process
  }

  const isFormValid = startDate && endDate && termsAccepted && campaignUrl

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
                        // Generate URL when end date is set
                        setTimeout(() => {
                          if (newDateTime) {
                            handleGenerateUrl()
                          }
                        }, 100)
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
                        // Generate URL when end time is set
                        setTimeout(() => {
                          if (newDateTime) {
                            handleGenerateUrl()
                          }
                        }, 100)
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
                  campaignUrl ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
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
                        <strong>Your campaign URL is ready!</strong>
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
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600">
                      URL will be generated automatically when you set the end date.
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

                {/* Launch Info */}
                {startDate && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>Campaign will launch:</strong> {new Date(startDate).toLocaleString('en-US', {
                        weekday: 'long',
                        year: 'numeric', 
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}

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
                  <div className="text-sm text-gray-500 text-center">
                    {!startDate || !endDate ? 'Please set campaign dates' : 
                     !campaignUrl ? 'Generating campaign URL...' :
                     !termsAccepted ? 'Please accept the terms to continue' : ''}
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
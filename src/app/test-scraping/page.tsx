'use client'

import { useState } from 'react'

export default function TestScrapingPage() {
  const [searchTerm, setSearchTerm] = useState('fashion')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)

  const handleTest = async () => {
    setLoading(true)
    setResults(null)

    try {
      const response = await fetch('/api/test-scraping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ searchTerm }),
      })

      const data = await response.json()
      setResults(data)
    } catch (error) {
      setResults({
        success: false,
        error: 'Network error',
        message: 'Failed to connect to API'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🧪 Test Google Search Scraping</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Term
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="e.g. fashion, lifestyle, beauty"
              />
            </div>
            <button
              onClick={handleTest}
              disabled={loading || !searchTerm}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Search'}
            </button>
          </div>
        </div>

        {results && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Results</h2>
            
            {results.success ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <h3 className="font-medium text-green-800">✅ Success!</h3>
                  <p className="text-green-700">{results.message}</p>
                  <p className="text-sm text-green-600 mt-2">
                    Found {results.foundProfiles} profiles for "{results.searchTerm}"
                  </p>
                </div>
                
                {results.profiles && results.profiles.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Found Profiles:</h4>
                    <div className="space-y-2">
                      {results.profiles.map((profile: string, index: number) => (
                        <div key={index} className="bg-gray-50 rounded px-3 py-2">
                          <span className="font-mono text-sm">@{profile}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <h3 className="font-medium text-red-800">❌ Error</h3>
                <p className="text-red-700">{results.message}</p>
                {results.error && (
                  <p className="text-sm text-red-600 mt-2 font-mono">{results.error}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 
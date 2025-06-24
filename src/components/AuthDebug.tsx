'use client'

import { useState, useEffect } from 'react'

export default function AuthDebug() {
  const [tokens, setTokens] = useState<any>({})
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const updateTokens = () => {
      setTokens({
        localStorage_influencer_token: localStorage.getItem('influencer_token'),
        sessionStorage_influencer_token: sessionStorage.getItem('influencer_token'),
        localStorage_influencer_user: localStorage.getItem('influencer_user'),
        sessionStorage_influencer_user: sessionStorage.getItem('influencer_user'),
      })
    }

    updateTokens()
    const interval = setInterval(updateTokens, 1000)
    return () => clearInterval(interval)
  }, [])

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white px-3 py-1 rounded text-xs z-50"
      >
        Debug Auth
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg z-50 max-w-sm">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-sm">Auth Status</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-2 text-xs">
        <div>
          <strong>localStorage influencer_token:</strong>
          <br />
          <code className="bg-gray-100 p-1 rounded text-xs break-all">
            {tokens.localStorage_influencer_token ? 
              `${tokens.localStorage_influencer_token.substring(0, 20)}...` : 
              'null'
            }
          </code>
        </div>
        
        <div>
          <strong>sessionStorage influencer_token:</strong>
          <br />
          <code className="bg-gray-100 p-1 rounded text-xs break-all">
            {tokens.sessionStorage_influencer_token ? 
              `${tokens.sessionStorage_influencer_token.substring(0, 20)}...` : 
              'null'
            }
          </code>
        </div>
        
        <div>
          <strong>localStorage user:</strong>
          <br />
          <code className="bg-gray-100 p-1 rounded text-xs break-all">
            {tokens.localStorage_influencer_user ? 
              JSON.parse(tokens.localStorage_influencer_user).name : 
              'null'
            }
          </code>
        </div>
        
        <div>
          <strong>sessionStorage user:</strong>
          <br />
          <code className="bg-gray-100 p-1 rounded text-xs break-all">
            {tokens.sessionStorage_influencer_user ? 
              JSON.parse(tokens.sessionStorage_influencer_user).name : 
              'null'
            }
          </code>
        </div>
      </div>
      
      <button
        onClick={() => {
          localStorage.clear()
          sessionStorage.clear()
          window.location.reload()
        }}
        className="mt-2 bg-red-500 text-white px-2 py-1 rounded text-xs"
      >
        Clear All & Reload
      </button>
    </div>
  )
} 
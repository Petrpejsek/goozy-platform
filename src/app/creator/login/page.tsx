'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CreatorLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/auth/creator/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Login successful, saving token and user data')
        
        // Save authentication token and user data 
        if (rememberMe) {
          // Use localStorage for persistent storage
          localStorage.setItem('creator_token', data.token)
          localStorage.setItem('creator_user', JSON.stringify(data.creator))
        } else {
          // Use sessionStorage for session-only storage
          sessionStorage.setItem('creator_token', data.token)
          sessionStorage.setItem('creator_user', JSON.stringify(data.creator))
        }
        
        console.log('Redirecting to dashboard...')
        router.push('/creator/dashboard')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Login failed. Please check your credentials.')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
       <div className="absolute top-8 left-8">
        <Link href="/" className="text-2xl font-bold text-black tracking-tight">
          GOOZY
        </Link>
      </div>
      <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-black">Creator Login</h2>
          <p className="text-gray-500 mt-2">
            Access your dashboard to manage products and track earnings.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="Your password"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Stay logged in
              </label>
            </div>
            <div className="text-sm">
              <a href="#" className="font-medium text-black hover:underline">
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-colors font-semibold text-lg disabled:opacity-50"
            >
                              {isSubmitting ? 'Logging in...' : 'Log In'}
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500">
          Not a member yet?{' '}
          <Link href="/#creator-form" className="font-medium text-black hover:underline">
            Apply now
          </Link>
        </p>
      </div>
    </div>
  )
} 
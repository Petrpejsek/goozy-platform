'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function BrandLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      // TODO: Replace with actual brand login API
      const response = await fetch('/api/auth/brand/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        // TODO: Handle session/token
        router.push('/partner-company')
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
          <h2 className="text-3xl font-bold text-black">Brand Login</h2>
          <p className="text-gray-500 mt-2">
            Access your partner dashboard to manage campaigns and partnerships.
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
              placeholder="you@company.com"
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
          New to Goozy?{' '}
          <Link href="/#brand-form" className="font-medium text-black hover:underline">
            Start collaborating
          </Link>
        </p>
      </div>
    </div>
  )
} 
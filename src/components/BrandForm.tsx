'use client'

import { useState } from 'react'

export default function BrandForm() {
  const [step, setStep] = useState(1)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    contactName: '',
    brandName: '',
    email: '',
    password: '',
    confirmPassword: '',
    website: '',
    phone: '',
    description: '',
    agreeToTerms: false,
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }))
  }

  const handleNext = () => {
    if (!formData.contactName || !formData.brandName || !formData.email || !formData.password || !formData.confirmPassword) {
      setMessage('Please fill in all required fields.')
      setMessageType('error')
      return
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setMessage('Please enter a valid email address.')
      setMessageType('error')
      return
    }

    if (formData.password.length < 8) {
      setMessage('Password must be at least 8 characters long.')
      setMessageType('error')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match.')
      setMessageType('error')
      return
    }
    
    setMessage('')
    setMessageType('')
    setStep(2)
  }

  const handleBack = () => {
    setStep(1)
    setMessage('')
    setMessageType('')
  }

  const normalizeUrl = (url: string): string => {
    if (!url) return url
    
    const trimmed = url.trim()
    
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed
    }
    
    if (trimmed.startsWith('www.')) {
      return `https://${trimmed}`
    }
    
    if (!trimmed.includes('://') && !trimmed.startsWith('www.')) {
      return `https://www.${trimmed}`
    }
    
    return `https://${trimmed}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')
    setMessageType('')

    if (!formData.agreeToTerms) {
      setMessage('Please agree to the Terms & Conditions and GDPR Policy.')
      setMessageType('error')
      setIsSubmitting(false)
      return
    }

    try {
      const normalizedWebsite = normalizeUrl(formData.website)
      
      const response = await fetch('/api/applications/brand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactName: formData.contactName,
          brandName: formData.brandName,
          email: formData.email,
          password: formData.password,
          website: normalizedWebsite,
          phone: formData.phone,
          description: formData.description,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setMessage('Thank you for your application! Your company will need to be approved and you will be contacted within 48 hours.')
        setMessageType('success')
        setIsSubmitted(true)
        setFormData({
          contactName: '',
          brandName: '',
          email: '',
          password: '',
          confirmPassword: '',
          website: '',
          phone: '',
          description: '',
          agreeToTerms: false,
        })
        setStep(1)
      } else {
        setMessage(result.error || 'An error occurred. Please try again.')
        setMessageType('error')
        setIsSubmitted(false) // Uistí sa, že formulár ostane viditeľný pri chybe
      }
    } catch (error) {
      setMessage('A network error occurred. Please try again later.')
      setMessageType('error')
      setIsSubmitted(false) // Uistí sa, že formulár ostane viditeľný pri chybe
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setIsSubmitted(false)
    setMessage('')
    setMessageType('')
    setStep(1)
  }

  if (isSubmitted && messageType === 'success') {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h3 className="text-2xl font-bold text-black mb-4">Application Submitted!</h3>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <p className="text-green-800 text-lg leading-relaxed">
            Thank you for your application! Your company will need to be approved and you will be contacted within 48 hours.
          </p>
        </div>
        
        <button
          onClick={resetForm}
          className="text-black font-medium hover:underline"
        >
          Submit another application
        </button>
        
        <div className="text-center pt-6 border-t border-gray-200 mt-8">
          <p className="text-gray-600 text-sm">
            Already have an account?{' '}
            <a 
              href="/brand/login" 
              className="text-black font-medium hover:underline"
            >
              Log in here
            </a>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step >= 1 ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            1
          </div>
          <div className={`w-16 h-1 mx-2 ${step >= 2 ? 'bg-black' : 'bg-gray-200'}`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step >= 2 ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            2
          </div>
        </div>
      </div>

      <div className="flex justify-between text-center mb-8">
        <div className="flex-1">
          <p className={`text-sm font-medium ${step >= 1 ? 'text-black' : 'text-gray-400'}`}>
            Basic Information
          </p>
        </div>
        <div className="flex-1">
          <p className={`text-sm font-medium ${step >= 2 ? 'text-black' : 'text-gray-400'}`}>
            Company Details
          </p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg text-sm mb-6 ${
          messageType === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-5">
          <div>
            <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-2">
              Your Name *
            </label>
            <input
              type="text"
              name="contactName"
              id="contactName"
              required
              value={formData.contactName}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="John Smith"
            />
          </div>

          <div>
            <label htmlFor="brandName" className="block text-sm font-medium text-gray-700 mb-2">
              Company Name *
            </label>
            <input
              type="text"
              name="brandName"
              id="brandName"
              required
              value={formData.brandName}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="Your Company Ltd."
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Company Email *
            </label>
            <input
              type="email"
              name="email"
              id="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="contact@yourcompany.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <input
              type="password"
              name="password"
              id="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="Create a secure password"
            />
            <p className="text-xs text-gray-500 mt-1">
              At least 8 characters long
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password *
            </label>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="Confirm your password"
            />
          </div>

          <div className="pt-4">
            <button
              type="button"
              onClick={handleNext}
              className="w-full bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-colors font-semibold text-lg"
            >
              Continue
            </button>
          </div>

          <div className="text-center pt-2 border-t border-gray-200">
            <p className="text-gray-600 text-sm">
              Already have an account?{' '}
              <a 
                href="/brand/login" 
                className="text-black font-medium hover:underline"
              >
                Log in here
              </a>
            </p>
          </div>
        </div>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
              Company Website *
            </label>
            <input
              type="text"
              name="website"
              id="website"
              required
              value={formData.website}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="www.yourcompany.com or yourcompany.com"
            />
            <p className="text-xs text-gray-500 mt-1">
              You can enter just www.example.com or example.com - we'll add https:// automatically
            </p>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              id="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Tell us more about your brand/company
            </label>
            <textarea
              name="description"
              id="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none"
              placeholder="What products do you offer? What are you looking for in a partnership?"
            ></textarea>
          </div>

          <div className="flex items-start space-x-3 pt-2">
            <input
              type="checkbox"
              id="agreeToTerms"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              required
              className="mt-1 w-4 h-4 text-black border-gray-300 rounded focus:ring-black focus:ring-2"
            />
            <label htmlFor="agreeToTerms" className="text-sm text-gray-600">
              I agree to{' '}
              <a 
                href="#" 
                className="text-black font-medium hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Terms & Conditions
              </a>
              {' '}and{' '}
              <a 
                href="#" 
                className="text-black font-medium hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                GDPR Policy
              </a>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 bg-white text-black border-2 border-gray-300 px-6 py-3 rounded-full hover:bg-gray-50 transition-colors font-semibold text-lg"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-colors font-semibold text-lg disabled:opacity-50"
            >
              {isSubmitting ? 'Sending...' : 'Send Inquiry'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
} 
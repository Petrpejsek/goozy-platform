'use client'

import { useState } from 'react'

interface FormData {
  // Step 1: Basic Info
  name: string
  email: string
  password: string
  confirmPassword: string
  
  // Step 2: Social Networks
  instagram: string
  tiktok: string
  youtube: string
  facebook: string
  
  // Step 3: Content and Preferences
  categories: string[]
  customCategory: string
  bio: string
}

export default function MultiStepInfluencerForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    instagram: '',
    tiktok: '',
    youtube: '',
    facebook: '',
    categories: [],
    customCategory: '',
    bio: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        categories: [...prev.categories, category]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        categories: prev.categories.filter(c => c !== category)
      }))
    }
  }

  const handleOtherCategoryChange = (checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        categories: [...prev.categories, 'Other']
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        categories: prev.categories.filter(c => c !== 'Other'),
        customCategory: ''
      }))
    }
  }

  const handleCustomCategoryText = (text: string) => {
    setFormData(prev => ({
      ...prev,
      customCategory: text
    }))
  }



  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.name || !formData.email || !formData.password) {
          setMessage('Please fill in all required fields.')
          setMessageType('error')
          return false
        }
        if (formData.password !== formData.confirmPassword) {
          setMessage('Passwords do not match.')
          setMessageType('error')
          return false
        }
        if (formData.password.length < 6) {
          setMessage('Password must be at least 6 characters long.')
          setMessageType('error')
          return false
        }
        break
      case 2:
        if (!formData.instagram && !formData.tiktok && !formData.youtube && !formData.facebook) {
          setMessage('Please provide at least one social media profile.')
          setMessageType('error')
          return false
        }
        break
      case 3:
        if (formData.categories.length === 0) {
          setMessage('Please select at least one content category.')
          setMessageType('error')
          return false
        }
        break
    }
    setMessage('')
    return true
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => prev - 1)
    setMessage('')
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) return
    
    setIsSubmitting(true)
    setMessage('')

    try {
      // Prepare categories - if "Other" is selected and custom text exists, replace "Other" with the custom text
      let categoriesForSubmit = [...formData.categories]
      if (formData.categories.includes('Other') && formData.customCategory.trim()) {
        categoriesForSubmit = categoriesForSubmit.filter(cat => cat !== 'Other')
        categoriesForSubmit.push(formData.customCategory.trim())
      }

      const submitData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        instagram: formData.instagram,
        tiktok: formData.tiktok,
        youtube: formData.youtube,
        facebook: formData.facebook,
                  categories: categoriesForSubmit,
          bio: formData.bio
      }

      const response = await fetch('/api/applications/influencer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      const result = await response.json()

      if (response.ok) {
        setMessageType('success')
        setMessage(result.message || 'Application submitted successfully! We will review it and get back to you soon.')
        setIsSubmitted(true)
      } else {
        setMessageType('error')
        setMessage(result.error || 'Failed to submit application.')
      }
    } catch (error) {
      setMessageType('error')
      setMessage('An error occurred. Please try again later.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white p-8 lg:p-12 rounded-3xl shadow-sm border border-gray-100">
      {/* Show success message only after submission */}
      {isSubmitted ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">Thank You!</h3>
          <p className="text-gray-600 text-lg leading-relaxed">
            {message}
          </p>
        </div>
      ) : (
        <>
          {/* Progress bar */}
          <div className="w-full mb-12">
            {/* Layer for circles and lines */}
            <div className="flex items-center justify-between">
              {/* Step 1 */}
              <div className="flex flex-col items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${currentStep >= 1 ? 'bg-black text-white' : 'bg-gray-200 text-gray-400'}`}>
                  {currentStep > 1 ? '✓' : '1'}
                </div>
                <p className={`text-sm transition-colors duration-300 ${currentStep >= 1 ? 'font-semibold text-black' : 'text-gray-400'} mt-2 text-center`}>Basic Info</p>
              </div>

              {/* Line 1 */}
              <div className="flex-1 h-px bg-gray-200 mx-4 max-w-24">
                <div className={`h-px bg-black transition-all duration-500 ease-in-out ${currentStep > 1 ? 'w-full' : 'w-0'}`}></div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${currentStep >= 2 ? 'bg-black text-white' : 'bg-gray-200 text-gray-400'}`}>
                  {currentStep > 2 ? '✓' : '2'}
                </div>
                <p className={`text-sm transition-colors duration-300 ${currentStep >= 2 ? 'font-semibold text-black' : 'text-gray-400'} mt-2 text-center`}>Social Networks</p>
              </div>

              {/* Line 2 */}
              <div className="flex-1 h-px bg-gray-200 mx-4 max-w-24">
                <div className={`h-px bg-black transition-all duration-500 ease-in-out ${currentStep > 2 ? 'w-full' : 'w-0'}`}></div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${currentStep >= 3 ? 'bg-black text-white' : 'bg-gray-200 text-gray-400'}`}>
                  3
                </div>
                <p className={`text-sm transition-colors duration-300 ${currentStep >= 3 ? 'font-semibold text-black' : 'text-gray-400'} mt-2 text-center`}>Content & Preferences</p>
              </div>
            </div>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-lg text-sm ${
              messageType === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          {/* Step 1: Basic Info */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-center mb-6 text-gray-900">Basic Info</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="john.doe@example.com"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Password *
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="At least 6 characters"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Confirm Password *
              </label>
              <input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({...prev, confirmPassword: e.target.value}))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Enter your password again"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={nextStep}
              className="bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-colors font-semibold flex items-center gap-2"
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Social Networks */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-center mb-6 text-gray-900">Social Networks</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Instagram
              </label>
              <input
                type="text"
                value={formData.instagram}
                onChange={(e) => setFormData(prev => ({...prev, instagram: e.target.value}))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="@username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                TikTok
              </label>
              <input
                type="text"
                value={formData.tiktok}
                onChange={(e) => setFormData(prev => ({...prev, tiktok: e.target.value}))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="@username"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                YouTube
              </label>
              <input
                type="text"
                value={formData.youtube}
                onChange={(e) => setFormData(prev => ({...prev, youtube: e.target.value}))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Channel Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Facebook
              </label>
              <input
                type="text"
                value={formData.facebook}
                onChange={(e) => setFormData(prev => ({...prev, facebook: e.target.value}))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Profile Name or URL"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={prevStep}
              className="border border-gray-300 text-gray-700 px-8 py-3 rounded-full hover:bg-gray-50 transition-colors font-semibold"
            >
              ← Back
            </button>
            <button
              onClick={nextStep}
              className="bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-colors font-semibold flex items-center gap-2"
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Content & Preferences */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-center mb-6 text-gray-900">Content & Preferences</h3>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-4">
              What categories does your content fit into? *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              {['Fashion', 'Beauty', 'Lifestyle', 'Travel', 'Food', 'Fitness'].map(cat => (
                <label key={cat} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.categories.includes(cat)}
                    onChange={(e) => handleCategoryChange(cat, e.target.checked)}
                    className="h-5 w-5 rounded text-black focus:ring-black border-gray-300"
                  />
                  <span className="text-gray-900 font-medium">{cat}</span>
                </label>
              ))}
            </div>
            
            {/* Other category row */}
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 flex-shrink-0">
                <input
                  type="checkbox"
                  checked={formData.categories.includes('Other')}
                  onChange={(e) => handleOtherCategoryChange(e.target.checked)}
                  className="h-5 w-5 rounded text-black focus:ring-black border-gray-300"
                />
                <span className="text-gray-900 font-medium">Other</span>
              </label>
              
              {formData.categories.includes('Other') && (
                <input
                  type="text"
                  value={formData.customCategory}
                  onChange={(e) => handleCustomCategoryText(e.target.value)}
                  placeholder="Specify your category..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Tell us about yourself (Bio)
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({...prev, bio: e.target.value}))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              rows={4}
              placeholder="What is your content about? What makes you unique?"
            />
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={prevStep}
              className="border border-gray-300 text-gray-700 px-8 py-3 rounded-full hover:bg-gray-50 transition-colors font-semibold"
            >
              ← Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-colors font-semibold disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  )
} 
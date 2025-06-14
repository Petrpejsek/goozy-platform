'use client'

import { useState } from 'react'

interface FormData {
  // Krok 1: Základní info
  name: string
  email: string
  password: string
  confirmPassword: string
  
  // Krok 2: Sociální sítě  
  instagram: string
  tiktok: string
  youtube: string
  followers: string
  
  // Krok 3: Obsah a preference
  categories: string[]
  bio: string
  collaborationTypes: string[]
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
    followers: '',
    categories: [],
    bio: '',
    collaborationTypes: []
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')

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

  const handleCollaborationChange = (type: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        collaborationTypes: [...prev.collaborationTypes, type]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        collaborationTypes: prev.collaborationTypes.filter(t => t !== type)
      }))
    }
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.name || !formData.email || !formData.password) {
          setMessage('Vyplňte všechna povinná pole')
          setMessageType('error')
          return false
        }
        if (formData.password !== formData.confirmPassword) {
          setMessage('Hesla se neshodují')
          setMessageType('error')
          return false
        }
        if (formData.password.length < 6) {
          setMessage('Heslo musí mít alespoň 6 znaků')
          setMessageType('error')
          return false
        }
        break
      case 2:
        if (!formData.followers) {
          setMessage('Vyberte počet followerů')
          setMessageType('error')
          return false
        }
        if (!formData.instagram && !formData.tiktok && !formData.youtube) {
          setMessage('Vyplňte alespoň jednu sociální síť')
          setMessageType('error')
          return false
        }
        break
      case 3:
        if (formData.categories.length === 0) {
          setMessage('Vyberte alespoň jednu kategorii obsahu')
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
      const submitData = {
        name: formData.name,
        email: formData.email,
        password: formData.password, // Nové pole pro heslo
        instagram: formData.instagram,
        tiktok: formData.tiktok, // Nové pole
        youtube: formData.youtube, // Nové pole
        followers: formData.followers,
        categories: formData.categories,
        bio: formData.bio, // Nové pole
        collaborationTypes: formData.collaborationTypes // Nové pole
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
        setMessage(result.message)
        // Reset formuláře
        setCurrentStep(1)
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          instagram: '',
          tiktok: '',
          youtube: '',
          followers: '',
          categories: [],
          bio: '',
          collaborationTypes: []
        })
      } else {
        setMessageType('error')
        setMessage(result.error || 'Chyba při odesílání formuláře')
      }
    } catch (error) {
      setMessageType('error')
      setMessage('Chyba při odesílání formuláře. Zkuste to prosím později.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-sm">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= currentStep
                  ? 'bg-black text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}>
                {step}
              </div>
              {step < 3 && (
                <div className={`w-20 h-1 mx-2 ${
                  step < currentStep ? 'bg-black' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>Základní údaje</span>
          <span>Sociální sítě</span>
          <span>Obsah a preference</span>
        </div>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          messageType === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      {/* Krok 1: Základní údaje */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold mb-4">Základní údaje</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jméno a příjmení *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Jan Novák"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="jan@email.cz"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Heslo *
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Alespoň 6 znaků"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Potvrzení hesla *
              </label>
              <input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({...prev, confirmPassword: e.target.value}))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Zadejte heslo znovu"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={nextStep}
              className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              Pokračovat →
            </button>
          </div>
        </div>
      )}

      {/* Krok 2: Sociální sítě */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold mb-4">Sociální sítě</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                YouTube
              </label>
              <input
                type="text"
                value={formData.youtube}
                onChange={(e) => setFormData(prev => ({...prev, youtube: e.target.value}))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Název kanálu"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Největší počet followerů *
              </label>
              <select 
                required
                value={formData.followers}
                onChange={(e) => setFormData(prev => ({...prev, followers: e.target.value}))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="">Vyberte...</option>
                <option value="1K-10K">1K - 10K</option>
                <option value="10K-50K">10K - 50K</option>
                <option value="50K-100K">50K - 100K</option>
                <option value="100K+">100K+</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={prevStep}
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              ← Zpět
            </button>
            <button
              onClick={nextStep}
              className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              Pokračovat →
            </button>
          </div>
        </div>
      )}

      {/* Krok 3: Obsah a preference */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold mb-4">Obsah a preference</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategorie obsahu * (vyberte alespoň jednu)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {['Fashion', 'Lifestyle', 'Beauty', 'Fitness', 'Travel', 'Food', 'Tech', 'Gaming', 'Jiné'].map((category) => (
                <label key={category} className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="mr-2"
                    checked={formData.categories.includes(category)}
                    onChange={(e) => handleCategoryChange(category, e.target.checked)}
                  />
                  <span className="text-sm">{category}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Typy spolupráce (co vás zajímá)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                'Propagace oblečení', 
                'Dlouhodobá spolupráce', 
                'Jednorázové kampaně', 
                'Affiliate marketing',
                'Recenze produktů',
                'Brand ambasadorství'
              ].map((type) => (
                <label key={type} className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="mr-2"
                    checked={formData.collaborationTypes.includes(type)}
                    onChange={(e) => handleCollaborationChange(type, e.target.checked)}
                  />
                  <span className="text-sm">{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Krátké bio (volitelné)
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({...prev, bio: e.target.value}))}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="Pár slov o sobě a svém obsahu..."
            ></textarea>
          </div>

          <div className="flex justify-between">
            <button
              onClick={prevStep}
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              ← Zpět
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Odesílání...' : 'Odeslat přihlášku ✨'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 
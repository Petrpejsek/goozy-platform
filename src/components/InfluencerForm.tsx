'use client'

import { useState } from 'react'

interface FormData {
  name: string
  email: string
  instagram: string
  followers: string
  categories: string[]
}

export default function InfluencerForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    instagram: '',
    followers: '',
    categories: []
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    try {
      const response = await fetch('/api/applications/influencer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        setMessageType('success')
        setMessage(result.message)
        // Reset formuláře
        setFormData({
          name: '',
          email: '',
          instagram: '',
          followers: '',
          categories: []
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
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-sm">
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          messageType === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}
      
      <div className="grid md:grid-cols-2 gap-6 mb-6">
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
      
      <div className="grid md:grid-cols-2 gap-6 mb-6">
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
            Počet followerů *
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
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Kategorie obsahu * (vyberte alespoň jednu)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {['Fashion', 'Lifestyle', 'Beauty', 'Fitness', 'Travel', 'Jiné'].map((category) => (
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
      
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Odesílání...' : 'Odeslat přihlášku'}
      </button>
    </form>
  )
} 
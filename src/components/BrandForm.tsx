'use client'

import { useState } from 'react'

interface FormData {
  brandName: string
  email: string
  phone: string
  description: string
}

export default function BrandForm() {
  const [formData, setFormData] = useState<FormData>({
    brandName: '',
    email: '',
    phone: '',
    description: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    try {
      const response = await fetch('/api/applications/brand', {
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
          brandName: '',
          email: '',
          phone: '',
          description: ''
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <div className={`p-4 rounded-lg ${
          messageType === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}
      
      <div>
        <input
          type="text"
          placeholder="Název značky *"
          required
          value={formData.brandName}
          onChange={(e) => setFormData(prev => ({...prev, brandName: e.target.value}))}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
        />
      </div>
      <div>
        <input
          type="email"
          placeholder="Email *"
          required
          value={formData.email}
          onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
        />
      </div>
      <div>
        <input
          type="tel"
          placeholder="Telefon"
          value={formData.phone}
          onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
        />
      </div>
      <div>
        <textarea
          placeholder="Stručně popište vaši značku a produkty *"
          rows={3}
          required
          value={formData.description}
          onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
        ></textarea>
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Odesílání...' : 'Odeslat poptávku'}
      </button>
    </form>
  )
} 
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import InfluencerSidebar from '../../../components/InfluencerSidebar'

interface InfluencerData {
  id: string
  name: string
  email: string
  phone?: string
  bio?: string
  avatar?: string
  slug: string
  contentCategories: string[]
  socialNetworks: {
    platform: string
    username: string
    url?: string
  }[]
  profile?: {
    age?: number
    gender?: string
    location?: string
  }
}

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [userData, setUserData] = useState<InfluencerData | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    age: '',
    gender: '',
    location: '',
    instagramUsername: '',
    tiktokUsername: '',
    youtubeChannel: '',
    linkedinUsername: '',
    facebookUsername: '',
    twitterUsername: '',
    contentCategories: [] as string[]
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>('')
  const [isDragging, setIsDragging] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const availableCategories = [
    'Fashion', 'Beauty', 'Lifestyle', 'Fitness', 'Food', 
    'Travel', 'Technology', 'Gaming', 'Art', 'Music',
    'Health', 'Parenting', 'Business', 'Education', 'Entertainment'
  ]

  useEffect(() => {
    loadInfluencerData()
  }, [])

  const loadInfluencerData = async () => {
    try {
      // Získat token z localStorage nebo sessionStorage
      const token = localStorage.getItem('influencer_token') || sessionStorage.getItem('influencer_token')
      if (!token) {
        console.log('❌ No authentication token found')
        router.push('/influencer/login')
        return
      }

      const response = await fetch('/api/influencer/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const responseData = await response.json()
        // API vrací data ve struktuře { influencer: { ... } }
        const data = responseData.influencer || responseData
        setUserData(data)
        
        // Naplnit formulář s daty z API
        setFormData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          bio: data.bio || '',
          age: data.profile?.[0]?.age?.toString() || data.profile?.age?.toString() || '',
          gender: data.profile?.[0]?.gender || data.profile?.gender || '',
          location: data.profile?.[0]?.location || data.profile?.location || '',
          instagramUsername: data.socialNetworks?.find((s: any) => s.platform === 'instagram')?.username || '',
          tiktokUsername: data.socialNetworks?.find((s: any) => s.platform === 'tiktok')?.username || '',
          youtubeChannel: data.socialNetworks?.find((s: any) => s.platform === 'youtube')?.username || '',
          linkedinUsername: data.socialNetworks?.find((s: any) => s.platform === 'linkedin')?.username || '',
          facebookUsername: data.socialNetworks?.find((s: any) => s.platform === 'facebook')?.username || '',
          twitterUsername: data.socialNetworks?.find((s: any) => s.platform === 'twitter')?.username || '',
          contentCategories: data.contentCategories?.map((c: any) => c.category) || []
        })
        
        // Nastavit avatar preview pokud existuje
        if (data.avatar) {
          setAvatarPreview(data.avatar)
        }
        
        console.log('✅ Profile data loaded successfully:', data.name)
      } else if (response.status === 401) {
        console.log('❌ Authentication failed, redirecting to login')
        localStorage.removeItem('influencer_token')
        localStorage.removeItem('influencer_user')
        sessionStorage.removeItem('influencer_token')
        sessionStorage.removeItem('influencer_user')
        router.push('/influencer/login')
        return
      } else {
        const errorData = await response.json()
        setMessage(errorData.error || 'Failed to load profile data')
      }
    } catch (error) {
      console.error('Error loading influencer data:', error)
      setMessage('Error loading profile data')
    } finally {
      setLoading(false)
    }
  }

  // Avatar functions
  const handleAvatarDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleAvatarFile(files[0])
    }
  }

  const handleAvatarFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setMessage('Please select an image file')
    }
  }

  const uploadAvatar = async () => {
    if (!avatarFile) return null

    setUploadingAvatar(true)
    try {
      const formData = new FormData()
      formData.append('avatar', avatarFile)

      const token = localStorage.getItem('influencer_token') || sessionStorage.getItem('influencer_token')
      const response = await fetch('/api/influencer/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        return data.avatarUrl
      } else {
        throw new Error('Failed to upload avatar')
      }
    } catch (error) {
      console.error('Avatar upload error:', error)
      setMessage('Failed to upload avatar')
      return null
    } finally {
      setUploadingAvatar(false)
    }
  }

  // Password change function
  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      setMessage('New password must be at least 6 characters')
      return
    }

    try {
      const token = localStorage.getItem('influencer_token') || sessionStorage.getItem('influencer_token')
      const response = await fetch('/api/influencer/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      if (response.ok) {
        setMessage('Password changed successfully!')
        setShowPasswordModal(false)
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        const error = await response.json()
        setMessage(error.message || 'Failed to change password')
      }
    } catch (error) {
      setMessage('Error changing password')
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    
    try {
      // Získat token
      const token = localStorage.getItem('influencer_token') || sessionStorage.getItem('influencer_token')
      if (!token) {
        setMessage('Authentication token not found. Please log in again.')
        router.push('/influencer/login')
        return
      }

      // Upload avatar if changed
      let avatarUrl = null
      if (avatarFile) {
        avatarUrl = await uploadAvatar()
        if (!avatarUrl) {
          return // Error message already set in uploadAvatar
        }
      }

      // Prepare data for API
      const profileData = {
        name: formData.name,
        phone: formData.phone,
        bio: formData.bio,
        avatar: avatarUrl,
        profile: {
          age: formData.age ? parseInt(formData.age) : null,
          gender: formData.gender || null,
          location: formData.location || null
        },
        socialNetworks: [
          formData.instagramUsername && { platform: 'instagram', username: formData.instagramUsername },
          formData.tiktokUsername && { platform: 'tiktok', username: formData.tiktokUsername },
          formData.youtubeChannel && { platform: 'youtube', username: formData.youtubeChannel },
          formData.linkedinUsername && { platform: 'linkedin', username: formData.linkedinUsername },
          formData.facebookUsername && { platform: 'facebook', username: formData.facebookUsername },
          formData.twitterUsername && { platform: 'twitter', username: formData.twitterUsername }
        ].filter(Boolean), // Remove null/undefined entries
        contentCategories: formData.contentCategories
      }

      const response = await fetch('/api/influencer/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData)
      })

      if (response.ok) {
        setMessage('Profile updated successfully!')
        setAvatarFile(null)
        setAvatarPreview('')
        // Reload data to get updated info
        await loadInfluencerData()
      } else {
        const error = await response.json()
        setMessage(error.message || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Save error:', error)
      setMessage('Error updating profile')
    } finally {
      setSaving(false)
    }
  }

  const toggleCategory = (category: string) => {
    setFormData(prev => ({
      ...prev,
      contentCategories: prev.contentCategories.includes(category)
        ? prev.contentCategories.filter(c => c !== category)
        : [...prev.contentCategories, category]
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <InfluencerSidebar />
      
      <div className="flex-1 ml-64 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Change Password
              </button>
            </div>

            {message && (
              <div className={`mb-6 p-4 rounded-lg ${
                message.includes('successfully') 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {message}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Avatar Section */}
              <div className="lg:col-span-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h3>
                <div className="space-y-4">
                  <div 
                    className={`relative w-48 h-48 mx-auto border-2 border-dashed rounded-lg transition-colors ${
                      isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
                    }`}
                    onDrop={handleAvatarDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onDragEnter={() => setIsDragging(true)}
                    onDragLeave={() => setIsDragging(false)}
                  >
                    {(avatarPreview || userData?.avatar) ? (
                      <Image
                        src={avatarPreview || userData?.avatar || ''}
                        alt="Profile"
                        fill
                        className="object-cover rounded-lg"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <p className="text-sm">Drop image here</p>
                      </div>
                    )}
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleAvatarFile(e.target.files[0])
                      }
                    }}
                  />
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Choose Image
                  </button>
                </div>
              </div>

              {/* Form Section */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Age
                      </label>
                      <input
                        type="number"
                        value={formData.age}
                        onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender
                      </label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    rows={4}
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                {/* Social Networks */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Networks</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Instagram Username
                      </label>
                      <input
                        type="text"
                        value={formData.instagramUsername}
                        onChange={(e) => setFormData(prev => ({ ...prev, instagramUsername: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="@username"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        TikTok Username
                      </label>
                      <input
                        type="text"
                        value={formData.tiktokUsername}
                        onChange={(e) => setFormData(prev => ({ ...prev, tiktokUsername: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="@username"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        YouTube Channel
                      </label>
                      <input
                        type="text"
                        value={formData.youtubeChannel}
                        onChange={(e) => setFormData(prev => ({ ...prev, youtubeChannel: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Channel name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        LinkedIn Username
                      </label>
                      <input
                        type="text"
                        value={formData.linkedinUsername}
                        onChange={(e) => setFormData(prev => ({ ...prev, linkedinUsername: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="username"
                      />
                    </div>
                  </div>
                </div>

                {/* Content Categories */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {availableCategories.map((category) => (
                      <button
                        key={category}
                        onClick={() => toggleCategory(category)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          formData.contentCategories.includes(category)
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-6">
                  <button
                    onClick={handleSave}
                    disabled={saving || uploadingAvatar}
                    className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {saving || uploadingAvatar ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordChange}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 
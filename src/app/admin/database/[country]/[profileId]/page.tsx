'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface ProfileDetail {
  id: string
  name: string
  username: string
  email?: string
  bio?: string
  avatar?: string
  country?: string
  location?: string
  instagramUsername?: string
  instagramUrl?: string
  instagramData?: string
  tiktokUsername?: string
  tiktokUrl?: string
  tiktokData?: string
  youtubeChannel?: string
  youtubeUrl?: string
  youtubeData?: string
  totalFollowers: number
  engagementRate?: number
  avgLikes?: number
  avgComments?: number
  sourceHashtags?: string
  sourceCountry?: string
  foundBy?: string
  isValidated: boolean
  hasEmail: boolean
  isActive: boolean
  lastScrapedAt?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export default function ProfileDetailPage() {
  const params = useParams()
  const country = params.country as string
  const profileId = params.profileId as string
  
  const [profile, setProfile] = useState<ProfileDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProfileData()
  }, [profileId])

  const loadProfileData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/database/profile/${profileId}`)
      
      if (!response.ok) {
        throw new Error(`Profile not found (${response.status})`)
      }
      
      const profileData = await response.json()
      setProfile(profileData)
    } catch (err) {
      console.error('Failed to load profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (updates: Partial<ProfileDetail>) => {
    try {
      const response = await fetch(`/api/admin/database/profile/${profileId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      
      if (response.ok) {
        const updatedProfile = await response.json()
        setProfile(updatedProfile)
        alert('Profile updated successfully')
      } else {
        const error = await response.json()
        alert(`Failed to update profile: ${error.error}`)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Error updating profile')
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'This profile does not exist or has been deleted.'}</p>
          <Link href={`/admin/database/${country}`} className="text-blue-600 hover:text-blue-800">
            ← Back to {country} profiles
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Link href={`/admin/database/${country}`} className="text-blue-600 hover:text-blue-800">
            ← Back to {country}
          </Link>
          <span className="text-gray-400">•</span>
          <Link href="/admin/database" className="text-blue-600 hover:text-blue-800">
            Database Overview
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.name} className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <span className="text-gray-600 font-bold text-xl">
                {profile.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
            <p className="text-gray-600">@{profile.username}</p>
            <div className="flex items-center space-x-4 mt-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                profile.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {profile.isActive ? 'Active' : 'Inactive'}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                profile.isValidated ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {profile.isValidated ? 'Validated' : 'Unvalidated'}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                profile.hasEmail ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {profile.hasEmail ? 'Has Email' : 'No Email'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">📋 Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <p className="text-gray-900">{profile.email || 'Not provided'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <p className="text-gray-900">{profile.bio || 'No bio available'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <p className="text-gray-900">{profile.location || 'Not specified'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <p className="text-gray-900">{profile.country || 'Unknown'}</p>
            </div>
          </div>
        </div>

        {/* Social Media Accounts */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">📱 Social Media</h2>
          <div className="space-y-4">
            {profile.instagramUsername && (
              <div className="flex items-center space-x-3">
                <span className="text-lg">📷</span>
                <div>
                  <p className="font-medium">Instagram</p>
                  <a 
                    href={profile.instagramUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    @{profile.instagramUsername}
                  </a>
                </div>
              </div>
            )}
            
            {profile.tiktokUsername && (
              <div className="flex items-center space-x-3">
                <span className="text-lg">🎵</span>
                <div>
                  <p className="font-medium">TikTok</p>
                  <a 
                    href={profile.tiktokUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    @{profile.tiktokUsername}
                  </a>
                </div>
              </div>
            )}
            
            {profile.youtubeChannel && (
              <div className="flex items-center space-x-3">
                <span className="text-lg">📺</span>
                <div>
                  <p className="font-medium">YouTube</p>
                  <a 
                    href={profile.youtubeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {profile.youtubeChannel}
                  </a>
                </div>
              </div>
            )}
            
            {!profile.instagramUsername && !profile.tiktokUsername && !profile.youtubeChannel && (
              <p className="text-gray-500">No social media accounts linked</p>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">📊 Statistics</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Followers</p>
              <p className="text-2xl font-bold text-gray-900">{profile.totalFollowers.toLocaleString()}</p>
            </div>
            
            {profile.engagementRate && (
              <div>
                <p className="text-sm text-gray-600">Engagement Rate</p>
                <p className="text-2xl font-bold text-gray-900">{profile.engagementRate.toFixed(2)}%</p>
              </div>
            )}
            
            {profile.avgLikes && (
              <div>
                <p className="text-sm text-gray-600">Avg Likes</p>
                <p className="text-2xl font-bold text-gray-900">{profile.avgLikes.toLocaleString()}</p>
              </div>
            )}
            
            {profile.avgComments && (
              <div>
                <p className="text-sm text-gray-600">Avg Comments</p>
                <p className="text-2xl font-bold text-gray-900">{profile.avgComments.toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>

        {/* Discovery & Metadata */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">🔍 Discovery & Metadata</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-700">Found By</p>
              <p className="text-gray-900">{profile.foundBy || 'Unknown'}</p>
            </div>
            
            {profile.sourceHashtags && (
              <div>
                <p className="text-sm font-medium text-gray-700">Source Hashtags</p>
                <p className="text-gray-900">{profile.sourceHashtags}</p>
              </div>
            )}
            
            <div>
              <p className="text-sm font-medium text-gray-700">Created</p>
              <p className="text-gray-900">{new Date(profile.createdAt).toLocaleString()}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-700">Last Updated</p>
              <p className="text-gray-900">{new Date(profile.updatedAt).toLocaleString()}</p>
            </div>
            
            {profile.lastScrapedAt && (
              <div>
                <p className="text-sm font-medium text-gray-700">Last Scraped</p>
                <p className="text-gray-900">{new Date(profile.lastScrapedAt).toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Admin Notes */}
      {profile.notes && (
        <div className="mt-8 bg-yellow-50 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">📝 Admin Notes</h2>
          <p className="text-gray-900">{profile.notes}</p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">⚡ Quick Actions</h2>
        <div className="flex space-x-4">
          <button 
            onClick={() => handleUpdateProfile({ isActive: !profile.isActive })}
            className={`px-4 py-2 rounded font-medium ${
              profile.isActive 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {profile.isActive ? 'Deactivate' : 'Activate'} Profile
          </button>
          
          <button 
            onClick={() => handleUpdateProfile({ isValidated: !profile.isValidated })}
            className={`px-4 py-2 rounded font-medium ${
              profile.isValidated 
                ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {profile.isValidated ? 'Mark Unvalidated' : 'Mark Validated'}
          </button>
        </div>
      </div>
    </div>
  )
} 
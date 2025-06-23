'use client'

import { useState } from 'react'
import Link from 'next/link'

interface InfluencerApplication {
  id: string
  name: string
  email: string
  instagram?: string
  tiktok?: string
  youtube?: string
  facebook?: string
  categories: string
  bio?: string
  collaborationTypes: string
  status: string
  createdAt: Date
}

interface BrandApplication {
  id: string
  brandName: string
  email: string
  phone?: string
  description?: string
  status: string
  createdAt: Date
}

interface InfluencerApplicationCardProps {
  application: InfluencerApplication
}

interface BrandApplicationCardProps {
  application: BrandApplication
}

export function InfluencerApplicationCard({ application }: InfluencerApplicationCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [currentStatus, setCurrentStatus] = useState(application.status)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleAction = async (action: 'approve' | 'reject') => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/applications/influencer/${application.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action })
      })

      if (response.ok) {
        const newStatus = action === 'approve' ? 'approved' : 'rejected'
        setCurrentStatus(newStatus)
        
        // Refresh page to update statistics
        window.location.reload()
      } else {
        alert('Error processing action')
      }
    } catch (error) {
      alert('Error communicating with server')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      // Reset confirmation after 3 seconds if no second click
      setTimeout(() => setConfirmDelete(false), 3000)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/applications/influencer/${application.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        // Refresh page to update the list
        window.location.reload()
      } else {
        alert('Error deleting application')
      }
    } catch (error) {
      alert('Error communicating with server')
    } finally {
      setIsLoading(false)
      setConfirmDelete(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approved'
      case 'rejected':
        return 'Rejected'
      default:
        return 'Pending'
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-black">{application.name}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(currentStatus)}`}>
              {getStatusText(currentStatus)}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mb-2">{application.email}</p>
          
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
            <span>{JSON.parse(application.categories || '[]').join(', ')}</span>
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            {application.instagram && (
              <span className="text-xs bg-pink-50 text-pink-700 px-2 py-1 rounded">
                Instagram
              </span>
            )}
            {application.tiktok && (
              <span className="text-xs bg-black text-white px-2 py-1 rounded">
                TikTok
              </span>
            )}
            {application.youtube && (
              <span className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded">
                YouTube
              </span>
            )}
            {application.facebook && (
              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                Facebook
              </span>
            )}
          </div>
          
          {application.bio && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{application.bio}</p>
          )}
          
          <p className="text-xs text-gray-400">
            Submitted: {new Date(application.createdAt).toLocaleDateString('en-US')}
          </p>
        </div>
        
        <div className="flex flex-col gap-2">
          <Link
            href={`/admin/applications/influencer/${application.id}`}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors inline-block text-center"
          >
            View Details
          </Link>
          
          {currentStatus === 'pending' && (
            <div className="flex gap-2">
              <button
                onClick={() => handleAction('approve')}
                disabled={isLoading}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? '...' : 'Approve'}
              </button>
              <button
                onClick={() => handleAction('reject')}
                disabled={isLoading}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? '...' : 'Reject'}
              </button>
            </div>
          )}
          
          {/* Delete Button */}
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className={`px-2 py-1 text-sm rounded transition-colors disabled:opacity-50 flex items-center justify-center gap-1 ${
              confirmDelete 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600'
            }`}
            title={confirmDelete ? 'Click again to confirm deletion' : 'Delete application'}
          >
            {isLoading ? (
              '...'
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {confirmDelete ? 'Confirm' : 'Delete'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export function BrandApplicationCard({ application }: BrandApplicationCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [currentStatus, setCurrentStatus] = useState(application.status)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleAction = async (action: 'approve' | 'reject') => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/applications/brand/${application.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action })
      })

      if (response.ok) {
        const newStatus = action === 'approve' ? 'approved' : 'rejected'
        setCurrentStatus(newStatus)
        
        // Refresh page to update statistics
        window.location.reload()
      } else {
        alert('Error processing action')
      }
    } catch (error) {
      alert('Error communicating with server')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      // Reset confirmation after 3 seconds if no second click
      setTimeout(() => setConfirmDelete(false), 3000)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/applications/brand/${application.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        // Refresh page to update the list
        window.location.reload()
      } else {
        alert('Error deleting application')
      }
    } catch (error) {
      alert('Error communicating with server')
    } finally {
      setIsLoading(false)
      setConfirmDelete(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approved'
      case 'rejected':
        return 'Rejected'
      default:
        return 'Pending'
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-black">{application.brandName}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(currentStatus)}`}>
              {getStatusText(currentStatus)}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mb-2">{application.email}</p>
          
          {application.phone && (
            <p className="text-sm text-gray-600 mb-2">
              Phone: {application.phone}
            </p>
          )}
          
          {application.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{application.description}</p>
          )}
          
          <p className="text-xs text-gray-400">
            Submitted: {new Date(application.createdAt).toLocaleDateString('en-US')}
          </p>
        </div>
        
        <div className="flex flex-col gap-2">
          <Link
            href={`/admin/applications/brand/${application.id}`}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors inline-block text-center"
          >
            View Details
          </Link>
          
          {currentStatus === 'pending' && (
            <div className="flex gap-2">
              <button
                onClick={() => handleAction('approve')}
                disabled={isLoading}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? '...' : 'Approve'}
              </button>
              <button
                onClick={() => handleAction('reject')}
                disabled={isLoading}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? '...' : 'Reject'}
              </button>
            </div>
          )}
          
          {/* Delete Button */}
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className={`px-2 py-1 text-sm rounded transition-colors disabled:opacity-50 flex items-center justify-center gap-1 ${
              confirmDelete 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600'
            }`}
            title={confirmDelete ? 'Click again to confirm deletion' : 'Delete application'}
          >
            {isLoading ? (
              '...'
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {confirmDelete ? 'Confirm' : 'Delete'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
} 
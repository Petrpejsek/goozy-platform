'use client'

import Link from 'next/link'

interface InfluencerApplication {
  id: string
  name: string
  email: string
  instagram?: string
  tiktok?: string
  youtube?: string
  followers: number
  categories: string
  bio?: string
  collaborationTypes: string
  status: string
  createdAt: Date
}

interface BrandApplication {
  id: string
  name: string
  email: string
  website?: string
  category: string
  description?: string
  collaborationType: string
  budget?: string
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
        return 'Schváleno'
      case 'rejected':
        return 'Zamítnuto'
      default:
        return 'Čeká na schválení'
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-black">{application.name}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
              {getStatusText(application.status)}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mb-2">{application.email}</p>
          
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
            <span>{application.followers.toLocaleString()} followerů</span>
            <span>•</span>
            <span>{application.categories}</span>
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
          </div>
          
          {application.bio && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{application.bio}</p>
          )}
          
          <p className="text-xs text-gray-400">
            Podáno: {new Date(application.createdAt).toLocaleDateString('cs-CZ')}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Link
            href={`/api/admin/applications/influencer/${application.id}?action=approve`}
            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
          >
            Schválit
          </Link>
          <Link
            href={`/api/admin/applications/influencer/${application.id}?action=reject`}
            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
          >
            Zamítnout
          </Link>
        </div>
      </div>
    </div>
  )
}

export function BrandApplicationCard({ application }: BrandApplicationCardProps) {
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
        return 'Schváleno'
      case 'rejected':
        return 'Zamítnuto'
      default:
        return 'Čeká na schválení'
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-black">{application.name}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
              {getStatusText(application.status)}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mb-2">{application.email}</p>
          
          {application.website && (
            <p className="text-sm text-blue-600 hover:underline mb-2">
              <a href={application.website} target="_blank" rel="noopener noreferrer">
                {application.website}
              </a>
            </p>
          )}
          
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
            <span>{application.category}</span>
            <span>•</span>
            <span>{application.collaborationType}</span>
          </div>
          
          {application.budget && (
            <p className="text-sm text-green-600 font-medium mb-2">
              Budget: {application.budget}
            </p>
          )}
          
          {application.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{application.description}</p>
          )}
          
          <p className="text-xs text-gray-400">
            Podáno: {new Date(application.createdAt).toLocaleDateString('cs-CZ')}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Link
            href={`/api/admin/applications/brand/${application.id}?action=approve`}
            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
          >
            Schválit
          </Link>
          <Link
            href={`/api/admin/applications/brand/${application.id}?action=reject`}
            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
          >
            Zamítnout
          </Link>
        </div>
      </div>
    </div>
  )
} 
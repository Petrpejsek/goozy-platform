import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import BrandApplicationActions from './BrandApplicationActions'

interface PageProps {
  params: {
    id: string
  }
}

export default async function BrandApplicationDetail({ params }: PageProps) {
  const application = await prisma.brandApplication.findUnique({
    where: { id: params.id }
  })

  if (!application) {
    notFound()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-50 text-green-800 border-green-200'
      case 'rejected': return 'bg-red-50 text-red-800 border-red-200'
      case 'pending': return 'bg-yellow-50 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-50 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href="/admin" 
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Brand Application Detail</h1>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(application.status)}`}>
              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Application Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">{application.brandName}</h1>
              
              {/* Company Information */}
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {application.contactName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                    <p className="text-sm text-gray-900 font-medium">{application.contactName}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <p className="text-sm text-gray-900 font-medium">{application.brandName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Email</label>
                  <p className="text-sm text-gray-900">{application.email}</p>
                </div>
                {application.website && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                    <a 
                      href={application.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      {application.website}
                    </a>
                  </div>
                )}
                {application.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <p className="text-sm text-gray-900">{application.phone}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Applied</label>
                  <p className="text-sm text-gray-900">
                    {new Date(application.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                  <p className="text-sm text-gray-900">
                    {new Date(application.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Company Description */}
            {application.description && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">About the Company</h2>
                <p className="text-gray-700 leading-relaxed">{application.description}</p>
              </div>
            )}

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Email</p>
                    <a 
                      href={`mailto:${application.email}`}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {application.email}
                    </a>
                  </div>
                </div>

                {application.website && (
                  <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Website</p>
                      <a 
                        href={application.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-purple-600 hover:text-purple-800"
                      >
                        {application.website}
                      </a>
                    </div>
                  </div>
                )}

                {application.phone && (
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Phone</p>
                      <a 
                        href={`tel:${application.phone}`}
                        className="text-sm text-green-600 hover:text-green-800"
                      >
                        {application.phone}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
              <BrandApplicationActions 
                applicationId={application.id}
                currentStatus={application.status}
              />
            </div>

            {/* Admin Notes */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin Notes</h2>
              {application.notes ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                    {application.notes}
                  </p>
                  <p className="text-xs text-gray-500">
                    Last updated: {new Date(application.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No notes added yet</p>
              )}
            </div>

            {/* Application Metadata */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Details</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <label className="block font-medium text-gray-700">Application ID</label>
                  <p className="text-gray-600 font-mono text-xs">{application.id}</p>
                </div>
                <div>
                  <label className="block font-medium text-gray-700">Created</label>
                  <p className="text-gray-600">
                    {new Date(application.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <label className="block font-medium text-gray-700">Last Updated</label>
                  <p className="text-gray-600">
                    {new Date(application.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
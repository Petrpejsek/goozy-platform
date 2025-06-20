'use client'

import { useState } from 'react'
import { InfluencerApplicationCard, BrandApplicationCard } from './AdminApplicationCard'

interface TabbedApplicationSectionProps {
  title: string
  applications: any[]
  type: 'influencer' | 'brand'
}

export default function TabbedApplicationSection({ title, applications, type }: TabbedApplicationSectionProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  
  // Filter applications based on status
  const filteredApplications = activeTab === 'all' 
    ? applications 
    : applications.filter(app => app.status.toLowerCase() === activeTab)
  
  // Get counts for each status
  const counts = {
    all: applications.length,
    pending: applications.filter(app => app.status.toLowerCase() === 'pending').length,
    approved: applications.filter(app => app.status.toLowerCase() === 'approved').length,
    rejected: applications.filter(app => app.status.toLowerCase() === 'rejected').length,
  }
  
  const tabs = [
    { id: 'all' as const, label: 'All', count: counts.all, color: 'text-gray-600' },
    { id: 'pending' as const, label: 'Pending', count: counts.pending, color: 'text-yellow-600' },
    { id: 'approved' as const, label: 'Approved', count: counts.approved, color: 'text-green-600' },
    { id: 'rejected' as const, label: 'Rejected', count: counts.rejected, color: 'text-red-600' },
  ]

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                activeTab === tab.id ? 'bg-gray-100' : 'bg-gray-200'
              } ${tab.color}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {filteredApplications.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-gray-400 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-500">
              {activeTab === 'all' ? 'No applications yet' : `No ${activeTab} applications`}
            </p>
          </div>
        ) : (
          filteredApplications.map(app => 
            type === 'influencer' 
              ? <InfluencerApplicationCard key={app.id} application={app} />
              : <BrandApplicationCard key={app.id} application={app} />
          )
        )}
      </div>
    </div>
  )
} 
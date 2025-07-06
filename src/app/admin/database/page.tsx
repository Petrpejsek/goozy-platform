'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface CountryStats {
  country: string
  flag: string
  name: string
  totalProfiles: number
  activeProfiles: number
  inactiveProfiles: number
  categories: {
    fashion: number
    beauty: number
    lifestyle: number
    fitness: number
    food: number
    travel: number
    parenting: number
    photography: number
  }
  topCities: Array<{
    city: string
    count: number
  }>
  discoveryMethods: {
    google: number
    hashtags: number
    manual: number
  }
}

interface DatabaseOverview {
  countries: CountryStats[]
  globalStats: {
    totalProfiles: number
    totalCountries: number
    totalCategories: number
    activeRate: number
  }
}

export default function InfluencerDatabase() {
  const [data, setData] = useState<DatabaseOverview | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/admin/database/overview')
        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error('Error fetching database overview:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Influencer Database</h1>
            <p className="text-gray-600 mt-2">Overview of discovered influencers by country and category</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Refresh Button */}
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:text-gray-900 transition-colors"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Global Stats */}
        {data?.globalStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard 
              title="Total Profiles" 
              value={data.globalStats.totalProfiles} 
              icon="👥" 
              color="blue"
            />
            <StatCard 
              title="Countries" 
              value={data.globalStats.totalCountries} 
              icon="🌍" 
              color="green"
            />
            <StatCard 
              title="Categories" 
              value={data.globalStats.totalCategories} 
              icon="📂" 
              color="purple"
            />
            <StatCard 
              title="Active Rate" 
              value={Math.round(data.globalStats.activeRate)}
              icon="⚡" 
              color="orange"
              suffix="%"
            />
          </div>
        )}

        {/* Countries Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Countries Overview</h2>
            <p className="text-gray-600 mt-1">Click on any country to view detailed statistics</p>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.countries?.map((country) => (
              <CountryCard key={country.country} country={country} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Stat Card Component
const StatCard = ({ 
  title, 
  value, 
  icon, 
  color, 
  suffix = '' 
}: { 
  title: string
  value: number
  icon: string
  color: string
  suffix?: string 
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-600',
    orange: 'bg-orange-50 border-orange-200 text-orange-600',
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {value.toLocaleString()}{suffix}
          </p>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center border ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue}`}>
          <span className="text-lg">{icon}</span>
        </div>
      </div>
    </div>
  )
}

// Country Card Component
const CountryCard = ({ country }: { country: CountryStats }) => {
  const activeRate = country.totalProfiles > 0 
    ? Math.round((country.activeProfiles / country.totalProfiles) * 100)
    : 0

  return (
    <Link
      href={`/admin/database/${country.country}`}
      className="block bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors border border-gray-200 hover:border-gray-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{country.flag}</span>
          <div>
            <h3 className="font-semibold text-gray-900">{country.name}</h3>
            <p className="text-sm text-gray-600">{country.country.toUpperCase()}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">{country.totalProfiles}</p>
          <p className="text-xs text-gray-600">profiles</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Active</span>
          <span className="font-medium text-green-600">{country.activeProfiles}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Inactive</span>
          <span className="font-medium text-gray-500">{country.inactiveProfiles}</span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full" 
            style={{ width: `${activeRate}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-600 text-center">{activeRate}% active</p>
      </div>
    </Link>
  )
} 
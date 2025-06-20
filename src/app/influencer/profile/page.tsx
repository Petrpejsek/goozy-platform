'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    age: 28,
    gender: 'female',
    location: 'Prague, Czech Republic',
    contentCategories: ['Fashion', 'Beauty', 'Lifestyle'],
    avgReach: 12000,
    avgComments: 85
  })

  const availableCategories = [
    'Fashion', 'Beauty', 'Lifestyle', 'Fitness', 'Food', 
    'Travel', 'Technology', 'Gaming', 'Art', 'Music'
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Sidebar */}
      <div className="w-64 bg-white h-screen shadow-lg border-r border-gray-100 fixed left-0 top-0 z-40">
        <div className="p-6 border-b border-gray-100">
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-black tracking-tight">GOOZY</h1>
            <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">CREATOR</span>
          </Link>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link href="/influencer/dashboard" className="flex items-center px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                </svg>
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/influencer/dashboard/products" className="flex items-center px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Product Catalog
              </Link>
            </li>
            <li>
              <div className="flex items-center px-4 py-3 rounded-xl bg-black text-white">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile
              </div>
            </li>
          </ul>
        </nav>
      </div>
      
      {/* Header */}
      <header className="bg-white border-b border-gray-100 h-16 fixed top-0 right-0 left-64 z-30">
        <div className="flex items-center justify-between h-full px-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Profile Settings</h2>
            <p className="text-sm text-gray-500">Manage your personal and audience information</p>
          </div>
          
          <button className="bg-black text-white px-6 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors">
            Save Changes
          </button>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="ml-64 pt-24 p-8">
        
        <div className="max-w-4xl space-y-8">
          
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                <input
                  type="number"
                  value={profile.age}
                  onChange={(e) => setProfile({...profile, age: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select
                  value={profile.gender}
                  onChange={(e) => setProfile({...profile, gender: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => setProfile({...profile, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
          </div>

          {/* Content Categories */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Content Categories</h3>
            <p className="text-sm text-gray-600 mb-4">Select all categories that match your content style</p>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {availableCategories.map((category) => (
                <label key={category} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={profile.contentCategories.includes(category)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setProfile({
                          ...profile,
                          contentCategories: [...profile.contentCategories, category]
                        })
                      } else {
                        setProfile({
                          ...profile,
                          contentCategories: profile.contentCategories.filter(c => c !== category)
                        })
                      }
                    }}
                    className="mr-2 rounded"
                  />
                  <span className="text-sm">{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Audience Demographics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Audience Demographics</h3>
            
            {/* Age Groups */}
            <div className="mb-8">
              <h4 className="font-medium text-gray-900 mb-4">Age Distribution (%)</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {['18-24', '25-34', '35-44', '45-54', '55+'].map((ageGroup) => (
                  <div key={ageGroup}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{ageGroup}</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      defaultValue={ageGroup === '25-34' ? 45 : ageGroup === '18-24' ? 35 : 10}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Gender Distribution */}
            <div className="mb-8">
              <h4 className="font-medium text-gray-900 mb-4">Gender Distribution (%)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Female</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    defaultValue={75}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Male</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    defaultValue={25}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
            </div>

            {/* Country Distribution */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Geographic Distribution (%)</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { code: 'CZ', name: 'Czech Republic' },
                  { code: 'SK', name: 'Slovakia' },
                  { code: 'DE', name: 'Germany' },
                  { code: 'Other', name: 'Other' }
                ].map((country) => (
                  <div key={country.code}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{country.name}</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      defaultValue={country.code === 'CZ' ? 60 : country.code === 'SK' ? 20 : 10}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Metrics</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Average Reach</label>
                <input
                  type="number"
                  value={profile.avgReach}
                  onChange={(e) => setProfile({...profile, avgReach: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Average Comments</label>
                <input
                  type="number"
                  value={profile.avgComments}
                  onChange={(e) => setProfile({...profile, avgComments: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Average Story Views</label>
                <input
                  type="number"
                  defaultValue={8500}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Click-Through Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  defaultValue={3.2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  )
} 
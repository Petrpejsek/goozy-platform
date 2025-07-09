'use client'

import React, { useState, useEffect } from 'react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(true)
  const [companyData, setCompanyData] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    description: ''
  })

  const [targetCountries, setTargetCountries] = useState<string[]>([])
  const [apiSettings, setApiSettings] = useState({
    apiKey: '',
    webhookUrl: '',
    autoSync: false
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [loginData, setLoginData] = useState({
    email: '',
    lastLogin: ''
  })

  const [emailPreferences, setEmailPreferences] = useState({
    transactionalEmails: true,
    orderNotifications: true,
    paymentNotifications: true,
    disputeNotifications: true,
    marketingEmails: false,
    newsletterEmails: false,
    productUpdates: true,
    systemUpdates: true
  })

  const [invoicingDetails, setInvoicingDetails] = useState({
    companyName: '',
    vatNumber: '',
    registrationNumber: '',
    address: '',
    city: '',
    zipCode: '',
    country: 'Czech Republic',
    contactEmail: '',
    contactPhone: ''
  })

  const [billingDetails, setBillingDetails] = useState({
    paymentMethod: 'bank_transfer',
    bankName: '',
    accountNumber: '',
    swiftCode: '',
    iban: '',
    paymentTerms: '30',
    currency: 'CZK',
    autoPayment: false
  })

  const availableCountries = [
    { code: 'CZ', name: 'Czech Republic' },
    { code: 'SK', name: 'Slovakia' },
    { code: 'PL', name: 'Poland' },
    { code: 'HU', name: 'Hungary' },
    { code: 'FR', name: 'France' },
    { code: 'ES', name: 'Spain' },
    { code: 'DE', name: 'Germany' },
    { code: 'AT', name: 'Austria' }
  ]

  // Načíst data při načtení komponenty
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        console.log('🔍 Loading partner company settings...')
        const response = await fetch('/api/partner-company/settings')
        
        if (response.ok) {
          const data = await response.json()
          console.log('✅ Settings loaded:', data.settings)
          
          // Aktualizovat state s daty z databáze
          setCompanyData({
            name: data.settings.name || '',
            email: data.settings.email || '',
            phone: data.settings.phone || '',
            website: data.settings.website || '',
            address: '', // Toto pole není v databázi, zatím prázdné
            description: data.settings.description || ''
          })
          
          setTargetCountries(data.settings.targetCountries || [])
        } else {
          console.error('❌ Failed to load settings:', response.status)
          alert('Failed to load settings. Please refresh the page.')
        }
      } catch (error) {
        console.error('❌ Error loading settings:', error)
        alert('Error loading settings. Please refresh the page.')
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleCountryToggle = (countryCode: string) => {
    setTargetCountries(prev => 
      prev.includes(countryCode) 
        ? prev.filter(c => c !== countryCode)
        : [...prev, countryCode]
    )
    }

  const saveProfile = () => {
    console.log('Saving company profile:', companyData)
    alert('Company profile saved successfully!')
  }

  const updatePassword = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      alert('Please fill in all password fields')
      return
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New password and confirm password do not match')
      return
    }
    console.log('Updating password')
    alert('Password updated successfully!')
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
  }

  const saveLoginSettings = () => {
    console.log('Saving login settings:', loginData)
    alert('Login settings saved successfully!')
  }

  const saveApiSettings = () => {
    console.log('Saving API settings:', apiSettings)
    alert('API settings saved successfully!')
  }

  const saveCountries = async () => {
    try {
      console.log('💾 Saving target countries:', targetCountries)
      
      const response = await fetch('/api/partner-company/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetCountries: targetCountries
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Countries saved successfully:', data)
        alert(`Target countries saved successfully! Selected countries: ${targetCountries.length > 0 ? targetCountries.join(', ') : 'None'}`)
      } else {
        console.error('❌ Failed to save countries:', response.status)
        alert('Failed to save countries. Please try again.')
      }
    } catch (error) {
      console.error('❌ Error saving countries:', error)
      alert('Error saving countries. Please try again.')
    }
  }

  const saveEmailPreferences = () => {
    console.log('Saving email preferences:', emailPreferences)
    alert('Email preferences saved successfully!')
  }

  const saveInvoicingDetails = () => {
    console.log('Saving invoicing details:', invoicingDetails)
    alert('Invoicing details saved successfully!')
  }

  const saveBillingDetails = () => {
    console.log('Saving billing details:', billingDetails)
    alert('Billing details saved successfully!')
  }

  const regenerateApiKey = () => {
    // Generování API klíče pro partnera pro nahrávání produktů
    const newKey = 'goozy_partner_' + Math.random().toString(36).substring(2, 22)
    setApiSettings(prev => ({ ...prev, apiKey: newKey }))
    alert('New API key generated successfully! Use this key to upload products to Goozy platform.')
  }

  const tabs = [
    { id: 'profile', name: 'Company Profile', icon: '🏢' },
    { id: 'security', name: 'Security & Login', icon: '🔒' },
    { id: 'countries', name: 'Target Countries', icon: '🌍' },
    { id: 'emails', name: 'Email Preferences', icon: '📧' },
    { id: 'api', name: 'API & Integration', icon: '🔗' }
  ]

  if (loading) {
    return (
      <div>
        <header className="bg-white border-b border-gray-100 h-16 fixed top-0 left-64 right-0 z-30">
          <div className="flex items-center justify-between h-full px-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
              <p className="text-sm text-gray-500">Loading settings...</p>
            </div>
          </div>
        </header>
        <main className="pt-24 p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading company settings...</div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div>
      {/* Top Header - properly positioned for sidebar layout */}
      <header className="bg-white border-b border-gray-100 h-16 fixed top-0 left-64 right-0 z-30">
        <div className="flex items-center justify-between h-full px-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
            <p className="text-sm text-gray-500">Manage your company profile and preferences</p>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="pt-24 p-8">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <div className="space-y-8">
            {/* Basic Company Information */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6">🏢 Basic Company Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                  <input
                    type="text"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={companyData.name}
                    onChange={(e) => setCompanyData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={companyData.email}
                    onChange={(e) => setCompanyData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={companyData.phone}
                    onChange={(e) => setCompanyData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                  <input
                    type="url"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={companyData.website}
                    onChange={(e) => setCompanyData(prev => ({ ...prev, website: e.target.value }))}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={companyData.address}
                    onChange={(e) => setCompanyData(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    rows={4}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={companyData.description}
                    onChange={(e) => setCompanyData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button 
                  onClick={saveProfile}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  Save Basic Information
                </button>
              </div>
            </div>

            {/* Invoicing Details */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6">📄 Invoicing Details</h3>
              <p className="text-sm text-gray-600 mb-6">Company information that will appear on invoices and tax documents.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Legal Company Name</label>
                  <input
                    type="text"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={invoicingDetails.companyName}
                    onChange={(e) => setInvoicingDetails(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="Enter legal company name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">VAT Number</label>
                  <input
                    type="text"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={invoicingDetails.vatNumber}
                    onChange={(e) => setInvoicingDetails(prev => ({ ...prev, vatNumber: e.target.value }))}
                    placeholder="CZ12345678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Registration Number</label>
                  <input
                    type="text"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={invoicingDetails.registrationNumber}
                    onChange={(e) => setInvoicingDetails(prev => ({ ...prev, registrationNumber: e.target.value }))}
                    placeholder="Company registration number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <select
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={invoicingDetails.country}
                    onChange={(e) => setInvoicingDetails(prev => ({ ...prev, country: e.target.value }))}
                  >
                    <option value="Czech Republic">Czech Republic</option>
                    <option value="Slovakia">Slovakia</option>
                    <option value="Poland">Poland</option>
                    <option value="Hungary">Hungary</option>
                    <option value="Germany">Germany</option>
                    <option value="Austria">Austria</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Address</label>
                  <input
                    type="text"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={invoicingDetails.address}
                    onChange={(e) => setInvoicingDetails(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Street address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={invoicingDetails.city}
                    onChange={(e) => setInvoicingDetails(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                  <input
                    type="text"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={invoicingDetails.zipCode}
                    onChange={(e) => setInvoicingDetails(prev => ({ ...prev, zipCode: e.target.value }))}
                    placeholder="ZIP Code"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                  <input
                    type="email"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={invoicingDetails.contactEmail}
                    onChange={(e) => setInvoicingDetails(prev => ({ ...prev, contactEmail: e.target.value }))}
                    placeholder="billing@company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                  <input
                    type="tel"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={invoicingDetails.contactPhone}
                    onChange={(e) => setInvoicingDetails(prev => ({ ...prev, contactPhone: e.target.value }))}
                    placeholder="+420 123 456 789"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button 
                  onClick={saveInvoicingDetails}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  Save Invoicing Details
                </button>
              </div>
            </div>

            {/* Billing Details */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6">💳 Billing Details</h3>
              <p className="text-sm text-gray-600 mb-6">Configure payment methods and billing preferences for your Goozy account.</p>
              
              <div className="space-y-8">
                {/* Payment Method */}
                <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                  <h4 className="text-lg font-semibold text-blue-900 mb-4">💳 Payment Method</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-900 mb-2">Preferred Payment Method</label>
                      <select
                        className="w-full rounded-md border-blue-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={billingDetails.paymentMethod}
                        onChange={(e) => setBillingDetails(prev => ({ ...prev, paymentMethod: e.target.value }))}
                      >
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="credit_card">Credit Card</option>
                        <option value="crypto">Cryptocurrency</option>
                      </select>
                    </div>
                    
                    {billingDetails.paymentMethod === 'bank_transfer' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-blue-900 mb-2">Bank Name</label>
                          <input
                            type="text"
                            className="w-full rounded-md border-blue-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={billingDetails.bankName}
                            onChange={(e) => setBillingDetails(prev => ({ ...prev, bankName: e.target.value }))}
                            placeholder="Česká spořitelna"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-blue-900 mb-2">Account Number</label>
                          <input
                            type="text"
                            className="w-full rounded-md border-blue-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={billingDetails.accountNumber}
                            onChange={(e) => setBillingDetails(prev => ({ ...prev, accountNumber: e.target.value }))}
                            placeholder="123456789/0800"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-blue-900 mb-2">IBAN</label>
                          <input
                            type="text"
                            className="w-full rounded-md border-blue-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={billingDetails.iban}
                            onChange={(e) => setBillingDetails(prev => ({ ...prev, iban: e.target.value }))}
                            placeholder="CZ6508000000192000145399"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-blue-900 mb-2">SWIFT Code</label>
                          <input
                            type="text"
                            className="w-full rounded-md border-blue-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={billingDetails.swiftCode}
                            onChange={(e) => setBillingDetails(prev => ({ ...prev, swiftCode: e.target.value }))}
                            placeholder="GIBACZPX"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Terms */}
                <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                  <h4 className="text-lg font-semibold text-green-900 mb-4">📅 Payment Terms</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-green-900 mb-2">Payment Terms (days)</label>
                      <select
                        className="w-full rounded-md border-green-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                        value={billingDetails.paymentTerms}
                        onChange={(e) => setBillingDetails(prev => ({ ...prev, paymentTerms: e.target.value }))}
                      >
                        <option value="7">7 days</option>
                        <option value="14">14 days</option>
                        <option value="30">30 days</option>
                        <option value="60">60 days</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-green-900 mb-2">Currency</label>
                      <select
                        className="w-full rounded-md border-green-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                        value={billingDetails.currency}
                        onChange={(e) => setBillingDetails(prev => ({ ...prev, currency: e.target.value }))}
                      >
                        <option value="CZK">CZK (Czech Koruna)</option>
                        <option value="EUR">EUR (Euro)</option>
                        <option value="USD">USD (US Dollar)</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={billingDetails.autoPayment}
                        onChange={(e) => setBillingDetails(prev => ({ ...prev, autoPayment: e.target.checked }))}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <span className="ml-3 text-sm text-green-800">Enable automatic payment processing</span>
                    </label>
                    <p className="text-xs text-green-700 mt-1 ml-7">Automatically charge your account when invoices are due</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button 
                  onClick={saveBillingDetails}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  Save Billing Details
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-8">
            {/* Change Password Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Change Password</h3>
              <div className="grid grid-cols-1 gap-6 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <input
                    type="password"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <input
                    type="password"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
              <div className="mt-6">
                <button 
                  onClick={updatePassword}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  Update Password
                </button>
              </div>
            </div>

            {/* Login Settings Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Login Settings</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Login Email</label>
                  <input
                    type="email"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 max-w-md"
                    value={loginData.email}
                    onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                


                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Account Activity</h4>
                  <div className="text-sm text-gray-600">
                    <p>No activity data available yet</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <button 
                  onClick={saveLoginSettings}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  Save Login Settings
                </button>
              </div>
            </div>


          </div>
        )}

        {activeTab === 'countries' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Target Countries</h3>
            <p className="text-sm text-gray-600 mb-6">Select the countries where you want to sell your products.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableCountries.map((country) => (
                <div key={country.code} className="flex items-center">
                  <input
                    type="checkbox"
                    id={country.code}
                    checked={targetCountries.includes(country.code)}
                    onChange={() => handleCountryToggle(country.code)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={country.code} className="ml-3 text-sm text-gray-700">
                    {country.name}
                  </label>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={saveCountries}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                Save Countries
              </button>
            </div>
          </div>
        )}

        {activeTab === 'emails' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Email Preferences</h3>
            <p className="text-sm text-gray-600 mb-6">Choose what types of emails you want to receive from Goozy platform.</p>
            
            <div className="space-y-8">
              {/* Transactional Emails */}
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h4 className="text-lg font-semibold text-blue-900 mb-4">📧 Transactional Emails</h4>
                <p className="text-blue-800 mb-4">Essential emails for business operations (cannot be disabled)</p>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={emailPreferences.orderNotifications}
                      onChange={(e) => setEmailPreferences(prev => ({ ...prev, orderNotifications: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm text-blue-800">Order notifications and confirmations</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={emailPreferences.paymentNotifications}
                      onChange={(e) => setEmailPreferences(prev => ({ ...prev, paymentNotifications: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm text-blue-800">Payment confirmations and invoices</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={emailPreferences.disputeNotifications}
                      onChange={(e) => setEmailPreferences(prev => ({ ...prev, disputeNotifications: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm text-blue-800">Dispute and refund notifications</span>
                  </label>
                </div>
              </div>

              {/* Marketing Emails */}
              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <h4 className="text-lg font-semibold text-green-900 mb-4">📢 Marketing & Newsletters</h4>
                <p className="text-green-800 mb-4">Promotional content and platform updates</p>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={emailPreferences.marketingEmails}
                      onChange={(e) => setEmailPreferences(prev => ({ ...prev, marketingEmails: e.target.checked }))}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm text-green-800">Marketing campaigns and promotions</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={emailPreferences.newsletterEmails}
                      onChange={(e) => setEmailPreferences(prev => ({ ...prev, newsletterEmails: e.target.checked }))}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm text-green-800">Weekly newsletter with platform insights</span>
                  </label>
                </div>
              </div>

              {/* System Updates */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-700 mb-4">⚙️ System Updates</h4>
                <p className="text-gray-600 mb-4">Platform changes and new features</p>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={emailPreferences.productUpdates}
                      onChange={(e) => setEmailPreferences(prev => ({ ...prev, productUpdates: e.target.checked }))}
                      className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700">New product features and improvements</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={emailPreferences.systemUpdates}
                      onChange={(e) => setEmailPreferences(prev => ({ ...prev, systemUpdates: e.target.checked }))}
                      className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700">System maintenance and security updates</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button 
                onClick={saveEmailPreferences}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                Save Email Preferences
              </button>
            </div>
          </div>
        )}


        {activeTab === 'api' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">API & Integration Configuration</h3>
            
            <div className="space-y-6">
              {/* API Key Section */}
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h4 className="text-lg font-semibold text-blue-900 mb-3">🔑 Product Upload API</h4>
                <p className="text-blue-800 mb-4">
                  Use this API key to upload your product catalog to the Goozy platform programmatically.
                </p>
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-2">API Key</label>
                  <div className="flex">
                    <input
                      type="text"
                      className="flex-1 rounded-l-md border-blue-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={apiSettings.apiKey}
                      readOnly
                      placeholder="No API key generated yet"
                    />
                    <button
                      onClick={regenerateApiKey}
                      className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      {apiSettings.apiKey ? 'Regenerate' : 'Generate'}
                    </button>
                  </div>
                  <p className="text-xs text-blue-700 mt-2">Include this key in the Authorization header of your API requests</p>
                </div>
              </div>

              {/* Webhook Section */}
              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <h4 className="text-lg font-semibold text-green-900 mb-3">🔔 Order Notifications</h4>
                <p className="text-green-800 mb-4">
                  Receive real-time notifications when customers order your products through influencer campaigns.
                </p>
                <div>
                  <label className="block text-sm font-medium text-green-900 mb-2">Webhook URL</label>
                  <input
                    type="url"
                    className="w-full rounded-md border-green-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    value={apiSettings.webhookUrl}
                    onChange={(e) => setApiSettings(prev => ({ ...prev, webhookUrl: e.target.value }))}
                    placeholder="https://your-domain.com/webhooks/goozy-orders"
                  />
                  <p className="text-xs text-green-700 mt-2">We'll send POST requests with order details to this URL</p>
                </div>
              </div>

              {/* Auto Sync Section */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-700 mb-3">⚙️ Synchronization Settings</h4>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="autoSync"
                    checked={apiSettings.autoSync}
                    onChange={(e) => setApiSettings(prev => ({ ...prev, autoSync: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="autoSync" className="ml-3 text-sm text-gray-700">
                    Enable automatic inventory synchronization
                  </label>
                </div>
                <p className="text-xs text-gray-600 mt-2">Automatically sync stock levels and product availability</p>
              </div>

              {/* API Documentation */}
              <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                <h4 className="text-lg font-semibold text-yellow-900 mb-3">📚 API Documentation</h4>
                <p className="text-yellow-800 mb-3">
                  Complete API guide for integrating your systems with Goozy platform.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="text-sm text-yellow-700">
                    <p>• <strong>Products API</strong> - Upload/update product catalog</p>
                    <p>• <strong>Inventory API</strong> - Manage stock levels</p>
                  </div>
                  <div className="text-sm text-yellow-700">
                    <p>• <strong>Orders Webhook</strong> - Receive order notifications</p>
                    <p>• <strong>Analytics API</strong> - Access sales performance data</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button 
                onClick={saveApiSettings}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                Save API Settings
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
} 
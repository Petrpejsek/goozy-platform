'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import InfluencerSidebar from '../../../../components/InfluencerSidebar'

interface EarningsData {
  totalEarnings: number
  currentMonth: number
  pendingPayout: number
  totalSent: number
  totalOrders: number
  averageOrderValue: number
  commissionRate: number
  lastPayout: string
  nextPayout: string
}

interface WithdrawalData {
  id: string
  date: string
  amount: number
  paymentMethod: string
  status: 'completed' | 'pending' | 'processing' | 'failed'
  transactionId?: string
}

interface PaymentMethod {
  id: string
  type: 'bank' | 'paypal' | 'stripe' | 'wise' | 'revolut'
  name: string
  details: string
  isDefault: boolean
}

export default function EarningsPage() {
  const [earnings, setEarnings] = useState<EarningsData | null>(null)
  const [withdrawals, setWithdrawals] = useState<WithdrawalData[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false)
  const [withdrawalAmount, setWithdrawalAmount] = useState('')
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('')
  const [isSubmittingWithdrawal, setIsSubmittingWithdrawal] = useState(false)
  
  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null)
  const [editFormData, setEditFormData] = useState({
    email: '',
    iban: '',
    bic: '',
    accountHolderName: '',
    accountHolderAddress: '',
    bankName: '',
    bankAddress: '',
    phoneNumber: '',
    country: '',
    correspondentBank: '',
    isDefault: false
  })
  const router = useRouter()

  useEffect(() => {
    const loadEarningsData = async () => {
      try {
        const token = localStorage.getItem('influencer_token') || sessionStorage.getItem('influencer_token')
        if (!token) {
          router.push('/influencer/login')
          return
        }

        // Call real APIs instead of using mock data (temporarily in test mode)
        const [earningsResponse, withdrawalsResponse, paymentMethodsResponse] = await Promise.all([
          fetch('/api/influencer/earnings?test=true', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }),
          fetch('/api/influencer/withdrawals?test=true', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }),
          fetch('/api/influencer/payment-methods?test=true', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
        ])

        if (!earningsResponse.ok || !withdrawalsResponse.ok || !paymentMethodsResponse.ok) {
          if (earningsResponse.status === 401 || withdrawalsResponse.status === 401 || paymentMethodsResponse.status === 401) {
            router.push('/influencer/login')
            return
          }
          throw new Error('API Error')
        }

        const [earningsData, withdrawalsData, paymentMethodsData] = await Promise.all([
          earningsResponse.json(),
          withdrawalsResponse.json(),
          paymentMethodsResponse.json()
        ])

        setEarnings(earningsData.earnings)
        setWithdrawals(withdrawalsData.withdrawals)
        setPaymentMethods(paymentMethodsData.paymentMethods)
        
        // Set default payment method
        const defaultMethod = paymentMethodsData.paymentMethods.find((method: PaymentMethod) => method.isDefault)
        if (defaultMethod) {
          setSelectedPaymentMethod(defaultMethod.id)
        }
        
      } catch (err) {
        console.error('Error loading earnings data:', err)
        setError('Failed to load earnings data')
      } finally {
        setIsLoading(false)
      }
    }

    loadEarningsData()
  }, [router])

  const handleRequestWithdrawal = () => {
    if (earnings) {
      const availableBalance = earnings.totalEarnings - earnings.totalSent
      setWithdrawalAmount(availableBalance.toString())
      setShowWithdrawalModal(true)
    }
  }

  const handleSubmitWithdrawal = async () => {
    try {
      const token = localStorage.getItem('influencer_token') || sessionStorage.getItem('influencer_token')
      if (!token) {
        router.push('/influencer/login')
        return
      }

      // Validate withdrawal amount
      const amount = parseFloat(withdrawalAmount)
      const availableBalance = earnings ? earnings.totalEarnings - earnings.totalSent : 0

      if (!withdrawalAmount || amount <= 0) {
        alert('Please enter a valid withdrawal amount')
        return
      }

      if (amount > availableBalance) {
        alert(`Insufficient funds. Available balance: $${availableBalance.toFixed(2)}`)
        return
      }

      if (!selectedPaymentMethod) {
        alert('Please select a payment method')
        return
      }

      setIsSubmittingWithdrawal(true)

      const response = await fetch('/api/influencer/withdrawals', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: amount,
          paymentMethodId: selectedPaymentMethod
        })
      })

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/influencer/login')
          return
        }
        
        let errorMessage = 'Failed to submit withdrawal request. Please try again.'
        
        try {
          const errorData = await response.json()
          if (errorData.error) {
            errorMessage = errorData.error
          }
        } catch (e) {
          // Use default error message if response is not JSON
        }
        
        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log('Withdrawal submitted successfully:', result)
      
      setShowWithdrawalModal(false)
      setWithdrawalAmount('')
      setSelectedPaymentMethod('')
      alert('Withdrawal request submitted successfully! You will receive confirmation via email.')
      
      // Reload data to show updated information
      window.location.reload()
      
    } catch (error) {
      console.error('Error submitting withdrawal:', error)
      alert(error instanceof Error ? error.message : 'Failed to submit withdrawal request. Please try again.')
    } finally {
      setIsSubmittingWithdrawal(false)
    }
  }

  const handleRemovePaymentMethod = async (methodId: string) => {
    if (!confirm('Are you sure you want to remove this payment method?')) {
      return
    }

    try {
      const token = localStorage.getItem('influencer_token') || sessionStorage.getItem('influencer_token')
      if (!token) {
        router.push('/influencer/login')
        return
      }

      const response = await fetch(`/api/influencer/payment-methods/${methodId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/influencer/login')
          return
        }
        throw new Error('Failed to remove payment method')
      }

      // Remove from local state
      setPaymentMethods(paymentMethods.filter(method => method.id !== methodId))
      alert('Payment method removed successfully!')
      
    } catch (error) {
      console.error('Error removing payment method:', error)
      alert('Failed to remove payment method. Please try again.')
    }
  }

  const handleEditPaymentMethod = (methodId: string) => {
    const method = paymentMethods.find(m => m.id === methodId)
    if (!method) return
    
    setEditingMethod(method)
    
    // Parse existing details and populate form
    const details = method.details || ''
    let parsedData = {
      email: '',
      iban: '',
      bic: '',
      accountHolderName: '',
      accountHolderAddress: '',
      bankName: '',
      bankAddress: '',
      phoneNumber: '',
      country: '',
      correspondentBank: '',
      isDefault: method.isDefault
    }
    
    if (method.type === 'bank' && details !== 'Not configured') {
      try {
        // Try to parse as JSON (new format)
        const bankData = JSON.parse(details)
        parsedData = {
          ...parsedData,
          iban: bankData.iban || '',
          bic: bankData.bic || '',
          accountHolderName: bankData.accountHolderName || '',
          accountHolderAddress: bankData.accountHolderAddress || '',
          bankName: bankData.bankName || '',
          bankAddress: bankData.bankAddress || '',
          country: bankData.country || '',
          correspondentBank: bankData.correspondentBank || ''
        }
      } catch {
        // Fallback for old format (just IBAN)
        parsedData.iban = details
      }
         } else if (method.type === 'paypal' || method.type === 'wise') {
       parsedData.email = details !== 'Not configured' ? details : ''
     } else if (method.type === 'revolut') {
       // Check if it's a phone number (starts with + or is numeric) or email (contains @)
       if (details !== 'Not configured') {
         if (details.includes('@')) {
           parsedData.email = details
         } else if (details.includes('+') || /^\d+/.test(details)) {
           parsedData.phoneNumber = details
         } else {
           parsedData.email = details // Default to email if unclear
         }
       }
     }
    
    setEditFormData(parsedData)
    
    setShowEditModal(true)
  }

  const handleSavePaymentMethod = async () => {
    if (!editingMethod) return
    
    try {
      const token = localStorage.getItem('influencer_token') || sessionStorage.getItem('influencer_token')
      if (!token) {
        router.push('/influencer/login')
        return
      }

      // Prepare details based on payment method type
      let details = ''
      let isValid = true
      
      switch (editingMethod.type) {
        case 'paypal':
          if (!editFormData.email) {
            alert('Please enter a PayPal email address')
            return
          }
          if (!editFormData.email.includes('@')) {
            alert('Please enter a valid email address')
            return
          }
          details = editFormData.email
          break
          
        case 'bank':
          if (!editFormData.iban) {
            alert('Please enter an IBAN')
            return
          }
          if (editFormData.iban.length < 15 || editFormData.iban.length > 34) {
            alert('IBAN must be between 15 and 34 characters')
            return
          }
          if (!editFormData.bic) {
            alert('Please enter a BIC/SWIFT code')
            return
          }
          if (!editFormData.accountHolderName) {
            alert('Please enter the account holder name')
            return
          }
          if (!editFormData.bankName) {
            alert('Please enter the bank name')
            return
          }
          if (!editFormData.bankAddress) {
            alert('Please enter the bank address')
            return
          }
          if (!editFormData.accountHolderAddress) {
            alert('Please enter the account holder address')
            return
          }
          
          // Combine all bank details into structured format
          details = JSON.stringify({
            iban: editFormData.iban,
            bic: editFormData.bic,
            accountHolderName: editFormData.accountHolderName,
            accountHolderAddress: editFormData.accountHolderAddress,
            bankName: editFormData.bankName,
            bankAddress: editFormData.bankAddress,
            country: editFormData.country,
            correspondentBank: editFormData.correspondentBank
          })
          break
          
        case 'wise':
          if (!editFormData.email) {
            alert('Please enter a Wise email address')
            return
          }
          if (!editFormData.email.includes('@')) {
            alert('Please enter a valid email address')
            return
          }
          details = editFormData.email
          break
          
        case 'revolut':
          if (!editFormData.email && !editFormData.phoneNumber) {
            alert('Please enter either an email or phone number')
            return
          }
          // Only validate email if it's provided and not empty
          if (editFormData.email && editFormData.email.trim() !== '' && !editFormData.email.includes('@')) {
            alert('Please enter a valid email address')
            return
          }
          // Use phone number if email is empty, otherwise use email
          details = editFormData.email && editFormData.email.trim() !== '' 
            ? editFormData.email 
            : editFormData.phoneNumber
          break
      }

      const response = await fetch(`/api/influencer/payment-methods/${editingMethod.id}?test=true`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          details,
          isDefault: editFormData.isDefault
        })
      })

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/influencer/login')
          return
        }
        throw new Error('Failed to update payment method')
      }

      // Update local state
      setPaymentMethods(paymentMethods.map(method => 
        method.id === editingMethod.id 
          ? { ...method, details, isDefault: editFormData.isDefault }
          : method
      ))
      
      setShowEditModal(false)
      setEditingMethod(null)
      alert('Payment method updated successfully!')
      
    } catch (error) {
      console.error('Error updating payment method:', error)
      alert('Failed to update payment method. Please try again.')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50'
      case 'pending':
        return 'text-yellow-600 bg-yellow-50'
      case 'processing':
        return 'text-blue-600 bg-blue-50'
      case 'failed':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading Earnings...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️ Error</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <InfluencerSidebar currentPage="earnings" />
      
      <header className="bg-white border-b border-gray-100 h-16 fixed top-0 right-0 left-64 z-30">
        <div className="flex items-center justify-between h-full px-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Earnings</h2>
            <p className="text-sm text-gray-500">Track your commissions and payouts</p>
          </div>
        </div>
      </header>

      <main className="pt-20 pb-8 px-8 ml-64">
        {earnings && (
          <>
            {/* Earnings Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Earnings</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(earnings.totalEarnings)}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-full">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">This Month</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(earnings.currentMonth)}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-full">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Pending Payout</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(earnings.pendingPayout)}</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-full">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Sent</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(earnings.totalSent)}</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-full">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500 mb-2">Total Orders</p>
                <p className="text-xl font-semibold text-gray-900">{earnings.totalOrders}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500 mb-2">Average Order Value</p>
                <p className="text-xl font-semibold text-gray-900">{formatCurrency(earnings.averageOrderValue)}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500 mb-2">Commission Rate</p>
                <p className="text-xl font-semibold text-gray-900">{earnings.commissionRate}%</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500 mb-2">Last Payout</p>
                <p className="text-xl font-semibold text-gray-900">{formatDate(earnings.lastPayout)}</p>
              </div>
            </div>

            {/* Ready to Withdrawal */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-sm border border-green-200 mb-8">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Withdrawal</h3>
                    <p className="text-sm text-gray-600 mb-4">Available balance ready for payout</p>
                    <div className="flex items-center space-x-2">
                      <span className="text-3xl font-bold text-green-600">
                        {earnings && formatCurrency(earnings.totalEarnings - earnings.totalSent)}
                      </span>
                      <span className="text-sm text-gray-500">Available</span>
                    </div>
                  </div>
                  <button 
                    onClick={handleRequestWithdrawal}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <span>Request Withdrawal</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
                    <p className="text-sm text-gray-500">Manage where your earnings are sent</p>
                  </div>
                  <button className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                    + Add Method
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-gray-100 rounded-full">
                        {method.type === 'paypal' && (
                          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.028-.026.056-.04.085-.699 1.462-2.457 2.22-5.227 2.22H12.18l-.9 5.717h2.924c2.938 0 4.128-1.263 4.128-4.384 0-1.524-.4-2.635-1.11-3.097z"/>
                          </svg>
                        )}
                        {method.type === 'bank' && (
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        )}
                        {method.type === 'wise' && (
                          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                        )}
                        {method.type === 'revolut' && (
                          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{method.name}</p>
                        <p className="text-xs text-gray-500">
                          {method.type === 'bank' && method.details !== 'Not configured' ? (
                            (() => {
                              try {
                                const bankData = JSON.parse(method.details)
                                return `${bankData.iban} • ${bankData.bankName}`
                              } catch {
                                return method.details
                              }
                            })()
                          ) : (
                            method.details
                          )}
                        </p>
                      </div>
                      {method.isDefault && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-600">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleEditPaymentMethod(method.id)}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleRemovePaymentMethod(method.id)}
                        className="text-sm text-red-600 hover:text-red-800 font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Withdrawals */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Recent Withdrawals</h3>
                  <p className="text-sm text-gray-500">Your latest payout requests</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {withdrawals.map((withdrawal) => (
                      <tr key={withdrawal.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(withdrawal.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(withdrawal.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {withdrawal.paymentMethod}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {withdrawal.transactionId || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(withdrawal.status)}`}>
                            {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Edit Payment Method Modal */}
      {showEditModal && editingMethod && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`bg-white rounded-xl shadow-xl w-full ${editingMethod.type === 'bank' ? 'max-w-2xl max-h-[90vh] overflow-y-auto' : 'max-w-md'}`}>
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Edit {editingMethod.name}
                </h3>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {/* PayPal Email */}
                {editingMethod.type === 'paypal' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PayPal Email Address
                    </label>
                    <input
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="your.email@example.com"
                    />
                  </div>
                )}

                {/* Bank Transfer */}
                {editingMethod.type === 'bank' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          IBAN <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={editFormData.iban}
                          onChange={(e) => setEditFormData({...editFormData, iban: e.target.value.toUpperCase()})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="GB82 WEST 1234 5698 7654 32"
                          maxLength={34}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          15-34 characters
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          BIC/SWIFT Code <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={editFormData.bic}
                          onChange={(e) => setEditFormData({...editFormData, bic: e.target.value.toUpperCase()})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="DEUTDEFF"
                          maxLength={11}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          8-11 characters
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account Holder Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editFormData.accountHolderName}
                        onChange={(e) => setEditFormData({...editFormData, accountHolderName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="John Smith"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account Holder Address <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={editFormData.accountHolderAddress}
                        onChange={(e) => setEditFormData({...editFormData, accountHolderAddress: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Street address, City, ZIP code, Country"
                        rows={2}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bank Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editFormData.bankName}
                        onChange={(e) => setEditFormData({...editFormData, bankName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Deutsche Bank AG"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bank Address <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={editFormData.bankAddress}
                        onChange={(e) => setEditFormData({...editFormData, bankAddress: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Bank street address, City, ZIP code, Country"
                        rows={2}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Country
                        </label>
                        <input
                          type="text"
                          value={editFormData.country}
                          onChange={(e) => setEditFormData({...editFormData, country: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Germany"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Correspondent Bank (optional)
                        </label>
                        <input
                          type="text"
                          value={editFormData.correspondentBank}
                          onChange={(e) => setEditFormData({...editFormData, correspondentBank: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="If required"
                        />
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-800">
                        <strong>Note:</strong> All fields marked with * are required for international wire transfers.
                      </p>
                    </div>
                  </>
                )}

                {/* Wise */}
                {editingMethod.type === 'wise' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Wise Email Address
                    </label>
                    <input
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="your.email@example.com"
                    />
                  </div>
                )}

                {/* Revolut */}
                {editingMethod.type === 'revolut' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={editFormData.email}
                        onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="your.email@example.com"
                      />
                    </div>
                    <div className="text-center text-sm text-gray-500">
                      - OR -
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={editFormData.phoneNumber}
                        onChange={(e) => setEditFormData({...editFormData, phoneNumber: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="+420 123 456 789"
                      />
                    </div>
                  </>
                )}

                {/* Default checkbox */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={editFormData.isDefault}
                    onChange={(e) => setEditFormData({...editFormData, isDefault: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-900">
                    Set as default payment method
                  </label>
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePaymentMethod}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal Modal */}
      {showWithdrawalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Request Withdrawal</h3>
                <button 
                  onClick={() => setShowWithdrawalModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {/* Available Balance Info */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-700 mb-1">Available Balance</p>
                  <p className="text-2xl font-bold text-green-600">
                    {earnings && formatCurrency(earnings.totalEarnings - earnings.totalSent)}
                  </p>
                </div>

                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Withdrawal Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={withdrawalAmount}
                      onChange={(e) => setWithdrawalAmount(e.target.value)}
                      max={earnings ? earnings.totalEarnings - earnings.totalSent : 0}
                      min="0"
                      step="0.01"
                      className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                        withdrawalAmount && parseFloat(withdrawalAmount) > (earnings ? earnings.totalEarnings - earnings.totalSent : 0)
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-green-500'
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  <p className={`text-xs mt-1 ${
                    withdrawalAmount && parseFloat(withdrawalAmount) > (earnings ? earnings.totalEarnings - earnings.totalSent : 0)
                      ? 'text-red-600'
                      : 'text-gray-500'
                  }`}>
                    {withdrawalAmount && parseFloat(withdrawalAmount) > (earnings ? earnings.totalEarnings - earnings.totalSent : 0)
                      ? `⚠️ Insufficient funds! Maximum: ${earnings && formatCurrency(earnings.totalEarnings - earnings.totalSent)}`
                      : `Maximum: ${earnings && formatCurrency(earnings.totalEarnings - earnings.totalSent)}`
                    }
                  </p>
                </div>

                {/* Payment Method Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={selectedPaymentMethod}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {paymentMethods.map((method) => (
                      <option key={method.id} value={method.id}>
                        {method.name} - {method.details}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Processing Time Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-700">
                    <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Processing time: 3-5 business days
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex space-x-3">
              <button
                onClick={() => setShowWithdrawalModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitWithdrawal}
                disabled={!withdrawalAmount || parseFloat(withdrawalAmount) <= 0 || isSubmittingWithdrawal}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isSubmittingWithdrawal 
                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
                    : !withdrawalAmount || parseFloat(withdrawalAmount) <= 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isSubmittingWithdrawal ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </div>
                ) : (
                  'Submit Request'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 
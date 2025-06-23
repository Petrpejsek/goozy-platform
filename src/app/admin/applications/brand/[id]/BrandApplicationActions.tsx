'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface BrandApplicationActionsProps {
  applicationId: string
  currentStatus: string
}

export default function BrandApplicationActions({ 
  applicationId, 
  currentStatus 
}: BrandApplicationActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [notes, setNotes] = useState('')
  const [showNotesForm, setShowNotesForm] = useState(false)
  const router = useRouter()

  const handleAction = async (action: 'approve' | 'reject') => {
    if (isLoading) return
    
    const confirmMessage = action === 'approve' 
      ? 'Are you sure you want to approve this brand application?' 
      : 'Are you sure you want to reject this brand application?'
    
    if (!confirm(confirmMessage)) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/applications/brand/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, notes: notes.trim() || undefined })
      })

      if (response.ok) {
        // Refresh the page to show updated status
        router.refresh()
        
        // Show success message
        const message = action === 'approve' 
          ? 'Brand application approved successfully!' 
          : 'Brand application rejected successfully!'
        alert(message)
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error || 'Failed to process action'}`)
      }
    } catch (error) {
      console.error('Error processing action:', error)
      alert('Error communicating with server')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddNotes = async () => {
    if (isLoading || !notes.trim()) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/applications/brand/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'add_notes', notes: notes.trim() })
      })

      if (response.ok) {
        router.refresh()
        setNotes('')
        setShowNotesForm(false)
        alert('Notes added successfully!')
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error || 'Failed to add notes'}`)
      }
    } catch (error) {
      console.error('Error adding notes:', error)
      alert('Error communicating with server')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Status Actions */}
      {currentStatus === 'pending' && (
        <div className="space-y-3">
          <button
            onClick={() => handleAction('approve')}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : 'Approve Application'}
          </button>
          
          <button
            onClick={() => handleAction('reject')}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : 'Reject Application'}
          </button>
        </div>
      )}
      
      {/* Status Badge for approved/rejected */}
      {currentStatus !== 'pending' && (
        <div className={`p-3 rounded-lg text-center font-medium ${
          currentStatus === 'approved' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          Application {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
        </div>
      )}

      {/* Notes Section */}
      <div className="border-t pt-4">
        {!showNotesForm ? (
          <button
            onClick={() => setShowNotesForm(true)}
            className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Admin Notes
          </button>
        ) : (
          <div className="space-y-3">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this brand application..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={4}
            />
            <div className="flex space-x-2">
              <button
                onClick={handleAddNotes}
                disabled={isLoading || !notes.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : 'Save Notes'}
              </button>
              <button
                onClick={() => {
                  setShowNotesForm(false)
                  setNotes('')
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="border-t pt-4 space-y-2">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Actions</h3>
        
        <button
          onClick={() => {
            navigator.clipboard.writeText(applicationId)
            alert('Application ID copied to clipboard!')
          }}
          className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          Copy Application ID
        </button>
        
        <button
          onClick={() => {
            const mailto = `mailto:${applicationId}@temp.com?subject=Regarding your brand application`
            window.open(mailto)
          }}
          className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          Send Email
        </button>
      </div>
    </div>
  )
} 
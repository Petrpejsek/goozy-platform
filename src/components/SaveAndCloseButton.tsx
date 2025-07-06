'use client'
import { useState } from 'react'

interface Props {
  onClose: (saved: boolean) => void
  autoSave: () => Promise<void>
  selectedTheme?: string
  selectedBackground?: string
  selectedHeroLayout?: string
}

export default function SaveAndCloseButton({ onClose, autoSave, ..._rest }: Props) {
  const [isSaving, setIsSaving] = useState(false)

  const handleClick = async () => {
    setIsSaving(true)
    try {
      await autoSave()
    } catch (err) {
      // Chybu pouze zalogujeme, stav UI zůstane uložen
      console.error('Save error', err)
    } finally {
      setIsSaving(false)
      onClose(true)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={isSaving}
      className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center transition-colors ${
        isSaving
          ? 'bg-blue-400 text-white cursor-not-allowed'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      }`}
    >
      {isSaving ? (
        <>
          <span className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Saving…
        </>
      ) : (
        'Save & Close'
      )}
    </button>
  )
}

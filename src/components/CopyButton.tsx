'use client'

interface CopyButtonProps {
  text: string
  className?: string
}

export default function CopyButton({ text, className = "" }: CopyButtonProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      // We can add toast notification later
    } catch (err) {
      console.error('Error copying text:', err)
    }
  }

  return (
    <button 
      onClick={handleCopy}
      className={`text-green-600 hover:text-green-800 text-sm ${className}`}
    >
      Copy
    </button>
  )
} 
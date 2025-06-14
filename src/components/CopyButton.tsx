'use client'

interface CopyButtonProps {
  text: string
  className?: string
}

export default function CopyButton({ text, className = "" }: CopyButtonProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      // Můžeme přidat toast notifikaci později
    } catch (err) {
      console.error('Chyba při kopírování:', err)
    }
  }

  return (
    <button 
      onClick={handleCopy}
      className={`text-green-600 hover:text-green-800 text-sm ${className}`}
    >
      Kopírovat
    </button>
  )
} 
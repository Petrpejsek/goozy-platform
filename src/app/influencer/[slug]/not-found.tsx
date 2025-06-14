import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Influencer nenalezen
          </h2>
          <p className="text-gray-600">
            Omlouváme se, ale stránka tohoto influencera neexistuje nebo ještě není dostupná.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link 
            href="/"
            className="block bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Zpět na hlavní stránku
          </Link>
          
          <Link 
            href="/#formular-influencer"
            className="block border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Stát se influencerem
          </Link>
        </div>
      </div>
    </div>
  )
} 
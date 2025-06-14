import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import CopyButton from '@/components/CopyButton'

// This function should live in a shared utility file
const createSlug = (name: string): string => {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
};

interface InfluencerPageProps {
  params: { slug: string };
}

export default async function InfluencerPublicPage({ params }: InfluencerPageProps) {
  const { slug } = params;

  // Find the approved influencer by their generated slug
  const applications = await prisma.influencer_applications.findMany({ 
    where: { status: 'APPROVED' } 
  });
  
  const influencer = applications.find(app => createSlug(app.name) === slug);

  if (!influencer) {
    notFound();
  }
  
  // TODO: Fetch products specifically selected by this influencer
  const products = await prisma.product.findMany({
    where: { isAvailable: true, stockQuantity: { gt: 0 } },
    include: { brand: { select: { name: true } } },
    take: 9,
    orderBy: { createdAt: 'desc' }
  });

  const discountCode = `${influencer.name.replace(/\s+/g, '').toUpperCase()}15`;

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-3xl font-bold text-black tracking-tight">
            GOOZY
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden sm:block">Powered by Goozy</span>
            <Link href="/#influencer-form" className="bg-black text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
              Join Us
            </Link>
          </div>
        </nav>
      </header>
      
      <main>
        {/* Influencer Profile Header */}
        <section className="bg-white pt-16 pb-20 text-center border-b">
          <div className="max-w-4xl mx-auto px-4">
            <div className="w-32 h-32 rounded-full mx-auto mb-6 ring-4 ring-offset-4 ring-black overflow-hidden">
                <Image src={'/placeholder-avatar.png'} alt={influencer.name} width={128} height={128} className="w-full h-full object-cover" />
            </div>
            <h1 className="text-5xl font-extrabold text-black mb-3">
              {influencer.name}'s Picks
            </h1>
            {influencer.bio && (
              <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
                {influencer.bio}
              </p>
            )}
            <div className="flex justify-center items-center gap-6 text-gray-500 mb-8">
               {influencer.instagram && <a href={`https://instagram.com/${influencer.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-black transition">Instagram</a>}
               {influencer.tiktok && <a href={`https://tiktok.com/@${influencer.tiktok.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-black transition">TikTok</a>}
               {influencer.youtube && <a href={`https://youtube.com/c/${influencer.youtube}`} target="_blank" rel="noopener noreferrer" className="hover:text-black transition">YouTube</a>}
            </div>
            <div className="bg-yellow-100 border-2 border-dashed border-yellow-300 rounded-xl p-4 inline-flex flex-col items-center gap-2">
                <span className="font-bold text-yellow-900 text-lg">Your 15% Discount Code:</span>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg">
                    <code className="text-xl font-mono font-bold text-black">{discountCode}</code>
                    <CopyButton textToCopy={discountCode} />
                </div>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => {
              const discountedPrice = product.price * 0.85;
              const images = JSON.parse(product.images || '[]') as string[];
              
              return (
                <div key={product.id} className="bg-white rounded-2xl shadow-lg overflow-hidden group flex flex-col">
                  <div className="relative">
                    <div className="aspect-w-1 aspect-h-1 w-full bg-gray-200">
                      <Image
                        src={images[0] || '/placeholder.png'}
                        alt={product.name}
                        width={400}
                        height={400}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="absolute top-0 right-0 m-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">15% OFF</div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <p className="text-sm text-gray-500 mb-1">{product.brand.name}</p>
                    <h3 className="text-xl font-bold text-black mb-3 flex-grow">
                      {product.name}
                    </h3>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-2xl font-extrabold text-black">
                        ${discountedPrice.toFixed(2)}
                      </span>
                      <span className="text-md text-gray-400 line-through">
                        ${product.price.toFixed(2)}
                      </span>
                    </div>
                    <button className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
                      Shop Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          <p>
            This page is powered by{' '}
            <Link href="/" className="font-semibold text-black hover:underline">
              Goozy
            </Link>
            . The platform for influencers.
          </p>
          <p className="mt-2">&copy; {new Date().getFullYear()} Goozy. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
} 
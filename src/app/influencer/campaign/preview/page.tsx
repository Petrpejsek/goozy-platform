'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Mock data pro influencera
const mockInfluencer = {
  name: "Aneta",
  avatar: "https://picsum.photos/150/150?random=1",
  bio: "Hi girls! I've selected amazing pieces for you with an exclusive discount! Use my code for 20% off ✨ I'm passionate about fashion, lifestyle, and helping you find the perfect pieces that make you feel confident and beautiful. From casual everyday looks to special occasion outfits, I love sharing my favorite finds with you. Let's create amazing looks together! 💕",
  followers: "125K",
  socialLinks: {
    instagram: "https://instagram.com/aneta",
    tiktok: "https://tiktok.com/@aneta", 
    youtube: "https://youtube.com/@aneta",
    facebook: "https://facebook.com/aneta",
    x: "https://x.com/aneta"
  },
  discountCode: "ANETA20",
  discountPercent: 20
}

// Dostupné sociální sítě
const availableSocialPlatforms = [
  { key: 'instagram', name: 'Instagram', color: 'from-purple-500 to-pink-500', icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' },
  { key: 'tiktok', name: 'TikTok', color: 'bg-black', icon: 'M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z' },
  { key: 'youtube', name: 'YouTube', color: 'bg-red-600', icon: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' },
  { key: 'facebook', name: 'Facebook', color: 'bg-blue-600', icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
  { key: 'x', name: 'X (Twitter)', color: 'bg-gray-900', icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
  { key: 'linkedin', name: 'LinkedIn', color: 'bg-blue-700', icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
  { key: 'pinterest', name: 'Pinterest', color: 'bg-red-500', icon: 'M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001.001 12.017z' }
]

// Mock vybrané produkty s placeholder obrázky
const mockSelectedProducts = [
  {
    id: "1",
    name: "Cotton T-Shirt",
    price: 24.99,
    discountedPrice: 19.99,
    images: ["https://picsum.photos/400/400?random=2", "https://picsum.photos/400/400?random=3"],
    brand: "Fashion Brand",
    category: "T-Shirts"
  },
  {
    id: "2", 
    name: "Luxury Leather Handbag",
    price: 129.99,
    discountedPrice: 103.99,
    images: ["https://picsum.photos/400/400?random=4", "https://picsum.photos/400/400?random=5"],
    brand: "Fashion Brand",
    category: "Accessories"
  },
  {
    id: "3",
    name: "Comfortable Sneakers", 
    price: 79.99,
    discountedPrice: 63.99,
    images: ["https://picsum.photos/400/400?random=6", "https://picsum.photos/400/400?random=7"],
    brand: "Fashion Brand",
    category: "Shoes"
  },
  {
    id: "4",
    name: "Stylish Denim Jacket",
    price: 65.50,
    discountedPrice: 52.40,
    images: ["https://picsum.photos/400/400?random=8", "https://picsum.photos/400/400?random=9"],
    brand: "Fashion Brand", 
    category: "Jackets"
  },
  {
    id: "5",
    name: "Cozy Winter Sweater",
    price: 69.99,
    discountedPrice: 55.99,
    images: ["https://picsum.photos/400/400?random=10", "https://picsum.photos/400/400?random=11"],
    brand: "Warm & Soft",
    category: "Sweaters"
  },
  {
    id: "6",
    name: "Classic Blue Jeans",
    price: 89.99,
    discountedPrice: 71.99,
    images: ["https://picsum.photos/400/400?random=12", "https://picsum.photos/400/400?random=13"],
    brand: "Denim World",
    category: "Jeans"
  },
  {
    id: "7",
    name: "Silk Scarf",
    price: 45.99,
    discountedPrice: 36.99,
    images: ["https://picsum.photos/400/400?random=14", "https://picsum.photos/400/400?random=15"],
    brand: "Elegant Touch",
    category: "Accessories"
  },
  {
    id: "8",
    name: "Leather Boots",
    price: 159.99,
    discountedPrice: 127.99,
    images: ["https://picsum.photos/400/400?random=16", "https://picsum.photos/400/400?random=17"],
    brand: "Premium Footwear",
    category: "Shoes"
  },
  {
    id: "9",
    name: "Evening Gown",
    price: 249.99,
    discountedPrice: 199.99,
    images: ["https://picsum.photos/400/400?random=18", "https://picsum.photos/400/400?random=19"],
    brand: "Glamour Plus",
    category: "Dresses"
  },
  {
    id: "10",
    name: "Sports Bra",
    price: 39.99,
    discountedPrice: 31.99,
    images: ["https://picsum.photos/400/400?random=20", "https://picsum.photos/400/400?random=21"],
    brand: "Active Wear",
    category: "Sportswear"
  },
  {
    id: "11",
    name: "Wool Coat",
    price: 299.99,
    discountedPrice: 239.99,
    images: ["https://picsum.photos/400/400?random=22", "https://picsum.photos/400/400?random=23"],
    brand: "Winter Collection",
    category: "Coats"
  },
  {
    id: "12",
    name: "Gold Necklace",
    price: 179.99,
    discountedPrice: 143.99,
    images: ["https://picsum.photos/400/400?random=24", "https://picsum.photos/400/400?random=25"],
    brand: "Jewelry Box",
    category: "Jewelry"
  },
  {
    id: "13",
    name: "Running Shoes",
    price: 119.99,
    discountedPrice: 95.99,
    images: ["https://picsum.photos/400/400?random=26", "https://picsum.photos/400/400?random=27"],
    brand: "Speed Runner",
    category: "Shoes"
  }
]

// Toast component
const Toast = ({ message, type, onDismiss }: { message: string, type: 'success' | 'error', onDismiss: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className={`fixed top-5 right-5 p-4 rounded-lg shadow-lg text-white z-50 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
      {message}
    </div>
  );
};

// Product Gallery Modal
const ProductGallery = ({ product, isOpen, onClose }: { product: any, isOpen: boolean, onClose: () => void }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-gray-900 bg-opacity-20 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-semibold">{product.name}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div>
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                <img
                  src={product.images[currentImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://picsum.photos/400/400?random=99';
                  }}
                />
              </div>
              
              {product.images.length > 1 && (
                <div className="flex gap-2">
                  {product.images.map((image: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${
                        currentImageIndex === index ? 'border-black' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://picsum.photos/64/64?random=98';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Product Info */}
            <div>
              <h4 className="text-2xl font-bold mb-2">{product.name}</h4>
              <p className="text-gray-600 mb-4">{product.brand}</p>
              
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl font-bold text-black">€{product.discountedPrice}</span>
                <span className="text-xl text-gray-400 line-through">€{product.price}</span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                  {mockInfluencer.discountPercent}% OFF
                </span>
              </div>
              
              <button className="w-full bg-black text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CampaignPreview() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [dragOverItem, setDragOverItem] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  
  // Profile editing states
  const [editingProfile, setEditingProfile] = useState(false);
  const [avatar, setAvatar] = useState(mockInfluencer.avatar);
  const [bio, setBio] = useState(mockInfluencer.bio);
  const [discountCode, setDiscountCode] = useState(mockInfluencer.discountCode);
  const [socialLinks, setSocialLinks] = useState(mockInfluencer.socialLinks);

  const router = useRouter();

  // Load products from localStorage on component mount
  useEffect(() => {
    const savedProducts = localStorage.getItem('selectedProducts');
    if (savedProducts) {
      try {
        const parsedProducts = JSON.parse(savedProducts);
        // Transform products to match expected format
        const transformedProducts = parsedProducts.map((product: any) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          discountedPrice: product.price * 0.8, // 20% discount
          images: product.images || [],
          brand: product.brand?.name || 'Unknown Brand',
          category: product.category
        }));
        setProducts(transformedProducts);
      } catch (error) {
        console.error('Error parsing saved products:', error);
        // Fallback to mock data if parsing fails
        setProducts(mockSelectedProducts);
      }
    } else {
      // Use mock data if no saved products
      setProducts(mockSelectedProducts);
    }
  }, []);

  // Optimized drag & drop handlers with useCallback for smooth performance
  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', ''); // For better browser compatibility
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    // Only update if different from current
    if (draggedItem !== null && draggedItem !== index && dragOverItem !== index) {
      setDragOverItem(index);
    }
  }, [draggedItem, dragOverItem]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only clear if leaving the container, not child elements
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverItem(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedItem === null || draggedItem === dropIndex) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }
    
    // Optimized array reordering
    const newProducts = [...products];
    const [movedProduct] = newProducts.splice(draggedItem, 1);
    newProducts.splice(dropIndex, 0, movedProduct);
    
    setProducts(newProducts);
    setDraggedItem(null);
    setDragOverItem(null);
  }, [draggedItem, products]);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    setDraggedItem(null);
    setDragOverItem(null);
  }, []);

  const handleSaveProfile = () => {
    if (discountCode.length > 15) {
      setToast({ message: 'Discount code too long (max 15 characters)', type: 'error' });
      return;
    }
    setEditingProfile(false);
    setToast({ message: 'Profile updated successfully!', type: 'success' });
  };

  const handleFileUpload = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAvatar(result);
        setToast({ message: 'Avatar updated successfully!', type: 'success' });
        setEditingAvatar(false);
      };
      reader.readAsDataURL(file);
    } else {
      setToast({ message: 'Please select a valid image file', type: 'error' });
    }
  };

  const handleAvatarDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleAvatarDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleAvatarDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleAvatarFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  const handleAddSocialLink = (platform: string, url: string) => {
    if (url.trim()) {
      setSocialLinks(prev => ({
        ...prev,
        [platform]: url.trim()
      }));
      setToast({ message: `${platform} link added!`, type: 'success' });
    }
  };

  const handleRemoveSocialLink = (platform: string) => {
    setSocialLinks(prev => {
      const newLinks = { ...prev };
      delete newLinks[platform as keyof typeof newLinks];
      return newLinks;
    });
    setToast({ message: `${platform} link removed!`, type: 'success' });
  };

  const openSocialLink = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Campaign Preview</h1>
              <p className="text-sm text-gray-500">Preview how your campaign will look to customers</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                href="/influencer/dashboard/products"
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                ← Back to Products
              </Link>
              <button className="bg-black text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                Publish Campaign
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Hero Section - Social Media Style */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <div className="flex flex-col h-full">
            {/* Top Section - Avatar, Name, Bio */}
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-start gap-6 flex-1">
                {/* Avatar */}
                <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    src={avatar}
                    alt={mockInfluencer.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://picsum.photos/150/150?random=100';
                    }}
                  />
                </div>
                
                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">{mockInfluencer.name}</h2>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                      {mockInfluencer.followers} followers
                    </span>
                  </div>
                  
                  {/* Bio - Now with more space */}
                  <div className="mb-6">
                    <p className="text-gray-700 leading-relaxed text-base">{bio}</p>
                  </div>
                </div>
              </div>
              
              {/* Universal Edit Button */}
              <button
                onClick={() => setEditingProfile(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Profile
              </button>
            </div>

            {/* Bottom Section - Social Media and Discount */}
            <div className="flex items-center justify-between">
              {/* Social Links - Left side */}
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Social Media</h4>
                <div className="flex items-center gap-3 flex-wrap">
                  {Object.entries(socialLinks).map(([platform, url]) => {
                    const platformData = availableSocialPlatforms.find(p => p.key === platform);
                    if (!platformData) return null;
                    
                    return (
                      <button
                        key={platform}
                        onClick={() => openSocialLink(url)}
                        className={`p-2 text-white rounded-lg hover:shadow-lg transition-all ${
                          platformData.color.startsWith('from-') 
                            ? `bg-gradient-to-r ${platformData.color}` 
                            : platformData.color
                        }`}
                        title={platformData.name}
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d={platformData.icon} />
                        </svg>
                      </button>
                    );
                  })}
                </div>
              </div>
            
              {/* Discount Code - Right side, smaller */}
              <div className="ml-8 flex-shrink-0">
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-3 rounded-lg border border-pink-100 max-w-xs">
                  <p className="text-xs text-gray-600 mb-2 text-center">Exclusive Discount</p>
                  <div className="text-center">
                    <code className="bg-white px-2 py-1 rounded border text-sm font-mono font-bold text-purple-600 block mb-1">
                      {discountCode}
                    </code>
                    <span className="text-xs text-gray-500">({mockInfluencer.discountPercent}% OFF)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">My Selected Products</h3>
            <p className="text-sm text-gray-500">Drag & drop to reorder products</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <div
                key={product.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-all duration-150 cursor-move group relative transform ${
                  draggedItem === index 
                    ? 'scale-105 border-blue-400 shadow-lg' 
                    : dragOverItem === index 
                    ? 'border-blue-400 bg-blue-50 scale-102' 
                    : 'border-gray-100 hover:shadow-md hover:scale-101'
                }`}
              >
                {/* Jednoduchý drag handle */}
                <div 
                  className="absolute top-2 right-2 z-10 bg-white/90 rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-gray-200"
                  title="Drag to reorder"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 3h2v2H9V3zm0 4h2v2H9V7zm0 4h2v2H9v-2zm0 4h2v2H9v-2zm0 4h2v2H9v-2zm4-16h2v2h-2V3zm0 4h2v2h-2V7zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2z"/>
                  </svg>
                </div>

                {/* Product Image */}
                <div 
                  className="aspect-square bg-gray-100 overflow-hidden cursor-pointer relative"
                  onClick={() => setSelectedProduct(product)}
                >
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://picsum.photos/400/400?random=97';
                    }}
                  />
                </div>
                
                {/* Product Info */}
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">{product.name}</h4>
                  <p className="text-sm text-gray-500 mb-3">{product.brand}</p>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg font-bold text-black">€{product.discountedPrice}</span>
                    <span className="text-sm text-gray-400 line-through">€{product.price}</span>
                  </div>
                  
                  <button className="w-full bg-black text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Product Gallery Modal */}
      <ProductGallery
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      {/* Universal Profile Edit Modal */}
      {editingProfile && (
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-20 flex items-center justify-center z-50 p-4"
          onClick={() => setEditingProfile(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Edit Profile</h3>
              <button
                onClick={() => setEditingProfile(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-8">
              {/* Avatar Section */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Profile Picture</h4>
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-gray-200 rounded-full overflow-hidden">
                    <img
                      src={avatar}
                      alt="Current avatar"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://picsum.photos/150/150?random=100';
                      }}
                    />
                  </div>
                  <div
                    onDragOver={handleAvatarDragOver}
                    onDragEnter={handleAvatarDragEnter}
                    onDragLeave={handleAvatarDragLeave}
                    onDrop={handleAvatarFileDrop}
                    className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                    onClick={() => document.getElementById('avatar-file-input')?.click()}
                  >
                    <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm font-medium text-gray-700">Drop image or click to browse</p>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF (max 5MB)</p>
                  </div>
                  <input
                    id="avatar-file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Bio Section */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Bio</h4>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={6}
                  maxLength={500}
                  placeholder="Write something about yourself... You can write up to 500 characters to tell your followers about yourself, your interests, and what makes you unique!"
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-500">{bio.length}/500 characters</span>
                  <span className={`text-xs ${bio.length > 450 ? 'text-orange-600' : bio.length > 480 ? 'text-red-600' : 'text-gray-400'}`}>
                    {bio.length > 450 ? (bio.length > 480 ? 'Almost full!' : 'Getting close') : 'Plenty of space'}
                  </span>
                </div>
              </div>

              {/* Discount Code Section */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Discount Code</h4>
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                    className="px-4 py-2 border border-gray-200 rounded-lg font-mono font-bold text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    maxLength={15}
                    placeholder="DISCOUNT20"
                  />
                  <span className="text-sm text-gray-500">({mockInfluencer.discountPercent}% OFF)</span>
                </div>
              </div>

              {/* Social Media Section */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Social Media Links</h4>
                
                {/* Current Links */}
                {Object.keys(socialLinks).length > 0 && (
                  <div className="mb-6">
                    <h5 className="text-sm font-medium text-gray-700 mb-3">Current Links</h5>
                    <div className="space-y-3">
                      {Object.entries(socialLinks).map(([platform, url]) => {
                        const platformData = availableSocialPlatforms.find(p => p.key === platform);
                        if (!platformData) return null;
                        
                        return (
                          <div key={platform} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className={`p-2 text-white rounded-lg ${
                              platformData.color.startsWith('from-') 
                                ? `bg-gradient-to-r ${platformData.color}` 
                                : platformData.color
                            }`}>
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d={platformData.icon} />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{platformData.name}</p>
                              <p className="text-xs text-gray-600 truncate">{url}</p>
                            </div>
                            <button
                              onClick={() => handleRemoveSocialLink(platform)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Remove"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* Add New Links */}
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-3">Add New Platform</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {availableSocialPlatforms
                      .filter(platform => !socialLinks[platform.key as keyof typeof socialLinks])
                      .map(platform => (
                        <div key={platform.key} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 text-white rounded-lg ${
                              platform.color.startsWith('from-') 
                                ? `bg-gradient-to-r ${platform.color}` 
                                : platform.color
                            }`}>
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d={platform.icon} />
                              </svg>
                            </div>
                            <span className="font-medium text-sm">{platform.name}</span>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="url"
                              placeholder={`Your ${platform.name} URL`}
                              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  const input = e.target as HTMLInputElement;
                                  handleAddSocialLink(platform.key, input.value);
                                  input.value = '';
                                }
                              }}
                            />
                            <button
                              onClick={(e) => {
                                const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                                handleAddSocialLink(platform.key, input.value);
                                input.value = '';
                              }}
                              className="px-3 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3 mt-8 pt-6 border-t">
              <button
                onClick={() => {
                  setBio(mockInfluencer.bio);
                  setDiscountCode(mockInfluencer.discountCode);
                  setAvatar(mockInfluencer.avatar);
                  setSocialLinks(mockInfluencer.socialLinks);
                  setEditingProfile(false);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS Styles */}
      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

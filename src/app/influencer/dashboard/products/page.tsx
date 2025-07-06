'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import InfluencerSidebar from '../../../../components/InfluencerSidebar'



interface Product {
  id: string
  name: string
  description?: string
  price: number
  currency: string
  images: string[]
  category: string
  sizes: string[]
  colors: string[]
  sku: string
  stockQuantity: number
  brand: {
    id: string
    name: string
    logo?: string
  }
}

interface Category {
  name: string
  count: number
}

interface Brand {
  name: string
  count: number
}

export default function InfluencerProductCatalog() {
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [selectedBrand, setSelectedBrand] = useState<string>('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set())
  const [categoriesExpanded, setCategoriesExpanded] = useState(false)
  const [brandsExpanded, setBrandsExpanded] = useState(false)
  
  // Edit campaign functionality
  const [editMode, setEditMode] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<any>(null)
  const [editCampaignId, setEditCampaignId] = useState<string | null>(null)
  
  const router = useRouter()
  const searchParams = useSearchParams()

  // Memoized filtered products to avoid recalculation
  const filteredProducts = useMemo(() => {
    let filtered = allProducts
    
    // Filter by brand
    if (selectedBrand !== 'All') {
      filtered = filtered.filter(product => product.brand.name === selectedBrand)
    }
    
    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(product => product.category === selectedCategory)
    }
    
    return filtered
  }, [allProducts, selectedCategory, selectedBrand])

  useEffect(() => {
    console.log('🎯 [INIT] Component mounted, checking localStorage...')
    
    // Check for edit campaign mode
    const editCampaignParam = searchParams.get('editCampaign')
    if (editCampaignParam) {
      console.log('✏️ [EDIT] Edit campaign mode detected:', editCampaignParam)
      setEditMode(true)
      setEditCampaignId(editCampaignParam)
      loadCampaignData(editCampaignParam)
    }
    
    // Jednorázově vyčistit localStorage od starých mock dat
    const savedData = localStorage.getItem('selectedProducts')
    console.log('🔍 [INIT] Raw localStorage data:', savedData)
    
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        console.log('📋 [INIT] Parsed data:', parsed)
        console.log('📋 [INIT] Parsed data type:', typeof parsed, 'isArray:', Array.isArray(parsed))
        
        // Zkontrolovat jen základní validitu formátu - nemazat na základě ID formátu
        if (!Array.isArray(parsed)) {
          localStorage.removeItem('selectedProducts')
          console.log('🧹 [INIT] Cleared invalid localStorage data - not an array')
        } else {
          console.log('✅ [INIT] localStorage data format is valid')
        }
      } catch (e) {
        localStorage.removeItem('selectedProducts')
        console.log('🧹 [INIT] Cleared invalid localStorage data - JSON parse error:', e)
      }
    } else {
      console.log('📝 [INIT] No localStorage data found')
    }
    
    console.log('🚀 [INIT] Starting fetchInitialData...')
    fetchInitialData()
  }, [])

  // Update brands when products change
  useEffect(() => {
    if (allProducts.length > 0) {
      fetchBrands()
    }
  }, [allProducts])

  // Load saved products AFTER products are loaded
  useEffect(() => {
    console.log('🚀 [useEffect] Products loaded, checking for saved products...')
    console.log('📦 [useEffect] allProducts.length:', allProducts.length)
    console.log('🔍 [useEffect] Current selectedProducts size:', selectedProducts.size)
    
    if (allProducts.length > 0) {
      console.log('✅ [useEffect] Products available, calling loadSavedProducts()')
      loadSavedProducts()
    } else {
      console.log('⏳ [useEffect] No products yet, waiting...')
    }
  }, [allProducts])

  // Load campaign data for editing
  const loadCampaignData = async (campaignId: string) => {
    try {
      console.log('📋 [EDIT] Loading campaign data:', campaignId)
      
      const token = localStorage.getItem('influencer_token') || sessionStorage.getItem('influencer_token')
      if (!token) {
        console.error('❌ [EDIT] No authentication token found')
        return
      }

      // Get campaign details
      const campaignResponse = await fetch(`/api/influencer/campaigns/${campaignId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })

      if (campaignResponse.ok) {
        const campaignData = await campaignResponse.json()
        console.log('✅ [EDIT] Campaign data loaded:', campaignData.campaign)
        setEditingCampaign(campaignData.campaign)
      }

      // Get selected products for this campaign
      const productsResponse = await fetch(`/api/influencer/campaigns/${campaignId}/products`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })

      if (productsResponse.ok) {
        const productsData = await productsResponse.json()
        console.log('✅ [EDIT] Campaign products loaded:', productsData.products)
        
        // Set selected products from campaign
        if (productsData.products && productsData.products.length > 0) {
          const productIds = productsData.products.map((p: any) => p.id)
          setSelectedProducts(new Set(productIds))
          console.log('📝 [EDIT] Pre-selected products:', productIds)
        }
      }
      
    } catch (error) {
      console.error('❌ [EDIT] Error loading campaign data:', error)
    }
  }

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // First fetch products and categories in parallel
      await Promise.all([
        fetchCategories(),
        fetchProducts(),
      ]);
      // Then fetch brands based on loaded products
      fetchBrands();
    } catch (err) {
      setError('Failed to load initial data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?limit=100')
      const data = await response.json()
      
      if (response.ok) {
        setAllProducts(data.data.products)
      } else {
        throw new Error(data.error || 'Failed to fetch products');
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching products:', err)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/products/categories')
      const data = await response.json()
      
      if (response.ok) {
        const totalCount = data.data.categories.reduce((acc: number, cat: Category) => acc + cat.count, 0)
        setCategories([{ name: 'All', count: totalCount }, ...data.data.categories])
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    }
  }

  const fetchBrands = async () => {
    try {
      // Get real brands from the products data
      const brandCounts: { [key: string]: number } = {}
      allProducts.forEach(product => {
        const brandName = product.brand.name
        brandCounts[brandName] = (brandCounts[brandName] || 0) + 1
      })
      
      const realBrands = Object.entries(brandCounts).map(([name, count]) => ({
        name,
        count
      }))
      
      const totalCount = realBrands.reduce((acc, brand) => acc + brand.count, 0)
      setBrands([{ name: 'All', count: totalCount }, ...realBrands])
    } catch (err) {
      console.error('Failed to fetch brands:', err)
      setBrands([{ name: 'All', count: 0 }])
    }
  }

  const loadSavedProducts = async () => {
    try {
      console.log('🔄 Loading saved products...')
      console.log('📦 Available products:', allProducts.length)
      
      // Pro teď použijeme localStorage fallback, až bude autentizace, použijeme API
      const savedFromStorage = localStorage.getItem('selectedProducts')
      if (savedFromStorage) {
        console.log('💾 Found saved data in localStorage')
        const savedProducts = JSON.parse(savedFromStorage)
        console.log('📋 Parsed saved products:', savedProducts.length)
        
        // Zkontrolovat, jestli jsou uložené produkty validní
        if (Array.isArray(savedProducts) && savedProducts.length > 0) {
          // Filtrovat jen produkty, které existují v aktuální databázi
          const validProductIds = savedProducts
            .filter(p => {
              if (!p || !p.id) {
                console.log('❌ Invalid product (missing id):', p)
                return false
              }
              const exists = allProducts.some(product => product.id === p.id)
              if (!exists) {
                console.log('⚠️ Product not found in current database:', p.id, p.name)
              }
              return exists
            })
            .map(p => p.id)
          
          console.log('✅ Valid product IDs found:', validProductIds.length, 'out of', savedProducts.length)
          
          if (validProductIds.length > 0) {
            setSelectedProducts(new Set(validProductIds))
            console.log(`✅ Restored ${validProductIds.length} previously saved products`)
            
            // Pokud jen některé produkty jsou nevalidní, aktualizuj localStorage s validními
            if (validProductIds.length !== savedProducts.length) {
              const validProductsData = allProducts.filter(p => validProductIds.includes(p.id))
              localStorage.setItem('selectedProducts', JSON.stringify(validProductsData))
              console.log('🔄 Updated localStorage with only valid products')
            }
            
            // Ověření že se stav skutečně nastavil
            setTimeout(() => {
              console.log('🔍 Final selected products count:', validProductIds.length)
            }, 100)
          } else {
            // Pouze pokud nejsou žádné validní produkty
            localStorage.removeItem('selectedProducts')
            console.log('🧹 No valid products found, cleared localStorage')
          }
        } else if (Array.isArray(savedProducts) && savedProducts.length === 0) {
          console.log('📝 Empty array in localStorage - this is valid')
          setSelectedProducts(new Set())
        } else {
          // Nevalidní formát
          localStorage.removeItem('selectedProducts')
          console.log('🧹 Invalid format in localStorage, cleared')
        }
      } else {
        console.log('📝 No saved products found in localStorage')
      }
      
      // TODO: Až bude autentizace implementována, použít tento API call:
      /*
      const response = await fetch('/api/influencer/products', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        const savedProductIds = data.products.map((p: Product) => p.id)
        setSelectedProducts(new Set(savedProductIds))
        console.log(`Loaded ${savedProductIds.length} previously saved products from API`)
      }
      */
    } catch (err) {
      console.error('❌ Failed to load saved products:', err)
      // V případě chyby vyčistit localStorage jen pokud je poškozen
      try {
        JSON.parse(localStorage.getItem('selectedProducts') || '[]')
      } catch {
        localStorage.removeItem('selectedProducts')
        console.log('🧹 Cleared corrupted localStorage after error')
      }
    }
  }

  // Optimized change handlers - no API call needed
  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category)
  }, [])

  const handleBrandChange = useCallback((brand: string) => {
    setSelectedBrand(brand)
  }, [])

  const toggleProductSelection = useCallback(async (productId: string) => {
    console.log(`🎯 [TOGGLE] Starting toggle for product: ${productId}`)
    
    setSelectedProducts(prev => {
      const newSelected = new Set(prev)
      const wasSelected = newSelected.has(productId)
      
      if (wasSelected) {
        newSelected.delete(productId)
        console.log(`➖ [TOGGLE] Removed product ${productId} from selection`)
      } else {
        newSelected.add(productId)
        console.log(`➕ [TOGGLE] Added product ${productId} to selection`)
      }
      
      console.log(`🔢 [TOGGLE] New selection size: ${newSelected.size}`)
      console.log(`🔍 [TOGGLE] New selection IDs:`, Array.from(newSelected))
      
      // Automaticky uložit výběr do localStorage
      const selectedProductsArray = allProducts.filter(p => newSelected.has(p.id))
      console.log(`📦 [TOGGLE] Products to save:`, selectedProductsArray.length)
      console.log(`🔍 [TOGGLE] Product details:`, selectedProductsArray.map(p => ({ id: p.id, name: p.name })))
      
      const dataToSave = JSON.stringify(selectedProductsArray)
      console.log(`💾 [TOGGLE] Saving to localStorage:`, dataToSave.substring(0, 200) + '...')
      
      localStorage.setItem('selectedProducts', dataToSave)
      
      // Ověř že se skutečně uložilo
      const verification = localStorage.getItem('selectedProducts')
      if (verification === dataToSave) {
        console.log(`✅ [TOGGLE] localStorage save verified successfully`)
      } else {
        console.error(`❌ [TOGGLE] localStorage save FAILED!`)
        console.error(`Expected:`, dataToSave.substring(0, 100))
        console.error(`Got:`, verification ? verification.substring(0, 100) : 'null')
      }
      
      console.log(`💾 [TOGGLE] Auto-saved ${newSelected.size} selected products to localStorage`)
      console.log('🔍 [TOGGLE] Saved product IDs:', Array.from(newSelected))
      
      // Také uložit do databáze (s error handling)
      setTimeout(async () => {
        try {
          await saveProductSelectionToDatabase(Array.from(newSelected))
        } catch (error) {
          console.error('❌ [TOGGLE] Failed to save to database:', error)
          // Optional: show user notification about the error
        }
      }, 100)
      
      return newSelected
    })
  }, [allProducts])

  const toggleCardFlip = useCallback((productId: string) => {
    setFlippedCards(prev => {
      const newFlipped = new Set(prev)
      if (newFlipped.has(productId)) {
        newFlipped.delete(productId)
      } else {
        newFlipped.add(productId)
      }
      return newFlipped
    })
  }, [])

  const calculateDiscountedPrice = useCallback((price: number) => {
    return (price * 0.8).toFixed(2); // 20% discount
  }, [])

  const saveProductSelectionToDatabase = async (productIds: string[]) => {
    try {
      console.log('🔍 [SAVE-DB] Starting save with productIds:', productIds.length)
      
      // Get token from localStorage or sessionStorage
      const token = localStorage.getItem('influencer_token') || sessionStorage.getItem('influencer_token')
      if (!token) {
        console.error('❌ [SAVE-DB] No authentication token found')
        return
      }

      console.log('🔍 [SAVE-DB] Token found, making API call...')
      
      const response = await fetch('/api/influencer/products', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productIds, action: 'set' })
      });
      
      console.log('🔍 [SAVE-DB] API response status:', response.status)
      
      const data = await response.json();
      console.log('🔍 [SAVE-DB] API response data:', data)
      
      if (response.ok) {
        console.log('✅ [SAVE-DB] Selection saved to database!', data);
      } else {
        console.error('❌ [SAVE-DB] Failed to save selection to database:', data.error);
        throw new Error(data.error || 'Failed to update product selection');
      }
    } catch (err: any) {
      console.error('❌ [SAVE-DB] Error saving selection to database:', err);
      console.error('❌ [SAVE-DB] Error details:', err.message, err.stack);
      throw new Error(err.message || 'Failed to update product selection');
    }
  };

  const saveProductSelection = async () => {
    setSaving(true);
    try {
      await saveProductSelectionToDatabase(Array.from(selectedProducts));
    } finally {
      setSaving(false);
    }
  };

  const updateCampaignProducts = async (campaignId: string) => {
    try {
      setSaving(true)
      console.log('📋 [EDIT] Updating campaign products:', campaignId)
      const token = localStorage.getItem('influencer_token') || sessionStorage.getItem('influencer_token')
      if (!token) {
        console.error('❌ No authentication token found for update')
        return
      }

      const response = await fetch(`/api/influencer/campaigns/${campaignId}/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productIds: Array.from(selectedProducts) })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Campaign products updated successfully:', data)
        showToast('Campaign products updated successfully!', 'success')
        router.push('/influencer/dashboard/campaigns')
      } else {
        const errorData = await response.json()
        console.error('❌ Failed to update campaign products:', errorData.error)
        showToast(`Failed to update: ${errorData.error}`, 'error')
      }
    } catch (error) {
      console.error('❌ Error updating campaign products:', error)
      showToast('Error updating campaign products', 'error')
    } finally {
      setSaving(false)
    }
  }

  // Helper funkce pro toast zprávy (použijeme tu samou jako v campaigns)
  const showToast = (message: string, type: 'success' | 'error') => {
    const toast = document.createElement('div')
    toast.className = `fixed top-5 right-5 px-4 py-2 rounded-lg shadow-lg z-50 text-white ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`
    toast.textContent = message
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 3000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
              <InfluencerSidebar currentPage="products" />
      
      {/* Top Header */}
      <header className="bg-white border-b border-gray-100 h-16 fixed top-0 right-0 left-64 z-30">
        <div className="flex items-center justify-between h-full px-8">
          <div>
            {editMode && editingCampaign ? (
              <>
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Campaign Products
                </h2>
                <p className="text-sm text-gray-500">
                  Editing: <span className="font-medium">{editingCampaign.name}</span>
                </p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-gray-900">Product Catalog</h2>
                <p className="text-sm text-gray-500">Choose products to promote</p>
              </>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">
              {selectedProducts.size} selected
            </span>
            
            {editMode ? (
              // Edit mode buttons
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    // Cancel edit mode
                    router.push('/influencer/dashboard/campaigns')
                  }}
                  className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                
                <button
                  onClick={async () => {
                    if (editCampaignId) {
                      await updateCampaignProducts(editCampaignId)
                    }
                  }}
                  disabled={saving}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    saving
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {saving ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Saving...
                    </div>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            ) : (
              // Normal mode button
              <button
                onClick={() => {
                  if (selectedProducts.size > 0) {
                    // Products are already saved automatically in localStorage
                    router.push('/influencer/campaign/preview');
                  }
                }}
                disabled={selectedProducts.size === 0}
                className={`bg-black text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedProducts.size === 0 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-gray-800'
                }`}
              >
                My Campaign
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="ml-64 pt-24 px-6 pb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-6">
            {/* Filters Sidebar */}
            <aside className="w-48 flex-shrink-0 space-y-2 sticky top-32 self-start max-h-screen overflow-y-auto">
            {/* Brands Filter */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="text-base font-semibold text-gray-900 mb-3">Brands</h3>
              
              {/* Collapsible Header for Brands */}
              <button
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  const isChevronClick = target.closest('svg') || target.closest('.chevron-area');
                  
                  if (isChevronClick) {
                    setBrandsExpanded(!brandsExpanded);
                  } else {
                    handleBrandChange('All');
                    setBrandsExpanded(true); // OKAMŽITĚ rozbal při kliknutí na All
                  }
                }}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-150 ease-out flex justify-between items-center mb-2 ${
                  selectedBrand === 'All'
                    ? 'bg-black text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="font-medium">All</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    selectedBrand === 'All' 
                      ? 'bg-white text-black' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {brands.find(brand => brand.name === 'All')?.count || 0}
                  </span>
                  <div 
                    className="chevron-area p-1 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setBrandsExpanded(!brandsExpanded);
                    }}
                  >
                    <svg 
                      className={`w-4 h-4 transition-transform duration-200 ease-out ${
                        brandsExpanded ? 'rotate-180' : ''
                      } ${selectedBrand === 'All' ? 'text-white' : 'text-gray-600'}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </button>

              {/* Expandable Brands */}
              <div className={`space-y-1 overflow-hidden transition-all duration-200 ease-out ${
                brandsExpanded ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                {brands.filter(brand => brand.name !== 'All').map(brand => (
                  <button
                    key={brand.name}
                    onClick={() => {
                      handleBrandChange(brand.name);
                      setBrandsExpanded(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-150 ease-out flex justify-between items-center ${
                      selectedBrand === brand.name
                        ? 'bg-black text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="font-medium">{brand.name}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      selectedBrand === brand.name 
                        ? 'bg-white text-black' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {brand.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Categories Filter */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="text-base font-semibold text-gray-900 mb-3">Categories</h3>
              
              {/* Collapsible Header - Optimized */}
              <button
                onClick={(e) => {
                  // If clicking on the chevron area, toggle expansion
                  const target = e.target as HTMLElement;
                  const isChevronClick = target.closest('svg') || target.closest('.chevron-area');
                  
                  if (isChevronClick) {
                    setCategoriesExpanded(!categoriesExpanded);
                  } else {
                    // If clicking on text/label area, select "All" category and expand
                    handleCategoryChange('All');
                    setCategoriesExpanded(true); // OKAMŽITĚ rozbal při kliknutí na All
                  }
                }}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-150 ease-out flex justify-between items-center mb-2 ${
                  selectedCategory === 'All'
                    ? 'bg-black text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="font-medium">All</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    selectedCategory === 'All' 
                      ? 'bg-white text-black' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {categories.find(cat => cat.name === 'All')?.count || 0}
                  </span>
                  <div 
                    className="chevron-area p-1 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCategoriesExpanded(!categoriesExpanded);
                    }}
                  >
                    <svg 
                      className={`w-4 h-4 transition-transform duration-200 ease-out ${
                        categoriesExpanded ? 'rotate-180' : ''
                      } ${selectedCategory === 'All' ? 'text-white' : 'text-gray-600'}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </button>

              {/* Expandable Categories - Optimized Animations */}
              <div className={`space-y-1 overflow-hidden transition-all duration-200 ease-out ${
                categoriesExpanded ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                {categories.filter(cat => cat.name !== 'All').map(cat => (
                  <button
                    key={cat.name}
                    onClick={() => {
                      handleCategoryChange(cat.name);
                      setCategoriesExpanded(false); // Close after selection
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-150 ease-out flex justify-between items-center ${
                      selectedCategory === cat.name
                        ? 'bg-black text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="font-medium">{cat.name}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      selectedCategory === cat.name 
                        ? 'bg-white text-black' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {cat.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl shadow-sm animate-pulse overflow-hidden">
                    <div className="w-full h-48 bg-gray-200"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-600 font-medium">{error}</p>
                <button 
                  onClick={() => fetchInitialData()}
                  className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map(product => (
                  <div 
                    key={product.id} 
                    className={`relative h-96 transition-all duration-200 ease-out hover:shadow-lg transform hover:-translate-y-1 ${
                      selectedProducts.has(product.id) ? 'shadow-xl' : ''
                    }`}
                    style={{ perspective: '1000px' }}
                  >
                    {/* Flip Card Container */}
                    <div 
                      className={`relative w-full h-full transition-transform duration-500 ease-out transform-style-preserve-3d ${
                        flippedCards.has(product.id) ? 'rotate-y-180' : ''
                      }`}
                    >
                      {/* Front Side */}
                      <div className="absolute inset-0 w-full h-full backface-hidden bg-white rounded-2xl shadow-sm overflow-hidden">
                        {/* Product Image */}
                        <div className="w-full h-48 overflow-hidden bg-gray-50 relative flex items-center justify-center p-2">
                          <div 
                            className="w-full h-full cursor-pointer group flex items-center justify-center"
                            onClick={() => toggleCardFlip(product.id)}
                          >
                            {product.images && product.images.length > 0 ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                            

                          </div>
                        </div>
                        
                        {/* Product Info */}
                        <div className="p-4 flex flex-col h-48">
                          <div className="min-h-0 mb-3">
                            <h4 className="font-semibold text-gray-900 text-sm leading-tight mb-1 line-clamp-2">{product.name}</h4>
                            <p className="text-sm text-gray-500">{product.brand.name}</p>
                          </div>
                          
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex flex-col">
                              <span className="text-lg font-bold text-black">
                                €{calculateDiscountedPrice(product.price)}
                              </span>
                              <span className="text-sm text-gray-400 line-through">
                                €{product.price.toFixed(2)}
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-500 mb-1">Commission</div>
                              <div className="text-sm font-semibold text-green-600">
                                €{(product.price * 0.2).toFixed(2)} (20%)
                              </div>
                            </div>
                          </div>
                          
                          {/* Save Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleProductSelection(product.id);
                            }}
                            className={`mt-auto w-full py-2 px-4 rounded-lg text-sm font-medium transition-all duration-150 ${
                              selectedProducts.has(product.id)
                                ? 'bg-black text-white hover:bg-gray-800'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {selectedProducts.has(product.id) ? 'Saved' : 'Save Product'}
                          </button>
                        </div>
                      </div>

                      {/* Back Side */}
                      <div className="absolute inset-0 w-full h-full backface-hidden bg-white rounded-2xl shadow-sm overflow-hidden" style={{ transform: 'rotateY(180deg)' }}>
                        <div className="p-4 h-full flex flex-col">
                          {/* Header with mini image and back button */}
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                              {product.images && product.images.length > 0 ? (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM5Q0EzQUYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 text-sm leading-tight mb-1 truncate">{product.name}</h4>
                              <p className="text-xs text-gray-500">{product.brand.name}</p>
                            </div>
                            
                            <button
                              onClick={() => toggleCardFlip(product.id)}
                              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                              title="Flip back"
                            >
                              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </button>
                          </div>
                          
                          {/* Product Details */}
                          <div className="flex-1 space-y-2.5 text-sm overflow-y-auto">
                            {product.description && (
                              <div>
                                <h5 className="font-medium text-gray-900 mb-1 text-xs">Description</h5>
                                <div className="max-h-20 overflow-y-auto">
                                  <p className="text-gray-600 text-xs leading-snug pr-2">
                                    {product.description}
                                  </p>
                                </div>
                              </div>
                            )}
                            
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-gray-500 text-xs">SKU:</span>
                                <div className="font-medium text-gray-900 text-xs truncate">{product.sku}</div>
                              </div>
                              <div>
                                <span className="text-gray-500 text-xs">Stock:</span>
                                <div className="font-medium text-gray-900 text-xs">{product.stockQuantity}</div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Price and Save Button */}
                          <div className="pt-3 border-t border-gray-100 mt-auto">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <div className="text-base font-bold text-gray-900">
                                  €{calculateDiscountedPrice(product.price)}
                                </div>
                                <div className="text-xs text-gray-400 line-through">
                                  €{product.price.toFixed(2)}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs text-gray-500">Commission</div>
                                <div className="text-sm font-semibold text-green-600">
                                  €{(product.price * 0.2).toFixed(2)} (20%)
                                </div>
                              </div>
                            </div>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleProductSelection(product.id);
                              }}
                              className={`w-full py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-150 ${
                                selectedProducts.has(product.id)
                                  ? 'bg-black text-white hover:bg-gray-800'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {selectedProducts.has(product.id) ? 'Saved' : 'Save Product'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {!loading && !error && filteredProducts.length === 0 && (
              <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <p className="text-gray-500 font-medium">No products found</p>
                <p className="text-gray-400 text-sm mt-1">Try selecting a different category</p>
              </div>
            )}
          </div>
        </div>
        </div>
      </main>
      
      <style jsx>{`
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        /* Hardware acceleration for smoother animations */
        .transition-transform {
          will-change: transform;
        }
        .transition-all {
          will-change: transform, background-color, box-shadow;
        }
      `}</style>
    </div>
  )
} 
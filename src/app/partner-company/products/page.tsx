'use client'

import React, { useState } from 'react'
import ProductsTab, { Product } from '../../../components/ProductsTab'

export default function ProductManagementPage() {
  const [activeTab, setActiveTab] = useState('products')
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [addProductTab, setAddProductTab] = useState('basic')
  const [productImages, setProductImages] = useState([])
  const [dragActive, setDragActive] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [showEditProduct, setShowEditProduct] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  
  // Mock data - v produkci by se načítala z API
  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      name: 'Premium Wireless Headphones',
      price: 2500,
      image: '/products/headphones.jpg',
      commission: 15,
      stock: 45,
      category: 'Electronics',
      status: 'active'
    },
    {
      id: '2',
      name: 'Stylish Backpack',
      price: 1200,
      image: '/products/backpack.jpg',
      commission: 20,
      stock: 12,
      category: 'Fashion',
      status: 'active'
    },
    {
      id: '3',
      name: 'Gaming Mechanical Keyboard',
      price: 3200,
      image: '/products/keyboard.jpg',
      commission: 12,
      stock: 28,
      category: 'Electronics',
      status: 'active'
    },
    {
      id: '4',
      name: 'Organic Face Cream',
      price: 890,
      image: '/products/cream.jpg',
      commission: 25,
      stock: 0,
      category: 'Beauty',
      status: 'inactive'
    },
    {
      id: '5',
      name: 'Smart Fitness Watch',
      price: 4500,
      image: '/products/watch.jpg',
      commission: 18,
      stock: 67,
      category: 'Electronics',
      status: 'active'
    },
    {
      id: '6',
      name: 'Yoga Mat Premium',
      price: 750,
      image: '/products/yoga.jpg',
      commission: 30,
      stock: 156,
      category: 'Sports',
      status: 'active'
    },
    {
      id: '7',
      name: 'Coffee Beans Arabica',
      price: 420,
      image: '/products/coffee.jpg',
      commission: 22,
      stock: 89,
      category: 'Food',
      status: 'active'
    },
    {
      id: '8',
      name: 'LED Desk Lamp',
      price: 1650,
      image: '/products/lamp.jpg',
      commission: 16,
      stock: 34,
      category: 'Home',
      status: 'active'
    }
  ])

  const tabs = [
    { id: 'products', label: 'Products', icon: '📦' },
    { id: 'campaigns', label: 'Campaign Settings', icon: '🎯' },
    { id: 'api', label: 'API Integration', icon: '🔗' }
  ]

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         String(product.id).includes(searchTerm)
    
    const matchesCategory = selectedCategory === 'All Categories' || 
                           product.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  // ProductsTab moved to separate component to keep stable reference and preserve input focus

  const CampaignSettingsTab = () => {
    const [discountRules, setDiscountRules] = useState<any[]>([
      {
        id: 1,
        name: 'Electronics Standard',
        rule_type: 'category',
        target_categories: ['Electronics'],
        customer_discount: 15,
        influencer_commission: 12,
        is_active: true
      },
      {
        id: 2,
        name: 'Fashion Premium',
        rule_type: 'category', 
        target_categories: ['Fashion'],
        customer_discount: 25,
        influencer_commission: 20,
        is_active: true
      }
    ])
    
    const [showAddRule, setShowAddRule] = useState(false)
    const [editingRule, setEditingRule] = useState<any>(null)
    const [newRule, setNewRule] = useState({
      name: '',
      rule_type: 'all',
      filters: [] as Array<{
        id: string,
        type: 'category' | 'brand' | 'specific_products',
        values: any[]
      }>,
      customer_discount: 0,
      influencer_commission: 0
    })

    const categories = ['Electronics', 'Fashion', 'Beauty', 'Home', 'Sports', 'Food']
    const productBrands = ['Samsung', 'Apple', 'Nike', 'Adidas', 'Coca-Cola'] // Mock data

    const addDiscountRule = () => {
      if (editingRule) {
        // Update existing rule
        setDiscountRules(discountRules.map(rule => 
          rule.id === editingRule.id ? { ...newRule, id: editingRule.id, is_active: editingRule.is_active } : rule
        ))
      } else {
        // Add new rule
        const rule = {
          ...newRule,
          id: Date.now(),
          is_active: true
        }
        setDiscountRules([...discountRules, rule])
      }
      
      setNewRule({
        name: '',
        rule_type: 'all',
        filters: [],
        customer_discount: 0,
        influencer_commission: 0
      })
      setEditingRule(null)
      setShowAddRule(false)
    }

    const editRule = (rule: any) => {
      setEditingRule(rule)
      // Convert old format to new format if needed
      let filters = []
      
      // Handle old format with target_categories, target_brands, selected_products
      if (rule.target_categories && rule.target_categories.length > 0) {
        filters.push({
          id: `cat_${Date.now()}`,
          type: 'category' as const,
          values: rule.target_categories || []
        })
      }
      if (rule.target_brands && rule.target_brands.length > 0) {
        filters.push({
          id: `brand_${Date.now()}`,
          type: 'brand' as const,
          values: rule.target_brands || []
        })
      }
      if (rule.selected_products && rule.selected_products.length > 0) {
        filters.push({
          id: `prod_${Date.now()}`,
          type: 'specific_products' as const,
          values: rule.selected_products || []
        })
      }
      
      // Handle new format with filters array
      if (rule.filters && Array.isArray(rule.filters)) {
        filters = rule.filters.map((filter: any) => ({
          ...filter,
          values: filter.values || [] // Ensure values is always an array
        }))
      }
      
      setNewRule({
        name: rule.name || '',
        rule_type: rule.rule_type || 'all',
        filters: filters,
        customer_discount: rule.customer_discount || 0,
        influencer_commission: rule.influencer_commission || 0
      })
      setShowAddRule(true)
    }

    const deleteRule = (id: number) => {
      setDiscountRules(discountRules.filter(rule => rule.id !== id))
    }

    const toggleRuleStatus = (id: number) => {
      setDiscountRules(discountRules.map(rule => 
        rule.id === id ? { ...rule, is_active: !rule.is_active } : rule
      ))
    }

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Settings</h3>
          <p className="text-sm text-gray-500 mb-6">Configure how influencers can create campaigns with your products</p>
        </div>

        {/* Discount & Commission Rules Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                <span className="mr-2">💰</span>
                Discount & Commission Rules
              </h4>
              <p className="text-sm text-gray-500">
                Set customer discounts and influencer commissions for different product groups
              </p>
            </div>
            <button
              onClick={() => setShowAddRule(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Rule
            </button>
          </div>

          {/* Rules List */}
          <div className="space-y-4">
            {discountRules.map((rule) => (
              <div key={rule.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <h5 className="font-medium text-gray-900">{rule.name}</h5>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        rule.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {rule.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {rule.rule_type === 'category' ? 'Category' : 
                         rule.rule_type === 'brand' ? 'Brand' : 
                         rule.rule_type === 'specific_products' ? 'Specific Products' : 'All Products'}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="mr-4">
                        <strong>Customer Discount:</strong> {rule.customer_discount}%
                      </span>
                      <span className="mr-4">
                        <strong>Influencer Commission:</strong> {rule.influencer_commission}%
                      </span>
                      {rule.filters && rule.filters.length > 0 && (
                        <span className="mr-4">
                          <strong>Filters:</strong> {rule.filters.map((f: any) => `${f.type}: ${f.values.length} items`).join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => editRule(rule)}
                      className="bg-blue-100 text-blue-800 hover:bg-blue-200 px-3 py-1 rounded text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleRuleStatus(rule.id)}
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        rule.is_active 
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {rule.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => deleteRule(rule.id)}
                      className="bg-red-100 text-red-800 hover:bg-red-200 px-3 py-1 rounded text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {discountRules.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No discount rules yet</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Create your first rule to set discounts and commissions for your products
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit Rule Modal */}
        {showAddRule && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingRule ? 'Edit Discount & Commission Rule' : 'Add Discount & Commission Rule'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddRule(false)
                    setEditingRule(null)
                    setNewRule({
                      name: '',
                      rule_type: 'all',
                      filters: [],
                      customer_discount: 0,
                      influencer_commission: 0
                    })
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Rule Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rule Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Electronics Standard, Fashion Premium"
                    value={newRule.name}
                    onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Combined Filters */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">Filters</label>
                    <button
                      type="button"
                      onClick={() => {
                        const newFilter = {
                          id: `filter_${Date.now()}`,
                          type: 'category' as const,
                          values: []
                        }
                        setNewRule({ ...newRule, filters: [...newRule.filters, newFilter] })
                      }}
                      className="bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1 rounded text-sm font-medium flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Filter
                    </button>
                  </div>
                  
                  {newRule.filters.length === 0 && (
                    <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                      <p className="text-sm">No filters added. Click "Add Filter" to start filtering products.</p>
                      <p className="text-xs mt-1">You can combine multiple filter types (categories + brands + specific products)</p>
                    </div>
                  )}
                  
                  {newRule.filters.map((filter, index) => (
                    <div key={filter.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <select
                          value={filter.type}
                          onChange={(e) => {
                            const updatedFilters = [...newRule.filters]
                            updatedFilters[index] = { ...filter, type: e.target.value as any, values: [] }
                            setNewRule({ ...newRule, filters: updatedFilters })
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="category">Categories</option>
                          <option value="brand">Brands</option>
                          <option value="specific_products">Specific Products</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            const updatedFilters = newRule.filters.filter((_, i) => i !== index)
                            setNewRule({ ...newRule, filters: updatedFilters })
                          }}
                          className="bg-red-100 hover:bg-red-200 text-red-800 px-2 py-1 rounded text-sm"
                        >
                          Remove
                        </button>
                      </div>
                      
                      {filter.type === 'category' && (
                        <div className="grid grid-cols-2 gap-2">
                          {categories.map((category) => (
                            <label key={category} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={filter.values ? filter.values.includes(category) : false}
                                onChange={(e) => {
                                  const updatedFilters = [...newRule.filters]
                                  if (e.target.checked) {
                                    updatedFilters[index] = { ...filter, values: [...filter.values, category] }
                                  } else {
                                    updatedFilters[index] = { ...filter, values: filter.values.filter(v => v !== category) }
                                  }
                                  setNewRule({ ...newRule, filters: updatedFilters })
                                }}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="ml-2 text-sm text-gray-700">{category}</span>
                            </label>
                          ))}
                        </div>
                      )}
                      
                      {filter.type === 'brand' && (
                        <div className="grid grid-cols-2 gap-2">
                          {productBrands.map((brand) => (
                            <label key={brand} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={filter.values ? filter.values.includes(brand) : false}
                                onChange={(e) => {
                                  const updatedFilters = [...newRule.filters]
                                  if (e.target.checked) {
                                    updatedFilters[index] = { ...filter, values: [...filter.values, brand] }
                                  } else {
                                    updatedFilters[index] = { ...filter, values: filter.values.filter(v => v !== brand) }
                                  }
                                  setNewRule({ ...newRule, filters: updatedFilters })
                                }}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="ml-2 text-sm text-gray-700">{brand}</span>
                            </label>
                          ))}
                        </div>
                      )}
                      
                      {filter.type === 'specific_products' && (
                        <div className="max-h-40 overflow-y-auto border border-gray-300 rounded p-2">
                          {products.map((product) => (
                            <label key={product.id} className="flex items-center mb-1">
                              <input
                                type="checkbox"
                                checked={filter.values ? filter.values.includes(product.id) : false}
                                onChange={(e) => {
                                  const updatedFilters = [...newRule.filters]
                                  if (e.target.checked) {
                                    updatedFilters[index] = { ...filter, values: [...filter.values, product.id] }
                                  } else {
                                    updatedFilters[index] = { ...filter, values: filter.values.filter(v => v !== product.id) }
                                  }
                                  setNewRule({ ...newRule, filters: updatedFilters })
                                }}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="ml-2 text-sm text-gray-700">{product.name}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>



                {/* Discount and Commission */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Customer Discount (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="15"
                      value={newRule.customer_discount}
                      onChange={(e) => setNewRule({ ...newRule, customer_discount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Discount for customers using influencer codes</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Influencer Commission (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="12"
                      value={newRule.influencer_commission}
                      onChange={(e) => setNewRule({ ...newRule, influencer_commission: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Commission paid to influencer from sales</p>
                  </div>
                </div>

                {/* Commission Calculation Example */}
                {newRule.customer_discount > 0 && newRule.influencer_commission > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="font-medium text-blue-900 mb-2">Calculation Example</h5>
                    <div className="text-sm text-blue-800 space-y-1">
                      <div>Product Price: 1000 CZK (incl. VAT)</div>
                      <div>Customer Pays: {1000 * (1 - newRule.customer_discount / 100)} CZK (after {newRule.customer_discount}% discount)</div>
                      <div>Revenue after VAT: {Math.round(1000 * (1 - newRule.customer_discount / 100) / 1.21)} CZK</div>
                      <div className="font-medium">Influencer Commission: {Math.round(1000 * (1 - newRule.customer_discount / 100) / 1.21 * newRule.influencer_commission / 100)} CZK ({newRule.influencer_commission}%)</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => {
                    setShowAddRule(false)
                    setEditingRule(null)
                    setNewRule({
                      name: '',
                      rule_type: 'all',
                      filters: [],
                      customer_discount: 0,
                      influencer_commission: 0
                    })
                  }}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={addDiscountRule}
                  disabled={!newRule.name || newRule.customer_discount === 0 || newRule.influencer_commission === 0}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  {editingRule ? 'Update Rule' : 'Create Rule'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'products':
        return (
          <ProductsTab
            products={products}
            filteredProducts={filteredProducts}
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
            setSearchTerm={setSearchTerm}
            setSelectedCategory={setSelectedCategory}
            setShowAddProduct={setShowAddProduct}
            setShowEditProduct={setShowEditProduct}
            setEditingProduct={setEditingProduct}
            setAddProductTab={setAddProductTab}
            setProducts={setProducts}
          />
        )
      case 'campaigns': return <CampaignSettingsTab />
      case 'api': return <div className="text-center py-12 text-gray-500">API Integration coming soon</div>
      default: return (
        <ProductsTab
          products={products}
          filteredProducts={filteredProducts}
          searchTerm={searchTerm}
          selectedCategory={selectedCategory}
          setSearchTerm={setSearchTerm}
          setSelectedCategory={setSelectedCategory}
          setShowAddProduct={setShowAddProduct}
          setShowEditProduct={setShowEditProduct}
          setEditingProduct={setEditingProduct}
          setAddProductTab={setAddProductTab}
          setProducts={setProducts}
        />
      )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
          <p className="text-gray-600 mt-2">Manage your products, campaigns, and influencer settings</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Advanced Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-4xl mx-4 my-8 max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Add New Product</h3>
              <button
                onClick={() => {
                  setShowAddProduct(false)
                  setAddProductTab('basic')
                  setProductImages([])
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 px-6">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'basic', label: 'Basic Info', icon: '📝' },
                  { id: 'images', label: 'Images', icon: '📷' },
                  { id: 'pricing', label: 'Pricing & Stock', icon: '💰' },
                  { id: 'campaign', label: 'Campaign Settings', icon: '🎯' },
                  { id: 'shipping', label: 'Shipping', icon: '📦' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setAddProductTab(tab.id)}
                    className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center ${
                      addProductTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {addProductTab === 'basic' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                      <input 
                        type="text" 
                        placeholder="Enter product name" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">SKU Code</label>
                      <input 
                        type="text" 
                        placeholder="e.g. PROD-001" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Description *</label>
                    <textarea 
                      rows={4}
                      placeholder="Detailed product description for customers and influencers..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Select category</option>
                        <option>Electronics</option>
                        <option>Fashion</option>
                        <option>Beauty</option>
                        <option>Home</option>
                        <option>Sports</option>
                        <option>Food</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                      <input 
                        type="text" 
                        placeholder="Product brand" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                    <input 
                      type="text" 
                      placeholder="premium, bestseller, new (separate with commas)" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Help influencers find your product with relevant tags</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product URL Slug</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-l-lg">
                        /products/
                      </span>
                      <input 
                        type="text" 
                        placeholder="premium-wireless-headphones" 
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {(addProductTab === 'images' || addProductTab === 'pricing' || addProductTab === 'campaign' || addProductTab === 'shipping') && (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-2">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <p className="text-gray-500">This tab content is available in the full version</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                * Required fields
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowAddProduct(false)
                    setAddProductTab('basic')
                    setProductImages([])
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Save logic here
                    setShowAddProduct(false)
                    setAddProductTab('basic')
                    setProductImages([])
                  }}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Add Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditProduct && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-4xl mx-4 my-8 max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Edit Product: {editingProduct.name}</h3>
              <button
                onClick={() => {
                  setShowEditProduct(false)
                  setEditingProduct(null)
                  setAddProductTab('basic')
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 px-6">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'basic', label: 'Basic Info', icon: '📝' },
                  { id: 'images', label: 'Images', icon: '📷' },
                  { id: 'pricing', label: 'Pricing & Stock', icon: '💰' },
                  { id: 'campaign', label: 'Campaign Settings', icon: '🎯' },
                  { id: 'shipping', label: 'Shipping', icon: '📦' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setAddProductTab(tab.id)}
                    className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center ${
                      addProductTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {addProductTab === 'basic' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                      <input 
                        type="text" 
                        defaultValue={editingProduct?.name}
                        placeholder="Enter product name" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">SKU Code</label>
                      <input 
                        type="text" 
                        defaultValue={editingProduct?.sku || ''}
                        placeholder="e.g. PROD-001" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Description *</label>
                    <textarea 
                      rows={4}
                      defaultValue={editingProduct?.description || ''}
                      placeholder="Detailed product description for customers and influencers..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                      <select 
                        defaultValue={editingProduct?.category}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option>Electronics</option>
                        <option>Fashion</option>
                        <option>Beauty</option>
                        <option>Home</option>
                        <option>Sports</option>
                        <option>Food</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                      <input 
                        type="number" 
                        defaultValue={editingProduct?.price}
                        placeholder="0" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Commission %</label>
                      <input 
                        type="number" 
                        defaultValue={editingProduct?.commission}
                        placeholder="15" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
                      <input 
                        type="number" 
                        defaultValue={editingProduct?.stock}
                        placeholder="0" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {(addProductTab === 'images' || addProductTab === 'pricing' || addProductTab === 'campaign' || addProductTab === 'shipping') && (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-2">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <p className="text-gray-500">This tab content is available in the full version</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                * Required fields
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowEditProduct(false)
                    setEditingProduct(null)
                    setAddProductTab('basic')
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Save logic here
                    setShowEditProduct(false)
                    setEditingProduct(null)
                    setAddProductTab('basic')
                  }}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
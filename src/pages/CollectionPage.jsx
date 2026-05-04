import { useState, useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ProductCard from '../components/ProductCard'
import { productAPI } from '../services/api'

const CollectionPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('featured')
  const [searchQuery, setSearchQuery] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [error, setError] = useState(null)

  // ✅ Read category from URL and properly decode it
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category')
    if (categoryFromUrl) {
      // Decode URI component (converts Luxury%20Jersey → Luxury Jersey)
      // Also handle + signs (converts Luxury+Jersey → Luxury Jersey)
      const decoded = decodeURIComponent(categoryFromUrl.replace(/\+/g, ' '))
      
      // Find matching category (case-insensitive)
      const allProducts = products
      const matched = allProducts.find(p => 
        p.category?.toLowerCase() === decoded.toLowerCase()
      )
      
      if (matched) {
        setSelectedCategory(matched.category) // Use exact category from product
      } else {
        setSelectedCategory(decoded)
      }
    }
  }, [searchParams, products])

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await productAPI.getProducts({ limit: 100 })
        console.log('Fetched products:', res.data)
        setProducts(res.data.products || [])
      } catch (error) {
        console.error('Error fetching products:', error)
        setError('Failed to load products. Please try again.')
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  // Get unique categories from products
  const categories = useMemo(() => {
    const cats = products.map(p => p.category).filter(Boolean)
    return ['All', ...new Set(cats)]
  }, [products])

  // ✅ Update URL when category changes - properly encode
  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
    if (category === 'All') {
      // Remove category param
      searchParams.delete('category')
      setSearchParams(searchParams)
    } else {
      // Set category with proper encoding
      setSearchParams({ category: category })
    }
  }

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...products]

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory)
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Sort products
    switch (sortBy) {
      case 'price-low': return filtered.sort((a, b) => (a.price || 0) - (b.price || 0))
      case 'price-high': return filtered.sort((a, b) => (b.price || 0) - (a.price || 0))
      case 'name': return filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      case 'newest': return filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      default: return filtered
    }
  }, [products, selectedCategory, sortBy, searchQuery])

  // Count products per category
  const categoryCounts = useMemo(() => {
    const counts = { All: products.length }
    products.forEach(p => {
      if (p.category) {
        counts[p.category] = (counts[p.category] || 0) + 1
      }
    })
    return counts
  }, [products])

  if (loading) {
    return (
      <div className="pt-32 pb-20 px-6 md:px-10 max-w-[1920px] mx-auto min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-on-surface-variant">Loading collections...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="pt-32 pb-20 px-6 md:px-10 max-w-[1920px] mx-auto min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl mb-4 text-error">error</span>
          <h3 className="font-headline text-2xl font-bold mb-2">Something went wrong</h3>
          <p className="text-on-surface-variant mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-3 bg-primary text-on-primary font-bold rounded-xl">Try Again</button>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-28 pb-20 px-6 md:px-10 max-w-[1920px] mx-auto min-h-screen">
      {/* Page Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
        <div className="flex items-center gap-2 text-primary font-headline text-sm font-bold tracking-[0.2em] uppercase mb-4">
          <span>Archive 01</span>
          <span className="w-12 h-[1px] bg-primary/30"></span>
        </div>
        <h1 className="font-headline text-5xl md:text-7xl font-black italic tracking-tighter text-on-surface mb-4">
          {selectedCategory !== 'All' ? selectedCategory.toUpperCase() : 'ALL COLLECTIONS'}
        </h1>
        <p className="text-on-surface-variant text-lg max-w-2xl">
          {selectedCategory !== 'All' 
            ? `Browse our ${selectedCategory} collection` 
            : 'Explore our complete archive of limited edition drops, heavy-weight essentials, and tech-mesh innovations.'}
        </p>
      </motion.div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant">search</span>
          <input
            type="text" placeholder="Search collections..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-surface-container-low border border-outline-variant/20 rounded-xl text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>

        <button onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="lg:hidden flex items-center justify-center gap-2 px-6 py-4 bg-surface-container-low border border-outline-variant/20 rounded-xl text-on-surface font-bold uppercase tracking-widest text-xs hover:bg-surface-container transition-all">
          <span className="material-symbols-outlined">tune</span>Filter & Sort
        </button>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
          className="hidden lg:block px-6 py-4 bg-surface-container-low border border-outline-variant/20 rounded-xl text-on-surface font-bold uppercase tracking-widest text-xs cursor-pointer hover:bg-surface-container transition-all">
          <option value="featured">Featured</option>
          <option value="newest">Newest</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="name">Name: A-Z</option>
        </select>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters - Desktop */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-28">
            <div className="bg-surface-container-low rounded-xl p-6">
              <h3 className="font-headline font-bold text-lg uppercase tracking-wider mb-6">Categories</h3>
              <div className="space-y-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`w-full flex justify-between items-center px-4 py-3 rounded-lg text-left transition-all ${
                      selectedCategory === category
                        ? 'bg-primary text-on-primary font-bold'
                        : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                    }`}
                  >
                    <span className="text-sm uppercase tracking-wider">{category}</span>
                    <span className={`text-xs ${selectedCategory === category ? 'opacity-80' : 'opacity-50'}`}>
                      {categoryCounts[category] || 0}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Filter Drawer */}
        <AnimatePresence>
          {isFilterOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsFilterOpen(false)} />
              <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.3 }}
                className="fixed right-0 top-0 h-full w-80 bg-surface-container-low z-50 p-6 lg:hidden overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-headline font-bold text-xl uppercase">Filters</h3>
                  <button onClick={() => setIsFilterOpen(false)} className="text-on-surface-variant">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <div className="mb-6">
                  <label className="block text-xs uppercase tracking-wider text-on-surface-variant mb-2">Sort By</label>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container border border-outline-variant/20 rounded-lg text-on-surface">
                    <option value="featured">Featured</option>
                    <option value="newest">Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name">Name: A-Z</option>
                  </select>
                </div>

                <div className="mb-6">
                  <h4 className="font-headline font-bold text-sm uppercase tracking-wider mb-3">Categories</h4>
                  <div className="space-y-1">
                    {categories.map(category => (
                      <button key={category} onClick={() => { handleCategoryChange(category); setIsFilterOpen(false) }}
                        className={`w-full flex justify-between items-center px-4 py-3 rounded-lg text-left ${
                          selectedCategory === category ? 'bg-primary text-on-primary font-bold' : 'text-on-surface-variant'
                        }`}>
                        <span className="text-sm">{category}</span>
                        <span className="text-xs opacity-70">{categoryCounts[category] || 0}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <p className="text-on-surface-variant text-sm">
              Showing <span className="text-on-surface font-bold">{filteredProducts.length}</span> products
              {selectedCategory !== 'All' && <span> in <span className="text-primary">{selectedCategory}</span></span>}
            </p>
            {selectedCategory !== 'All' && (
              <button onClick={() => handleCategoryChange('All')} className="text-primary text-sm font-bold hover:underline">
                Clear filter
              </button>
            )}
          </div>

          {filteredProducts.length > 0 ? (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product, index) => (
                  <motion.div key={product._id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3, delay: index * 0.05 }}>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <span className="material-symbols-outlined text-6xl mb-4 opacity-30">search</span>
              <h3 className="font-headline text-2xl font-bold mb-2">No products found</h3>
              <p className="text-on-surface-variant mb-6">Try adjusting your filters or search query.</p>
              <button onClick={() => { handleCategoryChange('All'); setSearchQuery(''); setSortBy('featured') }}
                className="px-6 py-3 bg-primary text-on-primary font-bold rounded-xl uppercase tracking-widest text-sm hover:scale-105 transition-all">
                Clear All Filters
              </button>
            </motion.div>
          )}

          {/* Quick Category Pills - Mobile */}
          <div className="lg:hidden mt-8 flex flex-wrap gap-2">
            {categories.slice(0, 6).map(category => (
              <button key={category} onClick={() => handleCategoryChange(category)}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                  selectedCategory === category
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-low text-on-surface-variant border border-outline-variant/20 hover:bg-surface-container'
                }`}>
                {category} ({categoryCounts[category] || 0})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Banner */}
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="mt-20 p-8 md:p-12 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl border border-primary/20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-headline text-2xl md:text-3xl font-black uppercase tracking-tighter mb-2">
              Can't find what you're looking for?
            </h3>
            <p className="text-on-surface-variant">Create your own custom piece in our Custom Lab.</p>
          </div>
          <Link to="/customize"
            className="px-8 py-4 bg-primary text-on-primary font-bold rounded-xl uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-[0_0_20px_rgba(143,245,255,0.3)] flex items-center gap-2 group">
            Enter Custom Lab
            <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default CollectionPage

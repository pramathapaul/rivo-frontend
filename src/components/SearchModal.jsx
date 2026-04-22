import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { productAPI } from '../services/api'

const SearchModal = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState([])
  const inputRef = useRef(null)
  const navigate = useNavigate()

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100)
    }
  }, [isOpen])

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('rivo-recent-searches')
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved).slice(0, 5))
      } catch (e) {
        setRecentSearches([])
      }
    }
  }, [isOpen])

  // Search products
  useEffect(() => {
    if (!searchTerm.trim()) {
      setProducts([])
      return
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await productAPI.searchProducts({ q: searchTerm, limit: 8 })
        setProducts(res.data.products || [])
      } catch (error) {
        console.error('Search error:', error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(delayDebounce)
  }, [searchTerm])

  // Save search to recent
  const saveSearch = (term) => {
    if (!term.trim()) return
    
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('rivo-recent-searches', JSON.stringify(updated))
  }

  // Handle product click
  const handleProductClick = (productId) => {
    saveSearch(searchTerm)
    onClose()
    navigate(`/product/${productId}`)
  }

  // Handle search submit
  const handleSubmit = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      saveSearch(searchTerm)
      onClose()
      navigate(`/collections?search=${encodeURIComponent(searchTerm)}`)
    }
  }

  // Handle recent search click
  const handleRecentSearch = (term) => {
    setSearchTerm(term)
    saveSearch(term)
    onClose()
    navigate(`/collections?search=${encodeURIComponent(term)}`)
  }

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('rivo-recent-searches')
  }

  // Popular searches
  const popularSearches = ['Oversized', 'Black', 'Cyber', 'Neon', 'Limited', 'Cotton']

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70"
          onClick={onClose}
        />

        {/* Search Modal */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="relative max-w-2xl mx-auto mt-20 px-4"
        >
          <div className="bg-surface-container-low rounded-2xl shadow-2xl overflow-hidden">
            {/* Search Input */}
            <div className="p-4 border-b border-outline-variant/20">
              <form onSubmit={handleSubmit} className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
                  <span className="material-symbols-outlined">search</span>
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search for products..."
                  className="w-full pl-12 pr-12 py-4 bg-surface-container border border-outline-variant/20 rounded-xl text-on-surface text-lg placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                )}
              </form>
            </div>

            {/* Search Results */}
            <div className="max-h-[60vh] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-on-surface-variant mt-3">Searching...</p>
                </div>
              ) : searchTerm ? (
                products.length > 0 ? (
                  <div className="p-4">
                    <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-3">
                      {products.length} results for "{searchTerm}"
                    </p>
                    <div className="space-y-2">
                      {products.map(product => (
                        <div
                          key={product._id}
                          onClick={() => handleProductClick(product._id)}
                          className="flex items-center gap-4 p-3 bg-surface-container rounded-xl cursor-pointer hover:bg-surface-container-high transition-colors"
                        >
                          <img
                            src={product.images?.[0] || 'https://via.placeholder.com/60'}
                            alt={product.name}
                            className="w-14 h-14 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <p className="font-bold">{product.name}</p>
                            <p className="text-sm text-on-surface-variant">{product.category}</p>
                          </div>
                          <p className="font-bold text-primary">₹{product.price}</p>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={handleSubmit}
                      className="w-full mt-4 py-3 text-primary font-bold text-sm uppercase tracking-wider hover:underline"
                    >
                      View All Results →
                    </button>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-3">search_off</span>
                    <p className="text-on-surface-variant">No products found for "{searchTerm}"</p>
                    <p className="text-sm text-on-surface-variant/60 mt-1">Try a different search term</p>
                  </div>
                )
              ) : (
                <div className="p-4">
                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-xs text-on-surface-variant uppercase tracking-wider">Recent Searches</p>
                        <button
                          onClick={clearRecentSearches}
                          className="text-xs text-primary hover:underline"
                        >
                          Clear All
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {recentSearches.map((term, i) => (
                          <button
                            key={i}
                            onClick={() => handleRecentSearch(term)}
                            className="px-4 py-2 bg-surface-container rounded-full text-sm hover:bg-surface-container-high transition-colors flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-sm">history</span>
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Popular Searches */}
                  <div>
                    <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-2">Popular Searches</p>
                    <div className="flex flex-wrap gap-2">
                      {popularSearches.map((term, i) => (
                        <button
                          key={i}
                          onClick={() => handleRecentSearch(term)}
                          className="px-4 py-2 bg-surface-container rounded-full text-sm hover:bg-surface-container-high transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-outline-variant/20 flex justify-between items-center">
              <button
                onClick={onClose}
                className="text-sm text-on-surface-variant hover:text-on-surface flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">keyboard_escape</span>
                Close
              </button>
              <span className="text-xs text-on-surface-variant/50">
                Press Enter to search
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default SearchModal
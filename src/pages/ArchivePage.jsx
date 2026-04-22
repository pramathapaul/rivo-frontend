import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { productAPI } from '../services/api'

const ArchivePage = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState('All')
  const [selectedSeason, setSelectedSeason] = useState('All')
  const [viewMode, setViewMode] = useState('grid') // grid or masonry
  const [selectedProduct, setSelectedProduct] = useState(null)

  // Fetch all products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const res = await productAPI.getProducts({ limit: 100 })
        // Filter for archived/sold out/limited items
        const allProducts = res.data.products || []
        // For archive, show sold out and limited edition items
        const archiveProducts = allProducts.filter(p => 
          !p.inStock || p.tags?.includes('Sold Out') || 
          p.tags?.includes('Limited') || p.tags?.includes('Limited Release') ||
          p.tags?.includes('Archive') || p.category === 'Archive 01'
        )
        setProducts(archiveProducts.length > 0 ? archiveProducts : allProducts)
      } catch (error) {
        console.error('Error fetching archive:', error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  // Archive collections data
  const archiveCollections = [
    {
      id: 'season-01',
      name: 'SEASON 01: GENESIS',
      year: '2023',
      season: 'Spring/Summer',
      description: 'The beginning of RIVO. Raw, unfiltered streetwear that defined our aesthetic.',
      image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800',
      featured: true,
      items: 12
    },
    {
      id: 'season-02',
      name: 'SEASON 02: DIGITAL SOUL',
      year: '2023',
      season: 'Fall/Winter',
      description: 'Cyberpunk meets minimalism. The collection that put us on the map.',
      image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800',
      featured: true,
      items: 18
    },
    {
      id: 'season-03',
      name: 'SEASON 03: NEON DREAMS',
      year: '2024',
      season: 'Spring/Summer',
      description: 'Vibrant colors and bold graphics. A celebration of digital culture.',
      image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800',
      featured: true,
      items: 15
    },
    {
      id: 'void-edition',
      name: 'VOID EDITION',
      year: '2023',
      season: 'Limited',
      description: 'Exclusive black-on-black collection. Only 100 pieces made.',
      image: 'https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=800',
      featured: false,
      items: 4
    },
    {
      id: 'cyber-collab',
      name: 'CYBER x RIVO',
      year: '2024',
      season: 'Collaboration',
      description: 'Special collaboration with digital artist CYBER.',
      image: 'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=800',
      featured: true,
      items: 6
    }
  ]

  // Stats for archive
  const stats = [
    { label: 'Total Pieces', value: '127', icon: 'inventory' },
    { label: 'Collections', value: '8', icon: 'collections_bookmark' },
    { label: 'Sold Out', value: '43', icon: 'sell' },
    { label: 'Limited Editions', value: '21', icon: 'stars' }
  ]

  // Get unique years and seasons
  const years = ['All', ...new Set(archiveCollections.map(c => c.year))]
  const seasons = ['All', ...new Set(archiveCollections.map(c => c.season))]

  // Filter collections
  const filteredCollections = useMemo(() => {
    return archiveCollections.filter(collection => {
      if (selectedYear !== 'All' && collection.year !== selectedYear) return false
      if (selectedSeason !== 'All' && collection.season !== selectedSeason) return false
      return true
    })
  }, [selectedYear, selectedSeason])

  // Group products by collection (mock data)
  const vintageProducts = [
    {
      id: 'vintage-01',
      name: 'OG LOGO TEE',
      price: 120,
      originalPrice: 85,
      collection: 'Season 01',
      year: '2023',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
      soldOut: true,
      rarity: 'Rare'
    },
    {
      id: 'vintage-02',
      name: 'DIGITAL SOUL HOODIE',
      price: 180,
      originalPrice: 140,
      collection: 'Season 02',
      year: '2023',
      image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400',
      soldOut: true,
      rarity: 'Limited'
    },
    {
      id: 'vintage-03',
      name: 'NEON DREAMS TEE',
      price: 150,
      originalPrice: 95,
      collection: 'Season 03',
      year: '2024',
      image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400',
      soldOut: true,
      rarity: 'Collector'
    }
  ]

  if (loading) {
    return (
      <div className="pt-32 pb-20 px-6 md:px-10 max-w-[1920px] mx-auto min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-on-surface-variant">Loading archive...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-28 pb-20 px-6 md:px-10 max-w-[1920px] mx-auto min-h-screen">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-16"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent rounded-3xl"></div>
        <div className="relative p-8 md:p-12">
          <div className="flex items-center gap-2 text-primary font-headline text-sm font-bold tracking-[0.2em] uppercase mb-4">
            <span>The Vault</span>
            <span className="w-12 h-[1px] bg-primary/30"></span>
          </div>
          <h1 className="font-headline text-6xl md:text-8xl font-black italic tracking-tighter text-on-surface mb-4">
            ARCHIVE
          </h1>
          <p className="text-on-surface-variant text-xl max-w-2xl mb-8">
            A curated collection of our most iconic pieces. Sold out, limited edition, and never to be made again.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 glass-panel px-4 py-2 rounded-full">
              <span className="material-symbols-outlined text-primary">history</span>
              <span className="text-sm">Est. 2023</span>
            </div>
            <div className="flex items-center gap-2 glass-panel px-4 py-2 rounded-full">
              <span className="material-symbols-outlined text-primary">verified</span>
              <span className="text-sm">Authentic Archive</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
      >
        {stats.map((stat, index) => (
          <div key={index} className="bg-surface-container-low rounded-2xl p-6 text-center border border-outline-variant/10">
            <span className="material-symbols-outlined text-3xl text-primary mb-3">{stat.icon}</span>
            <div className="text-3xl font-headline font-black text-on-surface">{stat.value}</div>
            <div className="text-xs text-on-surface-variant uppercase tracking-wider mt-1">{stat.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-4 py-2 bg-surface-container-low border border-outline-variant/20 rounded-xl text-on-surface text-sm"
          >
            {years.map(year => (
              <option key={year} value={year}>{year === 'All' ? 'All Years' : year}</option>
            ))}
          </select>
          <select 
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="px-4 py-2 bg-surface-container-low border border-outline-variant/20 rounded-xl text-on-surface text-sm"
          >
            {seasons.map(season => (
              <option key={season} value={season}>{season === 'All' ? 'All Seasons' : season}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant'}`}
          >
            <span className="material-symbols-outlined">grid_view</span>
          </button>
          <button 
            onClick={() => setViewMode('masonry')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'masonry' ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant'}`}
          >
            <span className="material-symbols-outlined">dashboard</span>
          </button>
        </div>
      </div>

      {/* Collections Grid */}
      <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'} gap-6 mb-16`}>
        {filteredCollections.map((collection, index) => (
          <motion.div
            key={collection.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`group relative bg-surface-container-low rounded-2xl overflow-hidden cursor-pointer border border-outline-variant/10 hover:border-primary/30 transition-all ${
              collection.featured && viewMode === 'masonry' ? 'md:row-span-2' : ''
            }`}
            onClick={() => setSelectedProduct(collection)}
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <img 
                src={collection.image} 
                alt={collection.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/50 to-transparent"></div>
              <div className="absolute top-4 left-4">
                <span className="glass-panel px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">
                  {collection.season}
                </span>
              </div>
              <div className="absolute top-4 right-4">
                <span className="bg-primary/20 text-primary-fixed px-3 py-1 rounded-full text-[10px] font-bold">
                  {collection.items} items
                </span>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-primary font-bold">{collection.year}</span>
                <span className="w-1 h-1 bg-outline-variant rounded-full"></span>
                <span className="text-xs text-on-surface-variant">{collection.season}</span>
              </div>
              <h3 className="font-headline text-2xl font-black mb-2">{collection.name}</h3>
              <p className="text-on-surface-variant text-sm mb-4">{collection.description}</p>
              <div className="flex items-center gap-2 text-primary">
                <span className="text-sm font-bold">View Collection</span>
                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Vintage Pieces Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-16"
      >
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="font-headline text-4xl font-black italic tracking-tighter mb-2">VINTAGE VAULT</h2>
            <p className="text-on-surface-variant">Rare pieces from our earliest collections.</p>
          </div>
          <span className="glass-panel px-4 py-2 rounded-full text-xs">
            <span className="material-symbols-outlined text-sm align-middle me-1">lock</span>
            Members Only
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {vintageProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="group bg-surface-container-low rounded-2xl overflow-hidden border border-outline-variant/10"
            >
              <div className="relative aspect-square overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent opacity-60"></div>
                <div className="absolute top-4 left-4">
                  <span className="bg-error/20 text-error px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">
                    SOLD OUT
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="glass-panel px-3 py-1 rounded-full text-[10px] font-bold">
                    {product.rarity}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <p className="text-xs text-primary mb-1">{product.collection} • {product.year}</p>
                <h4 className="font-headline text-xl font-bold mb-2">{product.name}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-on-surface-variant line-through text-sm">${product.originalPrice}</span>
                  <span className="text-primary font-bold">${product.price}</span>
                  <span className="text-xs text-on-surface-variant ml-auto">Resale Value</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Timeline Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-16"
      >
        <h2 className="font-headline text-4xl font-black italic tracking-tighter mb-8">THE JOURNEY</h2>
        
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-primary/50 to-transparent hidden md:block"></div>
          
          <div className="space-y-8">
            {[
              { year: '2023 Q1', title: 'RIVO Founded', description: 'Started in a small studio with a vision to redefine streetwear.' },
              { year: '2023 Q2', title: 'First Collection Drop', description: 'SEASON 01: GENESIS sells out in 48 hours.' },
              { year: '2023 Q3', title: 'Custom Lab Launch', description: 'Introduced our custom design platform.' },
              { year: '2023 Q4', title: 'VOID Edition', description: 'Limited 100-piece collection becomes instant classic.' },
              { year: '2024 Q1', title: 'NEON DREAMS', description: 'Our most colorful collection to date.' },
              { year: '2024 Q2', title: 'Creator Program', description: 'Launched community design initiative.' },
              { year: '2024 Q3', title: 'Archive Opens', description: 'The Vault is now accessible to members.' }
            ].map((event, index) => (
              <div key={index} className="flex flex-col md:flex-row gap-6 md:gap-12">
                <div className="md:w-32 flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-primary md:ml-[22px]"></div>
                    <span className="font-headline font-bold text-primary">{event.year}</span>
                  </div>
                </div>
                <div className="flex-1 bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10">
                  <h4 className="font-headline text-xl font-bold mb-2">{event.title}</h4>
                  <p className="text-on-surface-variant">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Newsletter CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent rounded-3xl p-8 md:p-12 border border-primary/30"
      >
        <div className="max-w-3xl">
          <h3 className="font-headline text-3xl md:text-4xl font-black uppercase tracking-tighter mb-4">
            Join the Archive Society
          </h3>
          <p className="text-on-surface-variant mb-6">
            Get early access to archive drops, exclusive content, and behind-the-scenes stories from the RIVO vault.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-1 px-6 py-4 bg-surface-container-low border border-outline-variant/20 rounded-xl text-on-surface focus:outline-none focus:border-primary"
            />
            <button className="px-8 py-4 bg-primary text-on-primary font-bold rounded-xl uppercase tracking-widest hover:scale-105 transition-all">
              Subscribe
            </button>
          </div>
          <p className="text-xs text-on-surface-variant mt-4">No spam. Only rare drops and archive stories.</p>
        </div>
      </motion.div>
    </div>
  )
}

export default ArchivePage
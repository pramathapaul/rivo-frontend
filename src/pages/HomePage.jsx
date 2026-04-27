import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ProductCard from '../components/ProductCard'
import { productAPI } from '../services/api'

const HomePage = () => {
  const [products, setProducts] = useState([])
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [scrollY, setScrollY] = useState(0)
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024)
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 })

  // Carousel State
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const carouselRef = useRef(null)
  const autoPlayRef = useRef(null)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  const getProductsPerView = () => {
    if (windowWidth < 640) return 1
    if (windowWidth < 1024) return 2
    return 4
  }

  const productsPerView = getProductsPerView()

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Flash Sale Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev
        if (seconds > 0) seconds--
        else {
          seconds = 59
          if (minutes > 0) minutes--
          else { minutes = 59; if (hours > 0) hours-- }
        }
        return { hours, minutes, seconds }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const res = await productAPI.getProducts({ page: 1 })
        setProducts(res.data.products || [])
        const featuredRes = await productAPI.getFeaturedProducts()
        setFeaturedProducts(featuredRes.data || [])
      } catch (error) {
        console.error('Error fetching products:', error)
        setProducts([])
        setFeaturedProducts([])
      } finally { setLoading(false) }
    }
    fetchProducts()
  }, [])
  
  const displayProducts = featuredProducts.length > 0 ? featuredProducts.slice(0, 8) : products.slice(0, 8)
  const categories = ['All', 'Heavyweight Cotton', 'Tech-Mesh Blend', 'Luxury Jersey', 'Limited Edition', 'Merchandise']
  const filteredProducts = activeCategory === 'All' ? displayProducts : displayProducts.filter(p => p.category === activeCategory)
  const totalSlides = Math.ceil(filteredProducts.length / productsPerView)
  const maxSlide = Math.max(0, totalSlides - 1)

  const startAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current)
    if (isAutoPlaying && filteredProducts.length > productsPerView) {
      autoPlayRef.current = setInterval(() => setCurrentSlide(prev => (prev >= maxSlide ? 0 : prev + 1)), 3000)
    }
  }, [isAutoPlaying, maxSlide, filteredProducts.length, productsPerView])

  useEffect(() => { startAutoPlay(); return () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current) } }, [startAutoPlay])

  const goToSlide = (index) => { setCurrentSlide(Math.max(0, Math.min(index, maxSlide))); setIsAutoPlaying(false); setTimeout(() => setIsAutoPlaying(true), 5000) }
  const nextSlide = () => goToSlide(currentSlide + 1)
  const prevSlide = () => goToSlide(currentSlide - 1)
  const handleTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX)
  const handleTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX)
  const handleTouchEnd = () => { if (touchStart - touchEnd > 50) nextSlide(); if (touchStart - touchEnd < -50) prevSlide(); setTouchStart(0); setTouchEnd(0) }
  const getCurrentProducts = () => { const start = currentSlide * productsPerView; return filteredProducts.slice(start, start + productsPerView) }

  const stats = [
    { label: 'Products', value: '200+', icon: 'inventory' },
    { label: 'Customers', value: '5000+', icon: 'group' },
    { label: 'Designs', value: '1000+', icon: 'palette' },
    { label: 'Rating', value: '4.9', icon: 'star' }
  ]

  const getGridClass = () => {
    if (productsPerView === 1) return 'grid-cols-1'
    if (productsPerView === 2) return 'grid-cols-1 sm:grid-cols-2'
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
  }

  return (
    <div className="overflow-x-hidden">
      {/* ==================== HERO SECTION ==================== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0" style={{ transform: `translateY(${scrollY * 0.3}px)` }}>
          <img src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1920&q=80" alt="RIVO Streetwear" className="w-full h-full object-cover scale-105" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/60 to-transparent z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/20 to-transparent z-10"></div>
        <div className="absolute inset-0 z-10 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle, #00eefc 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        <div className="absolute inset-0 z-20 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div key={i} className="absolute w-1 h-1 md:w-1.5 md:h-1.5 bg-primary rounded-full"
              initial={{ x: Math.random() * 100 + '%', y: Math.random() * 100 + '%', opacity: 0 }}
              animate={{ opacity: [0, 0.8, 0], scale: [0, 1.5, 0], y: [null, '-=120px'] }}
              transition={{ duration: 4 + Math.random() * 4, repeat: Infinity, delay: i * 0.3, ease: 'easeInOut' }} />
          ))}
        </div>
        <div className="absolute inset-0 z-10 pointer-events-none">
          <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <motion.div animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-30 text-center px-4 max-w-5xl mx-auto w-full">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }} className="inline-block mb-6 md:mb-8">
            <span className="glass-panel px-5 py-2 rounded-full border border-primary/20 text-primary-fixed text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase inline-flex items-center gap-2">
              <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-primary animate-pulse"></span>Season 04 // Now Live
            </span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
            className="font-headline text-7xl sm:text-8xl md:text-[10rem] lg:text-[12rem] font-black italic tracking-tighter leading-[0.82] mb-4 md:mb-6">
            <span className="bg-gradient-to-r from-primary via-primary-fixed to-secondary bg-clip-text text-transparent">RIVO</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }}
            className="font-body text-lg sm:text-xl md:text-3xl font-light tracking-wide text-on-surface-variant mb-6 md:mb-8 max-w-2xl mx-auto">Wear Your Identity.</motion.p>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }}
            className="font-body text-sm md:text-base text-on-surface-variant/70 mb-8 md:mb-10 max-w-xl mx-auto hidden sm:block">
            Premium streetwear designed for the bold. Limited drops, custom designs, and vintage collections.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
            <button onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="group relative px-8 md:px-10 py-4 md:py-5 bg-gradient-to-r from-primary to-primary-fixed text-on-primary font-bold rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(143,245,255,0.3)] w-full sm:w-auto">
              <span className="relative z-10 uppercase tracking-widest text-xs md:text-sm flex items-center justify-center gap-2">Shop Now<span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span></span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
            <Link to="/collections" className="px-8 md:px-10 py-4 md:py-5 border border-outline-variant/30 text-on-surface font-bold rounded-full transition-all hover:bg-surface-container-highest hover:border-primary/50 w-full sm:w-auto text-center">
              <span className="uppercase tracking-widest text-xs md:text-sm">View Collections</span>
            </Link>
          </motion.div>
        </div>

        {/* Animated Scroll Down */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 0.8 }}
          className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-3 cursor-pointer"
          onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}>
          <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-on-surface-variant font-bold">Scroll Down</motion.span>
          <div className="relative w-6 h-10 md:w-7 md:h-12 rounded-full border-2 border-primary/30 flex items-start justify-center p-1.5 md:p-2">
            <motion.div animate={{ y: [0, 8, 0], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} className="w-1 h-2 md:w-1.5 md:h-3 rounded-full bg-primary" />
          </div>
          <motion.div animate={{ y: [0, 5, 0], opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.3, ease: "easeInOut" }}>
            <span className="material-symbols-outlined text-primary text-lg md:text-xl">keyboard_arrow_down</span>
          </motion.div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-primary/10 rounded-full blur-xl -z-10"></div>
        </motion.div>
      </section>

      {/* ==================== STATS SECTION ==================== */}
      <section className="py-16 md:py-20 px-4 md:px-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="bg-surface-container-low rounded-2xl p-6 text-center border border-outline-variant/10 hover:border-primary/30 transition-all">
              <span className="material-symbols-outlined text-3xl text-primary mb-3">{stat.icon}</span>
              <div className="text-3xl md:text-4xl font-headline font-black text-on-surface">{stat.value}</div>
              <p className="text-xs text-on-surface-variant uppercase tracking-wider mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ==================== PRODUCTS CAROUSEL ==================== */}
      <section id="products-section" className="py-16 md:py-24 px-4 md:px-10 max-w-[1920px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="font-headline text-4xl md:text-6xl lg:text-7xl font-black italic tracking-tighter text-on-surface mb-4">LATEST<span className="text-primary"> DROPS</span></h2>
          <p className="text-on-surface-variant text-base md:text-lg max-w-xl mx-auto">Engineered for the digital nomad. Limited pieces, maximum impact.</p>
        </motion.div>
        {/* <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-10">
          {categories.map(cat => (
            <button key={cat} onClick={() => { setActiveCategory(cat); setCurrentSlide(0) }}
              className={`px-5 py-2.5 rounded-full text-xs md:text-sm font-bold uppercase tracking-wider transition-all ${activeCategory === cat ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container border border-outline-variant/20'}`}>
              {cat}
            </button>
          ))}
        </div> */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-surface-container-low rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-[3/4] bg-surface-container-highest"></div>
                <div className="p-5 space-y-3"><div className="h-4 bg-surface-container-highest rounded w-3/4"></div><div className="h-3 bg-surface-container-highest rounded w-1/2"></div><div className="h-5 bg-surface-container-highest rounded w-1/3"></div></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12"><span className="material-symbols-outlined text-5xl text-on-surface-variant mb-4">inventory_2</span><p className="text-on-surface-variant">No products found in this category</p></div>
        ) : (
          <div className="relative">
            <div ref={carouselRef} className="overflow-hidden" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
              <AnimatePresence mode="wait">
                <motion.div key={currentSlide} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.4, ease: "easeInOut" }} className={`grid ${getGridClass()} gap-4 md:gap-6`}>
                  {getCurrentProducts().map((product, index) => (
                    <motion.div key={product._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}><ProductCard product={product} /></motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
            {filteredProducts.length > productsPerView && (
              <>
                <button onClick={prevSlide} disabled={currentSlide === 0} className="hidden md:flex absolute top-1/2 -left-4 lg:-left-6 -translate-y-1/2 w-10 h-10 lg:w-12 lg:h-12 bg-surface-container-high rounded-full items-center justify-center hover:bg-primary hover:text-on-primary transition-all shadow-lg disabled:opacity-30 disabled:cursor-not-allowed z-10"><span className="material-symbols-outlined">chevron_left</span></button>
                <button onClick={nextSlide} disabled={currentSlide >= maxSlide} className="hidden md:flex absolute top-1/2 -right-4 lg:-right-6 -translate-y-1/2 w-10 h-10 lg:w-12 lg:h-12 bg-surface-container-high rounded-full items-center justify-center hover:bg-primary hover:text-on-primary transition-all shadow-lg disabled:opacity-30 disabled:cursor-not-allowed z-10"><span className="material-symbols-outlined">chevron_right</span></button>
              </>
            )}
          </div>
        )}
        {filteredProducts.length > 1 && windowWidth < 768 && (
          <div className="flex items-center justify-center gap-2 mt-4 text-on-surface-variant/50"><span className="material-symbols-outlined text-sm">swipe</span><span className="text-[10px] uppercase tracking-wider">Swipe to browse</span></div>
        )}
        {totalSlides > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {[...Array(totalSlides)].map((_, i) => (
              <button key={i} onClick={() => goToSlide(i)} className={`transition-all rounded-full ${i === currentSlide ? 'w-6 h-2 bg-primary' : 'w-2 h-2 bg-surface-container-highest hover:bg-primary/50'}`} aria-label={`Go to slide ${i + 1}`} />
            ))}
          </div>
        )}
        <div className="text-center mt-4"><p className="text-xs text-on-surface-variant">Showing {getCurrentProducts().length} of {filteredProducts.length} products</p></div>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-8">
          <Link to="/collections" className="inline-flex items-center gap-2 px-8 py-4 bg-surface-container-high rounded-full font-bold uppercase text-xs tracking-widest hover:bg-primary hover:text-on-primary transition-all group">
            View All Collections<span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </Link>
        </motion.div>
      </section>

      {/* ==================== FLASH SALE SECTION (REDESIGNED) ==================== */}
      <section className="py-16 md:py-24 px-4 md:px-10">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a0a0a] via-[#1a0a10] to-[#0a0a1a] border border-secondary/20">
            <div className="absolute inset-0">
              <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'repeating-linear-gradient(-45deg, #ff6b98 0, #ff6b98 1px, transparent 1px, transparent 20px)' }}></div>
              <div className="absolute -top-40 -right-40 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
              {[...Array(6)].map((_, i) => (
                <motion.div key={i} className="absolute w-1 h-1 bg-secondary rounded-full"
                  initial={{ x: Math.random() * 100 + '%', y: '100%', opacity: 0 }}
                  animate={{ y: '-10%', opacity: [0, 1, 0] }}
                  transition={{ duration: 3 + Math.random() * 3, repeat: Infinity, delay: i * 0.5, ease: 'easeInOut' }} />
              ))}
            </div>
            <div className="relative p-8 md:p-12 lg:p-16">
              <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
                <div className="flex-1 text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 border border-secondary/30 rounded-full mb-6">
                    <span className="flex w-2 h-2"><span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-secondary opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span></span>
                    <span className="text-secondary text-xs font-bold tracking-[0.3em] uppercase">Limited Time Offer</span>
                  </div>
                  <h2 className="font-headline text-4xl md:text-6xl lg:text-7xl font-black italic tracking-tighter text-white mb-4 leading-[0.9]">FLASH<br/><span className="text-secondary">SALE</span></h2>
                  <p className="text-lg md:text-xl text-on-surface-variant mb-2">Up to <span className="text-secondary font-bold text-2xl">50% OFF</span></p>
                  <p className="text-on-surface-variant/60 text-sm mb-8 max-w-md">On selected premium streetwear. Don't miss out on these exclusive deals.</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link to="/collections?sale=true" className="px-8 py-4 bg-secondary text-on-secondary font-bold rounded-full uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-lg shadow-secondary/20">Shop Sale Now</Link>
                    <Link to="/collections" className="px-8 py-4 border border-outline-variant/30 text-on-surface font-bold rounded-full uppercase tracking-widest text-sm hover:bg-white/5 transition-all text-center">Browse All</Link>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <div className="bg-surface/60 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-white/10">
                    <p className="text-center text-xs text-on-surface-variant uppercase tracking-[0.3em] font-bold mb-6">⏱ Offer Ends In</p>
                    <div className="flex items-center gap-3 md:gap-4">
                      {['hours', 'minutes', 'seconds'].map((unit, i) => (
                        <div key={unit} className="flex items-center gap-3 md:gap-4">
                          {i > 0 && <span className="text-2xl md:text-3xl font-bold text-secondary/50 mt-[-20px]">:</span>}
                          <div className="flex flex-col items-center">
                            <div className="w-20 h-20 md:w-24 md:h-24 bg-surface-container-low rounded-2xl border border-secondary/20 flex items-center justify-center relative overflow-hidden">
                              <motion.span key={`${unit}-${timeLeft[unit]}`} initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                                className="font-headline text-3xl md:text-4xl font-bold text-secondary tabular-nums">{String(timeLeft[unit]).padStart(2, '0')}</motion.span>
                            </div>
                            <span className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-2 capitalize">{unit}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 space-y-2">
                      <div className="flex justify-between text-[10px] text-on-surface-variant"><span>Sold</span><span>65% claimed</span></div>
                      <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: '65%' }} transition={{ duration: 1, delay: 0.5 }} className="h-full bg-gradient-to-r from-secondary to-primary rounded-full" />
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-4 text-yellow-500 text-xs"><span className="material-symbols-outlined text-sm">warning</span><span>Hurry! Limited stock available</span></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {[
              { icon: 'bolt', title: '50 Rs OFF', desc: 'Oversized Tees', color: 'border-secondary/30 hover:border-secondary', textColor: 'text-secondary', bgColor: 'bg-secondary/5' },
              { icon: 'local_offer', title: '100 Rs OFF', desc: 'Jerseys', color: 'border-primary/30 hover:border-primary', textColor: 'text-primary', bgColor: 'bg-primary/5' },
              { icon: 'stars', title: '', desc: 'Limited Edition', color: 'border-tertiary/30 hover:border-tertiary', textColor: 'text-tertiary', bgColor: 'bg-tertiary/5' },
              { icon: 'redeem', title: '', desc: 'All T-Shirts', color: 'border-secondary/30 hover:border-secondary', textColor: 'text-secondary', bgColor: 'bg-secondary/5' }
            ].map((deal, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.6 + i * 0.1 }} whileHover={{ y: -4 }}
                className={`${deal.bgColor} border ${deal.color} rounded-2xl p-5 text-center cursor-pointer transition-all`}>
                <span className={`material-symbols-outlined text-2xl ${deal.textColor} mb-3`}>{deal.icon}</span>
                <div className={`text-xl md:text-2xl font-headline font-black ${deal.textColor}`}>{deal.title}</div>
                <div className="text-xs text-on-surface-variant mt-1">{deal.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== FEATURED SECTION ==================== */}
      <section className="py-16 md:py-24 px-4 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="bg-surface-container-low rounded-3xl overflow-hidden flex flex-col lg:flex-row min-h-[500px] lg:min-h-[600px] border border-outline-variant/10">
            <div className="lg:w-3/5 relative overflow-hidden">
              <img src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80" alt="RIVO Editorial" className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-r from-surface-container-low via-surface-container-low/50 to-transparent lg:bg-gradient-to-r lg:from-surface-container-low lg:via-transparent lg:to-transparent"></div>
            </div>
            <div className="lg:w-2/5 p-8 md:p-12 lg:p-16 flex flex-col justify-center relative">
              <div className="w-12 h-1 bg-primary rounded-full mb-6"></div>
              <span className="text-primary font-bold tracking-[0.4em] uppercase text-xs mb-4">Custom Lab</span>
              <h2 className="font-headline text-4xl md:text-5xl lg:text-6xl font-black italic tracking-tighter text-on-surface mb-6">BEYOND <br/>THE <span className="text-primary">GRID.</span></h2>
              <p className="text-on-surface-variant text-base md:text-lg leading-relaxed mb-8">Our custom lab allows you to fuse your digital identity with physical fabrics. We don't just sell clothes; we provide the canvas for your self-expression.</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/customize" className="px-8 py-4 bg-primary text-on-primary font-bold rounded-full uppercase tracking-widest text-sm hover:scale-105 transition-all text-center shadow-lg shadow-primary/20">Start Designing</Link>
                <Link to="/collections" className="px-8 py-4 border border-outline-variant/30 text-on-surface font-bold rounded-full uppercase tracking-widest text-sm hover:bg-surface-container-highest transition-all text-center">Browse Gallery</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== CATEGORY SHOWCASE BENTO GRID ==================== */}
      <section className="py-20 md:py-28 px-4 md:px-10 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <span className="inline-flex items-center gap-2 glass-panel px-4 py-2 rounded-full text-primary text-xs font-bold tracking-wider uppercase mb-4"><span className="material-symbols-outlined text-sm">category</span>Explore Categories</span>
          <h2 className="font-headline text-4xl md:text-6xl lg:text-7xl font-black italic tracking-tighter mb-4">SHOP BY<span className="text-primary"> CATEGORY</span></h2>
          <p className="text-on-surface-variant text-base md:text-lg max-w-xl mx-auto">Find your perfect style from our curated collections</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 auto-rows-[200px] md:auto-rows-[220px]">
          {[
            { type: 'large', img: 'https://i.ibb.co/9mvg79v8/FFFFFF-sg.jpg', title: 'Oversized Tees', desc: 'Relaxed fits, bold statements. Streetwear essentials.', badge: 'Best Seller', link: '/collections?category=Oversized', color: 'primary' },
            { type: 'icon', icon: 'sports_soccer', title: 'Jerseys', desc: 'Player editions & fan merch', link: '/collections?category=Jerseys', bg: 'from-[#1a1a2e] to-[#16213e]', color: 'primary' },
            { type: 'image', img: 'https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=400&q=80', title: 'Limited Edition', desc: 'Exclusive drops', badge: 'Rare', link: '/collections?category=Limited+Edition', color: 'secondary' },
            { type: 'wide', title: 'Custom Lab', desc: 'Design your own tee. Upload graphics, add text, and create something unique.', link: '/customize', color: 'primary' },
            { type: 'icon', icon: 'local_fire_department', title: 'Streetwear', desc: 'Urban style essentials', badge: 'New Arrival', link: '/collections?category=Streetwear', bg: 'from-[#1a0a0a] to-[#2a1010]', color: 'secondary' },
            { type: 'center', icon: 'apps', title: 'View All', desc: 'Browse complete collection', link: '/collections', color: 'primary' }
          ].map((item, i) => {
            if (item.type === 'large') return (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="md:col-span-2 md:row-span-2 relative group cursor-pointer rounded-3xl overflow-hidden">
                <Link to={item.link} className="block w-full h-full">
                  <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/30 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                    {item.badge && <span className="inline-block px-3 py-1 bg-primary/20 text-primary-fixed rounded-full text-[10px] font-bold tracking-wider uppercase mb-3 backdrop-blur-sm">{item.badge}</span>}
                    <h3 className="font-headline text-2xl md:text-4xl font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-on-surface-variant/80 text-sm max-w-xs hidden md:block">{item.desc}</p>
                    <div className="flex items-center gap-2 mt-3 text-primary text-sm font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0"><span>Shop Collection</span><span className="material-symbols-outlined text-sm">arrow_forward</span></div>
                  </div>
                </Link>
              </motion.div>
            )
            if (item.type === 'wide') return (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="md:col-span-2 relative group cursor-pointer rounded-3xl overflow-hidden bg-gradient-to-br from-surface-container-high via-surface-container to-surface-container-low border border-primary/10">
                <Link to={item.link} className="block w-full h-full p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3"><span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span><span className="text-primary text-[10px] font-bold tracking-wider uppercase">Design Studio</span></div>
                    <h3 className="font-headline text-2xl md:text-3xl font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-on-surface-variant/70 text-sm max-w-md">{item.desc}</p>
                    <div className="flex items-center gap-2 mt-4 text-primary text-sm font-bold"><span>Start Designing</span><span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span></div>
                  </div>
                  <div className="flex items-center gap-3">
                    {['draw', 'palette', 'auto_awesome'].map((icon, j) => (
                      <motion.div key={j} animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, delay: j * 0.3 }} className={`w-14 h-14 rounded-2xl ${j === 0 ? 'bg-primary/10' : j === 1 ? 'bg-secondary/10' : 'bg-tertiary/10'} flex items-center justify-center`}>
                        <span className={`material-symbols-outlined text-2xl ${j === 0 ? 'text-primary' : j === 1 ? 'text-secondary' : 'text-tertiary'}`}>{icon}</span>
                      </motion.div>
                    ))}
                  </div>
                </Link>
              </motion.div>
            )
            if (item.type === 'center') return (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.6 }} className="relative group cursor-pointer rounded-3xl overflow-hidden bg-gradient-to-br from-primary/10 via-surface-container to-primary/5 border border-primary/20">
                <Link to={item.link} className="block w-full h-full p-6 flex flex-col items-center justify-center text-center">
                  <motion.div whileHover={{ scale: 1.1, rotate: 90 }} className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4"><span className="material-symbols-outlined text-4xl text-primary">{item.icon}</span></motion.div>
                  <h3 className="font-headline text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-on-surface-variant/70 text-xs">{item.desc}</p>
                  <div className="flex items-center gap-2 mt-4 text-primary text-sm font-bold"><span>All Collections</span><span className="material-symbols-outlined text-sm">arrow_forward</span></div>
                </Link>
              </motion.div>
            )
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.1 }} className={`relative group cursor-pointer rounded-3xl overflow-hidden ${item.bg ? `bg-gradient-to-br ${item.bg}` : ''} border border-${item.color}/10`}>
                <Link to={item.link} className="block w-full h-full p-6 flex flex-col justify-between">
                  {item.img ? (
                    <>
                      <img src={item.img} alt={item.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent"></div>
                      <div className="relative mt-auto">
                        <h3 className="font-headline text-xl font-bold text-white mb-1">{item.title}</h3>
                        <p className="text-on-surface-variant/70 text-xs">{item.desc}</p>
                      </div>
                      {item.badge && <div className="absolute top-4 right-4 px-3 py-1 bg-secondary/80 backdrop-blur-sm text-on-secondary rounded-full text-[10px] font-bold tracking-wider uppercase">{item.badge}</div>}
                    </>
                  ) : (
                    <>
                      <div className={`w-14 h-14 rounded-2xl bg-${item.color}/10 flex items-center justify-center group-hover:bg-${item.color}/20 group-hover:scale-110 transition-all duration-300`}>
                        <span className={`material-symbols-outlined text-3xl text-${item.color}`}>{item.icon}</span>
                      </div>
                      <div>
                        {item.badge && <span className={`inline-block px-2 py-1 bg-${item.color}/20 text-${item.color} rounded-full text-[10px] font-bold tracking-wider uppercase mb-2`}>{item.badge}</span>}
                        <h3 className="font-headline text-xl font-bold text-white mb-1">{item.title}</h3>
                        <p className="text-on-surface-variant/60 text-xs">{item.desc}</p>
                        <div className="flex items-center gap-2 mt-4 text-primary text-xs font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0"><span>Explore</span><span className="material-symbols-outlined text-sm">arrow_forward</span></div>
                      </div>
                      {item.bg && <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, #00eefc 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>}
                    </>
                  )}
                </Link>
              </motion.div>
            )
          })}
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.7 }} className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Categories', value: '8+', icon: 'category' },
            { label: 'Products', value: '50+', icon: 'inventory' },
            { label: 'New Weekly', value: '20+', icon: 'new_releases' },
            { label: 'Happy Customers', value: '100+', icon: 'sentiment_satisfied' }
          ].map((stat, i) => (
            <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-surface-container-low/50 border border-outline-variant/10">
              <span className="material-symbols-outlined text-2xl text-primary">{stat.icon}</span>
              <div><div className="font-headline font-bold text-lg">{stat.value}</div><div className="text-[10px] text-on-surface-variant uppercase tracking-wider">{stat.label}</div></div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ==================== BENEFITS SECTION ==================== */}
      <section className="py-16 md:py-20 px-4 md:px-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: 'local_shipping', title: 'Free Shipping', desc: 'On orders above ₹5000' },
            { icon: 'verified', title: 'Premium Quality', desc: '400GSM heavy cotton' },
            { icon: 'support_agent', title: '24/7 Support', desc: 'Always here to help' }
          ].map((benefit, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="bg-surface-container-low rounded-2xl p-8 text-center border border-outline-variant/10 hover:border-primary/30 transition-all group">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-all">
                <span className="material-symbols-outlined text-3xl text-primary">{benefit.icon}</span>
              </div>
              <h3 className="font-headline font-bold text-lg mb-2">{benefit.title}</h3>
              <p className="text-on-surface-variant text-sm">{benefit.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ==================== NEWSLETTER SECTION ==================== */}
      <section className="py-16 md:py-24 px-4 md:px-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-3xl p-8 md:p-12 border border-primary/20">
            <h2 className="font-headline text-3xl md:text-4xl font-black italic tracking-tighter mb-4">JOIN THE <span className="text-primary">MOVEMENT</span></h2>
            <p className="text-on-surface-variant mb-8">Get early access to drops, exclusive discounts, and behind-the-scenes content.</p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input type="email" placeholder="Enter your email" className="flex-1 px-6 py-4 bg-surface-container border border-outline-variant/20 rounded-full text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary transition-colors" />
              <button className="px-8 py-4 bg-primary text-on-primary font-bold rounded-full uppercase tracking-widest text-sm hover:scale-105 transition-all">Subscribe</button>
            </div>
            <p className="text-[10px] text-on-surface-variant/50 mt-4">No spam. Only rare drops and exclusive offers.</p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default HomePage

import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { productAPI } from '../services/api'

const HomePage = () => {
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 45, seconds: 18 })
  const [products, setProducts] = useState([])
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const productSectionRef = useRef(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev
        if (seconds > 0) seconds--
        else { seconds = 59; if (minutes > 0) minutes--; else { minutes = 59; if (hours > 0) hours-- } }
        return { hours, minutes, seconds }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const res = await productAPI.getProducts({ page: 1 })
        setProducts(res.data.products || [])
        
        // Get featured products
        const featuredRes = await productAPI.getFeaturedProducts()
        setFeaturedProducts(featuredRes.data || [])
      } catch (error) {
        console.error('Error fetching products:', error)
        // Fallback to empty array
        setProducts([])
        setFeaturedProducts([])
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const displayProducts = featuredProducts.length > 0 
    ? featuredProducts.slice(0, 4) 
    : products.slice(0, 4)

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/60 to-surface z-10"></div>
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuD1EulQOBRRbRkIutz_0KW9Qb2sQnAZrwGst6xszeDe8FVV6bMVs_KtAClIvv4ebB3WCMpb_GoNJNsETpJnHS9j4a-epLydDeAtOc97bGUAInRfPS2kBkiDXrmzX4FE-reifTMxWzrbZg3-SqSxXE22yQHPBXpr0HnkzkgKakyOtUZKrBDw4VI1aC3wTvCYvDtsii_O772BHHdmodrvkE6cQdYt1hb5NjfCPqqH1DHrf7IJJL8FrpRdbjoYWQqmpevqPmVX6Pk43OgQ" alt="Hero" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-20 text-center px-4 max-w-5xl mx-auto">
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-surface-container-highest/60 glass-effect border border-outline-variant/15">
            <span className="text-primary-fixed text-xs font-bold tracking-[0.2em] uppercase">Season 04 // Now Live</span>
          </div>
          <h1 className="font-headline text-6xl md:text-[10rem] font-black italic tracking-tighter leading-[0.85] text-on-surface mb-8">RIVO</h1>
          <p className="font-body text-xl md:text-3xl font-light tracking-wide text-on-surface-variant mb-12 max-w-2xl mx-auto">Wear Your Identity.</p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <button onClick={() => productSectionRef.current?.scrollIntoView({ behavior: 'smooth' })} className="group relative px-10 py-5 bg-primary text-on-primary font-bold rounded-xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(143,245,255,0.3)]">
              <span className="relative z-10 uppercase tracking-widest text-sm">Shop Now</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
            <button className="px-10 py-5 border border-outline-variant/30 text-on-surface font-bold rounded-xl transition-all hover:bg-surface-container-highest">
              <span className="uppercase tracking-widest text-sm">Lookbook</span>
            </button>
          </div>
        </div>
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20  md:block">
          <div className="bg-surface-variant/40 glass-effect px-12 py-6 rounded-xl border border-outline-variant/10 flex flex-col items-center gap-2">
            <span className="text-[10px] tracking-[0.3em] uppercase text-on-surface-variant font-bold">Next Drop In</span>
            <div className="flex gap-6 font-headline text-3xl font-bold text-secondary">
              <div className="flex flex-col items-center"><span>{String(timeLeft.hours).padStart(2, '0')}</span><span className="text-[8px] uppercase tracking-tighter text-on-surface-variant">Hrs</span></div>
              <div className="flex flex-col items-center"><span>{String(timeLeft.minutes).padStart(2, '0')}</span><span className="text-[8px] uppercase tracking-tighter text-on-surface-variant">Min</span></div>
              <div className="flex flex-col items-center"><span>{String(timeLeft.seconds).padStart(2, '0')}</span><span className="text-[8px] uppercase tracking-tighter text-on-surface-variant">Sec</span></div>
            </div>
          </div>
        </div>
      </section>

      <section ref={productSectionRef} className="py-32 px-6 md:px-10 max-w-[1920px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div>
            <h2 className="font-headline text-4xl md:text-6xl font-black italic tracking-tighter text-on-surface mb-4">LATEST DROPS</h2>
            <p className="text-on-surface-variant text-lg">Engineered for the digital nomad.</p>
          </div>
          <div className="flex gap-4">
            <button className="p-4 rounded-full border border-outline-variant/20 hover:bg-primary hover:text-on-primary transition-all">
              <span className="material-symbols-outlined">tune</span>
            </button>
            <Link 
              to="/collections" 
              className="px-8 py-4 bg-surface-container-high rounded-full font-bold uppercase text-xs tracking-widest hover:bg-surface-container-highest transition-all flex items-center gap-2 group"
            >
              View All Collections
              <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-on-surface-variant">Loading products...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {displayProducts.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      <section className="py-20 px-6 md:px-10">
        <div className="bg-surface-container-low rounded-xl overflow-hidden flex flex-col lg:flex-row min-h-[600px]">
          <div className="lg:w-3/5 relative">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuClFnuYEW3LlgAWErzQM7w626SZwZJZ8kxyOpzdGMTgAmjGQBQO-Ig4lzRis99NAs0M731INGsLE5ZhGw8QnEutPVB0KcO2zGTFR4XDk6yv4ZxPrbWZ9hOn28d3hagkF3cqwDrlP31lIighPRP94s3CP5NSejTVQFSx-8l5OZLZ_Usl7jAgxRT-PWYlFeSWkZ6D3beLVPSRjstjSeRbQ2O6QdehW1lAkbIMuvxaE61JQ3kfNVheyuMigFbxWLMwCL2DDvD6gctckM9K" alt="Editorial" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-surface-container-low via-transparent to-transparent hidden lg:block"></div>
          </div>
          <div className="lg:w-2/5 p-12 md:p-20 flex flex-col justify-center">
            <span className="text-primary font-bold tracking-[0.4em] uppercase text-xs mb-6">Archive Lab</span>
            <h2 className="font-headline text-4xl md:text-6xl font-black italic tracking-tighter text-on-surface mb-8">BEYOND THE GRID.</h2>
            <p className="text-on-surface-variant text-lg leading-relaxed mb-10">Our custom lab allows you to fuse your digital identity with physical fabrics. We don't just sell clothes; we provide the canvas for your self-expression.</p>
            <Link to="/customize" className="flex items-center gap-4 text-primary-fixed font-bold tracking-widest uppercase text-sm group">
              Enter Custom Lab
              <span className="material-symbols-outlined transition-transform group-hover:translate-x-2">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

export default HomePage
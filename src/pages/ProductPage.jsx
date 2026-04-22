import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { productAPI } from '../services/api'

const ProductPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [mainImage, setMainImage] = useState('')
  const [zoomStyle, setZoomStyle] = useState({})
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError('No product ID provided')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        console.log('Fetching product with ID:', id)
        
        const allProductsRes = await productAPI.getProducts({ limit: 100 })
        const allProducts = allProductsRes.data.products || []
        
        let foundProduct = allProducts.find(p => p._id === id || p.id === id)
        
        if (!foundProduct) {
          try {
            const directRes = await productAPI.getProductById(id)
            foundProduct = directRes.data
          } catch (directError) {
            console.error('Direct fetch failed:', directError)
          }
        }
        
        if (foundProduct) {
          console.log('Product found:', foundProduct)
          setProduct(foundProduct)
          setMainImage(foundProduct.images?.[0] || 'https://via.placeholder.com/600')
          
          if (foundProduct.sizes?.length > 0) {
            setSelectedSize(foundProduct.sizes[0])
          }
          if (foundProduct.colors?.length > 0) {
            setSelectedColor(foundProduct.colors[0].name)
          }
        } else {
          console.error('Product not found with ID:', id)
          setError(`Product not found with ID: ${id}`)
        }
      } catch (error) {
        console.error('Error fetching product:', error)
        setError(error.response?.data?.message || error.message || 'Failed to load product')
      } finally {
        setLoading(false)
      }
    }
    
    fetchProduct()
  }, [id])

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
    setZoomStyle({ 
      transformOrigin: `${((e.clientX - left) / width) * 100}% ${((e.clientY - top) / height) * 100}%`, 
      transform: 'scale(2)' 
    })
  }

  const handleMouseLeave = () => {
    setZoomStyle({})
  }

  const handleAddToCart = () => {
    if (!product) return
    
    if (!product.inStock) {
      alert('This item is currently sold out.')
      return
    }
    
    const size = selectedSize || product.sizes?.[0] || 'M'
    const color = selectedColor || product.colors?.[0]?.name || 'Default'
    
    addToCart(product, size, color, quantity)
    alert('Added to cart!')
  }

  const handleCustomize = () => {
    const productId = product?._id || product?.id || id
    navigate(`/customize?id=${productId}`)
  }

  // Loading state
  if (loading) {
    return (
      <div className="pt-32 pb-20 px-6 md:px-10 max-w-[1440px] mx-auto min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-on-surface-variant">Loading product...</p>
          <p className="text-xs text-on-surface-variant/50 mt-2">ID: {id}</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !product) {
    return (
      <div className="pt-32 pb-20 px-6 md:px-10 max-w-[1440px] mx-auto min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <span className="material-symbols-outlined text-6xl mb-4 text-error">error</span>
          <h3 className="font-headline text-2xl font-bold mb-2">Product Not Found</h3>
          <p className="text-on-surface-variant mb-2">{error || 'The product you are looking for does not exist.'}</p>
          <p className="text-xs text-on-surface-variant/50 mb-6">Requested ID: {id}</p>
          <div className="flex gap-3 justify-center">
            <Link to="/collections" className="px-6 py-3 bg-primary text-on-primary font-bold rounded-xl">
              Browse Collections
            </Link>
            <Link to="/" className="px-6 py-3 border border-outline-variant text-on-surface font-bold rounded-xl">
              Go Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const productId = product._id || product.id || id

  return (
    <main className="pt-32 pb-20 px-6 md:px-10 max-w-[1440px] mx-auto min-h-screen">
      {/* Debug info - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-2 bg-surface-container-low rounded text-xs">
          <span className="text-on-surface-variant">Product ID: {productId}</span>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
        {/* Left: Product Media Gallery */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div 
            className="relative overflow-hidden rounded-xl bg-surface-container-low aspect-[4/5] group cursor-zoom-in"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <img 
              src={mainImage || product.images?.[0] || 'https://via.placeholder.com/600'} 
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-200"
              style={zoomStyle}
            />
            
            {product.tags && product.tags.length > 0 && (
              <div className="absolute top-6 left-6 glass-panel px-4 py-2 rounded-full border border-white/5">
                <span className="text-xs font-headline font-bold tracking-widest uppercase">
                  {product.tags[0]}
                </span>
              </div>
            )}
            
            {!product.inStock && (
              <div className="absolute top-6 right-6 glass-panel px-4 py-2 rounded-full border border-white/5 bg-error/20">
                <span className="text-xs font-headline font-bold tracking-widest uppercase text-error">
                  Sold Out
                </span>
              </div>
            )}
          </div>
          
          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((img, index) => (
                <div 
                  key={index}
                  className={`aspect-square rounded-lg overflow-hidden bg-surface-container-highest cursor-pointer hover:opacity-80 transition-all ${
                    mainImage === img ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setMainImage(img)}
                >
                  <img 
                    src={img} 
                    alt={`${product.name} view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Right: Product Details */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-primary font-headline text-sm font-bold tracking-[0.2em] uppercase">
              <span>{product.category || 'Essential'}</span>
              <span className="w-12 h-[1px] bg-primary/30"></span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black font-headline tracking-tighter text-on-surface">
              {product.name}
            </h1>
            
            <div className="flex items-baseline gap-4 mt-2">
              <span className="text-3xl font-headline font-bold text-primary">
                ₹{product.price?.toFixed(2) || '0.00'}
              </span>
              {product.originalPrice && (
                <span className="text-on-surface-variant line-through text-lg font-headline opacity-50">
                  ₹{product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>
          
          {/* Description */}
          <div className="bg-surface-container-low p-8 rounded-lg">
            <p className="text-on-surface-variant leading-relaxed text-lg">
              {product.description || 'No description available.'}
            </p>
          </div>
          
          {/* Size Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="font-headline font-bold uppercase tracking-widest text-sm text-on-surface">
                  Select Size
                </span>
                <button className="text-xs text-primary underline underline-offset-4 font-bold">
                  Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    disabled={!product.inStock}
                    className={`px-8 py-3 rounded-xl font-headline font-bold transition-all border ${
                      selectedSize === size
                        ? 'bg-primary text-on-primary border-transparent'
                        : 'bg-surface-container-highest text-on-surface border-outline-variant/15 hover:bg-surface-bright'
                    } ${!product.inStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Color Selector */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex flex-col gap-4">
              <span className="font-headline font-bold uppercase tracking-widest text-sm text-on-surface">
                Available Tones
              </span>
              <div className="flex gap-4">
                {product.colors.map((color) => (
                  <button
                    key={color.name || color}
                    onClick={() => setSelectedColor(color.name || color)}
                    disabled={!product.inStock}
                    className={`w-12 h-12 rounded-full border transition-all hover:scale-110 ${
                      selectedColor === (color.name || color)
                        ? 'ring-2 ring-primary ring-offset-4 ring-offset-surface'
                        : 'border-outline-variant/30'
                    } ${!product.inStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                    style={{ backgroundColor: color.value || color }}
                    title={color.name || color}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Quantity Selector */}
          <div className="flex items-center gap-4">
            <span className="font-headline font-bold uppercase tracking-widest text-sm text-on-surface">
              Quantity:
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                disabled={!product.inStock}
                className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center hover:bg-surface-bright disabled:opacity-50"
              >
                <span className="material-symbols-outlined">remove</span>
              </button>
              <span className="w-8 text-center font-bold">{quantity}</span>
              <button 
                onClick={() => setQuantity(q => Math.min(10, q + 1))}
                disabled={!product.inStock}
                className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center hover:bg-surface-bright disabled:opacity-50"
              >
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex flex-col gap-4 pt-4">
            <button 
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className={`group relative w-full py-6 rounded-xl bg-gradient-to-r from-primary to-primary-fixed text-on-primary font-headline font-black text-xl uppercase tracking-widest flex items-center justify-center gap-3 overflow-hidden shadow-[0_0_20px_rgba(143,245,255,0.3)] hover:scale-[1.02] active:scale-95 transition-all ${
                !product.inStock ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                shopping_cart
              </span>
              {product.inStock ? 'Add to Cart' : 'Sold Out'}
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
            
            {product.customizationAvailable !== false && (
              <button 
                onClick={handleCustomize}
                className="w-full py-6 rounded-xl border-2 border-primary/20 text-primary font-headline font-bold text-lg uppercase tracking-widest hover:bg-primary/5 transition-all flex items-center justify-center gap-3"
              >
                <span className="material-symbols-outlined">bolt</span>
                Customize Lab
              </button>
            )}
          </div>
          
          {/* Product Details Accordion */}
          <div className="flex flex-col gap-2 mt-4">
            <div className="py-4 border-b border-outline-variant/15 flex justify-between items-center group cursor-pointer">
              <span className="font-headline font-bold text-sm tracking-widest uppercase text-on-surface">
                Fabric &amp; Care
              </span>
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-on-surface transition-colors">
                add
              </span>
            </div>
            <div className="py-4 border-b border-outline-variant/15 flex justify-between items-center group cursor-pointer">
              <span className="font-headline font-bold text-sm tracking-widest uppercase text-on-surface">
                Shipping &amp; Returns
              </span>
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-on-surface transition-colors">
                add
              </span>
            </div>
          </div>
          
          {/* Back to Collections */}
          <Link 
            to="/collections" 
            className="text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-2 mt-4"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Collections
          </Link>
        </div>
      </div>
    </main>
  )
}

export default ProductPage
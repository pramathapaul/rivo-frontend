import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const ProductCard = ({ product }) => {
  const navigate = useNavigate()
  const { addToCart } = useCart()

  const productId = product._id || product.id

  const handleQuickAdd = (e) => {
    e.stopPropagation()
    if (product.inStock) {
      addToCart(product, product.sizes?.[0] || 'M', product.colors?.[0]?.name || 'Default')
    }
  }

  return (
    <div className="group relative flex flex-col cursor-pointer" onClick={() => navigate(`/product/${productId}`)}>
      <div className="relative aspect-[3/4] bg-surface-container-low rounded-lg overflow-hidden mb-6 transition-transform duration-500 hover:scale-[1.02]">
        <img 
          src={product.images?.[0] || 'https://via.placeholder.com/400'} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
        />
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="absolute top-4 right-4 bg-surface/80 glass-effect p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
          <span className="material-symbols-outlined text-sm">favorite</span>
        </div>
        {product.tags && product.tags.length > 0 && (
          <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${
            product.tags.includes('Sold Out') ? 'bg-secondary text-on-secondary' : 
            product.tags.includes('New') ? 'bg-tertiary text-on-tertiary' : 
            'bg-primary/20 text-primary-fixed border border-primary/30'
          }`}>
            {product.tags[0]}
          </div>
        )}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[80%] opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
          {product.inStock ? (
            <button onClick={handleQuickAdd} className="w-full py-4 bg-primary text-on-primary font-bold rounded-full uppercase text-xs tracking-[0.2em] shadow-lg shadow-primary/20">
              Quick Add
            </button>
          ) : (
            <button className="w-full py-4 bg-surface-container-highest text-on-surface-variant font-bold rounded-full uppercase text-xs tracking-[0.2em] cursor-not-allowed">
              Restock Soon
            </button>
          )}
        </div>
      </div>
      <div className={`flex justify-between items-start ${!product.inStock ? 'opacity-60' : ''}`}>
        <div>
          <h3 className="font-headline text-xl font-bold tracking-tight text-on-surface mb-1">{product.name}</h3>
          <span className="text-on-surface-variant text-sm uppercase tracking-widest">{product.category}</span>
        </div>
        <p className="font-headline font-bold text-primary-fixed">₹{product.price}</p>
      </div>
    </div>
  )
}

export default ProductCard
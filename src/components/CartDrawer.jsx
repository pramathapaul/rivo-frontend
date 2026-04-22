import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const CartDrawer = ({ isOpen, onClose }) => {
  const { cartItems, updateQuantity, removeItem, getSubtotal, setIsCartOpen } = useCart()
  const navigate = useNavigate()

  const handleCheckout = () => {
    setIsCartOpen(false)
    navigate('/cart')
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full md:w-96 bg-[#131315] z-50 shadow-[-20px_0_40px_rgba(0,0,0,0.5)] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-outline-variant/20">
          <div>
            <h2 className="text-xl font-bold font-headline uppercase">YOUR BAG</h2>
            <p className="text-on-surface-variant text-xs">Ready for the runway?</p>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-12 opacity-50">
              <span className="material-symbols-outlined text-5xl mb-4">shopping_basket</span>
              <p className="text-sm uppercase">Nothing in your vault yet.</p>
            </div>
          ) : (
            cartItems.map(item => (
              <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-3 p-3 rounded-xl bg-surface-container-highest/30">
                <img src={item.image} alt={item.name} className="w-20 h-24 object-cover rounded-lg" />
                <div className="flex-1">
                  <p className="font-bold text-sm">{item.name}</p>
                  <p className="text-xs text-on-surface-variant">{item.size} / {item.color}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity - 1)} className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center">-</button>
                      <span className="text-sm">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity + 1)} className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center">+</button>
                    </div>
                    <p className="font-bold text-primary">₹{item.price * item.quantity}</p>
                  </div>
                </div>
                <button onClick={() => removeItem(item.id, item.size, item.color)} className="text-error-dim hover:text-error">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            ))
          )}
        </div>
        
        <div className="p-6 border-t border-outline-variant/20">
          <div className="flex justify-between font-bold mb-4">
            <span>TOTAL</span>
            <span className="text-primary">₹{getSubtotal().toFixed(2)}</span>
          </div>
          <button onClick={handleCheckout} disabled={cartItems.length === 0} className="w-full py-4 bg-primary text-on-primary rounded-xl font-bold uppercase tracking-widest disabled:opacity-50">
            Checkout Now
          </button>
        </div>
      </div>
    </>
  )
}

export default CartDrawer